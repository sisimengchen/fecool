"use strict";

/**
 * @file 公共css处理任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
var gulp = require("gulp");

var cached = require("gulp-cached");

var remember = require("gulp-remember");

var concat = require("gulp-concat");

var printer = require("../../gulp-plugin/gulp-printer");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var globalOptions = getOptions();

function cssConcat() {
  return gulp.src(globalOptions.getGulpCommon4Dest("css")).pipe(cached("css:common:concat")).pipe(printer(function (filepath) {
    return "css:common:concat: ".concat(filepath);
  })).pipe(remember("css:common:concat")).pipe(concat("common.css")).pipe(gulp.dest(globalOptions.getCommonDest()));
}

module.exports = cssConcat;