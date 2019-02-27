"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
var buildWrapper = template("\n  define(MODULE_NAME, AMD_ARGUMENTS, function(IMPORT_NAMES) {\n  })\n");
module.exports = declare(function (api, options) {
  api.assertVersion(7);
  var loose = options.loose,
      allowTopLevelThis = options.allowTopLevelThis,
      strict = options.strict,
      strictMode = options.strictMode,
      noInterop = options.noInterop;
  return {
    name: "transform-modules-amd",
    pre: function pre(file) {
      this.isAmdModule = false;
    },
    visitor: {
      Program: {
        exit: function exit(path) {
          var _this = this;

          if (!isModule(path)) return;
          path.traverse({
            CallExpression: function CallExpression(innerPath) {
              if (_this.isAmdModule) return;
              var node = innerPath.node,
                  parent = innerPath.parent;
              var calleeName = node.callee.name;
              _this.isAmdModule = calleeName === "define";
            }
          });
          if (this.isAmdModule) return;
          var moduleName = this.getModuleName();
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          var _rewriteModuleStateme = rewriteModuleStatementsAndPrepareHeader(path, {
            loose: loose,
            strict: strict,
            strictMode: strictMode,
            allowTopLevelThis: allowTopLevelThis,
            noInterop: noInterop
          }),
              meta = _rewriteModuleStateme.meta,
              headers = _rewriteModuleStateme.headers;

          var amdArgs = [];
          var importNames = [];

          if (hasExports(meta)) {
            amdArgs.push(t.stringLiteral("exports"));
            importNames.push(t.identifier(meta.exportName));
          }

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = meta.source[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _step$value = _slicedToArray(_step.value, 2),
                  source = _step$value[0],
                  metadata = _step$value[1];

              amdArgs.push(t.stringLiteral(source));
              importNames.push(t.identifier(metadata.name));

              if (!isSideEffectImport(metadata)) {
                var interop = wrapInterop(path, t.identifier(metadata.name), metadata.interop);

                if (interop) {
                  var header = t.expressionStatement(t.assignmentExpression("=", t.identifier(metadata.name), interop));
                  header.loc = metadata.loc;
                  headers.push(header);
                }
              }

              headers.push.apply(headers, _toConsumableArray(buildNamespaceInitStatements(meta, metadata, loose)));
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          ensureStatementsHoisted(headers);
          path.unshiftContainer("body", headers);
          var _path$node = path.node,
              body = _path$node.body,
              directives = _path$node.directives;
          path.node.directives = [];
          path.node.body = [];
          var amdWrapper = path.pushContainer("body", [buildWrapper({
            MODULE_NAME: moduleName,
            AMD_ARGUMENTS: t.arrayExpression(amdArgs),
            IMPORT_NAMES: importNames
          })])[0];
          var amdFactory = amdWrapper.get("expression.arguments").filter(function (arg) {
            return arg.isFunctionExpression();
          })[0].get("body");
          amdFactory.pushContainer("directives", directives);
          amdFactory.pushContainer("body", body);
        }
      }
    }
  };
});