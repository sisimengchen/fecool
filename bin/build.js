const gulp = require("gulp");
const { getOptions } = require("../dist/config");
const { printer } = require("../dist/util");
const asciiArt = require("../dist/util/asciiArt");

module.exports = function init() {
  asciiArt("fecool");
  const globalOptions = getOptions();
  require("../dist/tasks/main");
  if (globalOptions.isWatch()) {
    gulp.start("main:watch");
  } else if (globalOptions.isDevelopENV()) {
    gulp.start("main:build-dev");
  } else {
    printer.time("静态资源编译时间");
    printer.time("编译任务执行时间");
    gulp.start("main:build");
  }
};
