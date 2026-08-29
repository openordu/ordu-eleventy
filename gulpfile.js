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

// GAF-276 T15: Tailwind v3 build. Tailwind OWNS theme.min.css (the exact path
// inject-min-css serves). merge-theme later inlines the custom theme SCSS
// into the SAME artifact — one stylesheet, both vocabularies.
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

// GAF-276 T15: single-artifact merge. Reads dev/css/theme.css (dart-sass
// output of theme.scss), inlines it into the tailwind artifact at the
// /*__THEME_SCSS_INLINE__*/ slot inside @layer components in
// src/scss/tailwind.css, and RE-RUNS the tailwind CLI so the final
// theme.min.css contains BOTH tailwind utilities and the custom theme CSS.
// Re-running tailwind after the sass splice is required: tailwindcss CLI
// processes @layer at compile time.
gulp.task('merge-theme', function (done) {
  var fs = require('fs');
  // GAF-276 T20: sync the BUILT pages (minus the deslop /preview/ evidence
  // pages) into .twscan/ BEFORE the tailwind pass. The content globs scan
  // this snapshot: the plugins emit their markup at build time, so classes
  // that exist only in plugin output (tab-content, nav-tabs, quiz buttons,
  // carousel controls) are otherwise purged from the artifact. Eleventy runs
  // earlier in the chain, so dev/ is always fresh at this point.
  var execSync = require('child_process').execSync;
  try {
    execSync(
      'rsync -a --delete --prune-empty-dirs --exclude "preview/" ' +
      "--include '*/' --include '*.html' --exclude '*' dev/ .twscan/",
      { cwd: __dirname, stdio: 'ignore' }
    );
  } catch (e) {
    return done(new Error('merge-theme: .twscan sync failed — is rsync installed?'));
  }
  var input = 'src/scss/tailwind.css';
  var sassOut = 'dev/css/theme.css';
  var marker = '/*__THEME_SCSS_INLINE__*/';
  var base = fs.readFileSync(input, 'utf8');
  var scss;
  try {
    scss = fs.readFileSync(sassOut, 'utf8');
  } catch (e) {
    return done(new Error('merge-theme: ' + sassOut + ' missing — run gulp sass first'));
  }
  if (base.indexOf(marker) === -1) {
    return done(new Error('merge-theme: marker missing in ' + input));
  }
  fs.writeFileSync(input, base.replace(marker, '\n' + scss + '\n'));
  exec(
    'npx tailwindcss -i src/scss/tailwind.css -c tailwind.config.js -o dev/css/theme.min.css --minify',
    { cwd: __dirname, maxBuffer: 10 * 1024 * 1024 },
    function (err, stdout, stderr) {
      if (err) { console.error('merge-theme tailwind pass failed: ' + stderr); return done(err); }
      // Restore the marker so the input stays re-runnable and uncommitted
      // churn stays minimal.
      fs.writeFileSync(input, base);
      if (stdout) console.log(stdout.trim());
      console.log('merge-theme: theme.scss inlined into theme.min.css');
      done();
    }
  );
});

// GAF-276 T15: Tailwind owns the theme.min.css artifact. Order: eleventy →
// tailwind (artifact from src/scss/tailwind.css) → sass (theme.css) →
// dist-assets → merge-theme (inline sass output into the tailwind artifact)
// → minify-css (guarded no-clobber) → prod-copy → inject-min-css.
gulp.task('minify-css', () => {
  return gulp
    .src(['dev/css/*.css', '!dev/css/theme.css', '!dev/css/theme.min.css'])
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

// GAF-276 T20: copy-assets retired. The ONLY thing it still copied was
// the vendored dist JS bundles -> dev/js (postinstall), dead since T15's
// vanilla shim replaced the old interaction layer and T20 deleted both
// the vendored src/js bundle files and the npm dep. dist-assets copies
// src/js/** to dev/js; nothing imports the old bundles. The task is
// removed; postinstall no longer runs it (package.json updated with it).
