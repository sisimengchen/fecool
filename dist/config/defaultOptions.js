"use strict";

/**
 * @file 构建默认配置
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
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
    publicPath: "//fecool.com:8080",
    hasha: true,
    timestamp: undefined,
    // 指定资源构建的时间戳，为空则无
    args: {} // 构建出来的代码可以通过window.__args来获构建环境相关参数

  },
  resolve: {
    alias: {}
  },
  moduleDirectory: ["common_modules"],
  server: {
    port: 8080,
    single: true,
    // 启用单页面模式
    open: "external",
    host: "fecool.com",
    watch: false,
    middleware: []
  },
  optimization: {
    imagemin: false,
    // 图片压缩
    retainExtname: true // 保留扩展名
    // imagemin: false,
    // hasha: true,
    // timestamp: undefined, // 指定资源构建的时间戳，为空则无
    // args: {} // 构建出来的代码可以通过window.__args来获构建环境相关参数

  }
};
module.exports = defaultOptions;