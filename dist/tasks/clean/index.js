"use strict";

/**
 * @file 构建目录清理任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
var del = require("del");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var globalOptions = getOptions();

function clean() {
  return del(["".concat(globalOptions.getGulpDest(), "/**/*")]);
}

module.exports = clean;