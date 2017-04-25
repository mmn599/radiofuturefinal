var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");

gulp.task("default", function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['TypeScripts/Contracts.ts', 'TypeScripts/frame.ts', 'TypeScripts/Player.ts', 'TypeScripts/Room.ts', 'TypeScripts/Sockets.ts', 'TypeScripts/ui.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, { noImplicitAny: true })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest("wwwroot/js"));
});
