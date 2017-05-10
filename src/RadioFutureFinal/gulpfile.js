/// <binding BeforeBuild='default' ProjectOpened='watch' />
var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");

gulp.task('watch', function () {
    gulp.watch('./TypeScripts/*.ts', ['default']);
});

gulp.task("default", function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: 
        [
            "./TypeScripts/Contracts.ts",
            "./TypeScripts/UI.ts",
            "./TypeScripts/Room.ts",
            "./TypeScripts/PodcastPlayer.ts",
            "./TypeScripts/Requestor.ts"
        ],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, { noImplicitAny: false, inlineSourceMap: true, inlineSources: true })
        .bundle()
        .pipe(source('roombundle.js'))
        .pipe(gulp.dest("wwwroot/js"));
});
