const printer = require("./printer");
/**
 * 针对gulp报错增加的吞异常的函数
 *
 * @param {error} Error 异常
 */
module.exports = function(error) {
  printer.error(error);
  this.emit("end");
};
