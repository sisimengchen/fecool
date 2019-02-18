"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var chalk = require("chalk");

var moment = require("moment");

var cache = {};

function time() {
  return chalk.grey("[".concat(moment().format("YYYY-MM-DD HH:mm:ss"), "] "));
}

var formateArgs = function formateArgs() {
  var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (o) {
    o;
  };
  return args.map(function () {
    var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

    if (item.message && item.stack) {
      return item;
    } else if (_typeof(item) === "object") {
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
  log: function log() {
    var _console;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length == 0) return;
    process.stderr.write(time());
    args = formateArgs(args, chalk.white);

    (_console = console).log.apply(_console, _toConsumableArray(args));
  },

  /**
   * debug输出（粉色） (配置debug才会生效)
   */
  debug: function debug() {
    var _console2;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (process.env.DEBUG != "debug") return;
    if (args.length == 0) return;
    process.stderr.write(time());
    args = formateArgs(args, chalk.magenta);

    (_console2 = console).log.apply(_console2, _toConsumableArray(args));
  },

  /**
   * warn输出（黄色）
   */
  warn: function warn() {
    var _console3;

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    if (args.length == 0) return;
    process.stderr.write(time());
    args = formateArgs(args, chalk.yellow);

    (_console3 = console).log.apply(_console3, _toConsumableArray(args));
  },

  /**
   * error输出（红色）
   */
  error: function error() {
    var _console4;

    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    if (args.length == 0) return;
    process.stderr.write(time());
    args = formateArgs(args, chalk.red);

    (_console4 = console).error.apply(_console4, _toConsumableArray(args));
  },

  /**
   * 开始计算运行时间
   */
  time: function time(name) {
    if (!name) return;

    if (cache[name]) {
      delete cache[name];
    }

    cache[name] = +new Date();
  },

  /**
   * 输出运行时间（蓝色）
   */
  timeEnd: function timeEnd(name) {
    if (!name) return;

    if (cache[name]) {
      var message = "".concat(name, "\uFF1A").concat((+new Date() - cache[name]) / 1000, "\u79D2");
      process.stderr.write(time());
      console.log(chalk.blue(message));
      delete cache[name];
    }
  }
};