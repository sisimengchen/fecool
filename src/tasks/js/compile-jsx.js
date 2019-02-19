/**
 * @file jsx编译任务
 * @author mengchen <mengchen002@ke.com>
 * @module package
 */
const gulp = require("gulp");
const gulpif = require("gulp-if");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const printer = require("../../gulp-plugin/gulp-printer");
const changed = require("gulp-changed");
const rename = require("gulp-rename");
const { getBabelOptions, getOptions } = require("../../config");
const { swallowError, extname } = require("../../util");

const globalOptions = getOptions();

module.exports = function() {
  return gulp.task(`jsx:compile`, done => {
    return gulp
      .src(globalOptions.getGulpSrc("jsx", false, true)) // 对于非common目录下的所有.jsx资源执行
      .pipe(changed(globalOptions.getGulpDest(), { extension: ".js" }))
      .pipe(printer(filepath => `jsx编译任务 ${filepath}`))
      .pipe(gulpif(globalOptions.isDevelopENV(), sourcemaps.init())) // 开发环境生成sourcemap
      .pipe(
        babel(
          getBabelOptions({
            isModule: false,
            isES6Enabled: true,
            isReactEnabled: true
          })
        )
      )
      .on("error", swallowError)
      .pipe(
        gulpif(
          globalOptions.isDevelopENV(),
          sourcemaps.write(globalOptions.sourceMapDirname, {
            sourceMappingURLPrefix: globalOptions.publicPath
          })
        )
      )
      .pipe(
        rename(function(path, file) {
          if (path.extname === ".js") {
            const module = globalOptions.getModule(extname(file.path, ".jsx"));
            const hashCode = module.hashCode;
            path.basename = hashCode
              ? `${path.basename}.${hashCode}`
              : path.basename;
          }
        })
      )
      .pipe(gulp.dest(globalOptions.getGulpDest()));
  });
};
