const path = require("path");

/**
 * 修改文件扩展名
 *
 * @param {String} str 输入字符
 * @param {String} extname 扩展名
 * @return {Boolean} 判断结果
 */
module.exports = function(str, extname) {
  const { root, dir, name, ext } = path.parse(str);
  // console.log('extname', root, dir, name, ext)
  if (ext) {
    // return `${str}${extname}`
    return path.format({
      root,
      dir,
      name,
      ext: extname || ext
    });
  }
  return str;
};
