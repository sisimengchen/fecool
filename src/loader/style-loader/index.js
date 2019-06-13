const path = require("path");
const fs = require("fs");
const { getOptions } = require("../../config");
const { printer } = require("../../util");
const { template } = require("@babel/core");
const generate = require("@babel/generator").default;

const codeWrapper = template(`define("NAME",function(){return(function(d){var e=0;var f;var c;var a;function b(){if(e++>0){return}if(!f){f=document.head||document.getElementsByTagName("head")[0]}if(!c){var k=f.getElementsByTagName("link");for(var j=0,h=k.length;j<h;++j){if(k[j].rel==="stylesheet"){c=k[j];break}}}if(!a){a=document.createElement("style");c?f.insertBefore(a,c):f.appendChild(a);a.setAttribute("type","text/css");if(a.styleSheet){a.styleSheet.cssText=d}else{a.appendChild(document.createTextNode(d))}}else{c?f.insertBefore(a,c):f.appendChild(a)}}function g(){if(e===0){return}if(--e===0){f.removeChild(a)}}return{use:b,unuse:g}})("VALUE")});`);

const defaultOptions = {};

/**
 * [样式表文件依赖处理器]
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
      module = globalOptions.getModule(resourcePath, ".js"); // 生成模块对象
      source = fs.readFileSync(module.distFilenameRaw, "utf8");
      const ast = codeWrapper({
        NAME: module.url || dependName,
        VALUE: source
      });
      const code = generate(ast).code;
      fs.writeFile(module.distFilename, code, "utf8", error => {
        if (error) throw err;
      });
    }
  } catch (error) {
    printer.error(error);
  } finally {
  }
  return module;
};

// 由于less，scss，styl编译需要借助gulp来执行，因此resolve步骤可以从dist中取，需要优化
