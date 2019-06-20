const { declare } = require("@babel/helper-plugin-utils");

const { types } = require("@babel/core");
const t = types;

module.exports = declare((api, options, dirname) => {
  api.assertVersion(7);
  const { loose, allowTopLevelThis, strict, strictMode, noInterop } = options;
  return {
    name: "fecool-helper",
    visitor: {
      Program: {
        enter(path, { opts }) {
          const { parent } = path;
          const { comments = [] } = parent;
          if (!comments.length) return;
          const comment = comments[0];
          const { type, value } = comment;
          if (type === "CommentBlock" && value && value.trim() === "@umdjs") {
            path.node.sourceType = "script";
          }
        }
      }
    }
  };
});
