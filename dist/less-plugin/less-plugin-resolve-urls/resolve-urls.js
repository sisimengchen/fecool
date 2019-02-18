"use strict";

var _require = require("../../config"),
    getOptions = _require.getOptions;

var _require2 = require("../../util"),
    isURL = _require2.isURL,
    isDataURI = _require2.isDataURI;

var globalOptions = getOptions();

module.exports = function (less) {
  function ResolveUrls() {
    this._visitor = new less.visitors.Visitor(this);
  }

  ResolveUrls.prototype = {
    isReplacing: true,
    isPreEvalVisitor: true,
    run: function run(root) {
      return this._visitor.visit(root);
    },
    visitUrl: function visitUrl(URLNode, visitArgs) {
      if (!URLNode.value) return URLNode;
      if (!URLNode.value.value) return URLNode;

      var _URLNode$value$_fileI = URLNode.value._fileInfo,
          _fileInfo = _URLNode$value$_fileI === void 0 ? {} : _URLNode$value$_fileI;

      var filename = _fileInfo.filename;
      var url = URLNode.value.value;
      if (isURL(url)) return URLNode;
      if (isDataURI(url)) return URLNode;

      try {
        url = url.split("?")[0];
        var resourcePath = globalOptions.resolve(url, filename);

        var _module = globalOptions.getModule(resourcePath);

        url = _module.url;
      } catch (error) {} finally {
        URLNode.value.value = url;
        return URLNode;
      }
    }
  };
  return ResolveUrls;
};