"use strict";
const path = require("path");

const { printer } = require("../../../util");

const rules = [
  {
    name: "image-loader",
    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
    loader: require("../../../loader/image-loader"),
    options: {}
  },
  {
    name: "template-loader",
    test: /\.tmpl$/,
    loader: require("../../../loader/template-loader"),
    options: {}
  },
  {
    name: "json-loader",
    test: /\.json$/,
    loader: require("../../../loader/json-loader"),
    options: {}
  },
  {
    name: "style-loader",
    test: /\.css$/,
    loader: require("../../../loader/style-loader"),
    options: {}
  }
];

const defaultRule = {
  name: "default-loader",
  loader: require("../../../loader/default-loader"),
  options: {}
};

module.exports = t => {
  const isCode = function(source) {
    // 如果配置了rules则认为不是code
    const rule = rules.find((item, index) => {
      return item.test && item.test.test && item.test.test(source);
    });
    if (rule) {
      return false;
    }
    return true;
  };

  const createCode = function(name, source) {
    // 匹配规则，执行loader调用
    printer.log(`解析路径：${source}`);
    let isCode = false;
    let rule = rules.find((item, index) => {
      return item.test && item.test.test && item.test.test(source);
    });
    if (!rule) {
      isCode = true;
      rule = defaultRule;
    }
    printer.log(`执行加载器：${rule.name}`);
    const result = rule.loader(
      { name, source, filename: this.filename },
      rule.options
    );
    result.isCode = isCode;
    // console.log(result)
    return result;
  };

  return {
    isCode: isCode,
    createCode: createCode
  };
};
