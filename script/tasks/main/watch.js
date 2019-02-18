const gulp = require("gulp");
const path = require("path");
const watch = require("gulp-watch");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = function() {
  return gulp.task("main:watch", ["main:build-dev"], function(cb) {
    return watch(globalOptions.getGulpSrc(), function(vinyl) {
      console.log(vinyl.path);
      const path = vinyl.path;
      const extname = vinyl.extname;
      if (extname === ".js") {
        gulp.start("js:compile");
      } else if (extname === ".jsx") {
        gulp.start("jsx:compile");
      } else if (extname === ".css") {
        gulp.start("css:compile");
      } else if (extname === ".styl") {
        gulp.start("styl:compile");
      } else if (extname === ".less") {
        gulp.start("less:compile");
      } else if (extname === ".html") {
        gulp.start("html:compile");
      } else {
        gulp.start("other:move");
      }
    });
  });
};
