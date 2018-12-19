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

const { isCode, createCode } = require("./helpers")(t);
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
    pre(file) {
      console.log("babel-plugin-transform-modules-amd-fetool");
      this.nameCaches = {};
      this.sourceCaches = {};
    },
    visitor: {
      CallExpression: {
        // 解出被顶层define所包裹的代码，导出成类似于cmd的方式
        enter(path, { opts }) {
          const { node, parent } = path;
          const calleeName = node.callee.name;
          const isAmd = calleeName === REQUIRE || calleeName === DEFINE;
          if (!isAmd) return;
          const { arguments = [, , ,] } = node;
          let deps, callback;

          let moduleName4Package = extname(this.filename, ".js");
          let moduleName = globalOptions.getURL(moduleName4Package);

          if (
            calleeName === DEFINE &&
            arguments[0] &&
            t.isStringLiteral(arguments[0])
          ) {
            deps = arguments[1] ? arguments[1] : undefined;
            callback = arguments[2] ? arguments[2] : undefined;
            arguments[0] = t.stringLiteral(moduleName);
          } else if (calleeName === DEFINE) {
            deps = arguments[0] ? arguments[0] : undefined;
            callback = arguments[1] ? arguments[1] : undefined;
            arguments.unshift(t.stringLiteral(moduleName));
          } else {
            deps = arguments[0] ? arguments[0] : undefined;
            callback = arguments[1] ? arguments[1] : undefined;
          }

          if (!deps || !callback) return;
          if (!t.isArrayExpression(deps)) return;
          // callback可以是一个函数表达式  也可以是一个变量
          if (!t.isFunctionExpression(callback) && !t.isIdentifier(callback))
            return;

          console.log(`解析依赖开始：${this.filename}`);
          getPackage().addModule(moduleName4Package);
          if (t.isFunctionExpression(callback)) {
            // 如果callback是一个函数表达式，则解出params
            const { params = [] } = callback;
            deps.elements = deps.elements.filter((item, index) => {
              const paramName = params[index].name;
              const source = item.value;
              const result = createCode.call(this, paramName, source);
              if (result.resourcePath) {
                getPackage().addDependency(
                  moduleName4Package,
                  result.resourcePath
                );
              }
              if (result.acitve) {
                item.value = result.source || item.value;
              } else {
                this.nameCaches[paramName + ""] = true;
                this.sourceCaches[paramName + ""] = source;
              }
              return result.acitve;
            });
            callback.params = callback.params.filter(item => {
              const name = item.name;
              return !this.nameCaches[name + ""];
            });
          } else {
            deps.elements = deps.elements.filter((item, index) => {
              const source = item.value;
              const result = createCode.call(this, undefined, source);
              if (result.resourcePath) {
                getPackage().addDependency(
                  moduleName4Package,
                  result.resourcePath
                );
              }
              if (result.acitve) {
                item.value = result.source || item.value;
              }
              return result.acitve;
            });
          }
          console.log(`解析依赖结束：${this.filename}`);
        }
      },
      ExpressionStatement: {
        // 根据loader替换代码
        exit(path, { opts }) {
          const { node, parent } = path;
          if (!t.isAssignmentExpression(node.expression)) return;
          const { left, right } = node.expression;
          if (!this.nameCaches[left.name + ""]) return;
          if (right.callee.name != INTEROP_REQUIRE_DEFAULT) return;
          const source = this.sourceCaches[left.name + ""];
          const result = createCode.call(this, left.name, source);
          if (result.code) {
            path.replaceWith(result.code);
          }
        }
      }
    }
  };
});
