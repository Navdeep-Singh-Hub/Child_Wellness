/**
 * Moves assets from "scenes and ui" into assets/speech/level2/scenes and .../ui.
 * Renames single-letter tiles and fixes train-car-yellow-.png
 */
const fs = require('fs');
const path = require('path');

const legacyDir = path.join(__dirname, '../assets/speech/level2/scenes and ui');
const scenesDir = path.join(__dirname, '../assets/speech/level2/scenes');
const uiDir = path.join(__dirname, '../assets/speech/level2/ui');

if (!fs.existsSync(legacyDir)) {
  console.log('No legacy "scenes and ui" folder — nothing to move.');
  process.exit(0);
}

fs.mkdirSync(scenesDir, { recursive: true });
fs.mkdirSync(uiDir, { recursive: true });

const LETTER_RE = /^([a-z])\.png$/i;

for (const name of fs.readdirSync(legacyDir)) {
  const src = path.join(legacyDir, name);
  if (!fs.statSync(src).isFile()) continue;
  if (!/\.(png|jpg|jpeg|webp)$/i.test(name)) continue;

  let destName = name;
  if (destName === 'train-car-yellow-.png') destName = 'train-car-yellow.png';
  const letterMatch = destName.match(LETTER_RE);
  if (letterMatch) destName = `letter-${letterMatch[1].toLowerCase()}.png`;

  const isUi = destName.startsWith('ui-');
  const destDir = isUi ? uiDir : scenesDir;
  const dest = path.join(destDir, destName);
  if (fs.existsSync(dest)) {
    console.warn(`Skip (exists): ${destName}`);
    continue;
  }
  fs.renameSync(src, dest);
  console.log(`Moved → ${isUi ? 'ui' : 'scenes'}/${destName}`);
}

const remaining = fs.readdirSync(legacyDir);
if (remaining.length === 0) {
  fs.rmdirSync(legacyDir);
  console.log('Removed empty "scenes and ui" folder.');
} else {
  console.log('Legacy folder still has:', remaining.join(', '));
}
