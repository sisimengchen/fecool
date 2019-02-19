/**
 * 获取Babel的配置
 */
const getOptions = require("./getOptions");

module.exports = function(
  options = {
    isModule: false,
    isES6Enabled: true,
    isReactEnabled: false
  }
) {
  let { isModule, isES6Enabled, isReactEnabled } = options;
  isES6Enabled = isReactEnabled ? isReactEnabled : isES6Enabled;
  const babelOptions = {
    sourceType: "module",
    compact: getOptions().isDevelopENV() ? "auto" : true,
    minified: getOptions().isDevelopENV() ? false : true,
    comments: getOptions().isDevelopENV() ? true : false,
    presets: [
      [require("../babel-preset-fetool")],
      isES6Enabled && [
        require("@babel/preset-env").default,
        {
          // targets: {
          //   ie: 9
          // },
          ignoreBrowserslistConfig: true,
          // useBuiltIns: "entry",
          useBuiltIns: false,
          targets: { browsers: ["Android >= 4.0", "ios >= 8", "ie >=9"] },
          modules: isModule ? false : "amd"
          // modules: false,
          // modules: 'amd'
          // debug: true
        }
      ],
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
      // isES6Enabled && [require('babel-plugin-transform-class-properties')],
      // isES6Enabled && [require('babel-plugin-transform-object-rest-spread')],
      // isES6Enabled && [require('babel-plugin-transform-export-extensions')],
      // isES6Enabled && [require('babel-plugin-transform-decorators-legacy').default],
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
