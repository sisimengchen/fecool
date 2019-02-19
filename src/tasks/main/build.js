const gulp = require("gulp");
const getPackage = require("../../package");
const runSequence = require("run-sequence").use(gulp);
const { printer } = require("../../util");

module.exports = function() {
  return gulp.task("main:build", function(cb) {
    runSequence(
      [
        "clean" // 目录清理
      ],
      [
        "other:move", // 目录迁移
        // "image:move"
      ],
      [
        "css:compile", // css编译
        "styl:compile", // styl编译
        "less:compile" // less编译
      ],
      [
        "js:compile", // js编译
        "jsx:compile", // jsx编译
        "js:common-concat"
      ],
      [
        "html:compile" // html编译
      ],
      [
        // 'html:compress', // html压缩
        // 'js:compress', // js压缩
        "image:compress" // 图片压缩
      ],
      function() {
        printer.log("编译任务执行完毕");
        printer.timeEnd("编译任务执行时间");
        printer.time("打包任务执行时间");
        printer.log("打包任务执行开始");
        getPackage().resovleDependencies();
        printer.log("依赖映射表", getPackage().dependenciesMap);
        getPackage().concatDependencies();
        printer.log("打包任务执行完毕");
        printer.timeEnd("打包任务执行时间");
        printer.log("静态资源编译完毕");
        printer.timeEnd("静态资源编译时间");
        cb && cb();
      }
    );
  });
};
