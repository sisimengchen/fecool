"use strict";

var uid = 0;
var KEYWORD = "tinytooljs";

var getID = function getID(name) {
  return "name_".concat(KEYWORD, "_").concat(uid++);
};

module.exports = {
  KEYWORD: KEYWORD,
  getID: getID
};