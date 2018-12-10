const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const fs = require('fs');


gulp.task('mock-wallet', function() {
  let src = './index.js';
  let dest = './test';
  let fileReplacement = './test/mockedLocalForage.js';
  let replacedFile = 'mockWallet.js'

  let search = 'const localforage = require(\'localforage\');';
  let replacement = fs.readFileSync(fileReplacement).toString();
 
  return gulp.src(src)
    .pipe(replace(search, replacement))
    .pipe(rename(replacedFile))
    .pipe(gulp.dest(dest));
});
