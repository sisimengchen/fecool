"use strict";

var path = require("path");

var fs = require("fs");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var _require2 = require("../../util"),
    printer = _require2.printer;

var babel = require("@babel/core");

var generate = require("@babel/generator")["default"];

var codeWrapper = babel.template("define(\"NAME\",function(){return(function(d){var e=0;var f;var c;var a;function b(){if(e++>0){return}if(!f){f=document.head||document.getElementsByTagName(\"head\")[0]}if(!c){var k=f.getElementsByTagName(\"link\");for(var j=0,h=k.length;j<h;++j){if(k[j].rel===\"stylesheet\"){c=k[j];break}}}if(!a){a=document.createElement(\"style\");c?f.insertBefore(a,c):f.appendChild(a);a.setAttribute(\"type\",\"text/css\");if(a.styleSheet){a.styleSheet.cssText=d}else{a.appendChild(document.createTextNode(d))}}else{c?f.insertBefore(a,c):f.appendChild(a)}}function g(){if(e===0){return}if(--e===0){f.removeChild(a)}}return{use:b,unuse:g}})(\"VALUE\")});");
var defaultOptions = {};

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
      module = globalOptions.getModule(resourcePath, ".js");
      source = fs.readFileSync(module.distFilenameRaw, "utf8");
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