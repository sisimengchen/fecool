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
 * @param  {[type]} { dependName, paramName, filename } [dependName: dep中对应的依赖名, paramName: callback中对应的参数名, filename: 当前所处理的代码绝对路径]
 * @param  {[type]} options   [当前loader配置]
 * @return {[type]}          [处理之后的返回新source]
 */
module.exports = function({ dependName, paramName, filename }, options = {}) {
  const globalOptions = getOptions();
  options = Object.assign({}, defaultOptions, options);
  let code, source;
  try {
    const resourcePath = globalOptions.resolve(dependName, filename);
    const { size } = fs.lstatSync(resourcePath);
    if (size < options.limit) {
      // 图片输出成base64
      source = getDataURI(resourcePath);
    } else {
      const module = globalOptions.getModule(resourcePath); // 生成模块对象
      source = module.url;
    }
  } catch (error) {
    printer.error(error);
  } finally {
  }
  try {
    if (source) {
      code = codeWrapper({ NAME: paramName, VALUE: source });
    }
  } catch (error) {
    printer.error(error);
  }
  return {
    code
  };
};

// 由于图片压缩需要借助gulp来执行，因此resolve步骤可以从dist中取，需要优化
