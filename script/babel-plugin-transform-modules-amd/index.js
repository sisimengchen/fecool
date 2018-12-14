
/**
 * @file 
 * @author mengchen <mengchen002@ke.com>
 * @module babel-plugin-transform-modules-amd/index
 * 
 */
const { declare } = require("@babel/helper-plugin-utils");
const {
  isModule,
  rewriteModuleStatementsAndPrepareHeader,
  hasExports,
  isSideEffectImport,
  buildNamespaceInitStatements,
  ensureStatementsHoisted,
  wrapInterop
} = require("@babel/helper-module-transforms");
const { template, types } = require("@babel/core");
const t = types;
const { isCode, createCode } = require("./helpers")(t);

const { printer, extname } = require("../util");
const getPackage = require("../package");
const { getOptions } = require("../config");

const globalOptions = getOptions();

const buildWrapper = template(`
  define(MODULE_NAME, AMD_ARGUMENTS, function(IMPORT_NAMES) {
  })
`);

module.exports = declare((api, options) => {
  api.assertVersion(7);

  const { loose, allowTopLevelThis, strict, strictMode, noInterop } = options;
  return {
    pre(file) {
      this.dependencyList = file.__dependencyList || [];
      this.temp = [];
      this.isOver = false;
    },
    visitor: {
      Program: {
        exit(path) {
          if (!isModule(path)) return;
          // printer.log(this.dependencyList)
          printer.log(`解析依赖开始：${this.filename}`);
          printer.time("编译依赖时间");

          // let moduleName = this.getModuleName();
          let moduleName4Package = extname(this.filename, ".js");

          let moduleName = globalOptions.getURL(moduleName4Package);

          getPackage().addModule(moduleName4Package);
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          const { meta, headers } = rewriteModuleStatementsAndPrepareHeader(
            path,
            {
              loose,
              strict,
              strictMode,
              allowTopLevelThis,
              noInterop
            }
          );

          const dependencyList = [];
          // const amdArgs = [];
          // const importNames = [];

          if (hasExports(meta)) {
            // amdArgs.push(t.stringLiteral("exports"));

            // importNames.push(t.identifier(meta.exportName));
            dependencyList.push({
              name: meta.exportName,
              source: "exports"
            });
          }
          // console.log(meta.source)
          for (const [source, metadata] of meta.source) {
            // amdArgs.push(t.stringLiteral(source));
            // importNames.push(t.identifier(metadata.name));

            dependencyList.push({
              name: metadata.name,
              source: source
            });
            // console.log(1232131321, source, metadata);
            if (!isSideEffectImport(metadata)) {
              // console.log("isSideEffectImport", source);
              const interop = wrapInterop(
                path,
                t.identifier(metadata.name),
                metadata.interop
              );
              if (interop) {
                // printer.log(metadata.name)
                const header = t.expressionStatement(
                  t.assignmentExpression(
                    "=",
                    t.identifier(metadata.name),
                    interop
                  )
                );
                header.loc = metadata.loc;
                headers.push(header);
              }
            }

            headers.push(
              ...buildNamespaceInitStatements(meta, metadata, loose)
            );
          }
          this.dependencyList = dependencyList.concat(this.dependencyList);
          // 这里开始需要根据资源类型的不同去筛选资源，做不同的操作
          // console.log("依赖列表:", this.dependencyList);
          console.log("moduleName4Package", moduleName4Package);
          this.dependencyList = this.dependencyList.filter(
            (sourceItem, index) => {
              const { name, source } = sourceItem;
              const result = createCode.call(this, name, source);
              // console.log(sourceItem, result)
              if (result.resourcePath) {
                // 如果是code
                // console.log(sourceItem, result)
                // console.log('result.resourcePath', result.resourcePath)
                getPackage().addDependency(
                  moduleName4Package,
                  result.resourcePath
                );
              }
              if (result.acitve) {
                sourceItem.name = result.name;
                sourceItem.source = result.source;
              }
              if (result.code) {
                this.temp.push(result.code);
              }
              // printer.log(name, source)
              // printer.log(result.name, result.source)
              // return true
              // console.log(result.code)
              return result.acitve;
            }
          );
          console.log("moduleName4Package", moduleName4Package);
          // console.log("package", getPackage().package);
          // console.log("module", getPackage().module);
          path.unshiftContainer("body", this.temp);
          const amdArgs = this.dependencyList.map(source =>
            t.stringLiteral(source.source)
          ); // 添加到define参数里
          const importNames = this.dependencyList.map(source =>
            t.identifier(source.name)
          ); // 添加到function参数里

          ensureStatementsHoisted(headers);
          path.unshiftContainer("body", headers);

          const { body, directives } = path.node;
          path.node.directives = [];
          path.node.body = [];
          const amdWrapper = path.pushContainer("body", [
            buildWrapper({
              MODULE_NAME: moduleName,

              AMD_ARGUMENTS: t.arrayExpression(amdArgs),
              IMPORT_NAMES: importNames
            })
          ])[0];
          const amdFactory = amdWrapper
            .get("expression.arguments")
            .filter(arg => arg.isFunctionExpression())[0]
            .get("body");
          amdFactory.pushContainer("directives", directives);
          amdFactory.pushContainer("body", body);
          printer.timeEnd("编译依赖时间");
          printer.log(`编译依赖结束：${this.filename}`);
          this.isOver = true;
        }
      }
    }
  };
});
