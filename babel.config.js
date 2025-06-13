module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
    "react-native-reanimated/plugin", 
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env', // Import using this alias in your code
        path: '.env',        // Path to the .env file
      },
    ],
  ],
  };
};