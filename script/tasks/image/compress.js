/**
 * @file 图片压缩任务
 * @author mengchen <mengchen002@ke.com>
 * @module package
 */
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const printer = require("../../gulp-plugin/gulp-printer");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task("image:compress", () => {
    return gulp
      .src(globalOptions.getGulpSrc4Dest("{png,jpg,jpeg,gif,svg}"))
      .pipe(printer(filepath => `图片压缩任务 ${filepath}`))
      .pipe(
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          imagemin.jpegtran({ progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({
            plugins: [
              { cleanupIDs: false },
              { removeViewBox: false },
              { convertPathData: false },
              { mergePaths: false }
            ]
          })
        ])
      )
      .pipe(gulp.dest(globalOptions.getGulpDest()));
  });
};
