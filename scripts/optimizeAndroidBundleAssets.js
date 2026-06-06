/**
 * Shrinks PNG/MP4 assets before EAS Android builds so the APK stays installable on phones.
 * Run: node scripts/optimizeAndroidBundleAssets.js
 * Hook: eas-build-pre-install (see package.json)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');
const MIN_PNG_BYTES = 80 * 1024;
const MIN_MP4_BYTES = 5 * 1024 * 1024;

function walk(dir, ext, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, ext, out);
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

async function optimizePngs() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.log('[optimize] sharp not installed — skip PNG compression (npm i sharp --save-dev)');
    return;
  }

  const pngs = walk(ASSETS, '.png').filter((p) => fs.statSync(p).size >= MIN_PNG_BYTES);
  let saved = 0;
  for (const file of pngs) {
    const before = fs.statSync(file).size;
    const buf = await sharp(file)
      .png({ compressionLevel: 9, palette: true, quality: 80, effort: 10 })
      .toBuffer();
    if (buf.length < before) {
      fs.writeFileSync(file, buf);
      saved += before - buf.length;
    }
  }
  console.log(`[optimize] PNG: processed ${pngs.length}, saved ~${Math.round(saved / 1024 / 1024)} MB`);
}

function optimizeMp4s() {
  let ffmpeg;
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    ffmpeg = true;
  } catch {
    console.log('[optimize] ffmpeg not found — skip MP4 compression');
    return;
  }

  const mp4s = walk(ASSETS, '.mp4').filter((p) => fs.statSync(p).size >= MIN_MP4_BYTES);
  for (const file of mp4s) {
    const tmp = `${file}.tmp.mp4`;
    const before = fs.statSync(file).size;
    try {
      execSync(
        `ffmpeg -y -i "${file}" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k -movflags +faststart "${tmp}"`,
        { stdio: 'ignore' }
      );
      const after = fs.statSync(tmp).size;
      if (after < before * 0.85) {
        fs.renameSync(tmp, file);
        console.log(`[optimize] MP4 ${path.basename(file)}: ${Math.round(before / 1e6)}MB → ${Math.round(after / 1e6)}MB`);
      } else {
        fs.unlinkSync(tmp);
      }
    } catch (e) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      console.warn(`[optimize] MP4 failed: ${path.basename(file)}`);
    }
  }
}

async function main() {
  console.log('[optimize] Starting asset optimization for Android bundle…');
  await optimizePngs();
  optimizeMp4s();
  console.log('[optimize] Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
