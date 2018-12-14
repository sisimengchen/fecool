/**
 *  less处理任务（les => css）
 */

const gulp = require("gulp");
const less = require("gulp-less");
const modifyCssUrls = require("gulp-modify-css-urls");
const print = require("gulp-print").default;
const cached = require("gulp-cached");
const { getOptions } = require("../../config");
const { isURL } = require("../../util");

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task("less:compile", done => {
    return gulp
      .src(globalOptions.getGulpSrc("less", false, true))
      .pipe(cached("less:compile"))
      .pipe(print(filepath => `less编译: ${filepath}`))
      .pipe(less())
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
