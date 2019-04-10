"use strict";

/**
 * @file html编译任务
 * @author mengchen <mengchen002@ke.com>
 * @module package
 */
var gulp = require("gulp");

var printer = require("../../gulp-plugin/gulp-printer");

var changed = require("gulp-changed");

var replace = require("gulp-replace"); // const inlinesource = require("gulp-inline-source");


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
var includeTplReg = /(\$this\s*->\s*includeTpl\s*\(['"])(\S*)(['"])/gi;

function phtmlCompile() {
  return gulp.src(globalOptions.getGulpSrc("phtml")).pipe(changed(globalOptions.getGulpDest())).pipe(printer(function (filepath) {
    return "phtml\u7F16\u8BD1\u4EFB\u52A1 ".concat(filepath);
  })).pipe(replace(urlReg, function (match, str) {
    var source = str.replace(/\#[^\#]+$/, "");
    console.log('source', source);

    try {
      var resourcePath = globalOptions.resolve(source, this.file.path);

      var _module = globalOptions.getModule(resourcePath);

      source = _module.url;
    } catch (error) {} finally {
      return "'".concat(source, "'");
    }
  })).pipe(replace(includeTplReg, function (match, p1, p2, p3, str) {
    var source = p2;

    if (!source.endsWith(".phtml")) {
      source = "".concat(source, ".phtml");
    } // console.log("p1", p1);
    // console.log("p2", p2);
    // console.log("p3", p3);


    try {
      var resourcePath = globalOptions.resolve(source, this.file.path); // console.log("resourcePath", resourcePath);

      source = resourcePath; // const module = globalOptions.getModule(resourcePath);
      // source = module.url;
    } catch (error) {} finally {
      return "".concat(p1).concat(source).concat(p3);
    }
  })).on("error", swallowError).pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = phtmlCompile;