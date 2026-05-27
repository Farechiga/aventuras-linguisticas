#!/usr/bin/env node
// scripts/gen-sticker-index.js
// Lists every .png in assets/stickers/ (excluding .sticker-hashes.json and
// hidden files) and writes assets/stickers/index.json as a natural-sorted
// array of filenames. The Sticker Reward Game fetches this list as its pool.
// Re-runnable: re-run after gen-stickers.js produces new sticker PNGs.
//
// Usage: node scripts/gen-sticker-index.js

const fs = require("node:fs");
const path = require("node:path");

const STICKER_DIR = path.resolve(__dirname, "..", "assets", "stickers");
const OUT_FILE = path.join(STICKER_DIR, "index.json");

if (!fs.existsSync(STICKER_DIR)) {
  console.error(`No sticker directory at ${STICKER_DIR}`);
  process.exit(1);
}

const files = fs
  .readdirSync(STICKER_DIR)
  .filter((name) => {
    if (name.startsWith(".")) return false;
    return name.toLowerCase().endsWith(".png");
  })
  .sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  );

fs.writeFileSync(OUT_FILE, JSON.stringify(files, null, 2) + "\n");
console.log(`Wrote ${files.length} sticker(s) to ${OUT_FILE}`);
