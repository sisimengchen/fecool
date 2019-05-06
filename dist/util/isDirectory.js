"use strict";

var fs = require("fs");

module.exports = function (str) {
  try {
    var stat = fs.statSync(str);
  } catch (e) {
    if (e && (e.code === "ENOENT" || e.code === "ENOTDIR")) return false;
    throw e;
  }

  return stat.isDirectory();
};