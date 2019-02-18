/**
 * @file less编译任务
 * @author mengchen <mengchen002@ke.com>
 * @module package
 */
const gulp = require("gulp");
const gulpif = require("gulp-if");
const less = require("gulp-less");
const sourcemaps = require("gulp-sourcemaps");
const printer = require("../../gulp-plugin/gulp-printer");
const changed = require("gulp-changed");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const postcssPresetEnv = require("postcss-preset-env");
const cssnano = require("cssnano");
const { getOptions } = require("../../config");
const { swallowError, extname } = require("../../util");
const resolveUrls = require("../../less-plugin/less-plugin-resolve-urls");

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task("less:compile", done => {
    return (
      gulp
        .src(globalOptions.getGulpSrc("less"))
        .pipe(changed(globalOptions.getGulpDest(), { extension: ".css" }))
        .pipe(printer(filepath => `less编译任务 ${filepath}`))
        .pipe(gulpif(globalOptions.isDevelopENV(), sourcemaps.init())) // 开发环境生成sourcemap
        .pipe(less({ plugins: [resolveUrls] }))
        .pipe(
          postcss(
            [
              postcssPresetEnv(/* pluginOptions */),
              globalOptions.isDevelopENV() ? undefined : cssnano()
            ].filter(Boolean)
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
            if (path.extname == ".css") {
              const module = globalOptions.getModule(
                extname(file.path, ".less")
              );
              const hashCode = module.hashCode;
              path.basename = hashCode
                ? `${path.basename}.${hashCode}`
                : path.basename;
            }
          })
        )
        .pipe(gulp.dest(globalOptions.getGulpDest()))
    );
  });
};
