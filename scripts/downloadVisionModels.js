#!/usr/bin/env node
/** Downloads MediaPipe .task models into assets/models for native vision tracking. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DEST = path.join(ROOT, 'assets', 'models');
const MODELS = [
  ['face_landmarker.task', 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'],
  ['hand_landmarker.task', 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'],
  ['pose_landmarker_lite.task', 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'],
];

(async () => {
  fs.mkdirSync(DEST, { recursive: true });
  for (const [name, url] of MODELS) {
    const dest = path.join(DEST, name);
    if (fs.existsSync(dest)) {
      console.log('✓', name);
      continue;
    }
    console.log('Downloading', name, '…');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log('✓ saved', name);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
