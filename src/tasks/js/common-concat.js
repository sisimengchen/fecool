/**
 * @file 公共js合并任务
 * @author mengchen <mengchen002@ke.com>
 * @module package
 */
const gulp = require("gulp");
const concat = require("gulp-concat");
const printer = require("../../gulp-plugin/gulp-printer");
const cached = require("gulp-cached");
const remember = require("gulp-remember");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

function commonjsConcat() {
  return (
    gulp
      .src(globalOptions.getCommonSrc("js"))
      .pipe(cached("js:common-concat"))
      .pipe(printer(filepath => `公共js合并任务 ${filepath}`))
      .pipe(remember("js:common-concat"))
      .pipe(concat("common.js"))
      .pipe(gulp.dest(globalOptions.getCommonDest()))
  );
}

module.exports = commonjsConcat;
