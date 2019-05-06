"use strict";

var _require = require("@babel/helper-plugin-utils"),
    declare = _require.declare;

var _require2 = require("@babel/core"),
    types = _require2.types;

var t = types;

var _require3 = require("./utils"),
    KEYWORD = _require3.KEYWORD,
    getID = _require3.getID;

module.exports = declare(function (api, options, dirname) {
  api.assertVersion(7);
  var loose = options.loose,
      allowTopLevelThis = options.allowTopLevelThis,
      strict = options.strict,
      strictMode = options.strictMode,
      noInterop = options.noInterop;
  return {
    name: "transform-tinytool",
    pre: function pre(file) {
      file.isTinytooljs = false;
      this.isTinytooljs = false;
      this.isExpressionStatementOver = false;
      this.temp = [];
    },
    visitor: {
      Program: {
        enter: function enter(path, _ref) {
          var _this = this;

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
            if (!this.isTinytooljs) return;
            path.traverse({
              VariableDeclaration: function VariableDeclaration(path) {
                if (!_this.isTinytooljs) return;
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
                        var args = init.arguments || [];

                        if (args.length) {
                          var source = args[0].value;

                          if (name === "__include") {
                            source = "".concat(source, ".tmpl");
                          } else if (name === "__includejson") {
                            source = "".concat(source, ".json");
                          }

                          _this.temp.push(t.importDeclaration([t.importDefaultSpecifier(t.identifier(id.name))], t.stringLiteral(source)));

                          path.remove();
                        }
                      }
                    } else if (t.isCallExpression(callee)) {
                      var _name = callee.callee.name;

                      if (_name === "require" || _name === "__include" || _name === "__includejson") {
                        var _args = init.callee.arguments || [];

                        if (_args.length) {
                          var _source = _args[0].value;

                          if (_name === "__include") {
                            _source = "".concat(_source, ".tmpl");
                          } else if (_name === "__includejson") {
                            _source = "".concat(_source, ".json");
                          }

                          var identifierName = getID(id.name);

                          _this.temp.push(t.importDeclaration([t.importDefaultSpecifier(t.identifier(identifierName))], t.stringLiteral(_source)));

                          _this.temp.push(t.variableDeclaration("var", [t.variableDeclarator(t.identifier(id.name), t.CallExpression(t.identifier(identifierName), []))]));

                          path.remove();
                        }
                      }
                    }
                  }

                  if (t.isMemberExpression(init) && t.isCallExpression(init.object)) {
                    var _callee = init.object.callee;
                    var _name2 = _callee.name;

                    if (_name2 === "require" || _name2 === "__include" || _name2 === "__includejson") {
                      var _args2 = init.object.arguments || [];

                      if (_args2.length) {
                        var _source2 = _args2[0].value;

                        if (_name2 === "__include") {
                          _source2 = "".concat(_source2, ".tmpl");
                        } else if (_name2 === "__includejson") {
                          _source2 = "".concat(_source2, ".json");
                        }

                        var _identifierName = getID(id.name);

                        _this.temp.push(t.importDeclaration([t.importDefaultSpecifier(t.identifier(_identifierName))], t.stringLiteral(_source2)));

                        _this.temp.push(t.variableDeclaration("var", [t.variableDeclarator(t.identifier(id.name), t.memberExpression(t.identifier(_identifierName), t.identifier(init.property.name)))]));

                        path.remove();
                      }
                    }
                  }
                }
              },
              ExpressionStatement: function ExpressionStatement(path) {
                if (!_this.isTinytooljs) return;
                if (_this.isExpressionStatementOver) return;
                var node = path.node,
                    parent = path.parent;
                if (!t.isCallExpression(node.expression)) return;
                var calleeName = node.expression.callee.name;
                var isDefineCall = calleeName === "define";
                if (!isDefineCall) return;
                if (!t.isProgram(parent)) return;
                var args = node.expression.arguments || [];
                var callback;
                callback = args[0] ? args[0] : undefined;
                if (!callback) return;
                if (!t.isFunctionExpression(callback)) return;
                path.replaceWithMultiple(t.returnStatement(t.callExpression(t.functionExpression(null, [], callback.body), [])));
                _this.isExpressionStatementOver = true;
              }
            });
          }
        },
        exit: function exit(path) {
          if (!this.isTinytooljs) return;
          path.unshiftContainer("body", this.temp);
        }
      }
    }
  };
});