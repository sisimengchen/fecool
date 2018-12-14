/**
 *  css处理任务 (css => css)
 */

const gulp = require("gulp");
const modifyCssUrls = require("gulp-modify-css-urls");
const print = require("gulp-print").default;
const cached = require("gulp-cached");
const { getOptions } = require("../../config");
const { isURL } = require("../../util");

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task("css:compile", () => {
    return gulp
      .src(globalOptions.getGulpSrc("css", false, true))
      .pipe(cached("css:compile"))
      .pipe(print(filepath => `css编译: ${filepath}`))
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
