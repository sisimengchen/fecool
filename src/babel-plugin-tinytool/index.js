const { declare } = require("@babel/helper-plugin-utils");

const { types } = require("@babel/core");
const t = types;

const { KEYWORD, getID } = require("./utils");

module.exports = declare((api, options, dirname) => {
  api.assertVersion(7);
  const { loose, allowTopLevelThis, strict, strictMode, noInterop } = options;
  return {
    pre(file) {
      file.isTinytooljs = false;
      this.isTinytooljs = false;
      this.isExpressionStatementOver = false;
      this.temp = [];
    },
    visitor: {
      Program: {
        enter(path, { opts }) {
          const { parent } = path;
          const { comments = [] } = parent;
          if (!comments.length) return;
          const comment = comments[0];
          const { type, value } = comment;
          if (
            type === "CommentBlock" &&
            value &&
            value.trim() === `@${KEYWORD}`
          ) {
            this.isTinytooljs = true;
            path.hub.file.isTinytooljs = true;
          }
        },
        exit(path) {
          if (!this.isTinytooljs) return;
          path.unshiftContainer("body", this.temp);
        }
      },
      VariableDeclaration: {
        enter(path, { opts }) {
          if (!this.isTinytooljs) return;
          // 这个要针对老代码做依赖收集，遍历变量定义的path，依赖收集
          const { node, parent } = path;
          const { declarations = [] } = node;
          if (declarations.length == 1) {
            const declaration = declarations[0];
            const { id, init } = declaration;
            if (t.isCallExpression(init)) {
              const { callee } = init;
              if (t.isIdentifier(callee)) {
                const { name } = callee;
                if (
                  name === "require" ||
                  name === "__include" ||
                  name === "__includejson"
                ) {
                  const args = init.arguments || []; // 获取require调用参数
                  if (args.length) {
                    let source = args[0].value; // 获取require调用第一个参数的值
                    if (name === "__include") {
                      source = `${source}.tmpl`;
                    } else if (name === "__includejson") {
                      source = `${source}.json`;
                    }
                    this.temp.push(
                      t.importDeclaration(
                        [t.importDefaultSpecifier(t.identifier(id.name))],
                        t.stringLiteral(source)
                      )
                    );
                    path.remove();
                  }
                }
              } else if (t.isCallExpression(callee)) {
                const { name } = callee.callee;
                if (
                  name === "require" ||
                  name === "__include" ||
                  name === "__includejson"
                ) {
                  const args = init.callee.arguments || []; // 获取require调用参数
                  if (args.length) {
                    let source = args[0].value; // 获取require调用第一个参数的值
                    if (name === "__include") {
                      source = `${source}.tmpl`;
                    } else if (name === "__includejson") {
                      source = `${source}.json`;
                    }
                    const identifierName = getID(id.name);
                    this.temp.push(
                      t.importDeclaration(
                        [
                          t.importDefaultSpecifier(t.identifier(identifierName))
                        ],
                        t.stringLiteral(source)
                      )
                    );
                    this.temp.push(
                      t.variableDeclaration("var", [
                        t.variableDeclarator(
                          t.identifier(id.name), // 这个名字需要记录
                          t.CallExpression(t.identifier(identifierName), [])
                        )
                      ])
                    );
                    path.remove();
                  }
                }
              }
            }
            if (t.isMemberExpression(init) && t.isCallExpression(init.object)) {
              const { callee } = init.object;
              const { name } = callee;
              if (
                name === "require" ||
                name === "__include" ||
                name === "__includejson"
              ) {
                const args = init.object.arguments || []; // 获取require调用参数
                if (args.length) {
                  let source = args[0].value; // 获取require调用第一个参数的值
                  if (name === "__include") {
                    source = `${source}.tmpl`;
                  } else if (name === "__includejson") {
                    source = `${source}.json`;
                  }
                  const identifierName = getID(id.name);
                  this.temp.push(
                    t.importDeclaration(
                      [t.importDefaultSpecifier(t.identifier(identifierName))],
                      t.stringLiteral(source)
                    )
                  );
                  this.temp.push(
                    t.variableDeclaration("var", [
                      t.variableDeclarator(
                        t.identifier(id.name), // 这个名字需要记录
                        t.memberExpression(
                          t.identifier(identifierName),
                          t.identifier(init.property.name)
                        )
                      )
                    ])
                  );
                  path.remove();
                }
              }
            }
          }
        }
      },
      ExpressionStatement: {
        // 解出被顶层define所包裹的代码，导出成类似于cmd的方式
        enter(path, { opts }) {
          if (!this.isTinytooljs) return;
          if (this.isExpressionStatementOver) return;
          const { node, parent } = path;
          if (!t.isCallExpression(node.expression)) return;
          const calleeName = node.expression.callee.name;
          const isDefineCall = calleeName === "define";
          if (!isDefineCall) return;
          if (!t.isProgram(parent)) return;
          const args = node.expression.arguments || []
          let callback;
          callback = args[0] ? args[0] : undefined;
          if (!callback) return;
          if (!t.isFunctionExpression(callback)) return;
          path.replaceWithMultiple(
            t.returnStatement(
              t.callExpression(
                t.functionExpression(null, [], callback.body),
                []
              )
            )
          );
          this.isExpressionStatementOver = true;
        }
      }
    }
  };
});
