'use strict';

var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');
var del = require('del');
var exec = require('child_process').execSync;
var path = require('path');
var gutil = require('gulp-util');
var sass = require('gulp-sass');


// Based on: https://github.com/jbrodriguez/hugulp/blob/master/gulp/hugo.js
function hugo(drafts) {

    var cmd = 'hugo';
    if (drafts) {
        cmd += ' --buildDrafts=true --verbose=true" ';
    }

    var result = exec(cmd, { encoding: 'utf-8' });
    gutil.log('hugo: \n' + result);
}

gulp.task('hugo', ['clean:dist'], function () {
    hugo(false);
});

gulp.task('ghpages', ['hugo'], function () {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});

gulp.task('clean:dist', function () {
    return del([
        './dist/**/*'
    ]);
});


gulp.task('sass', function () {
  return gulp.src('./sass/**/*.s*ss')
    .pipe(
      sass(
        {
          includePaths: [
            './node_modules/bulma',
          ],
          errLogToConsole: true
        }
      )
      .on('error', sass.logError)
    )
    .pipe(gulp.dest('./src/static/css/'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.s*ss', ['sass']);
});


gulp.task('deploy', [
    'clean:dist',
    'sass',
    'hugo',
    'ghpages'
]);
