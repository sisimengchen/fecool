"use strict";

var path = require("path");

module.exports = function (str) {
  return !path.isAbsolute(str);
};