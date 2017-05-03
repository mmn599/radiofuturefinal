"use strict";
var PodcastPlayer = (function () {
    function PodcastPlayer(ui, mobileBrowser) {
        var _this = this;
        this.initPlayer = function (onPlayerStateChange) {
            // TODO: add thi
        };
        this.setPlayerContent = function (media, time) {
            _this.mp3source.src = media.MP3Source;
            _this.audio.play();
            $(_this.audio).bind('canplay', function () {
                this.currentTime = time;
            });
        };
        this.play = function () {
            _this.audio.play();
        };
        this.pause = function () {
            _this.audio.pause();
        };
        this.getCurrentTime = function () {
            return _this.audio.currentTime;
        };
        this.getCurrentState = function () {
            if (_this.audio.paused) {
                return 0;
            }
            else {
                return 1;
            }
        };
        this.mobileBrowser = mobileBrowser;
        this.audio = document.getElementById('html5audio');
        this.mp3source = document.getElementById('mp3Source');
        this.canvas = document.getElementById('canvas_podcast');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
    }
    return PodcastPlayer;
}());
exports.PodcastPlayer = PodcastPlayer;
//# sourceMappingURL=PodcastPlayer.js.map