const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare((api, opts) => {
  api.assertVersion(7);
  return {
    plugins: [
      require("./packages/babel-plugin-transform-remove-strict"),
      require("./packages/babel-plugin-transform-fecool")
    ].filter(Boolean)
  };
});
