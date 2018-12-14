/**
 *  公共css处理任务
 */

const gulp = require("gulp");
const cached = require("gulp-cached");
const remember = require("gulp-remember");
const concat = require("gulp-concat");
const print = require("gulp-print").default;
const { getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = function() {
  return gulp.task("css:common:concat", done => {
    return gulp
      .src(globalOptions.getGulpCommon4Dest("css"))
      .pipe(cached("css:common:concat"))
      .pipe(print(filepath => `公共css合并: ${filepath}`))
      .pipe(remember("css:common:concat"))
      .pipe(concat("common.css"))
      .pipe(gulp.dest(globalOptions.getCommonDest()));
  });
};
