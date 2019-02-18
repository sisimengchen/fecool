"use strict";

var map = require("map-stream");

var _require = require("../../util"),
    printer = _require.printer;

module.exports = function gulpPrinter(format) {
  if (!format) {
    format = function format(filepath) {
      return filepath;
    };
  }

  function mapFile(file, cb) {
    var filepath = file.path;
    var formatted = format(filepath);

    if (formatted) {
      printer.log(formatted);
    }

    cb(null, file);
  }

  return map(mapFile);
};