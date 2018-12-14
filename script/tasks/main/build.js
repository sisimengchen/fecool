const gulp = require('gulp');
const runSequence = require('run-sequence').use(gulp);

require('./build-dev')();

module.exports = function() {
  return gulp.task('main:build', ['main:build-dev'], function(cb) {
    runSequence(
      [
        // 'html:compress', // html压缩
        // 'js:compress', // js压缩
        'css:compress', // css压缩
        'image:compress', // 图片压缩
      ],
      cb
    );
  });
};
