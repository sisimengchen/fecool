/**
 * @file css编译任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const gulp = require("gulp");
const modifyCssUrls = require("gulp-modify-css-urls");
const printer = require("../../gulp-plugin/gulp-printer");
const changed = require("gulp-changed");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const postcssPresetEnv = require("postcss-preset-env");
const cssnano = require("cssnano");
const { getOptions } = require("../../config");
const { isURL, isDataURI, swallowError } = require("../../util");

const globalOptions = getOptions();

function cssCompile() {
  return gulp
    .src(globalOptions.getGulpSrc("css"))
    .pipe(changed(globalOptions.getGulpDest()))
    .pipe(printer(filepath => `css编译任务 ${filepath}`))
    .pipe(
      modifyCssUrls({
        modify: function(url, filename) {
          // url字符  当前解析的文件路径
          if (isURL(url)) return url;
          if (isDataURI(url)) return url;
          try {
            url = url.split("?")[0];
            const resourcePath = globalOptions.resolve(url, filename);
            const module = globalOptions.getModule(resourcePath);
            url = module.url;
          } catch (error) {
          } finally {
            return url;
          }
        }
      })
    )
    .on("error", swallowError)
    .pipe(
      postcss(
        [
          postcssPresetEnv(/* pluginOptions */),
          globalOptions.isDevelopENV() ? undefined : cssnano()
        ].filter(Boolean)
      )
    )
    .on("error", swallowError)
    .pipe(
      rename(function(path, file) {
        if (path.extname == ".css") {
          const module = globalOptions.getModule(file.path); // 生成hashcode
          const hashCode = module.hashCode;
          path.basename = hashCode
            ? `${path.basename}.${hashCode}`
            : path.basename;
        }
      })
    )
    .pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = cssCompile;
