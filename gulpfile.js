const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const uglify = require('gulp-uglify');
const fs = require('fs');


/**
 * Replaces localForage module with a mocked one
 * so that unit tests can be done. Also arranges
 * module paths accordingly.
 */
gulp.task('mock-wallet', function() {
  let src = './index.js';
  let dest = './test';
  let fileReplacement = './test/mockedLocalForage.js';
  let replacedFile = '../temp/mockWallet.js'

  let search1 = 'const localforage = require(\'localforage\');';
  let replacement1 = fs.readFileSync(fileReplacement).toString();
  let search2 = 'const NetworkStatsApi = require(\'./api/networkStatsApi\');';
  let replacement2 = 'const NetworkStatsApi = require(\'../api/networkStatsApi\');';
 
  return gulp.src(src)
    .pipe(replace(search1, replacement1))
    .pipe(replace(search2, replacement2))
    .pipe(rename(replacedFile))
    .pipe(gulp.dest(dest));
});


/**
 * Uglify and minify the distribution file
 */
gulp.task('minifier', function() {
  let src = './dist/spin.js';
  let dest = './dist';

  return gulp.src(src)
    .pipe(uglify())
    .pipe(rename('./spin.min.js'))
    .pipe(gulp.dest(dest));
});