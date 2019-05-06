"use strict";

var path = require("path");

var _require = require("child_process"),
    spawn = _require.spawn;

var _require2 = require("../../config"),
    getOptions = _require2.getOptions;

var globalOptions = getOptions();

var ejs = require("ejs");

module.exports = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (req, res, next) {
    var pathname = req._parsedUrl.pathname;
    var search = req._parsedUrl.search;

    var _path$parse = path.parse(pathname),
        ext = _path$parse.ext,
        base = _path$parse.base,
        name = _path$parse.name;

    if (ext && ext.toLocaleLowerCase() === ".ejs") {
      var fileName = path.join(globalOptions.distDir, pathname);
      var mockFilename = path.join(fileName, "../mock.ejsjson");
      ejs.renderFile(fileName, require(mockFilename), options, function (err, html) {
        res.end(html);
      });
    } else {
      next();
    }
  };
};