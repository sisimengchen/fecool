const gulp = require("gulp");
const runSequence = require("run-sequence").use(gulp);

require("./compile.js")();
require("./common-move.js")();
require("./common-concat.js")();

module.exports = function() {
  return gulp.task("js:build", function(cb) {
    runSequence(
      [
        "js:compile", // js编译
        "es6:compile", // es6编译
        "jsx:compile" // jsx编译
      ],
      [
        "js:common:move" // jsx编译
      ],
      [
        "js:common-concat" // jsx编译
      ],
      cb
    );
  });
};
