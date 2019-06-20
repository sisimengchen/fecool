"use strict";

var _require = require("@babel/helper-plugin-utils"),
    declare = _require.declare;

var _require2 = require("@babel/core"),
    types = _require2.types;

var t = types;
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
        enter: function enter(path, _ref) {
          var opts = _ref.opts;
          var parent = path.parent;
          var _parent$comments = parent.comments,
              comments = _parent$comments === void 0 ? [] : _parent$comments;
          if (!comments.length) return;
          var comment = comments[0];
          var type = comment.type,
              value = comment.value;

          if (type === "CommentBlock" && value && value.trim() === "@umdjs") {
            path.node.sourceType = "script";
          }
        }
      }
    }
  };
});