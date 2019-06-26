#!/usr/bin/env node

const info = require("../package.json");
const program = require("commander");
const path = require("path");
const { getOptions } = require("../dist/config");
const { printer } = require("../dist/util");
const initServer = require("./server");
const init = require("./build");

program
  .version(info.version)
  .option("-c, --config [value]", "设置配置文件路径")
  .option("-e, --environment [value]", "设置编译环境")
  .option("-d, --debug", "设置调试模式")
  .option("-w, --watch", "设置监听变化")
  .option("-s, --server", "启动开发服务")
  .parse(process.argv);

process.env.NODE_ENV = program.environment || "production";

process.env.FECOOL_VERSION = require("../package.json").version;

if (program.debug) {
  process.env.DEBUG = "debug";
}

const configPath = path.resolve(
  process.cwd(),
  program.config || "fecool.config.js"
);

let userOptions = {};
try {
  userOptions = require(configPath);
} catch (error) {
  printer.error(error);
  printer.warn(`用户配置文件${configPath}不存在，启用默认配置`);
}

userOptions.mode = program.environment || userOptions.mode || "production";
userOptions.watch = program.watch || userOptions.watch;
userOptions.debug = program.debug || userOptions.debug;

getOptions(userOptions);

if (program.server) {
  initServer();
} else {
  init();
}
