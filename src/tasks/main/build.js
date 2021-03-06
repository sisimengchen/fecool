/**
 * @file 生产环境构建任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const { series, parallel } = require("gulp");
const getPackage = require("../../package");
const { printer } = require("../../util");
const {
  clean,
  move,
  moveExclude,
  cssCompile,
  stylusCompile,
  lessCompile,
  jsCompile,
  jsxCompile,
  commonjsConcat,
  htmlCompile,
  phtmlCompile,
} = require("./index.js");

const build = series(
  parallel(clean),
  parallel(move, moveExclude),
  parallel(cssCompile, stylusCompile, lessCompile),
  parallel(jsCompile, jsxCompile, commonjsConcat),
  parallel(htmlCompile, phtmlCompile),
  function(cb) {
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
module.exports = build;
