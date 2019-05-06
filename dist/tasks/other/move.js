"use strict";

var gulp = require("gulp");

var printer = require("../../gulp-plugin/gulp-printer");

var changed = require("gulp-changed");

var rename = require("gulp-rename");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var globalOptions = getOptions();

function move() {
  return gulp.src(globalOptions.getGulpSrc("*", "{js,jsx,css,less,styl,html,phtml}")).pipe(changed(globalOptions.getGulpDest())).pipe(printer(function (filepath) {
    return "\u8D44\u6E90\u590D\u5236\u4EFB\u52A1 ".concat(filepath);
  })).pipe(rename(function (path, file) {
    var module = globalOptions.getModule(file.path);
    var hashCode = module.hashCode;
    path.basename = hashCode ? "".concat(path.basename, ".").concat(hashCode) : path.basename;
  })).pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = move;