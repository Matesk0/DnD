const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const rootDir = __dirname;
const projectRoot = path.resolve(rootDir, 'frontend');

// Load config using frontend/ as the project root
const config = getDefaultConfig(projectRoot);

// Watch both root and frontend directories
config.watchFolders = [rootDir, projectRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(rootDir, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

module.exports = config;
