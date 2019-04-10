const path = require("path");
const { spawn } = require("child_process");
const { getOptions } = require("../../config");
const globalOptions = getOptions();
const ejs = require("ejs");

module.exports = function(options = {}) {
  return function(req, res, next) {
    const pathname = req._parsedUrl.pathname;
    const search = req._parsedUrl.search;
    const { ext, base, name } = path.parse(pathname); // ext => '.phtml'  base => 'xxx.phtml'
    if (ext && ext.toLocaleLowerCase() === ".ejs") {
      const fileName = path.join(globalOptions.distDir, pathname);
      const mockFilename = path.join(fileName, "../mock.ejsjson");
      ejs.renderFile(fileName, require(mockFilename), options, function(
        err,
        html
      ) {
        res.end(html);
      });
    } else {
      next();
    }
  };
};
