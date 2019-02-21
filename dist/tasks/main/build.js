"use strict";

var _require = require("gulp"),
    series = _require.series,
    parallel = _require.parallel;

var getPackage = require("../../package");

var _require2 = require("../../util"),
    printer = _require2.printer;

var _require3 = require("./index.js"),
    clean = _require3.clean,
    move = _require3.move,
    cssCompile = _require3.cssCompile,
    stylusCompile = _require3.stylusCompile,
    lessCompile = _require3.lessCompile,
    jsCompile = _require3.jsCompile,
    jsxCompile = _require3.jsxCompile,
    commonjsConcat = _require3.commonjsConcat,
    htmlCompile = _require3.htmlCompile,
    imageCompress = _require3.imageCompress;

var build = series(parallel(clean), parallel(move), parallel(cssCompile, stylusCompile, lessCompile), parallel(jsCompile, jsxCompile, commonjsConcat), parallel(htmlCompile), parallel(imageCompress), function (cb) {
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
});
module.exports = build;