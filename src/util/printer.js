const chalk = require("chalk");
const moment = require("moment");
const cache = {};

function time() {
  return chalk.grey(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] `);
}

const formateArgs = (
  args = [],
  handler = o => {
    o;
  }
) => {
  return args.map((item = "") => {
    if (item.message && item.stack) {
      return item;
    } else if (typeof item === "object") {
      return handler(JSON.stringify(item));
    } else {
      return handler(item);
    }
  });
};

module.exports = {
  /**
   * log输出（白色）
   */
  log: function(...args) {
    if (args.length == 0) return;
    process.stderr.write(time());
    args = formateArgs(args, chalk.white);
    console.log(...args);
  },

  /**
   * debug输出（粉色） (配置debug才会生效)
   */
  debug: function(...args) {
    if (process.env.DEBUG != "debug") return;
    if (args.length == 0) return;
    process.stderr.write(time());
    args = formateArgs(args, chalk.magenta);
    console.log(...args);
  },

  /**
   * warn输出（黄色）
   */
  warn: function(...args) {
    if (args.length == 0) return;
    process.stderr.write(time());
    args = formateArgs(args, chalk.yellow);
    console.log(...args);
  },

  /**
   * error输出（红色）
   */
  error: function(...args) {
    if (args.length == 0) return;
    process.stderr.write(time());
    args = formateArgs(args, chalk.red);
    console.error(...args);
  },

  /**
   * 开始计算运行时间
   */
  time: function(name) {
    if (!name) return;
    if (cache[name]) {
      delete cache[name];
    }
    cache[name] = +new Date();
  },

  /**
   * 输出运行时间（蓝色）
   */
  timeEnd: function(name) {
    if (!name) return;
    if (cache[name]) {
      const message = `${name}：${(+new Date() - cache[name]) / 1000}秒`;
      process.stderr.write(time());
      console.log(chalk.blue(message));
      delete cache[name];
    }
  }
};
