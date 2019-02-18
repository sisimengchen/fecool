"use strict";

var getResolveUrls = require("./resolve-urls");

module.exports = {
  install: function install(less, pluginManager) {
    var ResolveUrls = getResolveUrls(less);
    pluginManager.addVisitor(new ResolveUrls());
  }
};