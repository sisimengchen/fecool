"use strict";

var path = require("path");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var _require2 = require("../../util"),
    printer = _require2.printer;
/**
 * [默认依赖处理器]
 * @param  {[type]} { dependName, paramName, filename } [dependName: dep中对应的依赖名, paramName: callback中对应的参数名, filename: 当前所处理的代码绝对路径]
 * @param  {[type]} options   [当前loader配置]
 * @return {[type]}          [处理之后的返回模块对象]
 */


module.exports = function (_ref) {
  var dependName = _ref.dependName,
      paramName = _ref.paramName,
      filename = _ref.filename;
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var globalOptions = getOptions();
  var module = {};

  try {
    if (dependName != "exports") {
      var resourcePath = globalOptions.resolve(dependName, filename);
      module = globalOptions.getModule(resourcePath); // 生成模块对象
    }
  } catch (error) {
    printer.error(error);
  } finally {}

  return module;
};