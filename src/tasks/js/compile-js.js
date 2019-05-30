/**
 * @file js编译任务
 * @author mengchen <sisimengchen@gmail.com>
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

function jsCompile() {
  return gulp
    .src(globalOptions.getGulpSrc("js", false, true)) // 对于非common目录下的所有.js资源执行
    .pipe(changed(globalOptions.getGulpDest(), { extension: ".js" }))
    .pipe(printer(filepath => `js编译任务 ${filepath}`))
    .pipe(gulpif(globalOptions.isDevelopENV(), sourcemaps.init())) // 开发环境生成sourcemap
    .pipe(
      gulpif(
        file => {
          const { path } = file;
          return !globalOptions.isModuleDirectory(path);
        },
        babel(
          getBabelOptions({
            isES6Enabled: true,
            isReactEnabled: false,
            isCommonModules: false
          })
        )
      )
    )
    .on("error", swallowError)
    .pipe(
      gulpif(
        file => {
          const { path } = file;
          return globalOptions.isModuleDirectory(path);
        },
        babel(
          getBabelOptions({
            isES6Enabled: true,
            isReactEnabled: false,
            isCommonModules: true
          })
        )
      )
    )
    .on("error", swallowError)
    .pipe(
      gulpif(
        globalOptions.isDevelopENV(),
        sourcemaps.write(globalOptions.sourceMapDirName, {
          sourceMappingURLPrefix: globalOptions.publicPath
        })
      )
    )
    .pipe(
      rename(function(path, file) {
        if (path.extname === ".js") {
          const module = globalOptions.getModule(file.path);
          const hashCode = module.hashCode;
          path.basename = hashCode
            ? `${path.basename}.${hashCode}`
            : path.basename;
        }
      })
    )
    .pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = jsCompile;
