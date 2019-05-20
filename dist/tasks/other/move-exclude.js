"use strict";

var gulp = require("gulp");

var printer = require("../../gulp-plugin/gulp-printer");

var changed = require("gulp-changed");

var rename = require("gulp-rename");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var globalOptions = getOptions();

function moveExclude() {
  var srcs = globalOptions.getExcludeSrc();
  var dests = globalOptions.getExcludeDest();
  var tasks = srcs.map(function (src, index) {
    return function () {
      return gulp.src(src).pipe(changed(dests[index])).pipe(printer(function (filepath) {
        return "\u6392\u9664\u7F16\u8BD1\u8D44\u6E90\u590D\u5236\u4EFB\u52A1 ".concat(filepath);
      })).pipe(rename(function (path, file) {
        var module = globalOptions.getModule(file.path);
        var hashCode = module.hashCode;
        path.basename = hashCode ? "".concat(path.basename, ".").concat(hashCode) : path.basename;
      })).pipe(gulp.dest(dests[index]));
    };
  });
  return tasks;
}

module.exports = moveExclude();