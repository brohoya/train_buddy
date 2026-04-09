const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// @elevenlabs packages are pure ESM with only "exports" fields (no "main").
// Instead of enabling unstable_enablePackageExports globally (which breaks
// production builds), resolve @elevenlabs packages explicitly.
const elevenlabsAliases = {
  '@elevenlabs/react': 'node_modules/@elevenlabs/react/dist/index.js',
  '@elevenlabs/client': 'node_modules/@elevenlabs/client/dist/index.js',
  '@elevenlabs/client/internal': 'node_modules/@elevenlabs/client/dist/internal.js',
  '@elevenlabs/types': 'node_modules/@elevenlabs/types/dist/src/index.js',
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (elevenlabsAliases[moduleName]) {
    return {
      filePath: path.resolve(__dirname, elevenlabsAliases[moduleName]),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
