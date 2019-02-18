const gulp = require("gulp");
const printer = require("../../gulp-plugin/gulp-printer");
const changed = require("gulp-changed");
const rename = require("gulp-rename");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task("image:move", () => {
    return gulp
      .src(globalOptions.getGulpSrc("{png,jpg,jpeg,gif,svg}"))
      .pipe(changed(globalOptions.getGulpDest()))
      .pipe(printer(filepath => `图片复制任务 ${filepath}`))
      .pipe(
        rename(function(path, file) {
          const module = globalOptions.getModule(file.path);
          const hashCode = module.hashCode;
          path.basename = hashCode
            ? `${path.basename}.${hashCode}`
            : path.basename;
        })
      )
      .pipe(gulp.dest(globalOptions.getGulpDest()));
  });
};
