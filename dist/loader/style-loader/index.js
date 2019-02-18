"use strict";

var path = require("path");

var fs = require("fs");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var _require2 = require("../../util"),
    printer = _require2.printer;

var _require3 = require("@babel/core"),
    template = _require3.template;

var codeWrapper = template("\n  var NAME = _interopRequireDefault((function(style) {\n    var useCount = 0;\n\n    var headElement;\n    var firstLinkElement;\n    var styleElement;\n\n    function use() {\n      if (useCount++ > 0) {\n        return;\n      }\n\n      if (!headElement) {\n        headElement = document.head || document.getElementsByTagName('head')[0];\n      }\n\n      if (!firstLinkElement) {\n        var linkElements = headElement.getElementsByTagName('link');\n        for (var i = 0, l = linkElements.length; i < l; ++i) {\n          if (linkElements[i].rel === 'stylesheet') {\n            firstLinkElement = linkElements[i];\n            break;\n          }\n        }\n      }\n\n      if (!styleElement) {\n        styleElement = document.createElement('style');\n        firstLinkElement ? headElement.insertBefore(styleElement, firstLinkElement) : headElement.appendChild(styleElement);\n        styleElement.setAttribute('type', 'text/css');\n        // styleElement.setAttribute('data-src', '<%= src%>');\n        if (styleElement.styleSheet) {\n          styleElement.styleSheet.cssText = style;\n        } else {\n          styleElement.appendChild(document.createTextNode(style));\n        }\n      } else {\n        firstLinkElement ? headElement.insertBefore(styleElement, firstLinkElement) : headElement.appendChild(styleElement);\n      }\n    }\n\n    function unuse() {\n      if (useCount === 0) {\n        return;\n      }\n\n      if (--useCount === 0) {\n        headElement.removeChild(styleElement);\n      }\n    }\n\n    return {\n      use: use,\n      unuse: unuse\n    };\n  })('VALUE'))\n");
var defaultOptions = {};
/**
 * [样式表文件依赖处理器]
 * @param  {[type]} { dependName, paramName, filename } [dependName: dep中对应的依赖名, paramName: callback中对应的参数名, filename: 当前所处理的代码绝对路径]
 * @param  {[type]} options   [当前loader配置]
 * @return {[type]}          [处理之后的返回新source]
 */

module.exports = function (_ref, options) {
  var dependName = _ref.dependName,
      paramName = _ref.paramName,
      filename = _ref.filename;
  var globalOptions = getOptions();
  options = Object.assign({}, defaultOptions, options);
  var code, source;

  try {
    var resourcePath = globalOptions.resolve(dependName, filename);
    source = fs.readFileSync(resourcePath, "utf-8");
  } catch (error) {
    printer.error(error);
  } finally {}

  try {
    if (source) {
      code = codeWrapper({
        NAME: paramName,
        VALUE: source
      });
    }
  } catch (error) {
    printer.error(error);
  }

  return {
    acitve: false,
    code: code
  };
}; // 由于less，scss，styl编译需要借助gulp来执行，因此resolve步骤可以从dist中取，需要优化