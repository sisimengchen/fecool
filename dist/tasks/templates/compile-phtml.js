"use strict";

var gulp = require("gulp");

var gulpif = require("gulp-if");

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
var includeTplReg = /(\$this\s*->\s*includeTpl\s*\(['"])(\S*)(['"])/gi;

function phtmlCompile() {
  return gulp.src(globalOptions.getGulpSrc("phtml")).pipe(changed(globalOptions.getGulpDest())).pipe(printer(function (filepath) {
    return "phtml\u7F16\u8BD1\u4EFB\u52A1 ".concat(filepath);
  })).pipe(replace(getOptions.urlReg, function (match, str) {
    var source = str.replace(/\#[^\#]+$/, "");

    try {
      var resourcePath = globalOptions.resolve(source, this.file.path);

      var _module = globalOptions.getModule(resourcePath);

      source = _module.url;
    } catch (error) {} finally {
      return "'".concat(source, "'");
    }
  })).pipe(gulpif(globalOptions.isDevelopENV(), replace(includeTplReg, function (match, p1, p2, p3, str) {
    var source = p2;

    if (!source.endsWith(".phtml")) {
      source = "".concat(source, ".phtml");
    }

    try {
      var resourcePath = globalOptions.resolve(source, this.file.path);
      source = resourcePath;
    } catch (error) {} finally {
      return "".concat(p1).concat(source).concat(p3);
    }
  }))).pipe(inlinesource()).on("error", swallowError).pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = phtmlCompile;