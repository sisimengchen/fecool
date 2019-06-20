/**
 * @file babel配置生成器
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const getOptions = require("./getOptions");

module.exports = function(
  options = {
    isES6Enabled: true,
    isReactEnabled: false,
    isCommonModules: false
  }
) {
  let { isES6Enabled, isReactEnabled, isCommonModules } = options;
  isES6Enabled = isReactEnabled ? isReactEnabled : isES6Enabled;
  const babelOptions = {
    sourceType: "module",
    compact: getOptions().isDevelopENV() ? false : true,
    minified: getOptions().isDevelopENV() ? false : true,
    comments: getOptions().isDevelopENV() ? true : false,
    presets: [
      [require("../babel-preset-fecool")], // 最后收集依赖
      isES6Enabled && [
        require("@babel/preset-env").default,
        {
          ignoreBrowserslistConfig: true,
          useBuiltIns: false,
          targets: { browsers: ["Android >= 4.0", "ios >= 8", "ie >=9"] },
          modules: "amd"
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
      [require("../babel-plugin-fecool-helper")],
      [require("../babel-plugin-transform-tinytool")], // 执行tinytool代码的转换
      isES6Enabled && [
        require("@babel/plugin-proposal-decorators").default,
        { legacy: true }
      ],
      isES6Enabled && [
        require("@babel/plugin-proposal-class-properties").default,
        { legacy: true }
      ]
    ].filter(Boolean)
  };
  return babelOptions;
};
