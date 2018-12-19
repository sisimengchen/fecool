const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare((api, opts) => {
  console.log("babel-preset-fetool");
  api.assertVersion(7);
  const plugins = [];
  plugins.push(require("./packages/babel-plugin-transform-modules-amd"));
  return {
    plugins
  };
});
