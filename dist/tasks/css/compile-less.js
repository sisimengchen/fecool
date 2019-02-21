"use strict";

/**
 * @file less编译任务
 * @author mengchen <mengchen002@ke.com>
 * @module package
 */
var gulp = require("gulp");

var gulpif = require("gulp-if");

var less = require("gulp-less");

var sourcemaps = require("gulp-sourcemaps");

var printer = require("../../gulp-plugin/gulp-printer");

var changed = require("gulp-changed");

var rename = require("gulp-rename");

var postcss = require("gulp-postcss");

var postcssPresetEnv = require("postcss-preset-env");

var cssnano = require("cssnano");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var _require2 = require("../../util"),
    swallowError = _require2.swallowError,
    extname = _require2.extname;

var resolveUrls = require("../../less-plugin/less-plugin-resolve-urls");

var globalOptions = getOptions();

function lessCompile() {
  return gulp.src(globalOptions.getGulpSrc("less")).pipe(changed(globalOptions.getGulpDest(), {
    extension: ".css"
  })).pipe(printer(function (filepath) {
    return "less\u7F16\u8BD1\u4EFB\u52A1 ".concat(filepath);
  })).pipe(gulpif(globalOptions.isDevelopENV(), sourcemaps.init())) // 开发环境生成sourcemap
  .pipe(less({
    plugins: [resolveUrls]
  })).pipe(postcss([postcssPresetEnv(), globalOptions.isDevelopENV() ? undefined : cssnano()].filter(Boolean))).on("error", swallowError).pipe(gulpif(globalOptions.isDevelopENV(), sourcemaps.write(globalOptions.sourceMapDirname, {
    sourceMappingURLPrefix: globalOptions.publicPath
  }))).pipe(rename(function (path, file) {
    if (path.extname == ".css") {
      var _module = globalOptions.getModule(extname(file.path, ".less"));

      var hashCode = _module.hashCode;
      path.basename = hashCode ? "".concat(path.basename, ".").concat(hashCode) : path.basename;
    }
  })).pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = lessCompile;