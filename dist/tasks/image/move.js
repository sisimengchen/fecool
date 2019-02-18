"use strict";

var gulp = require("gulp");

var printer = require("../../gulp-plugin/gulp-printer");

var changed = require("gulp-changed");

var rename = require("gulp-rename");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var globalOptions = getOptions();

module.exports = function () {
  return gulp.task("image:move", function () {
    return gulp.src(globalOptions.getGulpSrc("{png,jpg,jpeg,gif,svg}")).pipe(changed(globalOptions.getGulpDest())).pipe(printer(function (filepath) {
      return "\u56FE\u7247\u590D\u5236\u4EFB\u52A1 ".concat(filepath);
    })).pipe(rename(function (path, file) {
      var module = globalOptions.getModule(file.path);
      var hashCode = module.hashCode;
      path.basename = hashCode ? "".concat(path.basename, ".").concat(hashCode) : path.basename;
    })).pipe(gulp.dest(globalOptions.getGulpDest()));
  });
};