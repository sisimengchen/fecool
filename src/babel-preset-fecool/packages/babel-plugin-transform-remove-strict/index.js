const { declare } = require("@babel/helper-plugin-utils");
const { types } = require("@babel/core");
const t = types;

module.exports = declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-remove-strict",
    visitor: {
      Directive(path, state) {
        if (!state.file.get("isTinytoolJS")) return;
        const { node, parent } = path;
        if (t.isDirectiveLiteral(node.value)) {
          node.value.value = "use strict";
          path.remove();
        }
      }
    }
  };
});
