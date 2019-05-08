"use strict";

var gulp = require("gulp");

var gulpif = require("gulp-if");

var concat = require("gulp-concat");

var printer = require("../../gulp-plugin/gulp-printer");

var cached = require("gulp-cached");

var remember = require("gulp-remember");

var uglify = require("gulp-uglify");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var globalOptions = getOptions();

function commonjsConcat() {
  return gulp.src(globalOptions.getCommonSrc("js")).pipe(cached("js:common-concat")).pipe(printer(function (filepath) {
    return "\u516C\u5171js\u5408\u5E76\u4EFB\u52A1 ".concat(filepath);
  })).pipe(remember("js:common-concat")).pipe(concat("common.js")).pipe(gulpif(!globalOptions.isDevelopENV(), uglify())).pipe(gulp.dest(globalOptions.getCommonDest()));
}

module.exports = commonjsConcat;