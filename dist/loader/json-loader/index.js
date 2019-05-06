"use strict";

var path = require("path");

var fs = require("fs");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var _require2 = require("../../util"),
    printer = _require2.printer;

var _require3 = require("@babel/core"),
    template = _require3.template;

var generate = require("@babel/generator")["default"];

var codeWrapper = template("\n  define('NAME', function() {\n    return JSON.parse('VALUE');\n  })\n");
var defaultOptions = {
  minify: false
};
/**
 * [json文件依赖处理器]
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
  var module = {},
      source;

  try {
    if (dependName != "exports") {
      var resourcePath = globalOptions.resolve(dependName, filename);
      source = fs.readFileSync(resourcePath, "utf8");
      source = source.replace(getOptions.urlReg, function (match, p1) {
        // 针对#url做寻路
        var p2 = p1.replace(/\#[^\#]+$/, "");
        var p3 = globalOptions.resolve(p2, resourcePath);
        var module = globalOptions.getModule(p3); // 生成模块对象

        return "\"".concat(module.url, "\"");
      });

      if (options.minify) {
        source = JSON.parse(source);
        source = JSON.stringify(source).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
      }

      module = globalOptions.getModule(resourcePath, ".js"); // 生成模块对象

      var ast = codeWrapper({
        NAME: module.url || dependName,
        VALUE: source,
        JSON: "JSON"
      });
      var code = generate(ast).code;
      fs.writeFile(module.distFilename, code, "utf8", function (error) {
        if (error) throw err;
      });
    }
  } catch (error) {
    printer.error(error);
  } finally {}

  return module;
};