module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".ios.js",
            ".ios.jsx",
            ".ios.ts",
            ".ios.tsx",
            ".android.js",
            ".android.jsx",
            ".android.ts",
            ".android.tsx",
            ".json",
          ],
          alias: {
            "@": "./",
            "@utils": "./app/utils",
            "@icons": "./app/icons",
            "@config": "./app/config",
            "@fonts": "./assets/fonts",
            "@screens": "./app/screens",
            "@context": "./app/context",
            "@components": "./app/components",
            "@navigations": "./app/navigations",
          },
        },
      ],
    ],
  };
};
