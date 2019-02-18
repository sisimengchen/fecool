"use strict";

var gulp = require("gulp"); // const printer = require("../../gulp-plugin/gulp-printer");


var del = require("del");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var globalOptions = getOptions();

module.exports = function () {
  return gulp.task("clean", function () {
    return del(["".concat(globalOptions.getGulpDest(), "/**/*")]);
  });
};