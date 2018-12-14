const gulp = require("gulp");
const getPackage = require("../../package");
const runSequence = require("run-sequence").use(gulp);

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
        "es6:compile", // es6编译
        "jsx:compile" // jsx编译
      ],
      function() {
        // console.log(getPackage().module);
        // const allDependencies = [];
        // getPackage().getDependenciesByName(
        //   "/Users/mengchen/project/fetool/src/m/page/antd/app.js",
        //   allDependencies
        // );
        // console.log("allDependencies", allDependencies);
        getPackage().resovleDependencies();
        getPackage().concatDependencies();
        // console.log("dependenciesMap", getPackage().dependenciesMap);
        // const dependenciesMap = getPackage().dependenciesMap;
        // var concat = new Concat(false, "all.js", "\n");
        // const keys =
        console.log("over");
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
