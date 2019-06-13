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

var codeWrapper = template("define(\"NAME\",function(){return(function(d){var e=0;var f;var c;var a;function b(){if(e++>0){return}if(!f){f=document.head||document.getElementsByTagName(\"head\")[0]}if(!c){var k=f.getElementsByTagName(\"link\");for(var j=0,h=k.length;j<h;++j){if(k[j].rel===\"stylesheet\"){c=k[j];break}}}if(!a){a=document.createElement(\"style\");c?f.insertBefore(a,c):f.appendChild(a);a.setAttribute(\"type\",\"text/css\");if(a.styleSheet){a.styleSheet.cssText=d}else{a.appendChild(document.createTextNode(d))}}else{c?f.insertBefore(a,c):f.appendChild(a)}}function g(){if(e===0){return}if(--e===0){f.removeChild(a)}}return{use:b,unuse:g}})(\"VALUE\")});");
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
      fs.writeFile(module.distFilename, code, "utf8", function (error) {
        if (error) throw err;
      });
    }
  } catch (error) {
    printer.error(error);
  } finally {}

  return module;
};