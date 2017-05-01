"use strict";
var PodcastPlayer = (function () {
    function PodcastPlayer(mobileBrowser) {
        var _this = this;
        this.getCurrentTime = function () {
            return _this.html5audio.currentTime;
        };
        this.getCurrentState = function () {
            // TODO: implement
            // return this.html5audio.sta
            return 0;
        };
        this.mobileBrowser = mobileBrowser;
        this.html5audio = document.getElementById('html5audio');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
    }
    PodcastPlayer.prototype.initPlayer = function (onPlayerStateChange) {
        // TODO: add this
    };
    PodcastPlayer.prototype.setPlayerContent = function (media, time) {
        this.html5audio.src = media.MP3Source;
        this.html5audio.currentTime = time;
    };
    PodcastPlayer.prototype.play = function () {
        this.html5audio.play();
    };
    PodcastPlayer.prototype.pause = function () {
        this.html5audio.pause();
    };
    return PodcastPlayer;
}());
exports.PodcastPlayer = PodcastPlayer;
//# sourceMappingURL=PodcastPlayer.js.map