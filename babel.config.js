module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: true, // Changed back to true to prevent errors
          allowUndefined: false, // Changed back to false
          verbose: false, // Changed back to false to reduce noise
        },
      ],
    ],
  };
}; 