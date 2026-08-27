var gulp = require('gulp');
var plumber = require('gulp-plumber');
var cleanCSS = require('gulp-clean-css');
var sass = require('gulp-dart-sass');
var clean = require('gulp-clean');
var browserSync = require('browser-sync').create();
var rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
var htmlreplace = require('gulp-html-replace');
var reload      = browserSync.reload;
var exec        = require('child_process').exec;
// Configuration file to keep your code DRY
var cfg = require( './gulpconfig.json' );
var paths = cfg.paths;

// GAF-276 T6: Tailwind v3 build. Tailwind OWNS theme.min.css (the exact path
// inject-min-css serves). Produces the minified Tailwind artifact directly via
// the CLI (--minify), so the sass minify-css glob must EXCLUDE theme.min.css
// or it would clobber the Tailwind output with the old Bootstrap min.
gulp.task('tailwind', function (done) {
  exec(
    'npx tailwindcss -i src/scss/tailwind.css -c tailwind.config.js -o dev/css/theme.min.css --minify',
    { cwd: __dirname, maxBuffer: 10 * 1024 * 1024 },
    function (err, stdout, stderr) {
      if (err) { console.error('tailwind build failed: ' + stderr); return done(err); }
      if (stdout) console.log(stdout.trim());
      done();
    }
  );
});

gulp.task('dist-assets', function (done) {
    gulp.src('./src/js/**.*')
        .pipe(gulp.dest('./dev/js'));
    gulp.src('./src/img/**.*')
        .pipe(gulp.dest('./dev/img'));
      done();
});

gulp.task('prod-copy', function () {
    // Return the stream — calling done() early (old code) let minify-html race
    // ahead and hit not-yet-copied files (ENOENT public/merch/index.html).
    return gulp.src('./dev/**/**.*')
    .pipe(gulp.dest('./public/'));
});

gulp.task('minify-css', () => {
  // GAF-276 T6: EXCLUDE theme.min.css — Tailwind's 'tailwind' task owns it.
  // The sass glob must not re-minify Tailwind's output into theme.min.css.
  return gulp
    .src(['dev/css/*.css', '!dev/css/theme.min.css'])
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe( rename( { suffix: '.min' } ) )
    .pipe(gulp.dest('dev/css'))
    .pipe(browserSync.stream());
});

// HTML minification — REMOVED at GAF-276 T14 (build-gate blocker root-caused).
// html-minifier is pathologically slow on this corpus (~6s+ per category page,
// hundreds of pages -> hours) for BOTH collapseWhitespace AND removeComments,
// so no option tuning fixes it. Eleventy output is already compact and the
// deploy serves gzip (63.8% ratio measured on the live root), so a separate
// minify pass is redundant on the wire. Same reasoning as the old pruning-pass
// removal above: Tailwind + clean-css handle what matters; this pass only
// added cost.
//
// If HTML minification is ever wanted again, it must be a FAST minifier — not
// gulp-htmlmin on this corpus.


// Unused-CSS removal — REMOVED at GAF-276 T14. Tailwind's own build (the
// 'tailwind' task) already tree-shakes against the content globs in
// tailwind.config.js, so a separate gulp pruning pass was redundant AND would
// strip classes Tailwind intentionally emits before Eleventy writes final HTML.

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
        'css': '/css/theme.min.css'
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
