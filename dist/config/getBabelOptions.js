"use strict";

var getOptions = require("./getOptions");

module.exports = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    isES6Enabled: true,
    isReactEnabled: false,
    isCommonModules: false
  };
  var isES6Enabled = options.isES6Enabled,
      isReactEnabled = options.isReactEnabled,
      isCommonModules = options.isCommonModules;
  isES6Enabled = isReactEnabled ? isReactEnabled : isES6Enabled;
  var babelOptions = {
    sourceType: "module",
    compact: getOptions().isDevelopENV() ? false : true,
    minified: getOptions().isDevelopENV() ? false : true,
    comments: getOptions().isDevelopENV() ? true : false,
    presets: [[require("../babel-preset-fecool")], isES6Enabled && [require("@babel/preset-env")["default"], {
      ignoreBrowserslistConfig: true,
      useBuiltIns: false,
      targets: {
        browsers: ["Android >= 4.0", "ios >= 8", "ie >=9"]
      },
      modules: isCommonModules ? false : "amd"
    }], isReactEnabled && [require("@babel/preset-react")["default"], {
      development: false,
      useBuiltIns: true
    }]].filter(Boolean),
    plugins: [[require("../babel-plugin-transform-tinytool")], isES6Enabled && [require("@babel/plugin-proposal-decorators")["default"], {
      legacy: true
    }], isES6Enabled && [require("@babel/plugin-proposal-class-properties")["default"], {
      legacy: true
    }]].filter(Boolean)
  };
  return babelOptions;
};