const gulp = require("gulp");
const getPackage = require("../../package");
const runSequence = require("run-sequence").use(gulp);

module.exports = function() {
  return gulp.task("main:build-dev", function(cb) {
    runSequence(
      [
        "other:move", // 目录迁移
        // "image:move"
      ],
      [
        "css:compile", // css编译
        "styl:compile", // styl编译
        "less:compile" // less编译
      ],
      [
        "js:compile", // js编译
        "jsx:compile", // jsx编译
        "js:common-concat"
      ],
      [
        "html:compile" // 目录迁移
      ],
      function() {
        cb && cb();
      }
    );
  });
};
