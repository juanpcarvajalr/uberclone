// AI-assisted: see docs/AI_LOG.md #43
const path = require('path');
const fs = require('fs');
const appJson = require('./app.json');

/**
 * Loads KEY from .env without requiring dotenv as a dependency.
 * @returns {string|undefined}
 */
function readKeyFromEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    const raw = fs.readFileSync(envPath, 'utf8');
    const match = raw.match(/^KEY=(.*)$/m);
    return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : undefined;
  } catch {
    return undefined;
  }
}

const googleMapsApiKey = process.env.KEY || readKeyFromEnvFile();

module.exports = () => ({
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra ?? {}),
      googleMapsApiKey,
    },
    ios: {
      ...appJson.expo.ios,
      bundleIdentifier: appJson.expo.ios?.bundleIdentifier ?? 'com.juanp.uberclone',
      infoPlist: {
        ...(appJson.expo.ios?.infoPlist ?? {}),
        NSLocationWhenInUseUsageDescription:
          'Necesitamos tu ubicación para mostrarte en el mapa mientras estás disponible.',
      },
      config: {
        ...(appJson.expo.ios?.config ?? {}),
        googleMapsApiKey,
      },
    },
    android: {
      ...appJson.expo.android,
      package: appJson.expo.android?.package ?? 'com.juanp.uberclone',
      config: {
        ...(appJson.expo.android?.config ?? {}),
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
      permissions: [
        ...(appJson.expo.android?.permissions ?? []),
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'POST_NOTIFICATIONS',
      ],
    },
    plugins: [
      ...(appJson.expo.plugins ?? []),
      'expo-font',
      [
        'react-native-maps',
        {
          androidGoogleMapsApiKey: googleMapsApiKey,
          iosGoogleMapsApiKey: googleMapsApiKey,
        },
      ],
    ],
  },
});
