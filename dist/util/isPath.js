"use strict";

var path = require("path");

module.exports = function (str) {
  var _path$parse = path.parse(str),
      dir = _path$parse.dir;

  return !!dir;
};