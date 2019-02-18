"use strict";

var _require = require("@babel/helper-plugin-utils"),
    declare = _require.declare;

var _require2 = require("@babel/core"),
    types = _require2.types;

var t = types;
module.exports = declare(function (api) {
  api.assertVersion(7);
  return {
    visitor: {
      Directive: function Directive(path, _ref) {
        var opts = _ref.opts;
        if (!path.hub.file.isTinytooljs) return;
        var node = path.node,
            parent = path.parent;

        if (t.isDirectiveLiteral(node.value)) {
          node.value.value = "use strict";
          path.remove();
        }
      }
    }
  };
});