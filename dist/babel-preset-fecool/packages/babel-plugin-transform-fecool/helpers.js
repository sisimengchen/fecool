"use strict";

var path = require("path");

var _require = require("../../../util"),
    printer = _require.printer;

var rules = [{
  name: "image-loader",
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  loader: require("../../../loader/image-loader"),
  options: {}
}, {
  name: "template-loader",
  test: /\.tmpl$/,
  loader: require("../../../loader/template-loader"),
  options: {}
}, {
  name: "json-loader",
  test: /\.json$/,
  loader: require("../../../loader/json-loader"),
  options: {}
}, {
  name: "style-loader",
  test: /\.(css|less|styl)(\?.*)?$/,
  loader: require("../../../loader/style-loader"),
  options: {}
}];
var defaultRule = {
  name: "default-loader",
  loader: require("../../../loader/default-loader"),
  options: {}
};

module.exports = function (t) {
  var createCode = function createCode(dependName, paramName) {
    printer.debug("依赖名称", dependName, paramName);
    var rule = rules.find(function (item, index) {
      return item.test && item.test.test && item.test.test(dependName);
    });

    if (!rule) {
      rule = defaultRule;
    }

    printer.debug("执行加载器", rule.name);
    var result = rule.loader({
      dependName: dependName,
      paramName: paramName,
      filename: this.filename
    }, rule.options);
    return result;
  };

  return {
    createCode: createCode
  };
};