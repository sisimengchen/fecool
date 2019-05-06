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
      source = getDataURI(resourcePath);
    } else {
      var _module = globalOptions.getModule(resourcePath);

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
    code: code
  };
};