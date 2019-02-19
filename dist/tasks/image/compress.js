"use strict";

/**
 * @file 图片压缩任务
 * @author mengchen <mengchen002@ke.com>
 * @module package
 */
var gulp = require("gulp");

var gulpif = require("gulp-if");

var imagemin = require("gulp-imagemin");

var printer = require("../../gulp-plugin/gulp-printer");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var globalOptions = getOptions();

module.exports = function () {
  return gulp.task("image:compress", function () {
    if (process.env.IMAGE_MIN == '0') {
      return undefined;
    }

    return gulp.src(globalOptions.getGulpSrc4Dest("{png,jpg,jpeg,gif,svg}")).pipe(printer(function (filepath) {
      return "\u56FE\u7247\u538B\u7F29\u4EFB\u52A1 ".concat(filepath);
    })).pipe(imagemin([imagemin.gifsicle({
      interlaced: true
    }), imagemin.jpegtran({
      progressive: true
    }), imagemin.optipng({
      optimizationLevel: 5
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
  });
};