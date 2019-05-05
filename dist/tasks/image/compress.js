"use strict";

/**
 * @file 图片压缩任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
var gulp = require("gulp");

var imagemin = require("gulp-imagemin");

var printer = require("../../gulp-plugin/gulp-printer");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var globalOptions = getOptions();

function imageCompress() {
  if (!globalOptions.imagemin) {
    // 是否执行图片压缩命令，根据用户配置决定
    return Promise.resolve("the imageCompress is ignored");
  }

  return gulp.src(globalOptions.getGulpSrc4Dest("{png,jpg,jpeg,gif,svg}")).pipe(printer(function (filepath) {
    return "\u56FE\u7247\u538B\u7F29\u4EFB\u52A1 ".concat(filepath);
  })).pipe(imagemin([imagemin.gifsicle({
    interlaced: true
  }), // Compress GIF images
  imagemin.jpegtran({
    progressive: true
  }), // Compress JPEG images
  imagemin.optipng({
    optimizationLevel: 3
  }), // Compress PNG images
  imagemin.svgo({
    plugins: [{
      cleanupIDs: false
    }, {
      removeViewBox: false
    }, {
      convertPathData: false
    }, {
      mergePaths: false
    }]
  }) // Compress SVG images
  ])).pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = imageCompress;