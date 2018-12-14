/**
 * 获取Babel的配置
 */
module.exports = function(
  options = {
    isOldJSEnabled: false,
    isES6Enabled: false,
    isReactEnabled: false
  }
) {
  let { isOldJSEnabled, isES6Enabled, isReactEnabled } = options;
  isES6Enabled = isReactEnabled ? isReactEnabled : isES6Enabled;
  return {
    presets: [
      // [require('babel-preset-minify')],
      isES6Enabled && [
        require("@babel/preset-env").default,
        {
          useBuiltIns: "entry", // "entry", //"entry",
          targets: { browsers: ["Android >= 4.0", "ios >= 8", "ie >=9"] },
          modules: "amd",
          // debug: true
        }
      ],
      isReactEnabled && [require("@babel/preset-react").default]
    ].filter(Boolean),
    plugins: [
      // isES6Enabled && [require('babel-plugin-transform-class-properties')],
      // isES6Enabled && [require('babel-plugin-transform-object-rest-spread')],
      // isES6Enabled && [require('babel-plugin-transform-export-extensions')],
      // isES6Enabled && [require('babel-plugin-transform-decorators-legacy').default],
      isES6Enabled && [
        require("@babel/plugin-transform-runtime").default,
        {
          helpers: false
          // polyfill: false,
          // regenerator: true
        }
      ],
      // isOldJSEnabled && [require("../babel-plugin-tinytool")],
      // [require("../babel-plugin-transform-modules-amd")]
    ].filter(Boolean)
  };
};
