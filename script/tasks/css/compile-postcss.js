/**
 *  postcss处理任务（增强css）
 *  针对目标目录下的所有css
 */

const gulp = require('gulp');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');
const print = require('gulp-print').default;
const cached = require('gulp-cached');
const { getOptions } = require('../../config');

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task('postcss:compile', () => {
    return gulp.src(globalOptions.getGulpSrc4Dest('css', false, true))
      .pipe(cached('postcss:compile'))
      .pipe(print(filepath => `postcss编译: ${filepath}`))
      .pipe(postcss([
        postcssPresetEnv( /* pluginOptions */ )
      ]))
      .pipe(gulp.dest(globalOptions.getGulpDest()))
  });
};
