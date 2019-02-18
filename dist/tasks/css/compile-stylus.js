"use strict";

/**
 * @file stylus编译任务
 * @author mengchen <mengchen002@ke.com>
 * @module package
 */
var gulp = require("gulp");

var stylus = require("gulp-stylus");

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
    swallowError = _require2.swallowError,
    extname = _require2.extname;

var globalOptions = getOptions();

module.exports = function () {
  return gulp.task("styl:compile", function (done) {
    return gulp.src(globalOptions.getGulpSrc("styl")).pipe(changed(globalOptions.getGulpDest(), {
      extension: ".css"
    })).pipe(printer(function (filepath) {
      return "styl\u7F16\u8BD1\u4EFB\u52A1 ".concat(filepath);
    })).pipe(stylus({
      "resolve url": true,
      "include css": true
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
        var _module2 = globalOptions.getModule(extname(file.path, ".styl"));

        var hashCode = _module2.hashCode;
        path.basename = hashCode ? "".concat(path.basename, ".").concat(hashCode) : path.basename;
      }
    })).pipe(gulp.dest(globalOptions.getGulpDest()));
  });
};