const { series, parallel } = require("gulp");
const {
  move,
  cssCompile,
  stylusCompile,
  lessCompile,
  jsCompile,
  jsxCompile,
  commonjsConcat,
  htmlCompile,
  phtmlCompile
} = require("./index.js");

const devBuild = series(
  parallel(move),
  parallel(cssCompile, stylusCompile, lessCompile),
  parallel(jsCompile, jsxCompile, commonjsConcat),
  parallel(htmlCompile, phtmlCompile)
);

module.exports = devBuild;
