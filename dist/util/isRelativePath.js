"use strict";

var path = require("path");
/**
 * 判断输入字符是否是一个相对路径
 *
 * @param {String} str 输入字符
 * @return {Boolean} 判断结果
 */


module.exports = function (str) {
  return !path.isAbsolute(str);
};