"use strict";

/**
 * @file css编译任务
 * @author mengchen <mengchen002@ke.com>
 * @module package
 */
var gulp = require("gulp");

var printer = require("../../gulp-plugin/gulp-printer");

var changed = require("gulp-changed");

var replace = require("gulp-replace");

var inlinesource = require("gulp-inline-source");

var _require = require("../../config"),
    getOptions = _require.getOptions;

var template = require("gulp-template");

var _require2 = require("../../util"),
    isURL = _require2.isURL,
    isDataURI = _require2.isDataURI,
    swallowError = _require2.swallowError,
    extname = _require2.extname;

var path = require("path");

var globalOptions = getOptions();
var keyword = "url";
var urlReg = new RegExp("['\"\\(]\\s*([\\w\\_\\/\\.\\-]+\\#".concat(keyword, ")\\s*['\"\\)]"), "gi");

function htmlCompile() {
  return gulp.src(globalOptions.getGulpSrc("html")).pipe(changed(globalOptions.getGulpDest())).pipe(printer(function (filepath) {
    return "html\u7F16\u8BD1\u4EFB\u52A1 ".concat(filepath);
  })).pipe(replace(urlReg, function (match, str) {
    var source = str.replace(/\#[^\#]+$/, "");

    try {
      var resourcePath = globalOptions.resolve(source, this.file.path);

      var _module = globalOptions.getModule(resourcePath);

      source = _module.url;
    } catch (error) {} finally {
      return "'".concat(source, "'");
    }
  })).pipe(inlinesource()).pipe(template({
    publicPath: globalOptions.publicPath,
    envCode: globalOptions.getEnvCode()
  })).on("error", swallowError).pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = htmlCompile;