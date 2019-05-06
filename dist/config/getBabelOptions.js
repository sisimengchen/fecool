"use strict";

/**
 * @file babel配置生成器
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
var getOptions = require("./getOptions");

module.exports = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    isES6Enabled: true,
    isReactEnabled: false
  };
  var isES6Enabled = options.isES6Enabled,
      isReactEnabled = options.isReactEnabled;
  isES6Enabled = isReactEnabled ? isReactEnabled : isES6Enabled;
  var babelOptions = {
    sourceType: "module",
    // retainLines: getOptions().isDevelopENV() ? true : false,
    compact: getOptions().isDevelopENV() ? false : true,
    minified: getOptions().isDevelopENV() ? false : true,
    comments: getOptions().isDevelopENV() ? true : false,
    presets: [[require("../babel-preset-fecool")], // 最后收集依赖
    isES6Enabled && [require("@babel/preset-env")["default"], {
      ignoreBrowserslistConfig: true,
      // useBuiltIns: "entry",
      useBuiltIns: false,
      targets: {
        browsers: ["Android >= 4.0", "ios >= 8", "ie >=9"]
      },
      modules: "amd" // debug: true

    }], isReactEnabled && [require("@babel/preset-react")["default"], {
      development: false,
      useBuiltIns: true
    }]].filter(Boolean),
    plugins: [[require("../babel-plugin-transform-tinytool")], // 最先执行tinytool代码的转换
    isES6Enabled && [require("@babel/plugin-proposal-decorators")["default"], {
      legacy: true
    }], isES6Enabled && [require("@babel/plugin-proposal-class-properties")["default"], {
      legacy: true
    }], isES6Enabled && [require("@babel/plugin-transform-runtime")["default"], {
      corejs: false,
      helpers: false // polyfill: false,
      // regenerator: true

    }]].filter(Boolean)
  };
  return babelOptions;
};