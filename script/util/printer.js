const chalk = require("chalk");
const dateformat = require("dateformat");

const cache = {};

function time() {
  return `[${chalk.grey(dateformat(new Date(), "HH:MM:ss"))}]`;
}

module.exports = {
  log: function(message) {
    console.log(`${time()} ${message}`);
  },

  warn: function(message) {
    console.warn(`${time()} ${chalk.yellow(message)}`);
  },

  error: function(error) {
    console.error(`${time()} ${chalk.red(error.toString())}`);
  },

  time: function(name) {
    if (cache[name]) {
      delete cache[name];
    }
    cache[name] = +new Date();
  },

  timeEnd: function(name) {
    if (cache[name]) {
      const message = `${name}：${(+new Date() - cache[name]) / 1000}秒`;
      console.log(`${time()} ${chalk.blue(message)}`);
      delete cache[name];
    }
  }
};
