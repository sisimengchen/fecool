/**
 * @file 排除编译资源复制任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const gulp = require("gulp");
const printer = require("../../gulp-plugin/gulp-printer");
const changed = require("gulp-changed");
const rename = require("gulp-rename");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

function moveExclude() {
  const srcs = globalOptions.getExcludeSrc();
  const dests = globalOptions.getExcludeDest();
  const tasks = srcs.map((src, index) => {
    return () => {
      return gulp
        .src(src) // 对于不编译的资源，采用直接复制的方式
        .pipe(changed(dests[index]))
        .pipe(printer(filepath => `排除编译资源复制任务 ${filepath}`))
        .pipe(
          rename(function(path, file) {
            const module = globalOptions.getModule(file.path);
            const hashCode = module.hashCode;
            path.basename = hashCode
              ? `${path.basename}.${hashCode}`
              : path.basename;
          })
        )
        .pipe(gulp.dest(dests[index]));
    };
  });
  return tasks;
}

module.exports = moveExclude();
