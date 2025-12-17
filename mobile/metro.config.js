const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add watchFolders so Metro can watch the design-system folder for changes
config.watchFolders = [
  path.resolve(__dirname),
  path.resolve(__dirname, '../design-system'),
];

// Ensure Metro can resolve modules from the design-system folder
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
  },
};

// Increase timeout and buffer sizes to handle large bundles
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Increase timeout for large bundles
      req.setTimeout(300000); // 5 minutes
      res.setTimeout(300000);
      return middleware(req, res, next);
    };
  },
};

// Configure serializer for better handling of large bundles
config.serializer = {
  ...config.serializer,
  customSerializer: undefined, // Use default serializer
};

// Optimize transformer for better performance
config.transformer = {
  ...config.transformer,
  // Enable minification in development for smaller bundles
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

module.exports = config;

