"use strict";

var path = require("path");

var fs = require("fs");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var _require2 = require("../../util"),
    printer = _require2.printer,
    getDataURI = _require2.getDataURI;

var _require3 = require("@babel/core"),
    template = _require3.template;

var codeWrapper = template("\n  var NAME = _interopRequireDefault('VALUE')\n");
var defaultOptions = {
  limit: 10000
};
/**
 * [图片依赖处理器]
 * @param  {[type]} { dependName, paramName, filename } [dependName: dep中对应的依赖名, paramName: callback中对应的参数名, filename: 当前所处理的代码绝对路径]
 * @param  {[type]} options   [当前loader配置]
 * @return {[type]}          [处理之后的返回新source]
 */

module.exports = function (_ref) {
  var dependName = _ref.dependName,
      paramName = _ref.paramName,
      filename = _ref.filename;
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var globalOptions = getOptions();
  options = Object.assign({}, defaultOptions, options);
  var code, source;

  try {
    var resourcePath = globalOptions.resolve(dependName, filename);

    var _fs$lstatSync = fs.lstatSync(resourcePath),
        size = _fs$lstatSync.size;

    if (size < options.limit) {
      // 图片输出成base64
      source = getDataURI(resourcePath);
    } else {
      var _module = globalOptions.getModule(resourcePath); // 生成模块对象


      source = _module.url;
    }
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
}; // 由于图片压缩需要借助gulp来执行，因此resolve步骤可以从dist中取，需要优化