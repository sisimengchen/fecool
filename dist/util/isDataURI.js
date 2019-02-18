"use strict";

// const dataURIRegex = new RegExp(
//   /^(data:)([\w\/\+\-]+);(charset=[\w-]+|base64)$/
// );

/**
 * 判断输入字符是否是一个data-uri
 *
 * @param {String} str 输入字符
 * @return {Boolean} 判断结果
 */
module.exports = function (str) {
  if (!str) return false;
  var nReturn = /^(data:)([\w\/\+\-]+)$/.test(str.split(";")[0]);
  return nReturn;
};