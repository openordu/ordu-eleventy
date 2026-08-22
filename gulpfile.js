var gulp = require('gulp');
var plumber = require('gulp-plumber');
var cleanCSS = require('gulp-clean-css');
var sass = require('gulp-dart-sass');
var clean = require('gulp-clean');
var browserSync = require('browser-sync').create();
var rename = require('gulp-rename');
const purgecss = require('gulp-purgecss');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
var htmlreplace = require('gulp-html-replace');
var reload      = browserSync.reload;
// Configuration file to keep your code DRY
var cfg = require( './gulpconfig.json' );
var paths = cfg.paths;

gulp.task('dist-assets', function (done) {
    gulp.src('./src/js/**.*')
        .pipe(gulp.dest('./dev/js'));
    gulp.src('./src/img/**.*')
        .pipe(gulp.dest('./dev/img'));
      done();
});

gulp.task('prod-copy', function (done) {
    gulp.src('./dev/**/**.*')
    .pipe(gulp.dest('./public/'));
    done();
});

gulp.task('minify-css', () => {
  return gulp
    .src('dev/css/*.css')
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe( rename( { suffix: '.min' } ) )
    .pipe(gulp.dest('dev/css'))
    .pipe(browserSync.stream());
});

// minifies HTML. PCE volume pages are ~400KB each (they embed the full
// A-Z navigator sidebar); html-minifier is quadratic on large HTML and the
// 3800-page PCE tree would take hours. Size-gate: minify in-place only files
// under 250KB, skip the giant PCE pages so the build completes. GAF-223.
const through2 = require('through2');
const minifyHtml = require('html-minifier').minify;
const MINIFY_MAX_BYTES = 250 * 1024;
gulp.task('minify-html', () => {
  return gulp.src('public/**/*.html')
    .pipe(through2.obj(function (file, enc, cb) {
      if (file.isBuffer() && file.contents.length <= MINIFY_MAX_BYTES) {
        try {
          const out = minifyHtml(file.contents.toString('utf8'),
            { collapseWhitespace: true, removeComments: true });
          file.contents = Buffer.from(out);
        } catch (e) {
          return cb(e);
        }
      }
      cb(null, file);
    }))
    .pipe(gulp.dest('public'));
});


// Purging unused CSS
gulp.task('purgecss', () => {
    return gulp.src('public/css/theme.min.css')
        .pipe(purgecss({
            content: ['public/**/*.html'],
            safelist: ['shine','pulsate','sticky','search-suggestions', 'quiz','list-group-item-danger','list-group-item-primary','collapsed', 'collapse', 'active', 'show', 'collapsing' ]
        }))
        .pipe(gulp.dest('public/css'))
})

gulp.task('clean-public', function() {
  return gulp.src('public', {
      read: false,
      allowEmpty: true
    })
    .on('error', function(err) {
      console.log(err.toString());

      this.emit('end');
    })
    .pipe(clean());
});

gulp.task('clean-dev', function() {
  return gulp.src('dev', {
      read: false,
      allowEmpty: true
    })
    .on('error', function(err) {
      console.log(err.toString());

      this.emit('end');
    })
    .pipe(clean());
});

gulp.task('clean', function() {
  return gulp.src('dev/scss', {
      read: false
    })
    .on('error', function(err) {
      console.log(err.toString());

      this.emit('end');
    })
    .pipe(clean());
});

gulp.task('browser-sync', function(done) {
    browserSync.init({
        server: {
            baseDir: "./dev"
        }
    });
gulp.watch("dev/**/*.*").on('change', browserSync.reload);
});

// Compile sass to css
gulp.task('sass', function () {
  return gulp.src('src/scss/theme.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dev/css'))
});

gulp.task('inject-min-css', function(done) {
  gulp.src('./public/**/*.html')
    .pipe(htmlreplace({
        'css': '/ordu-eleventy/css/theme.min.css'
    }))
    .pipe(gulp.dest('./public'));
         done();
});

////////////////// All Bootstrap SASS  Assets /////////////////////////
gulp.task( 'copy-assets', function( done ) {
	////////////////// All Bootstrap 4 Assets /////////////////////////
	// Copy all JS files
	var stream = gulp
		.src( paths.node + '/bootstrap/dist/js/**/*.*' )
		.pipe( gulp.dest( paths.dev + '/js' ) );

	// Copy all Bootstrap SCSS files
	gulp
		.src( paths.node + '/bootstrap/scss/**/*.scss' )
		.pipe( gulp.dest( paths.dev + '/scss/assets/bootstrap' ) );

	////////////////// End Bootstrap 4 Assets /////////////////////////

	done();
} );
