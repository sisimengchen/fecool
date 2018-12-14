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
const t = types

const buildWrapper = template(`
  define(MODULE_NAME, AMD_ARGUMENTS, function(IMPORT_NAMES) {
  })
`);

module.exports = declare((api, options) => {
  api.assertVersion(7);

  const { loose, allowTopLevelThis, strict, strictMode, noInterop } = options;
  return {
    visitor: {
      Program: {
        exit(path) {
          if (!isModule(path)) return;

          let moduleName = this.getModuleName();
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          const { meta, headers } = rewriteModuleStatementsAndPrepareHeader(
            path, {
              loose,
              strict,
              strictMode,
              allowTopLevelThis,
              noInterop,
            },
          );

          const amdArgs = [];
          const importNames = [];

          if (hasExports(meta)) {
            amdArgs.push(t.stringLiteral("exports"));

            importNames.push(t.identifier(meta.exportName));
          }

          for (const [source, metadata] of meta.source) {
            amdArgs.push(t.stringLiteral(source));
            importNames.push(t.identifier(metadata.name));
            console.log(source)
            console.log(metadata.name)
            if (!isSideEffectImport(metadata)) {
              const interop = wrapInterop(
                path,
                t.identifier(metadata.name),
                metadata.interop,
              );
              if (interop) {
                const header = t.expressionStatement(
                  t.assignmentExpression(
                    "=",
                    t.identifier(metadata.name),
                    interop,
                  ),
                );
                header.loc = metadata.loc;
                headers.push(header);
              }
            }

            headers.push(
              ...buildNamespaceInitStatements(meta, metadata, loose),
            );
          }

          ensureStatementsHoisted(headers);
          path.unshiftContainer("body", headers);

          const { body, directives } = path.node;
          path.node.directives = [];
          path.node.body = [];
          const amdWrapper = path.pushContainer("body", [
            buildWrapper({
              MODULE_NAME: moduleName,

              AMD_ARGUMENTS: t.arrayExpression(amdArgs),
              IMPORT_NAMES: importNames,
            }),
          ])[0];
          const amdFactory = amdWrapper
            .get("expression.arguments")
            .filter(arg => arg.isFunctionExpression())[0]
            .get("body");
          amdFactory.pushContainer("directives", directives);
          amdFactory.pushContainer("body", body);
        },
      },
    },
  };
});
