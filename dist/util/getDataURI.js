"use strict";

var fs = require("fs");

var mime = require("mime");
/**
 * 获取文件的data-uri
 *
 * @param {String} filePath 文件路径
 * @return {String} 文件的data-uri
 */


module.exports = function (resourcePath) {
  var mimetype = mime.getType(resourcePath);
  return "data:".concat(mimetype || "", ";base64,").concat(fs.readFileSync(resourcePath).toString("base64"));
};