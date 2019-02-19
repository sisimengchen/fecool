const path = require("path");
const fs = require("fs");
const { getOptions } = require("../../config");
const minify = require("html-minifier").minify;
const { printer } = require("../../util");
const { template } = require("@babel/core");

const codeWrapper = template(`
  var NAME = _interopRequireDefault('VALUE')
`);

const defaultOptions = {
  minify: false
};

/**
 * [模板依赖处理器]
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
    source = fs.readFileSync(resourcePath, "utf-8");
    source = source.replace(getOptions.urlReg, function(match, p1) {
      // 针对#url做寻路
      const p2 = p1.replace(/\#[^\#]+$/, "");
      const p3 = globalOptions.resolve(p2, resourcePath);
      const module = globalOptions.getModule(p3); // 生成模块对象
      return `\"${module.url}\"`;
    });
    if (options.minify) {
      source = minify(source, {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      });
    }
    // 这里需要补充处理#url的逻辑
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
    acitve: false,
    code
  };
};
