import gulp from 'gulp';
import path from 'path';
import babel from 'gulp-babel';
import rimraf from 'rimraf';

const paths = {
  src: {
    base: 'src',
    main: 'src/main'
  },
  dest: {
    base: 'target',
    main: 'target/main'
  }
};

gulp.task('clean', function (done) {
  rimraf(paths.dest.base, done);
});

gulp.task('compile', function () {
  return gulp.src(path.join(paths.src.main, '**/*.js'))
    .pipe(babel())
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('default', ['compile']);
