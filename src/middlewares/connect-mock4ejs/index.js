const path = require("path");
const { spawn } = require("child_process");
const { getOptions } = require("../../config");
const globalOptions = getOptions();
const ejs = require("ejs");

module.exports = function(options) {
  if (options == null) {
    options = {};
  }
  return function(req, res, next) {
    const { ext } = path.parse(req.url);
    if (ext && ext.toLocaleLowerCase() === ".ejs") {
      const filePath = path.join(globalOptions.distDir, req.url);
      const mockPath = path.join(
        globalOptions.distDir,
        req.url,
        "../mock.ejsjson"
      );
      ejs.renderFile(filePath, require(mockPath), options, function(err, html) {
        res.end(html);
      });
    } else {
      next();
    }
  };
};
