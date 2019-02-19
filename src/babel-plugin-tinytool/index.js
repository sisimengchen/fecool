const { declare } = require("@babel/helper-plugin-utils");

const { template, types } = require("@babel/core");
const t = types;

const {
  decodeDefineArguments,
  decodeRequireArguments,
  isModuleOrExportsInjected,
  isSimplifiedCommonJSWrapper,
  createDependencyInjectionExpression,
  createModuleExportsAssignmentExpression,
  createModuleExportsResultCheck,
  getUniqueIdentifier,
  isFunctionExpression,
  createFactoryReplacementExpression
} = require("./helpers")(t);

const {
  REQUIRE,
  MODULE,
  EXPORTS,
  DEFINE,
  AMD_DEFINE_RESULT
} = require("./constants");

const { KEYWORD, getID } = require("./utils");

const argumentDecoders = {
  [DEFINE]: decodeDefineArguments,
  [REQUIRE]: decodeRequireArguments
};

const zip = (array1, array2) => {
  return array1.map((element, index) => [element, array2[index]]);
};

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
          if (this.isExpressionStatementOver) return;
          if (!this.isTinytooljs) return;
          const { node, parent } = path;
          if (!t.isCallExpression(node.expression)) return;
          const options = Object.assign(
            { restrictToTopLevelDefine: true },
            opts
          );
          const { name } = node.expression.callee;
          const isDefineCall = name === DEFINE;
          if (
            isDefineCall &&
            options.restrictToTopLevelDefine &&
            !t.isProgram(parent)
          )
            return;

          const argumentDecoder = argumentDecoders[name];
          if (!argumentDecoder) return;
          // 依赖列表, 创建工厂函数
          const { dependencyList, factory } = argumentDecoder(
            node.expression.arguments
          );
          if (!t.isArrayExpression(dependencyList) && !factory) return;
          const isFunctionFactory = isFunctionExpression(factory);
          const dependencyInjections = [];
          // 处理依赖列表
          if (dependencyList) {
            // 压缩
            const dependencyParameterPairs = zip(
              dependencyList.elements,
              isFunctionFactory ? factory.params : []
            );
            // 创建依赖表达式
            const dependencyInjectionExpressions = dependencyParameterPairs
              .map(([dependency, paramName]) => {
                return createDependencyInjectionExpression(
                  dependency,
                  paramName
                );
              })
              .filter(dependencyInjection => {
                return dependencyInjection !== undefined;
              });

            dependencyInjections.push(...dependencyInjectionExpressions);
          }
          // 如果有工厂函数
          if (isFunctionFactory) {
            // 获取工厂函数参数个数
            const factoryArity = factory.params.length;
            // 创建工厂函数替换表达式
            let replacementFuncExpr = createFactoryReplacementExpression(
              factory,
              dependencyInjections
            );
            let replacementCallExprParams = [];

            if (isSimplifiedCommonJSWrapper(dependencyList, factoryArity)) {
              replacementFuncExpr = factory;

              // Order is important here for the simplified commonjs wrapper
              const amdKeywords = [REQUIRE, EXPORTS, MODULE];

              replacementCallExprParams = amdKeywords
                .slice(0, factoryArity)
                .map(keyword => t.identifier(keyword));
            }

            const factoryReplacement = t.callExpression(
              replacementFuncExpr,
              replacementCallExprParams
            );

            if (isDefineCall) {
              if (!isModuleOrExportsInjected(dependencyList, factoryArity)) {
                // console.log("ExpressionStatement");
                path.replaceWith(
                  createModuleExportsAssignmentExpression(factoryReplacement)
                );
              } else {
                const resultCheckIdentifier = getUniqueIdentifier(
                  path.scope,
                  AMD_DEFINE_RESULT
                );
                path.replaceWithMultiple(
                  createModuleExportsResultCheck(
                    factoryReplacement,
                    resultCheckIdentifier
                  )
                );
              }
            } else {
              path.replaceWith(factoryReplacement);
            }
          } else if (factory && isDefineCall) {
            const exportExpression = createModuleExportsAssignmentExpression(
              factory
            );
            const nodes = dependencyInjections.concat(exportExpression);
            path.replaceWithMultiple(nodes);
          } else {
            path.replaceWithMultiple(dependencyInjections);
          }
          this.isExpressionStatementOver = true;
        }
        // 解出被顶层define所包裹的代码，导出成类似于cmd的方式
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
