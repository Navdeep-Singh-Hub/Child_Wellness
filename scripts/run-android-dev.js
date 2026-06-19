/**
 * Run `expo run:android` with APP_VARIANT=development (separate dev APK id).
 */
process.env.APP_VARIANT = 'development';

const { spawnSync } = require('child_process');
const path = require('path');

const expoCli = path.join(__dirname, '..', 'node_modules', 'expo', 'bin', 'cli');
const args = ['run:android', ...process.argv.slice(2)];

const result = spawnSync(process.execPath, ['--max-old-space-size=6144', expoCli, ...args], {
  stdio: 'inherit',
  env: process.env,
  shell: false,
});

process.exit(result.status ?? 1);
