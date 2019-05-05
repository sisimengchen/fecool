"use strict";

/**
 * @file 开发环境构建任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
var _require = require("gulp"),
    series = _require.series,
    parallel = _require.parallel;

var _require2 = require("./index.js"),
    move = _require2.move,
    cssCompile = _require2.cssCompile,
    stylusCompile = _require2.stylusCompile,
    lessCompile = _require2.lessCompile,
    jsCompile = _require2.jsCompile,
    jsxCompile = _require2.jsxCompile,
    commonjsConcat = _require2.commonjsConcat,
    htmlCompile = _require2.htmlCompile,
    phtmlCompile = _require2.phtmlCompile;

var devBuild = series(parallel(move), parallel(cssCompile, stylusCompile, lessCompile), parallel(jsCompile, jsxCompile, commonjsConcat), parallel(htmlCompile, phtmlCompile));
module.exports = devBuild;