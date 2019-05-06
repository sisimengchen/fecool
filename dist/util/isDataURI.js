"use strict";

module.exports = function (str) {
  if (!str) return false;
  var nReturn = /^(data:)([\w\/\+\-]+)$/.test(str.split(";")[0]);
  return nReturn;
};