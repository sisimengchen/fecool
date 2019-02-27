/**
 * 获取Babel的配置
 */
const getOptions = require("./getOptions");

module.exports = function(
  options = {
    isES6Enabled: true,
    isReactEnabled: false
  }
) {
  let { isES6Enabled, isReactEnabled } = options;
  isES6Enabled = isReactEnabled ? isReactEnabled : isES6Enabled;
  const babelOptions = {
    sourceType: "module",
    compact: getOptions().isDevelopENV() ? "auto" : true,
    minified: getOptions().isDevelopENV() ? false : true,
    comments: getOptions().isDevelopENV() ? true : false,
    presets: [
      [require("../babel-preset-fecool")],
      isES6Enabled && [
        require("@babel/preset-env").default,
        {
          ignoreBrowserslistConfig: true,
          // useBuiltIns: "entry",
          useBuiltIns: false,
          targets: { browsers: ["Android >= 4.0", "ios >= 8", "ie >=9"] },
          modules: false
          // debug: true
        }
      ],
      [require("../babel-preset-amd")],
      isReactEnabled && [
        require("@babel/preset-react").default,
        {
          development: false,
          useBuiltIns: true
        }
      ]
    ].filter(Boolean),
    plugins: [
      [require("../babel-plugin-tinytool")],
      isES6Enabled && [
        require("@babel/plugin-proposal-decorators").default,
        { legacy: true }
      ],
      isES6Enabled && [
        require("@babel/plugin-proposal-class-properties").default,
        { legacy: true }
      ],
      isES6Enabled && [
        require("@babel/plugin-transform-runtime").default,
        {
          corejs: false,
          helpers: false
          // polyfill: false,
          // regenerator: true
        }
      ]
    ].filter(Boolean)
  };
  // debugger;
  return babelOptions;
};
