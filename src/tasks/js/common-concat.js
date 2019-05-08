/**
 * @file 公共js合并任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const gulp = require("gulp");
const gulpif = require("gulp-if");
const concat = require("gulp-concat");
const printer = require("../../gulp-plugin/gulp-printer");
const cached = require("gulp-cached");
const remember = require("gulp-remember");
const uglify = require("gulp-uglify");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

function commonjsConcat() {
  return gulp
    .src(globalOptions.getCommonSrc("js"))
    .pipe(cached("js:common-concat"))
    .pipe(printer(filepath => `公共js合并任务 ${filepath}`))
    .pipe(remember("js:common-concat"))
    .pipe(concat("common.js"))
    .pipe(gulpif(!globalOptions.isDevelopENV(), uglify()))
    .pipe(gulp.dest(globalOptions.getCommonDest()));
}

module.exports = commonjsConcat;
