/**
 * @file html编译任务
 * @author mengchen <sisimengchen@gmail.com>
 * @module package
 */
const gulp = require("gulp");
const printer = require("../../gulp-plugin/gulp-printer");
const changed = require("gulp-changed");
const replace = require("gulp-replace");
const inlinesource = require("gulp-inline-source");

const { getOptions } = require("../../config");
const template = require("gulp-template");
const { isURL, isDataURI, swallowError, extname } = require("../../util");
const path = require("path");
const globalOptions = getOptions();

function htmlCompile() {
  return gulp
    .src(globalOptions.getGulpSrc("html"))
    .pipe(changed(globalOptions.getGulpDest()))
    .pipe(printer(filepath => `html编译任务 ${filepath}`))
    .pipe(
      replace(getOptions.urlReg, function(match, str) {
        let source = str.replace(/\#[^\#]+$/, "");
        try {
          const resourcePath = globalOptions.resolve(source, this.file.path);
          const module = globalOptions.getModule(resourcePath);
          source = module.url;
        } catch (error) {
        } finally {
          return `\'${source}\'`;
        }
      })
    )
    .pipe(inlinesource())
    .pipe(
      template({
        publicPath: globalOptions.publicPath,
        envCode: globalOptions.getEnvCode()
      })
    )
    .on("error", swallowError)
    .pipe(gulp.dest(globalOptions.getGulpDest()));
}

module.exports = htmlCompile;
