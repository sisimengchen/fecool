"use strict";

var _argumentDecoders;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require("@babel/helper-plugin-utils"),
    declare = _require.declare;

var _require2 = require("@babel/core"),
    template = _require2.template,
    types = _require2.types;

var t = types;

var _require3 = require("./helpers")(t),
    decodeDefineArguments = _require3.decodeDefineArguments,
    decodeRequireArguments = _require3.decodeRequireArguments,
    isModuleOrExportsInjected = _require3.isModuleOrExportsInjected,
    isSimplifiedCommonJSWrapper = _require3.isSimplifiedCommonJSWrapper,
    createDependencyInjectionExpression = _require3.createDependencyInjectionExpression,
    createModuleExportsAssignmentExpression = _require3.createModuleExportsAssignmentExpression,
    createModuleExportsResultCheck = _require3.createModuleExportsResultCheck,
    getUniqueIdentifier = _require3.getUniqueIdentifier,
    isFunctionExpression = _require3.isFunctionExpression,
    createFactoryReplacementExpression = _require3.createFactoryReplacementExpression;

var _require4 = require("./constants"),
    REQUIRE = _require4.REQUIRE,
    MODULE = _require4.MODULE,
    EXPORTS = _require4.EXPORTS,
    DEFINE = _require4.DEFINE,
    AMD_DEFINE_RESULT = _require4.AMD_DEFINE_RESULT;

var _require5 = require("./utils"),
    KEYWORD = _require5.KEYWORD,
    getID = _require5.getID;

var argumentDecoders = (_argumentDecoders = {}, _defineProperty(_argumentDecoders, DEFINE, decodeDefineArguments), _defineProperty(_argumentDecoders, REQUIRE, decodeRequireArguments), _argumentDecoders);

var zip = function zip(array1, array2) {
  return array1.map(function (element, index) {
    return [element, array2[index]];
  });
};

module.exports = declare(function (api, options, dirname) {
  api.assertVersion(7);
  var loose = options.loose,
      allowTopLevelThis = options.allowTopLevelThis,
      strict = options.strict,
      strictMode = options.strictMode,
      noInterop = options.noInterop;
  return {
    pre: function pre(file) {
      file.isTinytooljs = false;
      this.isTinytooljs = false;
      this.isExpressionStatementOver = false;
      this.temp = [];
    },
    visitor: {
      Program: {
        enter: function enter(path, _ref) {
          var opts = _ref.opts;
          var parent = path.parent;
          var _parent$comments = parent.comments,
              comments = _parent$comments === void 0 ? [] : _parent$comments;
          if (!comments.length) return;
          var comment = comments[0];
          var type = comment.type,
              value = comment.value;

          if (type === "CommentBlock" && value && value.trim() === "@".concat(KEYWORD)) {
            this.isTinytooljs = true;
            path.hub.file.isTinytooljs = true;
          }
        },
        exit: function exit(path) {
          if (!this.isTinytooljs) return;
          path.unshiftContainer("body", this.temp);
        }
      },
      VariableDeclaration: {
        enter: function enter(path, _ref2) {
          var opts = _ref2.opts;
          if (!this.isTinytooljs) return; // 这个要针对老代码做依赖收集，遍历变量定义的path，依赖收集

          var node = path.node,
              parent = path.parent;
          var _node$declarations = node.declarations,
              declarations = _node$declarations === void 0 ? [] : _node$declarations;

          if (declarations.length == 1) {
            var declaration = declarations[0];
            var id = declaration.id,
                init = declaration.init;

            if (t.isCallExpression(init)) {
              var callee = init.callee;

              if (t.isIdentifier(callee)) {
                var name = callee.name;

                if (name === "require" || name === "__include" || name === "__includejson") {
                  var args = init.arguments || []; // 获取require调用参数

                  if (args.length) {
                    var source = args[0].value; // 获取require调用第一个参数的值

                    if (name === "__include") {
                      source = "".concat(source, ".tmpl");
                    } else if (name === "__includejson") {
                      source = "".concat(source, ".json");
                    }

                    this.temp.push(t.importDeclaration([t.importDefaultSpecifier(t.identifier(id.name))], t.stringLiteral(source)));
                    path.remove();
                  }
                }
              } else if (t.isCallExpression(callee)) {
                var _name = callee.callee.name;

                if (_name === "require" || _name === "__include" || _name === "__includejson") {
                  var _args = init.callee.arguments || []; // 获取require调用参数


                  if (_args.length) {
                    var _source = _args[0].value; // 获取require调用第一个参数的值

                    if (_name === "__include") {
                      _source = "".concat(_source, ".tmpl");
                    } else if (_name === "__includejson") {
                      _source = "".concat(_source, ".json");
                    }

                    var identifierName = getID(id.name);
                    this.temp.push(t.importDeclaration([t.importDefaultSpecifier(t.identifier(identifierName))], t.stringLiteral(_source)));
                    this.temp.push(t.variableDeclaration("var", [t.variableDeclarator(t.identifier(id.name), // 这个名字需要记录
                    t.CallExpression(t.identifier(identifierName), []))]));
                    path.remove();
                  }
                }
              }
            }

            if (t.isMemberExpression(init) && t.isCallExpression(init.object)) {
              var _callee = init.object.callee;
              var _name2 = _callee.name;

              if (_name2 === "require" || _name2 === "__include" || _name2 === "__includejson") {
                var _args2 = init.object.arguments || []; // 获取require调用参数


                if (_args2.length) {
                  var _source2 = _args2[0].value; // 获取require调用第一个参数的值

                  if (_name2 === "__include") {
                    _source2 = "".concat(_source2, ".tmpl");
                  } else if (_name2 === "__includejson") {
                    _source2 = "".concat(_source2, ".json");
                  }

                  var _identifierName = getID(id.name);

                  this.temp.push(t.importDeclaration([t.importDefaultSpecifier(t.identifier(_identifierName))], t.stringLiteral(_source2)));
                  this.temp.push(t.variableDeclaration("var", [t.variableDeclarator(t.identifier(id.name), // 这个名字需要记录
                  t.memberExpression(t.identifier(_identifierName), t.identifier(init.property.name)))]));
                  path.remove();
                }
              }
            }
          }
        }
      },
      ExpressionStatement: {
        // 解出被顶层define所包裹的代码，导出成类似于cmd的方式
        enter: function enter(path, _ref3) {
          var opts = _ref3.opts;
          if (this.isExpressionStatementOver) return;
          if (!this.isTinytooljs) return;
          var node = path.node,
              parent = path.parent;
          if (!t.isCallExpression(node.expression)) return;
          var options = Object.assign({
            restrictToTopLevelDefine: true
          }, opts);
          var name = node.expression.callee.name;
          var isDefineCall = name === DEFINE;
          if (isDefineCall && options.restrictToTopLevelDefine && !t.isProgram(parent)) return;
          var argumentDecoder = argumentDecoders[name];
          if (!argumentDecoder) return; // 依赖列表, 创建工厂函数

          var _argumentDecoder = argumentDecoder(node.expression.arguments),
              dependencyList = _argumentDecoder.dependencyList,
              factory = _argumentDecoder.factory;

          if (!t.isArrayExpression(dependencyList) && !factory) return;
          var isFunctionFactory = isFunctionExpression(factory);
          var dependencyInjections = []; // 处理依赖列表

          if (dependencyList) {
            // 压缩
            var dependencyParameterPairs = zip(dependencyList.elements, isFunctionFactory ? factory.params : []); // 创建依赖表达式

            var dependencyInjectionExpressions = dependencyParameterPairs.map(function (_ref4) {
              var _ref5 = _slicedToArray(_ref4, 2),
                  dependency = _ref5[0],
                  paramName = _ref5[1];

              return createDependencyInjectionExpression(dependency, paramName);
            }).filter(function (dependencyInjection) {
              return dependencyInjection !== undefined;
            });
            dependencyInjections.push.apply(dependencyInjections, _toConsumableArray(dependencyInjectionExpressions));
          } // 如果有工厂函数


          if (isFunctionFactory) {
            // 获取工厂函数参数个数
            var factoryArity = factory.params.length; // 创建工厂函数替换表达式

            var replacementFuncExpr = createFactoryReplacementExpression(factory, dependencyInjections);
            var replacementCallExprParams = [];

            if (isSimplifiedCommonJSWrapper(dependencyList, factoryArity)) {
              replacementFuncExpr = factory; // Order is important here for the simplified commonjs wrapper

              var amdKeywords = [REQUIRE, EXPORTS, MODULE];
              replacementCallExprParams = amdKeywords.slice(0, factoryArity).map(function (keyword) {
                return t.identifier(keyword);
              });
            }

            var factoryReplacement = t.callExpression(replacementFuncExpr, replacementCallExprParams);

            if (isDefineCall) {
              if (!isModuleOrExportsInjected(dependencyList, factoryArity)) {
                // console.log("ExpressionStatement");
                path.replaceWith(createModuleExportsAssignmentExpression(factoryReplacement));
              } else {
                var resultCheckIdentifier = getUniqueIdentifier(path.scope, AMD_DEFINE_RESULT);
                path.replaceWithMultiple(createModuleExportsResultCheck(factoryReplacement, resultCheckIdentifier));
              }
            } else {
              path.replaceWith(factoryReplacement);
            }
          } else if (factory && isDefineCall) {
            var exportExpression = createModuleExportsAssignmentExpression(factory);
            var nodes = dependencyInjections.concat(exportExpression);
            path.replaceWithMultiple(nodes);
          } else {
            path.replaceWithMultiple(dependencyInjections);
          }

          this.isExpressionStatementOver = true;
        } // 解出被顶层define所包裹的代码，导出成类似于cmd的方式
        // enter(path, { opts }) {
        //   if (this.isExpressionStatementOver) return;
        //   if (!this.isTinytooljs) return;
        //   const { node, parent } = path;
        //   if (!t.isCallExpression(node.expression)) return;
        //   const calleeName = node.expression.callee.name;
        //   const isDefineCall = calleeName === DEFINE;
        //   if (!isDefineCall) return;
        //   if (!t.isProgram(parent)) return;
        //   const { arguments = [] } = node.expression;
        //   let callback;
        //   callback = arguments[0] ? arguments[0] : undefined;
        //   if (!callback) return;
        //   if (!t.isFunctionExpression(callback)) return;
        //   path.replaceWithMultiple(callback.body.body);
        //   // return
        //   // console.log(123)
        //   // return;
        //   const declaration = callback.body.body.map((item, index, array) => {
        //     if (t.isReturnStatement(item)) {
        //       // const argument = item.argument;  properties
        //       // console.log(item.argument);
        //       return t.exportDefaultDeclaration(item.argument);
        //       // return item;
        //     } else {
        //       return item;
        //     }
        //   });
        //   // console.log(declaration);
        //   // console.log(123);
        //   // path.replaceWithMultiple(declaration);
        //   // path.scope
        //   // path.replaceWith()
        // }

      }
    }
  };
});