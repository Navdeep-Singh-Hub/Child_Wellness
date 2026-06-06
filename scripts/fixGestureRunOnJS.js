/**
 * Codemod: make react-native-gesture-handler callbacks run on the JS thread.
 *
 * Many games call React state setters / Haptics / TTS / setTimeout directly inside
 * Gesture.Pan()/Tap()/Pinch() callbacks. Those callbacks are auto-workletized and run
 * on the UI thread in native (APK) builds, so calling non-worklet JS crashes the app
 * ("app closes" on drag). On web they run on the JS thread, which is why it only breaks
 * in the APK. Adding `.runOnJS(true)` forces the callbacks onto the JS thread (the same
 * fix already used in DrawingCanvas.tsx), which is safe for shared-value writes too.
 *
 * Run: node scripts/fixGestureRunOnJS.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TARGET_DIRS = ['components'];
const LEAF_GESTURES = ['Pan', 'Tap', 'Pinch', 'Rotation', 'Fling', 'LongPress', 'Hover', 'Manual', 'ForceTouch', 'Native'];

// Match `Gesture.Pan()` (etc.) that is NOT already followed by `.runOnJS`.
const re = new RegExp(`Gesture\\.(${LEAF_GESTURES.join('|')})\\(\\)(?!\\s*\\.runOnJS)`, 'g');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue;
      walk(p, out);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      out.push(p);
    }
  }
  return out;
}

let changedFiles = 0;
let totalReplacements = 0;
const changed = [];

for (const d of TARGET_DIRS) {
  const dir = path.join(ROOT, d);
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const src = fs.readFileSync(file, 'utf8');
    if (!src.includes('Gesture.')) continue;
    let count = 0;
    const next = src.replace(re, (m) => {
      count++;
      return `${m}.runOnJS(true)`;
    });
    if (count > 0 && next !== src) {
      fs.writeFileSync(file, next);
      changedFiles++;
      totalReplacements += count;
      changed.push(`${path.relative(ROOT, file)} (${count})`);
    }
  }
}

console.log(`Updated ${changedFiles} files, ${totalReplacements} gesture(s) set to runOnJS(true).`);
changed.forEach((c) => console.log('  ' + c));
