var getResolveUrls = require("./resolve-urls");

module.exports = {
  install: function(less, pluginManager) {
    var ResolveUrls = getResolveUrls(less);
    pluginManager.addVisitor(new ResolveUrls());
  }
};
