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
          safe: false, // Changed from true to false to allow undefined values
          allowUndefined: true,
          verbose: true, // Changed to true for better debugging
        },
      ],
    ],
  };
}; 