/**
 * @file 构建目录清理任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const del = require("del");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

function clean() {
  return del([`${globalOptions.getGulpDest()}/**/*`]);
}

module.exports = clean;
