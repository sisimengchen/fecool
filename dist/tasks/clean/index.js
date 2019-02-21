"use strict";

var del = require("del");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var globalOptions = getOptions();

function clean() {
  return del(["".concat(globalOptions.getGulpDest(), "/**/*")]);
}

module.exports = clean;