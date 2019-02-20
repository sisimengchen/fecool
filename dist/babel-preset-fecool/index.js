"use strict";

var _require = require("@babel/helper-plugin-utils"),
    declare = _require.declare;

module.exports = declare(function (api, opts) {
  api.assertVersion(7);
  var plugins = [];
  plugins.push(require("./packages/babel-plugin-transform-modules-remove-strict"));
  plugins.push(require("./packages/babel-plugin-transform-modules-amd"));
  return {
    plugins: plugins
  };
});