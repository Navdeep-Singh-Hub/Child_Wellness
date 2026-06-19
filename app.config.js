/**
 * Dynamic Expo config — installs dev and production builds side-by-side on device.
 *
 * Set APP_VARIANT=development for local dev client / EAS "development" profile.
 * Preview & production builds keep com.anonymous.childwellness (store APK).
 */
const base = require('./app.json');

const variant = process.env.APP_VARIANT === 'development' ? 'development' : 'production';
const isDev = variant === 'development';

const androidPackage = isDev ? 'com.anonymous.childwellness.dev' : 'com.anonymous.childwellness';
const iosBundleId = isDev ? 'com.anonymous.childwellness.dev' : 'com.anonymous.childwellness';
const productionPackage = 'com.anonymous.childwellness';
const auth0Domain = 'child-wellness.us.auth0.com';

module.exports = {
  expo: {
    ...base.expo,
    name: isDev ? 'ChildWellness Dev' : base.expo.name,
    scheme: isDev ? 'ChildWellness-dev' : base.expo.scheme,
    android: {
      ...base.expo.android,
      package: androidPackage,
    },
    ios: {
      ...base.expo.ios,
      bundleIdentifier: iosBundleId,
    },
    plugins: [
      ...base.expo.plugins,
      ...(isDev ? [require('./plugins/withDevAuth0ProductionRedirect')] : []),
    ],
    extra: {
      ...base.expo.extra,
      appVariant: variant,
      auth0CallbackPackage: isDev ? productionPackage : androidPackage,
      auth0Domain,
    },
  },
};
