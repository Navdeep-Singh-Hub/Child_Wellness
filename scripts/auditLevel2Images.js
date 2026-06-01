/**
 * Prints an audit of assets/speech/level2 images.
 * Run: node scripts/auditLevel2Images.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../assets/speech/level2');
const IMG = /\.(png|jpg|jpeg|webp)$/i;
const AI = /ChatGPT|Gemini_Generated/i;

function walk(dir, list = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, list);
    else if (IMG.test(ent.name)) list.push(full);
  }
  return list;
}

const files = walk(root);
const byFolder = {};
const ai = [];
const suspicious = [];
const stems = new Map();

for (const full of files) {
  const rel = path.relative(root, full).replace(/\\/g, '/');
  const folder = rel.includes('/') ? rel.split('/')[0] : '(root)';
  byFolder[folder] = (byFolder[folder] || 0) + 1;
  const base = path.basename(full, path.extname(full));
  if (AI.test(path.basename(full))) ai.push(rel);
  if (/^letter-[a-z]$/i.test(base) === false && /^[a-z]$/i.test(base)) suspicious.push(rel);
  if (base.endsWith('-')) suspicious.push(rel);
  const key = base.toLowerCase();
  if (!stems.has(key)) stems.set(key, []);
  stems.get(key).push(rel);
}

const dupes = [...stems.entries()].filter(([, v]) => v.length > 1);

console.log('=== Level 2 image audit ===\n');
console.log(`Total images: ${files.length}\n`);
console.log('Per folder:');
Object.entries(byFolder)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([k, n]) => console.log(`  ${k}: ${n}`));

console.log(`\nAI-named (excluded from registry): ${ai.length}`);
ai.forEach((r) => console.log(`  - ${r}`));

if (dupes.length) {
  console.log(`\nDuplicate stems (${dupes.length}):`);
  dupes.forEach(([k, v]) => console.log(`  ${k}:\n    ${v.join('\n    ')}`));
} else {
  console.log('\nNo duplicate stems across folders.');
}

if (suspicious.length) {
  console.log(`\nSuspicious names (${suspicious.length}):`);
  suspicious.forEach((r) => console.log(`  - ${r}`));
}

const inRegistry = files.filter((f) => !AI.test(path.basename(f))).length;
console.log(`\nRegistered by genLevel2Assets (approx): ${inRegistry - ai.length} → run genLevel2Assets.js for exact count.`);
