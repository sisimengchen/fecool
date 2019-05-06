"use strict";

var fs = require("fs");

var mime = require("mime");

module.exports = function (resourcePath) {
  var mimetype = mime.getType(resourcePath);
  return "data:".concat(mimetype || "", ";base64,").concat(fs.readFileSync(resourcePath).toString("base64"));
};