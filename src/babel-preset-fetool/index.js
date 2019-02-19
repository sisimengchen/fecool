const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare((api, opts) => {
  api.assertVersion(7);
  const plugins = [];
  plugins.push(
    require("./packages/babel-plugin-transform-modules-remove-strict")
  );
  plugins.push(require("./packages/babel-plugin-transform-modules-amd"));
  return {
    plugins
  };
});
