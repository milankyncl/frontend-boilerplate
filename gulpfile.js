/**
 * Modern frontend boilerplate
 *
 * @package frontend-template
 * @author Milan Kyncl <kontakt@milankyncl.cz>
 */

/**
 * Gulp Plugins
 * ---------------------
 */

var config = require('./config.json');
var gulp = require('gulp');
var surge = require('gulp-surge');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var imagemin = require('gulp-imagemin');
var newer = require('gulp-newer');
var browserSync = require('browser-sync').create();
var inline = require('gulp-inline');
var jsImport = require('gulp-js-import');
var htmlmin = require('gulp-html-minifier');
var htmlbeautify = require('gulp-html-beautify');
var fileinclude = require('gulp-file-include');

/**
 *
 */

/**
 * Gulp taks
 * ---------------------
 */

/**
 * Major tasks
 */

gulp.task('dev', function () {

    gulp.watch([ 'src/scss/**/*' ], [ 'process:styles' ]);

    gulp.watch([ 'src/js/**/*' ], [ 'process:scripts' ]);

    gulp.watch([ 'src/fonts/**/*' ], [ 'process:fonts' ]);

    gulp.watch([ 'src/img/**/*' ], [ 'process:images' ]);

    gulp.watch([ 'src/**/*.html' ], [ 'process:html']);

    gulp.watch([ 'src/svg/min/*.svg' ], [ 'process:html']);

    gulp.watch([ 'src/svg/orig/*.svg' ], [ 'process:svg' ]);

    browserSync.init({
        server: {
            baseDir: './dist'
        }
    });

    gulp.watch('dist/**/*').on('change', function () {

        browserSync.reload();

    });

});

gulp.task('deploy', [], function () {

    return surge({
        project: './dist',
        domain: config["deploy-url"]
    })

});

/**
 * Process tasks
 */

gulp.task('process:html', [], function () {

    return gulp.src([
            'src/*.html'
        ])
        .pipe(inline({
            base: 'src/',
            disabledTypes: ['css', 'js', 'img']
        }))
        .on('error', onError)
        .pipe(htmlmin(
            {
                removeComments: true
            }
        ))
        .on('error', onError)
        .pipe(htmlbeautify({
            indentSize: 4
        }))
        .on('error', onError)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .on('error', onError)
        .pipe(gulp.dest('./dist'));

});

gulp.task('process:svg', function () {

    return gulp.src('src/svg/orig/**/*')
        .pipe(newer('src/svg/min'))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('src/svg/min'));
});

gulp.task('process:images', function () {

    return gulp.src('src/img/**/*')
        .pipe(newer('dist/img'))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('process:fonts', function () {

    return gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('process:javascript', function() {

    return gulp.src([
        'src/js/import.js',
        'src/js/script.js'
    ])
        .pipe(jsImport())
        .on('error', onError)
        .pipe(concat('script.js'))
        .on('error', onError)
        .pipe(gulp.dest('dist/js/'))
        .on('error', onError)
        .pipe(minify({
            ext: {
                min: '.min.js'
            }
        }))
        .on('error', onError)
        .pipe(gulp.dest('dist/js'));

});

gulp.task('process:scss', function() {

    var plugins = [
        autoprefixer({browsers: ['last 5 version']}),
        cssnano()
    ];

    return gulp.src('src/scss/main.scss')
        .pipe(sourcemaps.init())
        .on('error', onError)
        .pipe(sass())
        .on('error', onError)
        .pipe(postcss(plugins))
        .on('error', onError)
        .pipe(gulp.dest('dist/css'))
        .on('error', onError)
        .pipe(cssmin())
        .on('error', onError)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write())
        .on('error', onError);

});

/**
 * Exception log
 */

function onError(err) {

    console.log(err);

    this.emit('end');
}