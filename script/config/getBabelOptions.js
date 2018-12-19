/**
 * 获取Babel的配置
 */
module.exports = function(
  options = {
    isCommonModules: false,
    isES6Enabled: true,
    isReactEnabled: false
  }
) {
  let { isCommonModules, isES6Enabled, isReactEnabled } = options;
  isES6Enabled = isReactEnabled ? isReactEnabled : isES6Enabled;
  return {
    presets: [
      [require("../babel-preset-fetool")],
      isES6Enabled && [
        require("@babel/preset-env").default,
        {
          useBuiltIns: "entry",
          targets: { browsers: ["Android >= 4.0", "ios >= 8", "ie >=9"] },
          // modules: isCommonModules ? false : "amd"
          // modules: false,
          modules: 'amd'
          // debug: true
        }
      ],
      isReactEnabled && [require("@babel/preset-react").default]
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
          helpers: false
          // polyfill: false,
          // regenerator: true
        }
      ]
    ].filter(Boolean)
  };
};
