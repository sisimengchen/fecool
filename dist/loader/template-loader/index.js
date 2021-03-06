"use strict";

var path = require("path");

var fs = require("fs");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var minify = require("html-minifier").minify;

var _require2 = require("../../util"),
    printer = _require2.printer;

var babel = require("@babel/core");

var generate = require("@babel/generator")["default"];

var codeWrapper = babel.template("\n  define('NAME', function() {\n    return 'VALUE';\n  })\n");
var defaultOptions = {
  minify: false
};

module.exports = function (_ref) {
  var dependName = _ref.dependName,
      paramName = _ref.paramName,
      filename = _ref.filename;
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var globalOptions = getOptions();
  options = Object.assign({}, defaultOptions, options);
  var module = {},
      source;

  try {
    if (dependName != "exports") {
      var resourcePath = globalOptions.resolve(dependName, filename);
      source = fs.readFileSync(resourcePath, "utf8");
      source = source.replace(getOptions.urlReg, function (match, p1) {
        var p2 = p1.replace(/\#[^\#]+$/, "");
        var p3 = globalOptions.resolve(p2, resourcePath);
        var module = globalOptions.getModule(p3);
        return "\"".concat(module.url, "\"");
      });

      if (options.minify) {
        source = minify(source, {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        });
      }

      module = globalOptions.getModule(resourcePath, ".js");
      var ast = codeWrapper({
        NAME: module.url || dependName,
        VALUE: source
      });
      var code = generate(ast).code;

      if (getOptions().isDevelopENV()) {
        fs.writeFile(module.distFilename, code, "utf8", function (error) {
          if (error) throw err;
        });
      } else {
        babel.transform(code, {
          configFile: false,
          babelrc: false,
          minified: true,
          compact: true
        }, function (error, result) {
          if (error) throw err;
          fs.writeFile(module.distFilename, result.code, "utf8", function (error) {
            if (error) throw err;
          });
        });
      }
    }
  } catch (error) {
    printer.error(error);
  } finally {}

  return module;
};