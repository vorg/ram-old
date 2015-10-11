var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');

gulp.task('watch', function() {
  var bundler = watchify(browserify('./js/main.js', watchify.args));

  bundler.on('update', rebundle);

  function rebundle() {
    return bundler.bundle()
      // log errors if they happen
      //.on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .on('error', function(e) {
        console.log(e.toString());
      })
      .on('update', function(e) {
        console.log('update', new Date());
      })
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('./dist'));
  }

  return rebundle();
});