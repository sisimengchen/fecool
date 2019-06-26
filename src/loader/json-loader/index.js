const path = require("path");
const fs = require("fs");
const { getOptions } = require("../../config");
const { printer } = require("../../util");
const babel = require("@babel/core");
const generate = require("@babel/generator").default;

const codeWrapper = babel.template(`
  define('NAME', function() {
    return JSON.parse('VALUE');
  })
`);

const defaultOptions = {
  minify: false
};

/**
 * [json文件依赖处理器]
 * @param  {[type]} { dependName, paramName, filename } [dependName: dep中对应的依赖名, paramName: callback中对应的参数名, filename: 当前所处理的代码绝对路径]
 * @param  {[type]} options   [当前loader配置]
 * @return {[type]}          [处理之后的返回新source]
 */
module.exports = function({ dependName, paramName, filename }, options) {
  const globalOptions = getOptions();
  options = Object.assign({}, defaultOptions, options);
  let module = {},
    source;
  try {
    if (dependName != "exports") {
      const resourcePath = globalOptions.resolve(dependName, filename);
      source = fs.readFileSync(resourcePath, "utf8");
      source = source.replace(getOptions.urlReg, function(match, p1) {
        // 针对#url做寻路
        const p2 = p1.replace(/\#[^\#]+$/, "");
        const p3 = globalOptions.resolve(p2, resourcePath);
        const module = globalOptions.getModule(p3); // 生成模块对象
        return `\"${module.url}\"`;
      });
      if (options.minify) {
        source = JSON.parse(source);
        source = JSON.stringify(source)
          .replace(/\u2028/g, "\\u2028")
          .replace(/\u2029/g, "\\u2029");
      }
      module = globalOptions.getModule(resourcePath, ".js"); // 生成模块对象
      const ast = codeWrapper({
        NAME: module.url || dependName,
        VALUE: source,
        JSON: "JSON"
      });
      const code = generate(ast).code;
      if (getOptions().isDevelopENV()) {
        fs.writeFile(module.distFilename, code, "utf8", error => {
          if (error) throw err;
        });
      } else {
        babel.transform(
          code,
          {
            configFile: false,
            babelrc: false,
            minified: true,
            compact: true
          },
          function(error, result) {
            if (error) throw err;
            fs.writeFile(module.distFilename, result.code, "utf8", error => {
              if (error) throw err;
            });
          }
        );
      }
    }
  } catch (error) {
    printer.error(error);
  } finally {
  }
  return module;
};
