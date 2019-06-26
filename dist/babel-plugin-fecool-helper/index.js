"use strict";

var _require = require("@babel/helper-plugin-utils"),
    declare = _require.declare;

var _require2 = require("@babel/core"),
    types = _require2.types;

var t = types;

var _require3 = require("../config"),
    getOptions = _require3.getOptions;

module.exports = declare(function (api, options, dirname) {
  api.assertVersion(7);
  var loose = options.loose,
      allowTopLevelThis = options.allowTopLevelThis,
      strict = options.strict,
      strictMode = options.strictMode,
      noInterop = options.noInterop;
  return {
    name: "fecool-helper",
    visitor: {
      Program: {
        enter: function enter(path, state) {
          var _this = this;

          var parent = path.parent;
          var _parent$comments = parent.comments,
              comments = _parent$comments === void 0 ? [] : _parent$comments;
          if (!comments.length) return;
          var comment = comments[0];
          var type = comment.type,
              value = comment.value;

          if (type === "CommentBlock" && value && /^@sourcetype=/.test(value.trim())) {
            this.file.set("sourceType", value.trim().replace(/^@sourcetype=/, ""));
            return;
          } else if (type === "CommentBlock" && value && value.trim() === "@tinytooljs") {
            this.file.set("sourceType", "tinytooljs");
            return;
          } else {
            path.traverse({
              ExpressionStatement: function ExpressionStatement(path) {
                if (_this.file.get("sourceType")) return;
                if (!t.isProgram(path.parent)) return;

                if (t.isIdentifier(path.node.expression.callee, {
                  name: "define"
                }) || t.isIdentifier(path.node.expression.callee, {
                  name: "require"
                })) {
                  var args = path.node.expression.arguments || [];
                  if (!args.length) return;
                  var lastArgument = args[args.length - 1];

                  if (t.isFunctionExpression(lastArgument)) {
                    _this.file.set("sourceType", "amd");

                    path.stop();
                  }
                }

                if (t.isFunctionExpression(path.node.expression.callee) && t.isBlockStatement(path.node.expression.callee.body)) {
                  var _args = path.node.expression.arguments || [];

                  if (!_args.length) return;
                  var _lastArgument = _args[_args.length - 1];

                  if (t.isFunctionExpression(_lastArgument)) {
                    _this.file.set("sourceType", "umd");

                    path.stop();
                  }
                }
              },
              AssignmentExpression: function AssignmentExpression(path) {
                var left = path.get("left");

                if (left && left.isMemberExpression()) {
                  var object = left.get("object");
                  if (object && object.node.name != "module") return;
                  var property = left.get("property");
                  if (property && property.node.name != "exports") return;

                  _this.file.set("sourceType", "commonjs");

                  path.stop();
                }
              }
            });
          }

          var sourceType = this.file.get("sourceType");
          path.node.sourceType = sourceType && sourceType != "module" ? "script" : path.node.sourceType;
        }
      }
    }
  };
});