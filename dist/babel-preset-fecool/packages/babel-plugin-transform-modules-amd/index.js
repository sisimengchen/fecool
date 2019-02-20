"use strict";

var _require = require("@babel/helper-plugin-utils"),
    declare = _require.declare;

var _require2 = require("@babel/helper-module-transforms"),
    isModule = _require2.isModule,
    rewriteModuleStatementsAndPrepareHeader = _require2.rewriteModuleStatementsAndPrepareHeader,
    hasExports = _require2.hasExports,
    isSideEffectImport = _require2.isSideEffectImport,
    buildNamespaceInitStatements = _require2.buildNamespaceInitStatements,
    ensureStatementsHoisted = _require2.ensureStatementsHoisted,
    wrapInterop = _require2.wrapInterop;

var _require3 = require("@babel/core"),
    template = _require3.template,
    types = _require3.types;

var t = types;

var _require4 = require("./helpers")(t),
    createCode = _require4.createCode;

var _require5 = require("../../../util"),
    printer = _require5.printer,
    extname = _require5.extname;

var getPackage = require("../../../package");

var _require6 = require("../../../config"),
    getOptions = _require6.getOptions;

var globalOptions = getOptions();

var _require7 = require("./constants"),
    REQUIRE = _require7.REQUIRE,
    MODULE = _require7.MODULE,
    EXPORTS = _require7.EXPORTS,
    DEFINE = _require7.DEFINE,
    AMD_DEFINE_RESULT = _require7.AMD_DEFINE_RESULT,
    INTEROP_REQUIRE_DEFAULT = _require7.INTEROP_REQUIRE_DEFAULT;

module.exports = declare(function (api, options) {
  api.assertVersion(7);
  var loose = options.loose,
      allowTopLevelThis = options.allowTopLevelThis,
      strict = options.strict,
      strictMode = options.strictMode,
      noInterop = options.noInterop;
  return {
    pre: function pre(file) {
      this.paramNameCaches = {};
      this.dependNameCaches = {};
    },
    visitor: {
      CallExpression: {
        // 解出被顶层define所包裹的代码，导出成类似于cmd的方式
        enter: function enter(path, _ref) {
          var _this = this;

          var opts = _ref.opts;
          var node = path.node,
              parent = path.parent;
          var calleeName = node.callee.name;
          var isAmd = calleeName === REQUIRE || calleeName === DEFINE;
          if (!isAmd) return;
          var args = node.arguments || [,,,];
          var deps, callback; // 解参数

          if (calleeName === DEFINE && args[0] && t.isStringLiteral(args[0]) // define调用，第一个参数是字符串 define('react', ...)
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
            args[1] = args[0]; // args[0] = t.stringLiteral("@fecool_temp_name"); // 生成一个临时的 moduleName后面处理会被替换掉

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
          if (!t.isArrayExpression(deps)) return; // callback可以是一个函数表达式  也可以是一个变量

          if (!t.isFunctionExpression(callback) && !t.isIdentifier(callback)) return;
          printer.debug("解析依赖开始", this.filename);
          var module = globalOptions.getModule(this.filename); // 生成模块对象

          var moduleName4Package = module.transformFilename;
          getPackage().addModule(moduleName4Package); // 把模块添加到打包列表中

          if (calleeName === DEFINE) {
            args[0] = t.stringLiteral(module.url); // 定义为一个新的模块名称
          }

          if (t.isFunctionExpression(callback)) {
            // 如果callback是一个函数表达式，则解出params
            var _callback = callback,
                _callback$params = _callback.params,
                params = _callback$params === void 0 ? [] : _callback$params; // 遍历依赖里的每一项

            deps.elements = deps.elements.filter(function (item, index) {
              var dependName = item.value; // 依赖名

              var paramName = params[index].name; // 参数名

              var result = createCode.call(_this, dependName, paramName);

              if (result.transformFilename) {
                getPackage().addDependency(moduleName4Package, result.transformFilename);
              }

              if (result.acitve) {
                item.value = result.url || item.value;
              } else {
                _this.paramNameCaches[paramName + ""] = true;
                _this.dependNameCaches[paramName + ""] = dependName;
              }

              return result.acitve;
            });
            callback.params = callback.params.filter(function (item) {
              var paramName = item.name;
              return !_this.paramNameCaches[paramName + ""];
            });
          } else {
            deps.elements = deps.elements.filter(function (item, index) {
              var dependName = item.value; // 依赖名

              var result = createCode.call(_this, dependName, undefined);

              if (result.transformFilename) {
                getPackage().addDependency(moduleName4Package, result.transformFilename);
              }

              if (result.acitve) {
                item.value = result.url || item.value;
              }

              return result.acitve;
            });
          }

          printer.debug("解析依赖结束", this.filename);
        }
      },
      ExpressionStatement: {
        // 根据loader替换代码
        exit: function exit(path, _ref2) {
          var opts = _ref2.opts;
          var node = path.node,
              parent = path.parent;
          if (!t.isAssignmentExpression(node.expression)) return;
          var _node$expression = node.expression,
              left = _node$expression.left,
              right = _node$expression.right;
          if (!this.paramNameCaches[left.name + ""]) return;
          if (right.callee.name != INTEROP_REQUIRE_DEFAULT) return;
          var dependName = this.dependNameCaches[left.name + ""];
          var result = createCode.call(this, dependName, left.name);

          if (result.code) {
            path.replaceWith(result.code);
          }
        }
      }
    }
  };
});