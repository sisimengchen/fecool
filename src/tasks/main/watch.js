/**
 * @file 生产环境监听构建任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const { watch } = require("gulp");
const { getOptions } = require("../../config");
const devBuild = require("./build-dev");
const {
  move,
  cssCompile,
  stylusCompile,
  lessCompile,
  jsCompile,
  jsxCompile,
  htmlCompile,
  phtmlCompile
} = require("./index.js");

const globalOptions = getOptions();

function watchBuild() {
  devBuild(() => {
    watch(globalOptions.getGulpSrc("js", false, true), jsCompile);
    watch(globalOptions.getGulpSrc("jsx", false, true), jsxCompile);
    watch(globalOptions.getGulpSrc("css"), cssCompile);
    watch(globalOptions.getGulpSrc("styl"), stylusCompile);
    watch(globalOptions.getGulpSrc("less"), lessCompile);
    watch(globalOptions.getGulpSrc("html"), htmlCompile);
    watch(globalOptions.getGulpSrc("phtml"), phtmlCompile);
    watch(globalOptions.getGulpSrc("*", "{js,jsx,css,less,styl,html}"), move);
  });
}

module.exports = watchBuild;
