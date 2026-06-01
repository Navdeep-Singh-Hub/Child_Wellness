const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../assets/speech/level2');
const out = path.join(__dirname, '../components/game/speech/level2-shared/speechLevel2Assets.ts');
const entries = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(png|jpg|jpeg|webp)$/i.test(ent.name)) continue;
    if (/ChatGPT|Gemini_Generated/i.test(ent.name)) continue;
    const rel = full.split(`${path.sep}assets${path.sep}speech${path.sep}level2${path.sep}`)[1].replace(/\\/g, '/');
    const id = path.basename(ent.name, path.extname(ent.name));
    entries.push({ id, rel });
  }
}

walk(root);
entries.sort((a, b) => a.id.localeCompare(b.id));

const body = `/** Auto-generated from assets/speech/level2 — run \`node scripts/genLevel2Assets.js\` after adding images. */
import type { ImageSourcePropType } from 'react-native';

export type Level2ImageKey = ${entries.map((e) => `'${e.id}'`).join(' | ') || 'never'};

export const LEVEL2_IMAGES: Record<Level2ImageKey, ImageSourcePropType> = {
${entries.map((e) => `  '${e.id}': require('@/assets/speech/level2/${e.rel}'),`).join('\n')}
};

export function getLevel2Image(key: Level2ImageKey): ImageSourcePropType {
  return LEVEL2_IMAGES[key];
}
`;

fs.writeFileSync(out, body, 'utf8');
console.log(`Wrote ${entries.length} assets to ${out}`);
