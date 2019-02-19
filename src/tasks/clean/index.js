const gulp = require("gulp");
// const printer = require("../../gulp-plugin/gulp-printer");
const del = require("del");
const { getOptions } = require("../../config");

const globalOptions = getOptions();
module.exports = () => {
  return gulp.task("clean", function() {
    return del([`${globalOptions.getGulpDest()}/**/*`]);
  });
};
