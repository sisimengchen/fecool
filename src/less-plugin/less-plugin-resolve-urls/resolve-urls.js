const { getOptions } = require("../../config");
const { isURL, isDataURI } = require("../../util");
const globalOptions = getOptions();

module.exports = function(less) {
  function ResolveUrls() {
    this._visitor = new less.visitors.Visitor(this);
  }

  ResolveUrls.prototype = {
    isReplacing: true,
    isPreEvalVisitor: true,
    run: function(root) {
      return this._visitor.visit(root);
    },
    visitUrl: function(URLNode, visitArgs) {
      if (!URLNode.value) return URLNode;
      if (!URLNode.value.value) return URLNode;
      const { _fileInfo = {} } = URLNode.value;
      const { filename } = _fileInfo;
      let url = URLNode.value.value;
      if (isURL(url)) return URLNode;
      if (isDataURI(url)) return URLNode;
      try {
        url = url.split("?")[0];
        const resourcePath = globalOptions.resolve(url, filename);
        const module = globalOptions.getModule(resourcePath);
        url = module.url;
      } catch (error) {
      } finally {
        URLNode.value.value = url;
        return URLNode;
      }
    }
  };
  return ResolveUrls;
};
