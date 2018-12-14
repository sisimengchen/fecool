/**
 *  css压缩处理任务（css => minify css）
 */

const gulp = require("gulp");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const print = require("gulp-print").default;
const cached = require("gulp-cached");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task("css:compress", done => {
    return gulp
      .src(globalOptions.getGulpSrc4Dest("css"))
      .pipe(cached("css:compress"))
      .pipe(print(filepath => `css压缩: ${filepath}`))
      .pipe(postcss([cssnano()]))
      .pipe(gulp.dest(globalOptions.getGulpDest()));
  });
};
