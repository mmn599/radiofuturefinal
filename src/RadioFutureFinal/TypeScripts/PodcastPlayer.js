"use strict";
var PodcastPlayer = (function () {
    function PodcastPlayer(ui, mobileBrowser) {
        var _this = this;
        this.setupControls = function () {
            var btnPlayPause = $("#btn_play_pause");
            btnPlayPause.attr('class', 'play_btn');
            btnPlayPause.click(function () {
                if (btnPlayPause.hasClass('play_btn')) {
                    _this.play();
                    btnPlayPause.removeClass('play_btn');
                    btnPlayPause.addClass('pause_btn');
                }
                else {
                    _this.pause();
                    btnPlayPause.removeClass('pause_btn');
                    btnPlayPause.addClass('play_btn');
                }
            });
        };
        this.initPlayer = function (onPlayerStateChange) {
            _this.setupControls();
            _this.updatePlayerUI(true, 0);
            _this.audio.onended = function () {
                onPlayerStateChange({ data: 0 });
            };
            _this.audio.ontimeupdate = function () {
                _this.audioTimeUpdate();
            };
        };
        this.updatePlayerUI = function (isPaused, percentage) {
        };
        this.setPlayerContent = function (media, time) {
            _this.mp3source.setAttribute('src', media.MP3Source);
            _this.audio.load();
            _this.audio.play();
            _this.ui.updateCurrentContent(media);
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
        this.isStopped = function () {
            return _this.audio.currentTime >= _this.audio.duration;
        };
        this.ui = ui;
        this.mobileBrowser = mobileBrowser;
        this.audio = document.getElementById('html5audio');
        this.mp3source = document.getElementById('mp3Source');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
    }
    ;
    PodcastPlayer.prototype.audioTimeUpdate = function () {
        var percentage = this.audio.currentTime / this.audio.duration;
        this.updatePlayerUI(this.audio.paused, percentage);
    };
    return PodcastPlayer;
}());
exports.PodcastPlayer = PodcastPlayer;
//# sourceMappingURL=PodcastPlayer.js.map