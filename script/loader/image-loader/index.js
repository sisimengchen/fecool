const path = require("path");
const fs = require("fs");
const { getOptions } = require("../../config");
const { printer, getDataURI } = require("../../util");
const { template } = require("@babel/core");

const codeWrapper = template(`
  var NAME = _interopRequireDefault('VALUE')
`);

const defaultOptions = {
  limit: 10000
};

/**
 * [图片依赖处理器]
 * @param  {[type]} { name, source, filename } [name: 当前所处理的依赖对应的变量名称, source: 当前所处理的依赖值, filename: 当前所处理的代码绝对路径]
 * @param  {[type]} options   [当前loader配置]
 * @return {[type]}          [处理之后的返回新source]
 */
module.exports = function({ name, source, filename }, options = {}) {
  const globalOptions = getOptions();
  options = Object.assign({}, defaultOptions, options);
  let code;
  try {
    const resourcePath = globalOptions.resolve(source, filename);
    const { size } = fs.lstatSync(resourcePath);
    if (size < options.limit) {
      // 图片输出成base64
      source = getDataURI(resourcePath);
    } else {
      source = resourcePath;
    }
  } catch (error) {
    printer.error(error);
  } finally {
  }
  try {
    code = codeWrapper({ NAME: name, VALUE: source });
  } catch (error) {
    printer.error(error);
  }
  return {
    acitve: false,
    name,
    source,
    code
  };
};

// 由于图片压缩需要借助gulp来执行，因此resolve步骤可以从dist中取，需要优化
