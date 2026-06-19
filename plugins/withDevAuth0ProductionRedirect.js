/**
 * Dev APK uses production Auth0 callback URLs (already in Auth0 dashboard)
 * while keeping com.anonymous.childwellness.dev as the install package.
 */
const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

const PROD_PACKAGE = 'com.anonymous.childwellness';
const AUTH0_DOMAIN = 'child-wellness.us.auth0.com';

function withDevAuth0ProductionRedirect(config) {
  if (process.env.APP_VARIANT !== 'development') {
    return config;
  }

  return withAndroidManifest(config, (cfg) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    const redirectActivity = mainApplication.activity?.find(
      (activity) =>
        activity.$['android:name'] === 'com.auth0.android.provider.RedirectActivity',
    );

    if (!redirectActivity) {
      return cfg;
    }

    redirectActivity['intent-filter'] = redirectActivity['intent-filter'] || [];
    const intentFilter = redirectActivity['intent-filter'][0] || {
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      category: [
        { $: { 'android:name': 'android.intent.category.DEFAULT' } },
        { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
      ],
      data: [],
    };
    intentFilter.data = intentFilter.data || [];

    const prodScheme = `${PROD_PACKAGE}.auth0`;
    const prodCallbackPath = `/android/${PROD_PACKAGE}/callback`;
    const hasProdCallback = intentFilter.data.some(
      (entry) =>
        entry.$?.['android:scheme'] === prodScheme &&
        entry.$?.['android:pathPrefix'] === prodCallbackPath,
    );

    if (!hasProdCallback) {
      intentFilter.data.push({
        $: {
          'android:scheme': prodScheme,
          'android:pathPrefix': prodCallbackPath,
          'android:host': AUTH0_DOMAIN,
        },
      });
    }

    if (!redirectActivity['intent-filter'][0]) {
      redirectActivity['intent-filter'][0] = intentFilter;
    }

    return cfg;
  });
}

module.exports = withDevAuth0ProductionRedirect;
