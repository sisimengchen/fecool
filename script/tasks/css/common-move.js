/**
 *  公共css移动任务
 */

const gulp = require("gulp");
const print = require("gulp-print").default;
const cached = require("gulp-cached");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task("css:common:move", () => {
    return gulp
      .src(globalOptions.getCommonSrc("css"))
      .pipe(cached("css:common:move"))
      .pipe(print(filepath => `公共css移动: ${filepath}`))
      .pipe(gulp.dest(globalOptions.getCommonDest()));
  });
};
