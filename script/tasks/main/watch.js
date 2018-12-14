const gulp = require("gulp");
const path = require("path");
const watch = require("gulp-watch");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = function() {
  return gulp.task("main:watch", function() {
    watch(globalOptions.getGulpSrc(), function(vinyl) {
      console.log(vinyl.path);
      var path = vinyl.path;
      var extname = vinyl.extname;
      if (extname === ".js") {
        gulp.start("js:compile");
      } else if (extname === ".es6") {
        gulp.start("es6:compile");
      } else if (extname === ".jsx") {
        gulp.start("jsx:compile");
      } else if (extname === ".styl") {
        gulp.start("styl:compile");
      } else if (extname === ".less") {
        gulp.start("less:compile");
      } else if (
        extname === ".png" ||
        extname === ".jpg" ||
        extname === ".jpeg" ||
        extname === ".gif" ||
        extname === ".svg"
      ) {
        gulp.start("images:move");
      } else {
        gulp.start("other:move");
      }
    });
  });
};
