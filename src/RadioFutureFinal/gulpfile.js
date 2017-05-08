/// <binding BeforeBuild='default' ProjectOpened='watch' />
var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");

gulp.task('watch', function () {
    gulp.watch('./TypeScripts/*.ts', ['default']);
});

gulp.task("default", function () {
    browserify({
        basedir: '.',
        debug: true,
        entries: 
        [
            './TypeScripts/Contracts.ts',
            './TypeScripts/Sockets.ts',
            './TypeScripts/FrameBuilder.ts',
            './TypeScripts/UI.ts',
            './TypeScripts/Room.ts',
            './TypeScripts/IPlayer.ts',
            './TypeScripts/PodcastPlayer.ts',
            './TypeScripts/YtPlayer.ts'
        ],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, { noImplicitAny: false, inlineSourceMap: true, inlineSources: true })
        .bundle()
        .pipe(source('roombundle.js'))
        .pipe(gulp.dest("wwwroot/js"));

    browserify({
        basedir: '.',
        debug: true,
        entries: 
        [
            './TypeScripts/Homepage/Homepage.ts',
        ],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, { noImplicitAny: false, inlineSourceMap: true, inlineSources: true })
        .bundle()
        .pipe(source('homebundle.js'))
        .pipe(gulp.dest("wwwroot/js"));
});
