"use strict";

var gulp = require("gulp");

var getPackage = require("../../package");

var runSequence = require("run-sequence").use(gulp);

module.exports = function () {
  return gulp.task("main:build-dev", function (cb) {
    runSequence(["other:move"], ["css:compile", // css编译
    "styl:compile", // styl编译
    "less:compile" // less编译
    ], ["js:compile", // js编译
    "jsx:compile", // jsx编译
    "js:common-concat"], ["html:compile" // 目录迁移
    ], function () {
      cb && cb();
    });
  });
};