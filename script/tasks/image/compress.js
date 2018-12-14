const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const print = require("gulp-print").default;
const changed = require("gulp-changed");
const { getOptions } = require("../../config");

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task("image:compress", () => {
    return gulp
      .src(globalOptions.getGulpSrc4Dest("{png,jpg,jpeg,gif,svg}"))
      .pipe(changed(globalOptions.getGulpDest()))
      .pipe(print(filepath => `图片压缩: ${filepath}`))
      .pipe(
        imagemin([
          imagemin.jpegtran({ progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({
            plugins: [
              { cleanupIDs: false },
              { removeViewBox: false },
              { convertPathData: false },
              { mergePaths: false }
            ]
          })
        ])
      )
      .pipe(gulp.dest(globalOptions.getGulpDest()));
  });
};
