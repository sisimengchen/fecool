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
    publicPath: "//fecool.com:8080",
    hasha: true,
    timestamp: undefined,
    args: {}
  },
  resolve: {
    alias: {}
  },
  moduleDirectory: ["common_modules"],
  server: {
    port: 8080,
    single: true,
    open: "external",
    host: "fecool.com",
    watch: false,
    middleware: []
  },
  optimization: {
    imagemin: false,
    retainExtname: true
  }
};
module.exports = defaultOptions;