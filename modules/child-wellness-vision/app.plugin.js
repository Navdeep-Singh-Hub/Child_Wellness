const {
  withAppBuildGradle,
  withDangerousMod,
  AndroidConfig,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MODELS = ['face_landmarker.task', 'hand_landmarker.task', 'pose_landmarker_lite.task'];

function withVisionModels(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const destDir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'assets', 'models');
      fs.mkdirSync(destDir, { recursive: true });
      for (const name of MODELS) {
        const src = path.join(projectRoot, 'assets', 'models', name);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(destDir, name));
        }
      }
      return cfg;
    },
  ]);
}

function withVisionGradle(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') return cfg;
    let contents = cfg.modResults.contents;
    if (!contents.includes('packagingOptions')) {
      contents = contents.replace(
        /android\s*\{/,
        `android {
    packagingOptions {
        pickFirst '**/libc++_shared.so'
    }`,
      );
    }
    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = function withChildWellnessVision(config) {
  config = AndroidConfig.Permissions.withPermissions(config, ['android.permission.CAMERA']);
  config = withVisionModels(config);
  config = withVisionGradle(config);
  return config;
};
