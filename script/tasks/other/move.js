const gulp = require('gulp');
const print = require('gulp-print').default;
const cached = require('gulp-cached');
const remember = require('gulp-remember');
const { getOptions } = require('../../config');

const globalOptions = getOptions();

module.exports = () => {
  return gulp.task('other:move', () => {
    return gulp.src(globalOptions.getGulpSrc('*'))
      .pipe(cached('other:move'))
      .pipe(print(filepath => `其他移动: ${filepath}`))
      .pipe(remember('other:move'))
      .pipe(gulp.dest(globalOptions.getGulpDest()))
  });
};

// , '{js,es6,jsx,css,styl,less,ico,png,jpg,jpeg,gif,svg,ejs,tmpl}'
