/**
 * @file stylus编译任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const nodePath = require("path");
const gulp = require("gulp");
const stylus = require("gulp-stylus");
const modifyCssUrls = require("gulp-modify-css-urls");
const printer = require("../../gulp-plugin/gulp-printer");
const changed = require("gulp-changed");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const postcssPresetEnv = require("postcss-preset-env");
const cssnano = require("cssnano");
const { getOptions } = require("../../config");
const { isURL, isDataURI, swallowError, extname } = require("../../util");

const globalOptions = getOptions();

function stylusCompile() {
  return gulp
    .src(globalOptions.getGulpSrc("styl"))
    .pipe(changed(globalOptions.getGulpDest(), { extension: ".css" }))
    .pipe(printer(filepath => `styl编译任务 ${filepath}`))
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
          const module = globalOptions.getModule(extname(file.path, ".styl"));
          const { distFilename } = module;
          path.basename = nodePath.basename(distFilename, ".css");
        }
      })
    )
    .pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = stylusCompile;
