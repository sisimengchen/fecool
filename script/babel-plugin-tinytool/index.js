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

const argumentDecoders = {
  [DEFINE]: decodeDefineArguments,
  [REQUIRE]: decodeRequireArguments
};

const zip = (array1, array2) => {
  return array1.map((element, index) => [element, array2[index]]);
};

const interopRequireDefault = template(`
  function _interopRequireDefault(obj) { return obj }
`);

module.exports = declare((api, options, dirname) => {
  api.assertVersion(7);
  return {
    pre(file) {
      file.__dependencyList = [];
      this.isExpressionStatementOver = false;
    },
    visitor: {
      Program: {
        exit(path) {
          path.pushContainer("body", interopRequireDefault());
        }
      },
      VariableDeclarator(path) {
        // 这个要针对老代码做依赖收集，遍历变量定义的path，依赖收集
        const { node } = path;
        const { id, init } = node; // id:变量名 init:变量调用表达式
        if (!t.isIdentifier(id)) return;
        if (!t.isCallExpression(init)) return;
        const { __dependencyList } = path.hub.file;
        const { callee } = init;
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
            __dependencyList.push({
              name: id.name,
              source: source
            });
            path.remove();
          }
        }
      },
      ExpressionStatement: {
        // 解出被顶层define所包裹的代码，导出成类似于cmd的方式
        enter(path, { opts }) {
          if (this.isExpressionStatementOver) return;
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
      }
    }
  };
});
