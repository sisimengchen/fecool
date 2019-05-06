"use strict";

var path = require("path");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var _require2 = require("../../util"),
    printer = _require2.printer;

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
      module = globalOptions.getModule(resourcePath);
    }
  } catch (error) {
    printer.error(error);
  } finally {}

  return module;
};