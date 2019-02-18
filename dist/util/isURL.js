"use strict";

var protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
var localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
var nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;
/**
 * 判断输入字符是否是一个url
 *
 * @param {String} str 输入字符
 * @return {Boolean} 判断结果
 */

module.exports = function (str) {
  if (typeof str !== "string") {
    return false;
  }

  var match = str.match(protocolAndDomainRE);

  if (!match) {
    return false;
  }

  var everythingAfterProtocol = match[1];

  if (!everythingAfterProtocol) {
    return false;
  }

  if (localhostDomainRE.test(everythingAfterProtocol) || nonLocalhostDomainRE.test(everythingAfterProtocol)) {
    return true;
  }

  return false;
};