"use strict";

var path = require("path");
/**
 * 修改文件扩展名
 *
 * @param {String} str 输入字符
 * @param {String} extname 扩展名
 * @return {Boolean} 判断结果
 */


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