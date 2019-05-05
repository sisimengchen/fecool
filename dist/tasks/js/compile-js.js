"use strict";

/**
 * @file js编译任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
var gulp = require("gulp");

var gulpif = require("gulp-if");

var babel = require("gulp-babel");

var sourcemaps = require("gulp-sourcemaps");

var printer = require("../../gulp-plugin/gulp-printer");

var changed = require("gulp-changed");

var rename = require("gulp-rename");

var _require = require("../../config"),
    getBabelOptions = _require.getBabelOptions,
    getOptions = _require.getOptions;

var _require2 = require("../../util"),
    swallowError = _require2.swallowError,
    extname = _require2.extname;

var globalOptions = getOptions();

function jsCompile() {
  return gulp.src(globalOptions.getGulpSrc("js", false, true)) // 对于非common目录下的所有.js资源执行
  // .pipe(changed(globalOptions.getGulpDest(), { extension: ".js" }))
  .pipe(printer(function (filepath) {
    return "js\u7F16\u8BD1\u4EFB\u52A1 ".concat(filepath);
  })).pipe(gulpif(globalOptions.isDevelopENV(), sourcemaps.init())) // 开发环境生成sourcemap
  .pipe(babel(getBabelOptions())).on("error", swallowError).pipe(gulpif(globalOptions.isDevelopENV(), sourcemaps.write(globalOptions.sourceMapDirName, {
    sourceMappingURLPrefix: globalOptions.publicPath
  }))).pipe(rename(function (path, file) {
    if (path.extname === ".js") {
      var _module = globalOptions.getModule(file.path);

      var hashCode = _module.hashCode;
      path.basename = hashCode ? "".concat(path.basename, ".").concat(hashCode) : path.basename;
    }
  })).pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = jsCompile;