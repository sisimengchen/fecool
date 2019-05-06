/**
 * @file 图片压缩任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const printer = require("../../gulp-plugin/gulp-printer");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

function imageCompress() {
  if (!globalOptions.imagemin) { // 是否执行图片压缩命令，根据用户配置决定
    return Promise.resolve("the imageCompress is ignored");
  }
  return gulp
    .src(globalOptions.getGulpSrc4Dest("{png,jpg,jpeg,gif,svg}"))
    .pipe(printer(filepath => `图片压缩任务 ${filepath}`))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }), // Compress GIF images
        imagemin.jpegtran({ progressive: true }), // Compress JPEG images
        imagemin.optipng({ optimizationLevel: 3 }), // Compress PNG images
        imagemin.svgo({
          plugins: [
            { cleanupIDs: false },
            { removeViewBox: false },
            { convertPathData: false },
            { mergePaths: false }
          ]
        }) // Compress SVG images
      ])
    )
    .pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = imageCompress;
