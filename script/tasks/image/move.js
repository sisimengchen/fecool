const gulp = require("gulp");
const print = require("gulp-print").default;
const cached = require("gulp-cached");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task("image:move", () => {
    return gulp
      .src(globalOptions.getGulpSrc("{png,jpg,jpeg,gif,svg}"))
      .pipe(cached("image:move"))
      .pipe(print(filepath => `图片移动: ${filepath}`))
      .pipe(gulp.dest(globalOptions.getGulpDest()));
  });
};
