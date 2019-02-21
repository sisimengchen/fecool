const { getOptions } = require("../dist/config");
const { printer } = require("../dist/util");
const asciiArt = require("../dist/util/asciiArt");

module.exports = function init() {
  asciiArt("fecool");
  const globalOptions = getOptions();
  if (globalOptions.isWatch()) {
    const watchBuild = require("../dist/tasks/main/watch");
    watchBuild()
  } else if (globalOptions.isDevelopENV()) {
    const devBuild = require("../dist/tasks/main/build-dev");
    devBuild();
  } else {
    printer.time("静态资源编译时间");
    printer.time("编译任务执行时间");
    const build = require("../dist/tasks/main/build");
    build();
  }
};
