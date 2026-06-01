const fs = require('fs');
const path = require('path');

const gamesRoot = path.join(__dirname, '../components/game/speech');
const registryPath = path.join(__dirname, '../components/game/speech/level2-shared/speechLevel2Assets.ts');
const actionMapPath = path.join(__dirname, '../components/game/speech/level2-shared/level2ActionImages.ts');

const registry = fs.readFileSync(registryPath, 'utf8');
const actionMap = fs.existsSync(actionMapPath) ? fs.readFileSync(actionMapPath, 'utf8') : '';

const keys = [];
const re = /'([^']+)': require\('@\/assets\/speech\/level2\/([^']+)'\)/g;
let m;
while ((m = re.exec(registry)) !== null) keys.push({ key: m[1], rel: m[2] });

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, files);
    else if (/\.tsx?$/.test(ent.name)) {
      if (
        full.includes('speechLevel2Assets.ts') ||
        full.includes('level2ActionImages.ts') ||
        full.includes('level2SequenceImages.ts')
      ) {
        continue;
      }
      files.push(fs.readFileSync(full, 'utf8'));
    }
  }
  return files;
}

const corpus = walk(gamesRoot).join('\n');

function isKeyUsed(key) {
  if (corpus.includes(`'${key}'`) || corpus.includes(`"${key}"`)) return true;
  return false;
}

const unused = keys.filter((k) => !isKeyUsed(k.key));
console.log('Unused:', unused.length);
for (const u of unused) console.log(`${u.key}\t${u.rel.split('/')[0]}`);
if (unused.length === 0) console.log('All 188 registered Level 2 assets are referenced in games.');
