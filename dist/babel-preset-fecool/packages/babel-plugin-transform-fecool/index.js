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
    name: "transform-fecool",
    pre: function pre(file) {
      this.paramNameCaches = {};
      this.dependNameCaches = {};
      this.dependCodeCaches = {};
    },
    visitor: {
      CallExpression: {
        enter: function enter(path, _ref) {
          var _this = this;

          var opts = _ref.opts;
          var node = path.node,
              parent = path.parent;
          var calleeName = node.callee.name;
          var isAmd = calleeName === REQUIRE || calleeName === DEFINE;
          if (!isAmd) return;
          var args = node.arguments || [,,,];
          var deps, callback;

          if (calleeName === DEFINE && args[0] && t.isStringLiteral(args[0])) {
              if (args[1] && t.isArrayExpression(args[1])) {
                deps = args[1];
                callback = args[2];
              } else {
                args[2] = args[1];
                args[1] = t.arrayExpression();
                deps = args[1];
                callback = args[2];
              }
            } else if (calleeName === DEFINE) {
            args[2] = args[1];
            args[1] = args[0];

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
            deps = args[0] ? args[0] : undefined;
            callback = args[1] ? args[1] : undefined;
          }

          if (!deps || !callback) return;
          if (!t.isArrayExpression(deps)) return;
          if (!t.isFunctionExpression(callback) && !t.isIdentifier(callback)) return;
          printer.debug("解析依赖开始", this.filename);
          var module = globalOptions.getModule(this.filename);
          var moduleName4Package = module.transformFilename;
          getPackage().addModule(moduleName4Package);

          if (calleeName === DEFINE) {
            args[0] = t.stringLiteral(module.url);
          }

          if (t.isFunctionExpression(callback)) {
            var _callback = callback,
                _callback$params = _callback.params,
                params = _callback$params === void 0 ? [] : _callback$params;
            deps.elements = deps.elements.filter(function (item, index) {
              var dependName = item.value;
              var paramName = params[index].name;
              var result = createCode.call(_this, dependName, paramName);

              if (result.transformFilename) {
                getPackage().addDependency(moduleName4Package, result.transformFilename);
              }

              if (result.code) {
                _this.paramNameCaches[paramName + ""] = true;
                _this.dependNameCaches[paramName + ""] = dependName;
                _this.dependCodeCaches[paramName + ""] = result.code;
                return false;
              } else {
                item.value = result.url || item.value;
                return true;
              }
            });
            callback.params = callback.params.filter(function (item) {
              var paramName = item.name;
              return !_this.paramNameCaches[paramName + ""];
            });
          } else {
            deps.elements = deps.elements.filter(function (item, index) {
              var dependName = item.value;
              var result = createCode.call(_this, dependName, undefined);

              if (result.transformFilename) {
                getPackage().addDependency(moduleName4Package, result.transformFilename);
              }

              if (result.acitve) {
                item.value = result.url || item.value;
                return true;
              } else {
                return false;
              }
            });
          }

          printer.debug("解析依赖结束", this.filename);
        }
      },
      ExpressionStatement: {
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
          var dependCode = this.dependCodeCaches[left.name + ""];

          if (dependName && dependCode) {
            path.replaceWith(dependCode);
          }
        }
      }
    }
  };
});