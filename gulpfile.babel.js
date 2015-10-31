import gulp from 'gulp';
import path from 'path';
import rimraf from 'rimraf';
import webpack from 'webpack-stream';

const paths = {
  src: {
    base: 'src',
    main: 'src/main',
    test: 'src/test',
  },
  dest: {
    base: 'target',
    main: 'target/main',
    test: 'target/test',
    pack: 'target/pack',
  },
  globs: {
    es6: '**/*.es6',
    json: '**/*.json',
  },
  name: {
    main: 'main.bundle.js',
  }
}

function webpackOptions(name, test) {
  return {
    entry: ['index'],
    externals: {
      'config': './config.json'
    },
    module: {
      preLoaders: [{
        test: /\.es6$/,
        include: path.resolve(paths.src.base),
        loader: 'babel-loader',
        query: {
          optional: ['runtime']
        }
      }]
    },
    node: {
      global: true,
      process: true,
    },
    output: {
      filename: name,
      libraryTarget: 'umd'
    },
    resolve: {
      extensions: ['', '.es6', '.js'],
      root: path.join(__dirname, paths.src.main)
    },
    target: 'node'
  };
}

gulp.task('clean', function (done) {
  rimraf(paths.dest.base, done);
});

gulp.task('compile', function () {
  return gulp.src(path.join(paths.src.main, paths.globs.es6))
    .pipe(webpack(webpackOptions(paths.name.main, false)))
    .pipe(gulp.dest(paths.dest.pack));
});

gulp.task('config', function () {
  return gulp.src(path.join(paths.src.main, paths.globs.json))
    .pipe(gulp.dest(paths.dest.pack));
});

gulp.task('default', ['compile']);
