"use strict";

/**
 * @file js编译任务
 * @author mengchen <mengchen002@ke.com>
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

module.exports = function () {
  return gulp.task("js:compile", function (done) {
    return gulp.src(globalOptions.getGulpSrc("js", false, true)) // 对于非common目录下的所有.js资源执行
    .pipe(changed(globalOptions.getGulpDest(), {
      extension: ".js"
    })).pipe(printer(function (filepath) {
      return "js\u7F16\u8BD1\u4EFB\u52A1 ".concat(filepath);
    })).pipe(gulpif(globalOptions.isDevelopENV(), sourcemaps.init())) // 开发环境生成sourcemap
    .pipe(gulpif(function (file) {
      var path = file.path,
          contents = file.contents;
      return !contents.toString("utf8", 0, 18).startsWith("/* @thirdmodule */");
    }, babel(getBabelOptions({
      isModule: false,
      isES6Enabled: true,
      isReactEnabled: false
    })))).pipe(gulpif(function (file) {
      var path = file.path,
          contents = file.contents;
      return contents.toString("utf8", 0, 18).startsWith("/* @thirdmodule */");
    }, babel(getBabelOptions({
      isModule: true,
      isES6Enabled: true,
      isReactEnabled: false
    })))).on("error", swallowError).pipe(gulpif(globalOptions.isDevelopENV(), sourcemaps.write(globalOptions.sourceMapDirname, {
      sourceMappingURLPrefix: globalOptions.publicPath
    }))).pipe(rename(function (path, file) {
      if (path.extname === ".js") {
        var _module = globalOptions.getModule(file.path);

        var hashCode = _module.hashCode;
        path.basename = hashCode ? "".concat(path.basename, ".").concat(hashCode) : path.basename;
      }
    })).pipe(gulp.dest(globalOptions.getGulpDest()));
  });
};