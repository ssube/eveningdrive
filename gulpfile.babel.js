import gulp from 'gulp';
import path from 'path';
import rimraf from 'rimraf';
import webpack from 'webpack-stream';

const paths = {
  src: {
    base: 'src',
    main: 'src/main'
  },
  dest: {
    base: 'target',
    main: 'target/main'
  },
  globs: {
    es6: '**/*.js'
  },
  name: {
    main: 'main.bundle.js'
  }
};

function webpackOptions(name) {
  return {
    module: {
      preLoaders: [{
        test: /\.js$/,
        include: path.resolve(paths.src.base),
        loader: 'babel-loader',
        query: {
          options: ['runtime']
        }
      }]
    },
    node: {
      global: true,
      process: true
    },
    output: {
      filename: name,
      libraryTarget: 'umd'
    },
    resolve: {
      extensions: ['', '.es6', '.js'],
      root: path.join(__dirname, paths.src.main)
    }
  };
}

gulp.task('clean', function (done) {
  rimraf(paths.dest.base, done);
});

gulp.task('compile', function () {
  return gulp.src(path.join(paths.src.main, paths.globs.es6))
    .pipe(webpack(webpackOptions(paths.name.main, false)))
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('default', ['compile']);
