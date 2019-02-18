const browserSync = require("browser-sync").create("fetool");
const { getOptions } = require("../dist/config");

module.exports = function initServer() {
  const globalOptions = getOptions();
  browserSync.init(globalOptions.server());
};
