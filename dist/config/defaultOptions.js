"use strict";

var defaultOptions = {
  mode: "production",
  debug: false,
  watch: false,
  context: process.cwd(),
  entry: {
    path: "./src",
    common: "./src/common"
  },
  output: {
    path: "./dest",
    common: "./dest/common",
    publicPath: "//fecool.com:8080"
  },
  resolve: {
    alias: {}
  },
  moduleDirectory: ["common_modules"],
  template: "ejs",
  server: {
    port: 8080,
    single: true,
    // 启用单页面模式
    open: "external",
    host: "fecool.com",
    watch: false,
    middleware: []
  },
  timestamp: undefined,
  // 指定资源构建的时间戳，为空则无
  args: {} // 构建出来的代码可以通过window.__args来获构建环境相关参数

};
module.exports = defaultOptions;