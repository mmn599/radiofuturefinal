"use strict";
var PodcastPlayer = (function () {
    function PodcastPlayer(ui, mobileBrowser, nextMedia, previousMedia) {
        var _this = this;
        this.initPlayer = function (onPlayerStateChange) {
            _this.canvas.width = _this.canvas.offsetWidth;
            _this.canvas.height = _this.canvas.offsetHeight;
            _this.setupControls();
            _this.nothingPlaying();
            _this.audio.onended = function () {
                onPlayerStateChange({ data: 0 });
            };
            _this.audio.ontimeupdate = function () {
                _this.audioTimeUpdate();
            };
        };
        this.nothingPlaying = function () {
            $("#cc_title").text('Nothing currently playing.');
            $("#cc_show").text('Queue something up!');
            _this.updateProgressUI(0, 1);
        };
        this.setupControls = function () {
            var btnPlayPause = $("#btn_play_pause");
            btnPlayPause.attr('class', 'play_btn');
            btnPlayPause.click(function () {
                if (_this.audio.paused) {
                    _this.play();
                }
                else {
                    _this.pause();
                }
            });
        };
        this.updateProgressUI = function (time, duration) {
            var ctx = _this.canvas.getContext('2d');
            ctx.moveTo(0, 0);
            ctx.fillStyle = 'white';
            if (duration == 0) {
                duration = 1;
            }
            ctx.rect(0, 0, time / duration * _this.canvas.width, _this.canvas.height);
            ctx.fill();
            $("#cc_time").text(_this.format(time));
            $("#cc_duration").text(_this.format(duration));
        };
        this.setPlayerContent = function (media, time) {
            _this.mp3source.setAttribute('src', media.MP3Source);
            _this.audio.load();
            _this.updateInfoUI(media);
            _this.play();
        };
        this.play = function () {
            $("#btn_play_pause").removeClass('play_btn').addClass('pause_btn');
            _this.audio.play();
        };
        this.pause = function () {
            $("#btn_play_pause").removeClass('pause_btn').addClass('play_btn');
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
        this.canvas = document.getElementById('canvas_progress');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
        $("#btn_next").click(nextMedia);
        $("#btn_previous").click(previousMedia);
    }
    ;
    PodcastPlayer.prototype.audioTimeUpdate = function () {
        var percentage = this.audio.currentTime / this.audio.duration;
        this.updateProgressUI(this.audio.currentTime, this.audio.duration);
    };
    PodcastPlayer.prototype.format = function (seconds) {
        if (!seconds || seconds == NaN) {
            seconds = 0;
        }
        seconds = Math.round(seconds);
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return this.format2Digit(hours) + ":" + this.format2Digit(minutes) + ":" + this.format2Digit(secs);
    };
    PodcastPlayer.prototype.format2Digit = function (num) {
        if (num < 10) {
            return "0" + num.toString();
        }
        return num.toString();
    };
    PodcastPlayer.prototype.updateInfoUI = function (media) {
        $("#cc_show").text('Radiolab');
        $("#cc_title").text(media.Title);
    };
    return PodcastPlayer;
}());
exports.PodcastPlayer = PodcastPlayer;
//# sourceMappingURL=PodcastPlayer.js.map