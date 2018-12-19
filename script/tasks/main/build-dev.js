const gulp = require("gulp");
const getPackage = require("../../package");
const runSequence = require("run-sequence").use(gulp);
const { printer } = require("../../util");

require("../other/move")();
require("../css/compile-stylus")();
require("../css/compile-less")();
require("../css/compress")();
// require('../js/common')();
require("../js/compile")();
require("../image/move")();
require("../image/compress")();

module.exports = function() {
  return gulp.task("main:build-dev", function(cb) {
    runSequence(
      [
        "other:move" // 移动
      ],
      [
        "styl:compile", // styl编译
        "less:compile" // less编译
      ],
      [
        "js:compile", // js编译
        // "es6:compile", // es6编译
        "jsx:compile" // jsx编译
      ],
      function() {
        printer.log("gulp执行完毕");
        printer.log("依赖打包开始");
        // getPackage().resovleDependencies();
        // console.log(getPackage().dependenciesMap);
        // getPackage().concatDependencies();
        printer.log("依赖打包结束");
        printer.log("静态资源编译完成");
        cb && cb();
      }
    );
  });
};

/*
      [
        'image:move', // image移动
        'other:move' // js编译
      ], [
        'styl:compile', // styl编译
        'less:compile', // less编译
      ], [
        'js:compile', // js编译
        'es6:compile', // es6编译
        'jsx:compile' // jsx编译
      ], [
        'css:common', // common css合并
        'js:common' // common js合并
      ],
 */
