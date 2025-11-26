const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude web platform to avoid web-specific dependencies
config.resolver.platforms = ['ios', 'android'];

module.exports = config;
