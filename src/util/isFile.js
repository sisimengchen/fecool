const fs = require("fs");

/**
 * 判断输入字符是否是一个文件
 *
 * @param {String} str 输入字符
 * @return {Boolean} 判断结果
 */
module.exports = function(str) {
  try {
    var stat = fs.statSync(str);
  } catch (e) {
    if (e && (e.code === "ENOENT" || e.code === "ENOTDIR")) return false;
    throw e;
  }
  return stat.isFile() || stat.isFIFO();
};
