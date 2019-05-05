const path = require("path");
const { getOptions } = require("../../config");
const { printer } = require("../../util");
/**
 * [默认依赖处理器]
 * @param  {[type]} { dependName, paramName, filename } [dependName: dep中对应的依赖名, paramName: callback中对应的参数名, filename: 当前所处理的代码绝对路径]
 * @param  {[type]} options   [当前loader配置]
 * @return {[type]}          [处理之后的返回模块对象]
 */
module.exports = function({ dependName, paramName, filename }, options = {}) {
  const globalOptions = getOptions();
  let module = {};
  try {
    if (dependName != "exports") {
      const resourcePath = globalOptions.resolve(dependName, filename);
      module = globalOptions.getModule(resourcePath); // 生成模块对象
    }
  } catch (error) {
    printer.error(error);
  } finally {
  }
  return module;
};
