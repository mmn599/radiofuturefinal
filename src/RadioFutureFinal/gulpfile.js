/// <binding BeforeBuild='default' />
var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");

gulp.task("default", function () {
    return browserify({
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
            './TypeScripts/YtPlayer.ts',
            './TypeScripts/ISearcher.ts',
            './TypeScripts/PodcastSearcher.ts',
            './TypeScripts/YtSearcher.ts'
        ],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, { noImplicitAny: false, inlineSourceMap: true, inlineSources: true })
        .bundle()
        .pipe(source('roombundle.js'))
        .pipe(gulp.dest("wwwroot/js"));
});
