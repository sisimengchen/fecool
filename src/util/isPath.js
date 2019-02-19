const path = require("path");

/**
 * 判断输入字符是否是一个路径
 *
 * @param {String} str 输入字符
 * @return {Boolean} 判断结果
 */
module.exports = function(str) {
  const { dir } = path.parse(str);
  return !!dir;
};
