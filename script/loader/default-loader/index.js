const path = require("path");
const fs = require("fs");
const { getOptions } = require("../../config");
const { printer, extname, md5 } = require("../../util");
/**
 * [默认依赖处理器]
 * @param  {[type]} { name, source, filename } [name: 当前所处理的依赖对应的变量名称, source: 当前所处理的依赖值, filename: 当前所处理的代码绝对路径]
 * @param  {[type]} options   [当前loader配置]
 * @return {[type]}          [处理之后的返回新source]
 */
module.exports = function({ name, source, filename }, options = {}) {
  console.log("filename:", filename);
  const globalOptions = getOptions();
  let resourcePath;
  try {
    resourcePath = globalOptions.resolve(source, filename);
    resourcePath = extname(resourcePath, ".js");
    source = globalOptions.getURL(resourcePath);
  } catch (error) {
    printer.error(error);
  } finally {
  }
  return {
    acitve: true,
    name,
    source,
    resourcePath
  };
};
