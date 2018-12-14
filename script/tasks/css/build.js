const gulp = require("gulp");
const runSequence = require("run-sequence").use(gulp);

require("./compile-css.js")();
require("./compile-less.js")();
require("./compile-stylus.js")();
require("./compile-postcss.js")();
require("./common-move.js")();
require("./common-concat.js")();
require("./compress.js")();

module.exports = function() {
  return gulp.task("css:build", function(cb) {
    runSequence(
      [
        "css:compile", // css编译
        "styl:compile", // styl编译
        "less:compile", // less编译
        "css:common:move"
      ],
      [
        "postcss:compile" // postcss编译
      ],
      [
        "css:common:concat" // 合并css
      ],
      // [
      //   "css:compress" // 压缩css
      // ],
      cb
    );
  });
};
