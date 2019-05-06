"use strict";

var path = require("path");

module.exports = function (str, extname) {
  if (typeof str !== "string") {
    return str;
  }

  if (str.length === 0) {
    return str;
  }

  var nStr = path.basename(str, path.extname(str)) + extname;
  return path.join(path.dirname(str), nStr);
};