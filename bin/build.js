const gulp = require("gulp");
const { getOptions } = require("../script/config");
const { printer } = require("../script/util");
const asciiArt = require("../script/util/asciiArt");

module.exports = function init() {
  asciiArt("fetool");
  const globalOptions = getOptions();
  require("../script/tasks/main");
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
