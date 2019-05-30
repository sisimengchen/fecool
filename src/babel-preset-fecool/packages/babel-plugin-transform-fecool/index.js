const { declare } = require("@babel/helper-plugin-utils");
const {
  isModule,
  rewriteModuleStatementsAndPrepareHeader,
  hasExports,
  isSideEffectImport,
  buildNamespaceInitStatements,
  ensureStatementsHoisted,
  wrapInterop
} = require("@babel/helper-module-transforms");
const { template, types } = require("@babel/core");
const t = types;

const { createCode } = require("./helpers")(t);
const { printer, extname } = require("../../../util");
const getPackage = require("../../../package");
const { getOptions } = require("../../../config");

const globalOptions = getOptions();

const {
  REQUIRE,
  MODULE,
  EXPORTS,
  DEFINE,
  AMD_DEFINE_RESULT,
  INTEROP_REQUIRE_DEFAULT
} = require("./constants");

module.exports = declare((api, options) => {
  api.assertVersion(7);

  const { loose, allowTopLevelThis, strict, strictMode, noInterop } = options;
  return {
    name: "transform-fecool",
    pre(file) {
      this.paramNameCaches = {};
      this.dependNameCaches = {};
      this.dependCodeCaches = {};
    },
    visitor: {
      CallExpression: {
        // 解出被顶层define所包裹的代码，导出成类似于cmd的方式
        enter(path, { opts }) {
          const { node, parent } = path;
          const calleeName = node.callee.name;
          const isAmd = calleeName === REQUIRE || calleeName === DEFINE;
          if (!isAmd) return;
          const args = node.arguments || [, , ,];
          let deps, callback;
          // 解参数
          if (
            calleeName === DEFINE &&
            args[0] &&
            t.isStringLiteral(args[0]) // define调用，第一个参数是字符串 define('react', ...)
          ) {
            if (args[1] && t.isArrayExpression(args[1])) {
              // define调用，第一个参数是字符串 第二个参数是数组 define('react', [], function() {})
              deps = args[1];
              callback = args[2];
            } else {
              // define调用，第一个参数是字符串 第二个参数不是数组 define('react', function() {})
              args[2] = args[1];
              args[1] = t.arrayExpression();
              deps = args[1];
              callback = args[2];
            }
          } else if (calleeName === DEFINE) {
            args[2] = args[1];
            args[1] = args[0];
            // args[0] = t.stringLiteral("@fecool_temp_name"); // 生成一个临时的 moduleName后面处理会被替换掉
            if (args[1] && t.isArrayExpression(args[1])) {
              deps = args[1];
              callback = args[2];
            } else {
              args[2] = args[1];
              args[1] = t.arrayExpression();
              deps = args[1];
              callback = args[2];
            }
          } else {
            // require
            deps = args[0] ? args[0] : undefined;
            callback = args[1] ? args[1] : undefined;
          }

          if (!deps || !callback) return;
          if (!t.isArrayExpression(deps)) return;
          // callback可以是一个函数表达式  也可以是一个变量
          if (!t.isFunctionExpression(callback) && !t.isIdentifier(callback))
            return;

          printer.debug("解析依赖开始", this.filename);
          const module = globalOptions.getModule(this.filename); // 生成模块对象
          const moduleName4Package = module.transformFilename;
          getPackage().addModule(moduleName4Package); // 把模块添加到打包列表中
          if (calleeName === DEFINE) {
            args[0] = t.stringLiteral(module.url); // 定义为一个新的模块名称
          }
          if (t.isFunctionExpression(callback)) {
            // 如果callback是一个函数表达式，则解出params
            const { params = [] } = callback;
            // 遍历依赖里的每一项
            deps.elements = deps.elements.filter((item, index) => {
              const dependName = item.value; // 依赖名
              const paramName = params[index].name; // 参数名
              const result = createCode.call(this, dependName, paramName);
              if (result.transformFilename) {
                getPackage().addDependency(
                  moduleName4Package,
                  result.transformFilename
                );
              }
              if (result.code) {
                this.paramNameCaches[paramName + ""] = true;
                this.dependNameCaches[paramName + ""] = dependName;
                this.dependCodeCaches[paramName + ""] = result.code;
                return false;
              } else {
                item.value = result.url || item.value;
                return true;
              }
            });
            callback.params = callback.params.filter(item => {
              const paramName = item.name;
              return !this.paramNameCaches[paramName + ""];
            });
          } else {
            deps.elements = deps.elements.filter((item, index) => {
              const dependName = item.value; // 依赖名
              const result = createCode.call(this, dependName, undefined);
              if (result.transformFilename) {
                getPackage().addDependency(
                  moduleName4Package,
                  result.transformFilename
                );
              }
              if (result.code) {
                this.paramNameCaches[paramName + ""] = true;
                this.dependNameCaches[paramName + ""] = dependName;
                this.dependCodeCaches[paramName + ""] = result.code;
                return false;
              } else {
                item.value = result.url || item.value;
                return true;
              }
            });
          }
          printer.debug("解析依赖结束", this.filename);
        }
      },
      ExpressionStatement: {
        // 根据loader替换代码
        exit(path, { opts }) {
          const { node, parent } = path;
          if (!t.isAssignmentExpression(node.expression)) return;
          const { left, right } = node.expression;
          if (!this.paramNameCaches[left.name + ""]) return;
          if (right.callee.name != INTEROP_REQUIRE_DEFAULT) return;
          const dependName = this.dependNameCaches[left.name + ""];
          const dependCode = this.dependCodeCaches[left.name + ""];
          if (dependName && dependCode) {
            path.replaceWith(dependCode);
          }
        }
      }
    }
  };
});
