/**
 *  stylus处理任务（stylus => css）
 */

const gulp = require("gulp");
const stylus = require("gulp-stylus");
const modifyCssUrls = require("gulp-modify-css-urls");
const print = require("gulp-print").default;
const cached = require("gulp-cached");
const { getOptions } = require("../../config");
const { isURL } = require("../../util");

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task("styl:compile", done => {
    return gulp
      .src(globalOptions.getGulpSrc("styl"))
      .pipe(cached("styl:compile"))
      .pipe(print(filepath => `styl编译: ${filepath}`))
      .pipe(
        stylus({
          "resolve url": true,
          "include css": true
        })
      )
      .pipe(
        modifyCssUrls({
          modify: function(url, filename) {
            // url字符  当前解析的文件路径
            if (isURL(url)) return url;
            let resourcePath;
            try {
              resourcePath = globalOptions.resolve(`./${url}`, filename);
              resourcePath = globalOptions.getURL(resourcePath);
            } catch (error) {
              resourcePath = url;
            } finally {
              return resourcePath;
            }
          }
        })
      )
      .pipe(gulp.dest(globalOptions.getGulpDest()));
  });
};
