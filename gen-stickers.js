#!/usr/bin/env node
/* Batch-cartoonify animal photos into die-cut stickers via the OpenAI Images
   (edits) API. Reads  assets/animaloriginals/*.{jpg,jpeg,png,webp}
   and writes transparent PNGs to  assets/stickers/<name>.png.
   Idempotent + prompt-hash aware, like gen-tts.js.

   Usage (run from the folder that CONTAINS the assets/ directory; Node 18+):
     export OPENAI_API_KEY=sk-...
     node gen-stickers.js --dry-run      # list what it would do; no API calls, $0
     node gen-stickers.js --limit 5      # do only the first 5  <-- DO THIS FIRST (cost check)
     node gen-stickers.js                # process all missing/changed
     node gen-stickers.js --force        # regenerate everything (e.g. after editing PROMPT)
*/
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IN  = path.resolve(process.env.INPUT_DIR  || 'assets/animaloriginals');
const OUT = path.resolve(process.env.OUTPUT_DIR || 'assets/stickers');
const HASHES = path.join(OUT, '.sticker-hashes.json');

/* ---- config: tweak freely ---- */
const MODEL          = 'gpt-image-1.5';     // 1.5 supports transparent bg; gpt-image-2 does NOT
const SIZE           = '1024x1024';
const QUALITY        = 'medium';            // 'low'|'medium'|'high' ~ $0.01 / $0.04 / $0.13 per image
const BACKGROUND     = 'transparent';
const OUTPUT_FORMAT  = 'png';
const INPUT_FIDELITY = 'low';               // 'high' preserves markings better (costs more) — for specific pets
const DELAY_MS       = 1500;                // pacing between calls; 429s are retried with backoff anyway

const PROMPT = `Turn the uploaded photo into a die-cut sticker.
SUBJECT: Keep every animal in the photo (there may be one or more) and remove everything else. Preserve each animal's distinctive markings, colors, proportions, and pose so it stays clearly recognizable, and keep multiple animals in their original relative positions.
STYLE: Redraw them in a clean, friendly cartoon/vector sticker style - bold smooth outlines, flat vibrant cell-shaded colors with soft shading, simplified shapes, slightly rounded charming features. Cute but true to the real animal.
CUTOUT: Remove the original background completely. Place the subject(s) on a fully transparent background with a thick white die-cut border hugging the outer silhouette, like a glossy vinyl sticker.
Do not add any text, props, scenery, or background. Output one centered sticker.`;

/* ---- args / key ---- */
const argv  = process.argv.slice(2);
const DRY   = argv.includes('--dry-run');
const FORCE = argv.includes('--force');
const li    = argv.indexOf('--limit');
const LIMIT = li >= 0 ? parseInt(argv[li + 1], 10) : Infinity;
const API_KEY = process.env.OPENAI_API_KEY;
if (!DRY && !API_KEY) { console.error('Set your key:  export OPENAI_API_KEY=sk-...'); process.exit(2); }

const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const mime = e => ({ '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[e]);
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (!fs.existsSync(IN)) { console.error('Input folder not found: ' + IN); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

let hashes = {};
try { hashes = JSON.parse(fs.readFileSync(HASHES, 'utf8')); } catch {}

// one signature for this run; changes whenever you edit the prompt or any setting above
const PROMPT_SIG = crypto.createHash('sha256')
  .update([MODEL, SIZE, QUALITY, BACKGROUND, OUTPUT_FORMAT, INPUT_FIDELITY, PROMPT].join('\u0001'))
  .digest('hex');

const inputs = fs.readdirSync(IN).filter(f => EXTS.has(path.extname(f).toLowerCase())).sort();

async function makeSticker(file) {
  const buf = fs.readFileSync(path.join(IN, file));
  const ext = path.extname(file).toLowerCase();
  const form = new FormData();
  form.append('model', MODEL);
  form.append('prompt', PROMPT);
  form.append('size', SIZE);
  form.append('quality', QUALITY);
  form.append('background', BACKGROUND);
  form.append('output_format', OUTPUT_FORMAT);
  form.append('input_fidelity', INPUT_FIDELITY);
  form.append('n', '1');
  form.append('image', new Blob([buf], { type: mime(ext) }), file);

  for (let attempt = 0; ; attempt++) {
    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}` }, // no Content-Type — fetch sets the multipart boundary
      body: form
    });
    if (res.status === 429 && attempt < 5) {
      const wait = (parseInt(res.headers.get('retry-after')) || (2 ** attempt) * 3) * 1000;
      console.log(`  (rate limited — waiting ${Math.round(wait / 1000)}s)`);
      await sleep(wait); continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    const b64 = json.data && json.data[0] && json.data[0].b64_json;
    if (!b64) throw new Error('no image in response');
    const outName = path.basename(file, ext) + '.png';
    fs.writeFileSync(path.join(OUT, outName), Buffer.from(b64, 'base64'));
    return outName;
  }
}

(async () => {
  if (!inputs.length) { console.log('No images in ' + IN); return; }
  let made = 0, skipped = 0, failed = 0, done = 0;
  for (const file of inputs) {
    if (done >= LIMIT) break;
    const ext = path.extname(file).toLowerCase();
    const outName = path.basename(file, ext) + '.png';
    if (!FORCE && fs.existsSync(path.join(OUT, outName)) && hashes[outName] === PROMPT_SIG) { skipped++; continue; }
    done++;
    if (DRY) { console.log('would generate  ' + outName); made++; continue; }
    try {
      process.stdout.write(`-> ${outName} (${done}) ... `);
      await makeSticker(file);
      hashes[outName] = PROMPT_SIG;
      fs.writeFileSync(HASHES, JSON.stringify(hashes, null, 2) + '\n'); // resumable
      console.log('ok');
      made++;
      await sleep(DELAY_MS);
    } catch (e) { console.log('FAIL — ' + e.message); failed++; }
  }
  console.log(`\nDone. generated: ${made}, up-to-date: ${skipped}, failed: ${failed}` +
    (LIMIT !== Infinity ? `  (capped at ${LIMIT})` : ''));
  if (DRY) console.log('(dry run — no API calls, nothing written)');
  if (failed) process.exit(1);
})();
