"use strict";

var _require = require("@babel/helper-plugin-utils"),
    declare = _require.declare;

module.exports = declare(function (api, opts) {
  api.assertVersion(7);
  return {
    plugins: [require("./packages/babel-plugin-transform-remove-strict"), require("./packages/babel-plugin-transform-fecool")].filter(Boolean)
  };
});