module.exports = {
  clean: require("../clean/index"),
  move: require("../other/move"),
  moveExclude: require("../other/move-exclude"),
  cssCompile: require("../css/compile-css"),
  stylusCompile: require("../css/compile-stylus"),
  lessCompile: require("../css/compile-less"),
  jsCompile: require("../js/compile-js"),
  jsxCompile: require("../js/compile-jsx"),
  commonjsConcat: require("../js/common-concat"),
  htmlCompile: require("../templates/compile-html"),
  phtmlCompile: require("../templates/compile-phtml"),
  imageCompress: require("../image/compress")
};
