"use strict";

var path = require("path");

var _require = require("child_process"),
    spawn = _require.spawn;

var _require2 = require("../../config"),
    getOptions = _require2.getOptions;

var globalOptions = getOptions();

var ejs = require("ejs");

module.exports = function (options) {
  if (options == null) {
    options = {};
  }

  return function (req, res, next) {
    var _path$parse = path.parse(req.url),
        ext = _path$parse.ext;

    if (ext && ext.toLocaleLowerCase() === ".ejs") {
      var filePath = path.join(globalOptions.distDir, req.url);
      var mockPath = path.join(globalOptions.distDir, req.url, "../mock.ejsjson");
      ejs.renderFile(filePath, require(mockPath), options, function (err, html) {
        res.end(html);
      });
    } else {
      next();
    }
  };
};