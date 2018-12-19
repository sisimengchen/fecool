const { declare } = require("@babel/helper-plugin-utils");

const { template, types } = require("@babel/core");
const t = types;

const {
  REQUIRE,
  MODULE,
  EXPORTS,
  DEFINE,
  AMD_DEFINE_RESULT
} = require("./constants");

const { KEYWORD, getID } = require("./utils");

module.exports = declare((api, options, dirname) => {
  api.assertVersion(7);
  const { loose, allowTopLevelThis, strict, strictMode, noInterop } = options;
  return {
    pre(file) {
      // file.__dependencyList = [];
      this.transformMap = {};
      this.isTinytooljs = false;
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
          }
        },
        exit(path) {
          if (!this.isTinytooljs) return;
          // path.pushContainer("body", interopRequireDefault());
        }
      },
      Identifier: {
        enter(path, { opts }) {
          if (!this.isTinytooljs) return;
          const { node, parent } = path;
          // 这里可能会有判断缺失的情况 后期需要注意
          if (
            !t.isVariableDeclarator(parent) &&
            !t.isImportDefaultSpecifier(parent) &&
            !t.isMemberExpression(parent)
          ) {
            // console.log("transformMap", this.transformMap);
            const { name } = node;
            const newName = this.transformMap[name + ""];
            if (newName) {
              path.replaceWith(t.identifier(newName));
            }
          }
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
                  const { arguments = [] } = init; // 获取require调用参数
                  if (arguments.length) {
                    let source = arguments[0].value; // 获取require调用第一个参数的值
                    if (name === "__include") {
                      source = `${source}.tmpl`;
                    } else if (name === "__includejson") {
                      source = `${source}.json`;
                    }
                    path.replaceWith(
                      t.importDeclaration(
                        [t.importDefaultSpecifier(t.identifier(id.name))],
                        t.stringLiteral(source)
                      )
                    );
                  }
                }
              } else if (t.isCallExpression(callee)) {
                const { name } = callee.callee;
                if (
                  name === "require" ||
                  name === "__include" ||
                  name === "__includejson"
                ) {
                  const { arguments = [] } = init.callee; // 获取require调用参数
                  if (arguments.length) {
                    let source = arguments[0].value; // 获取require调用第一个参数的值
                    if (name === "__include") {
                      source = `${source}.tmpl`;
                    } else if (name === "__includejson") {
                      source = `${source}.json`;
                    }
                    const identifierName = getID(id.name);
                    this.transformMap[id.name + ""] = identifierName;
                    path.replaceWithMultiple([
                      t.importDeclaration(
                        [t.importDefaultSpecifier(t.identifier(id.name))],
                        t.stringLiteral(source)
                      ),
                      t.variableDeclaration("var", [
                        t.variableDeclarator(
                          t.identifier(identifierName), // 这个名字需要记录
                          t.CallExpression(t.identifier(id.name), [])
                        )
                      ])
                    ]);
                  }
                }
              }
            }
            if (t.isMemberExpression(init) && t.isCallExpression(init.object)) {
              // console.log(init.object)
              // console.log(init.property.name);
              const { callee } = init.object;
              const { name } = callee;
              if (
                name === "require" ||
                name === "__include" ||
                name === "__includejson"
              ) {
                const { arguments = [] } = init.object; // 获取require调用参数
                if (arguments.length) {
                  let source = arguments[0].value; // 获取require调用第一个参数的值
                  if (name === "__include") {
                    source = `${source}.tmpl`;
                  } else if (name === "__includejson") {
                    source = `${source}.json`;
                  }
                  // path.remove();
                  const identifierName = getID(id.name);
                  this.transformMap[id.name + ""] = identifierName;
                  path.replaceWithMultiple([
                    t.importDeclaration(
                      [t.importDefaultSpecifier(t.identifier(id.name))],
                      t.stringLiteral(source)
                    ),
                    t.variableDeclaration("var", [
                      t.variableDeclarator(
                        t.identifier(identifierName), // 这个名字需要记录
                        t.memberExpression(
                          t.identifier(id.name),
                          t.identifier(init.property.name)
                        )
                      )
                    ])
                  ]);
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
          const { node, parent } = path;
          if (!t.isCallExpression(node.expression)) return;
          const calleeName = node.expression.callee.name;
          const isDefineCall = calleeName === DEFINE;
          if (!isDefineCall) return;
          if (!t.isProgram(parent)) return;
          const { arguments = [] } = node.expression;
          let callback;
          callback = arguments[0] ? arguments[0] : undefined;
          if (!callback) return;
          if (!t.isFunctionExpression(callback)) return;
          const declaration = callback.body.body.map((item, index, array) => {
            if (t.isReturnStatement(item)) {
              // const argument = item.argument;
              // console.log(item.argument);
              return t.exportDefaultDeclaration(item.argument);
              // return item;
            } else {
              return item;
            }
          });
          // console.log(declaration);
          // console.log(123);
          path.replaceWithMultiple(declaration);
        },
        // 解出被顶层define所包裹的代码，导出成类似于cmd的方  式
        exit(path, { opts }) {
          if (!this.isTinytooljs) return;
          // console.log("this.dependencyList", this.dependencyList);
          // const { node, parent } = path;
        }
      }
      // ReturnStatement: {
      //   exit(path, { opts }) {
      //     if (!this.isTinytooljs) return;
      //     const { node, parent } = path;
      //     // console.log("23232322", path);
      //   }
      // }
    }
  };
});
