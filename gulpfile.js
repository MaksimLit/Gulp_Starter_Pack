const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const watch = require('gulp-watch')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')
const gcmq = require('gulp-group-css-media-queries')
const sassGlob = require('gulp-sass-glob')
const pug = require('gulp-pug')
const del = require('del')

// Сборка pug файлов
gulp.task('pug', (callback) => {
    return gulp.src('./src/pug/pages/**/*.pug')
    .pipe( plumber({
        errorHandler: notify.onError((err) => {
            return {
                title: 'pug',
                sound: false,
                message: err.message
            }
        })
    }) )
    .pipe( pug({
        pretty: true
    }) )
    .pipe(gulp.dest('./build'))
    .pipe( browserSync.stream() )
    callback()
})

// Компиляция из scss в css
gulp.task('scss', (callback) => {
    return gulp.src('./src/scss/**/*.scss')
        .pipe( plumber({
            errorHandler: notify.onError((err) => {
                return {
                    title: 'Styles',
                    sound: false,
                    message: err.message
                }
            })
        }) )
        .pipe( sourcemaps.init() )
        .pipe( sassGlob() )
        .pipe( sass({
            indentType: "tab",
            indentWidth: 1,
            outputStyle: "expanded"
        }) )
        .pipe( gcmq() )
        .pipe( autoprefixer({
            overrideBrowserslist: ['last 4 versions']
        }) )
        .pipe( sourcemaps.write() )
        .pipe( gulp.dest('./build/css/') )
        .pipe( browserSync.stream() )
    callback()
})

// Копирование изображений
gulp.task('copy:img', (callback) => {
    return gulp.src('./src/img/**/*.*')
    .pipe(gulp.dest('./build/img/'))
    callback()
})

// Копирование js
gulp.task('copy:js', (callback) => {
    return gulp.src('./src/js/**/*.*')
    .pipe(gulp.dest('./build/js/'))
    callback()
})


gulp.task('watch', () => {

    watch( ['./build/js/**/*.*', './build/img/**/*.*'], gulp.parallel(browserSync.reload) )

    // Слежение за SCSS 
    watch('./src/scss/**/*.scss', () => {
        setTimeout( gulp.parallel('scss'), 500)
    })

    // Слежение за Pug
    watch('./src/pug/**/*.pug', gulp.parallel('pug'))

    // Слежение за картинками и скриптами
    watch('./src/img/**/*.*', gulp.parallel('copy:img'))
    watch('./src/js/**/*.*', gulp.parallel('copy:js'))

})

// Задача для старта сервера из папки src
gulp.task('browser-sync', () => {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    })
})

// Удаление папки build
gulp.task('clean:build', () => {
    return del('./build')
})

gulp.task(
    'default', 
    gulp.series( 
        gulp.parallel('clean:build'),
        gulp.parallel('scss', 'pug', 'copy:img', 'copy:js'), 
        gulp.parallel('browser-sync', 'watch')
        )
    )
