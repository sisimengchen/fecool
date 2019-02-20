"use strict";

/**
 * 获取Babel的配置
 */
var getOptions = require("./getOptions");

module.exports = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    isModule: false,
    isES6Enabled: true,
    isReactEnabled: false
  };
  var isModule = options.isModule,
      isES6Enabled = options.isES6Enabled,
      isReactEnabled = options.isReactEnabled;
  isES6Enabled = isReactEnabled ? isReactEnabled : isES6Enabled;
  var babelOptions = {
    sourceType: "module",
    compact: getOptions().isDevelopENV() ? "auto" : true,
    minified: getOptions().isDevelopENV() ? false : true,
    comments: getOptions().isDevelopENV() ? true : false,
    presets: [[require("../babel-preset-fecool")], isES6Enabled && [require("@babel/preset-env").default, {
      // targets: {
      //   ie: 9
      // },
      ignoreBrowserslistConfig: true,
      // useBuiltIns: "entry",
      useBuiltIns: false,
      targets: {
        browsers: ["Android >= 4.0", "ios >= 8", "ie >=9"]
      },
      modules: isModule ? false : "amd" // modules: false,
      // modules: 'amd'
      // debug: true

    }], isReactEnabled && [require("@babel/preset-react").default, {
      development: false,
      useBuiltIns: true
    }]].filter(Boolean),
    plugins: [[require("../babel-plugin-tinytool")], // isES6Enabled && [require('babel-plugin-transform-class-properties')],
    // isES6Enabled && [require('babel-plugin-transform-object-rest-spread')],
    // isES6Enabled && [require('babel-plugin-transform-export-extensions')],
    // isES6Enabled && [require('babel-plugin-transform-decorators-legacy').default],
    isES6Enabled && [require("@babel/plugin-transform-runtime").default, {
      corejs: false,
      helpers: false // polyfill: false,
      // regenerator: true

    }]].filter(Boolean)
  }; // debugger;

  return babelOptions;
};