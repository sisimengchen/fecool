const { declare } = require("@babel/helper-plugin-utils");

const { types } = require("@babel/core");
const t = types;

const { getOptions } = require("../config");

const globalOptions = getOptions();

module.exports = declare((api, options, dirname) => {
  api.assertVersion(7);
  const { loose, allowTopLevelThis, strict, strictMode, noInterop } = options;
  return {
    name: "fecool-helper",
    visitor: {
      Program: {
        enter(path, state) {
          const { parent } = path;
          const { comments = [] } = parent;
          const comment = comments[0] || {};
          const { type, value } = comment;
          // 通过注释修改program的sourceType
          if (
            type === "CommentBlock" &&
            value &&
            /^@sourcetype=/.test(value.trim())
          ) {
            this.file.set(
              "sourceType",
              value.trim().replace(/^@sourcetype=/, "")
            );
            return;
          } else if (
            globalOptions.tinytooljs ||
            (type === "CommentBlock" && value && value.trim() === "@tinytooljs")
          ) {
            this.file.set("sourceType", "tinytooljs");
            return;
          } else {
            // 尝试访问获取当前解析的包类型
            path.traverse({
              ExpressionStatement: path => {
                if (this.file.get("sourceType")) return;
                if (!t.isProgram(path.parent)) return;
                // 开始amd解析
                if (
                  t.isIdentifier(path.node.expression.callee, {
                    name: "define"
                  }) ||
                  t.isIdentifier(path.node.expression.callee, {
                    name: "require"
                  })
                ) {
                  const args = path.node.expression.arguments || [];
                  if (!args.length) return;
                  const lastArgument = args[args.length - 1];
                  if (t.isFunctionExpression(lastArgument)) {
                    this.file.set("sourceType", "amd");
                    path.stop();
                    return;
                  }
                }
                // 开始umd解析
                let callExpression = undefined;
                if (t.isCallExpression(path.node.expression)) {
                  callExpression = path.node.expression;
                } else if (
                  t.isUnaryExpression(path.node.expression) &&
                  t.isCallExpression(path.node.expression.argument)
                ) {
                  callExpression = path.node.expression.argument;
                }
                if (
                  callExpression &&
                  t.isFunctionExpression(callExpression.callee) &&
                  t.isBlockStatement(callExpression.callee.body)
                ) {
                  const args = callExpression.arguments || [];
                  if (!args.length) return;
                  const lastArgument = args[args.length - 1];
                  if (t.isFunctionExpression(lastArgument)) {
                    this.file.set("sourceType", "umd");
                    path.stop();
                  }
                }
              },
              AssignmentExpression: path => {
                // 开始commonjs解析
                const left = path.get("left");
                if (left && left.isMemberExpression()) {
                  const object = left.get("object");
                  if (object && object.node.name != "module") return;
                  const property = left.get("property");
                  if (property && property.node.name != "exports") return;
                  this.file.set("sourceType", "commonjs");
                  path.stop();
                }
              }
            });
          }
          const sourceType = this.file.get("sourceType"); // 'umd' 'amd' 'commonjs' 'tinytooljs'
          path.node.sourceType =
            sourceType && sourceType != "module"
              ? "script"
              : path.node.sourceType;
        }
      }
    }
  };
});
