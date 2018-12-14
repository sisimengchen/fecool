const gulp = require("gulp");
const concat = require("gulp-concat");
const print = require("gulp-print").default;
const cached = require("gulp-cached");
const remember = require("gulp-remember");
const { getBabelOptions, getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = function() {
  return gulp.task("js:common-concat", done => {
    return gulp
      .src(globalOptions.getCommonSrc("js"))
      .pipe(cached("js:common-concat"))
      .pipe(print(filepath => `公共js合并: ${filepath}`))
      .pipe(concat("common.js"))
      .pipe(remember("js:common-concat"))
      .pipe(gulp.dest(globalOptions.getCommonDest()));
  });
};
