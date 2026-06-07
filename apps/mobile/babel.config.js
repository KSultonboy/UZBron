module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // react-native-reanimated 4 / worklets — oxirgi plagin bo'lishi shart
    plugins: ["react-native-worklets/plugin"],
  };
};
