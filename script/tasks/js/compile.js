const gulp = require("gulp");
const gulpif = require("gulp-if");
const babel = require("gulp-babel");
const print = require("gulp-print").default;
const cached = require("gulp-cached");
const remember = require("gulp-remember");
const rename = require("gulp-rename");
const { getBabelOptions, getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = function() {
  globalOptions.js.types.forEach(type => {
    // console.log(globalOptions.getGulpSrc(type, false, true))
    // console.log(globalOptions.getGulpDest());
    gulp.task(`${type}:compile` /*, ['js:check']*/, done => {
      return (
        gulp
          .src(globalOptions.getGulpSrc(type, false, true))
          // .pipe(cached(`${type}:compile`))
          .pipe(print(filepath => `${type}编译: ${filepath}`))
          .pipe(
            babel(
              getBabelOptions({
                isOldJSEnabled: type == "js" ? true : false,
                isES6Enabled: type == "es6" ? true : false,
                isReactEnabled: type == "jsx" ? true : false
              })
            )
          )
          // .pipe(
          //   rename(function(path) {
          //     console.log(path)
          //   })
          // )
          // .gulp.dest('../../../dest')
          // .pipe(print(filepath => `${type}编译22: ${filepath}`))
          // .pipe(remember(`${type}:compile`))
          .pipe(gulp.dest(globalOptions.getGulpDest()))
      );
    });
  });
};
