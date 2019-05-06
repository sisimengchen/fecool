"use strict";

var gulp = require("gulp");

var imagemin = require("gulp-imagemin");

var printer = require("../../gulp-plugin/gulp-printer");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var globalOptions = getOptions();

function imageCompress() {
  if (!globalOptions.imagemin) {
    return Promise.resolve("the imageCompress is ignored");
  }

  return gulp.src(globalOptions.getGulpSrc4Dest("{png,jpg,jpeg,gif,svg}")).pipe(printer(function (filepath) {
    return "\u56FE\u7247\u538B\u7F29\u4EFB\u52A1 ".concat(filepath);
  })).pipe(imagemin([imagemin.gifsicle({
    interlaced: true
  }), imagemin.jpegtran({
    progressive: true
  }), imagemin.optipng({
    optimizationLevel: 3
  }), imagemin.svgo({
    plugins: [{
      cleanupIDs: false
    }, {
      removeViewBox: false
    }, {
      convertPathData: false
    }, {
      mergePaths: false
    }]
  })])).pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = imageCompress;