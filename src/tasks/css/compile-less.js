/**
 * @file less编译任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const nodePath = require("path");
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

function lessCompile() {
  return gulp
    .src(globalOptions.getGulpSrc("less"))
    .pipe(changed(globalOptions.getGulpDest(), { extension: ".less.css" }))
    .pipe(printer(filepath => `less编译任务 ${filepath}`))
    .pipe(gulpif(globalOptions.isDevelopENV(), sourcemaps.init())) // 开发环境生成sourcemap
    .pipe(less({ plugins: [resolveUrls] }))
    .on("error", swallowError)
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
        sourcemaps.write(globalOptions.sourceMapDirName, {
          sourceMappingURLPrefix: globalOptions.publicPath
        })
      )
    )
    .on("error", swallowError)
    .pipe(
      rename(function(path, file) {
        if (path.extname == ".css") {
          const module = globalOptions.getModule(extname(file.path, ".less"));
          const { distFilename } = module;
          path.basename = nodePath.basename(distFilename, ".css");
        }
      })
    )
    .pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = lessCompile;
