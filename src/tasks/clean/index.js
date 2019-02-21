const del = require("del");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

function clean() {
  return del([`${globalOptions.getGulpDest()}/**/*`]);
}

module.exports = clean;
