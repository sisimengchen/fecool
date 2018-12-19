const gulp = require("gulp");
const gulpif = require("gulp-if");
const babel = require("gulp-babel");
const gulpmatch = require("gulp-match");
const map = require("map-stream");
const print = require("gulp-print").default;
const cached = require("gulp-cached");
const remember = require("gulp-remember");
const rename = require("gulp-rename");
const { getBabelOptions, getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = function() {
  globalOptions.js.types.forEach(type => {
    gulp.task(`${type}:compile` /*, ['js:check']*/, done => {
      return (
        gulp
          .src(globalOptions.getGulpSrc(type, false, true))
          .pipe(print(filepath => `${type}编译: ${filepath}`))
          .pipe(
            gulpif(
              file => {
                const { path } = file;
                const isCommonModules = path.indexOf("common_modules") > -1;
                return isCommonModules;
              },
              babel(
                getBabelOptions({
                  isCommonModules: true,
                  isES6Enabled: true,
                  isReactEnabled: type == "jsx" ? true : false
                })
              )
            )
          )
          .pipe(
            gulpif(
              file => {
                const { path } = file;
                const isCommonModules = path.indexOf("common_modules") > -1;
                return !isCommonModules;
              },
              babel(
                getBabelOptions({
                  isCommonModules: false,
                  isES6Enabled: true,
                  isReactEnabled: type == "jsx" ? true : false
                })
              )
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
