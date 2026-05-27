#!/usr/bin/env node
// scripts/gen-background-index.js
// Lists every image file in assets/stickerbackgrounds/ (excluding hidden
// files like .DS_Store and the .sticker-hashes.json kind of bookkeeping)
// and writes assets/stickerbackgrounds/index.json — a natural-sorted array
// of filenames the placement-scene background picker consumes.
//
// Usage: node scripts/gen-background-index.js

const fs = require("node:fs");
const path = require("node:path");

const BG_DIR = path.resolve(__dirname, "..", "assets", "stickerbackgrounds");
const OUT_FILE = path.join(BG_DIR, "index.json");

if (!fs.existsSync(BG_DIR)) {
  console.error(`No backgrounds directory at ${BG_DIR}`);
  process.exit(1);
}

const VALID_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const files = fs
  .readdirSync(BG_DIR)
  .filter((name) => {
    if (name.startsWith(".")) return false;
    return VALID_EXT.has(path.extname(name).toLowerCase());
  })
  .sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  );

fs.writeFileSync(OUT_FILE, JSON.stringify(files, null, 2) + "\n");
console.log(`Wrote ${files.length} background(s) to ${OUT_FILE}`);
