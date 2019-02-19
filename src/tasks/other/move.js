const gulp = require("gulp");
const printer = require("../../gulp-plugin/gulp-printer");
const changed = require("gulp-changed");
const rename = require("gulp-rename");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task("other:move", () => {
    return gulp
      .src(globalOptions.getGulpSrc("*", "{js,jsx,css,less,styl,html}")) // 对于不编译的资源，采用直接复制的方式
      .pipe(changed(globalOptions.getGulpDest()))
      .pipe(printer(filepath => `资源复制任务 ${filepath}`))
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
