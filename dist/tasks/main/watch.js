"use strict";

var _require = require("gulp"),
    watch = _require.watch;

var _require2 = require("../../config"),
    getOptions = _require2.getOptions;

var devBuild = require("./build-dev");

var _require3 = require("./index.js"),
    move = _require3.move,
    cssCompile = _require3.cssCompile,
    stylusCompile = _require3.stylusCompile,
    lessCompile = _require3.lessCompile,
    jsCompile = _require3.jsCompile,
    jsxCompile = _require3.jsxCompile,
    htmlCompile = _require3.htmlCompile,
    phtmlCompile = _require3.phtmlCompile;

var globalOptions = getOptions();

function watchBuild() {
  devBuild(function () {
    watch(globalOptions.getGulpSrc("js", false, true), jsCompile);
    watch(globalOptions.getGulpSrc("jsx", false, true), jsxCompile);
    watch(globalOptions.getGulpSrc("css"), cssCompile);
    watch(globalOptions.getGulpSrc("styl"), stylusCompile);
    watch(globalOptions.getGulpSrc("less"), lessCompile);
    watch(globalOptions.getGulpSrc("html"), htmlCompile);
    watch(globalOptions.getGulpSrc("phtml"), phtmlCompile);
    watch(globalOptions.getGulpSrc("*", globalOptions.getIgnoreMove()), move);
  });
}

module.exports = watchBuild;