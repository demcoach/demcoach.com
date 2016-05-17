var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var ghPages = require('gulp-gh-pages');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
* Build and deploy the Jekyll site to gh-pages
*/
gulp.task('deploy', ['jekyll-build'], function () {
  return gulp.src('./_site/**/*')
  .pipe(ghPages({
    remoteUrl: 'git@github.com:demcoach/demcoach.com.git',
    origin: 'github',
    push: true
  }));
});

/**
* Build the Jekyll Site
*/
gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
  .on('close', done);
});

/**
* Rebuild Jekyll & do page reload
*/
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browserSync.reload();
});

/**
* Wait for jekyll-build, then launch the Server
*/
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
  browserSync({
    notify: false,
    server: {
      baseDir: '_site'
    }
  });
});

/**
* Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
*/
gulp.task('sass', function () {
  return gulp.src('_scss/main.scss')
  .pipe(sass({
    includePaths: ['scss'],
    onError: browserSync.notify
  }))
  .pipe(prefix(['last 2 versions', '> 5%'], { cascade: true }))
  .pipe(gulp.dest('_site/css'))
  .pipe(browserSync.reload({stream:true}))
  .pipe(gulp.dest('css'));
});

/**
* Watch scss files for changes & recompile
* Watch html/md files, run jekyll & reload BrowserSync
*/
gulp.task('watch', function () {
  gulp.watch('_scss/*.scss', ['sass']);
  gulp.watch(['*.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild']);
});

/**
* Default task, running just `gulp` will compile the sass,
* compile the jekyll site, launch BrowserSync & watch files.
*/
gulp.task('default', ['browser-sync', 'watch']);
