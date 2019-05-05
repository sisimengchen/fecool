"use strict";

/**
 * @file css编译任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
var gulp = require("gulp");

var modifyCssUrls = require("gulp-modify-css-urls");

var printer = require("../../gulp-plugin/gulp-printer");

var changed = require("gulp-changed");

var rename = require("gulp-rename");

var postcss = require("gulp-postcss");

var postcssPresetEnv = require("postcss-preset-env");

var cssnano = require("cssnano");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var _require2 = require("../../util"),
    isURL = _require2.isURL,
    isDataURI = _require2.isDataURI,
    swallowError = _require2.swallowError;

var globalOptions = getOptions();

function cssCompile() {
  return gulp.src(globalOptions.getGulpSrc("css")).pipe(changed(globalOptions.getGulpDest())).pipe(printer(function (filepath) {
    return "css\u7F16\u8BD1\u4EFB\u52A1 ".concat(filepath);
  })).pipe(modifyCssUrls({
    modify: function modify(url, filename) {
      // url字符  当前解析的文件路径
      if (isURL(url)) return url;
      if (isDataURI(url)) return url;

      try {
        url = url.split("?")[0];
        var resourcePath = globalOptions.resolve(url, filename);

        var _module = globalOptions.getModule(resourcePath);

        url = _module.url;
      } catch (error) {} finally {
        return url;
      }
    }
  })).pipe(postcss([postcssPresetEnv(), globalOptions.isDevelopENV() ? undefined : cssnano()].filter(Boolean))).on("error", swallowError).pipe(rename(function (path, file) {
    if (path.extname == ".css") {
      var _module2 = globalOptions.getModule(file.path); // 生成hashcode


      var hashCode = _module2.hashCode;
      path.basename = hashCode ? "".concat(path.basename, ".").concat(hashCode) : path.basename;
    }
  })).pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = cssCompile;