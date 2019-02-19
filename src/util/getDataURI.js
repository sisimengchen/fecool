const fs = require("fs");
const mime = require("mime");

/**
 * 获取文件的data-uri
 *
 * @param {String} filePath 文件路径
 * @return {String} 文件的data-uri
 */
module.exports = function(resourcePath) {
  const mimetype = mime.getType(resourcePath);
  return `data:${mimetype || ""};base64,${fs
    .readFileSync(resourcePath)
    .toString("base64")}`;
};
