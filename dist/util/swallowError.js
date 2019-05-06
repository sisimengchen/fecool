"use strict";

var printer = require("./printer");

module.exports = function (error) {
  printer.error(error);
  this.emit("end");
};