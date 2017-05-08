"use strict";
var PodcastPlayer = (function () {
    function PodcastPlayer(ui, mobileBrowser, nextMedia, previousMedia) {
        var _this = this;
        this.initPlayer = function (onPlayerStateChange) {
            _this.canvas.width = _this.canvas.offsetWidth;
            _this.canvas.height = _this.canvas.offsetHeight;
            $(_this.canvas).click(function (e) {
                var xPos = e.clientX - _this.canvas.getBoundingClientRect().left;
                if (xPos < 0) {
                    xPos = 0;
                }
                var percentage = xPos / _this.canvas.width;
                var time = percentage * _this.audio.duration;
                if (time < 0 || time == NaN) {
                    time = 0;
                }
                _this.updatePlayerTime(time);
            });
            _this.nothingPlaying();
            _this.audio.onended = function () {
                onPlayerStateChange({ data: 0 });
            };
            _this.audio.ontimeupdate = function () {
                _this.audioTimeUpdate();
            };
        };
        this.updatePlayerTime = function (time) {
            if (time != NaN) {
                _this.audio.currentTime = time;
            }
        };
        this.nothingPlaying = function () {
            $("#cc_title").text('Nothing currently playing.');
            $("#cc_show").text('Queue something up!');
            _this.audio.pause();
            _this.audio.currentTime = 0;
            _this.removeSource();
            _this.audio.load;
            _this.uiBtnPlay();
            setTimeout(function () {
                _this.updateProgressUI(0, 0);
            }, 100);
        };
        // Maybe move this seperate player ui class
        this.uiBtnPlay = function () {
            var btnPlayPause = $("#btn_play_pause");
            btnPlayPause.width(0);
            btnPlayPause.height(0);
            var parentHeight = btnPlayPause.parent().height();
            var length = parentHeight * .2;
            btnPlayPause.css('border', '0');
            btnPlayPause.css('border-top', length + "px solid transparent");
            btnPlayPause.css('border-left', 1.5 * length + "px solid white");
            btnPlayPause.css('border-bottom', length + "px solid transparent");
            btnPlayPause.css('border-right', '0');
            btnPlayPause.click(function () {
                _this.play();
            });
        };
        this.uiBtnPause = function () {
            var btnPlayPause = $("#btn_play_pause");
            var parentHeight = btnPlayPause.parent().height();
            var length = parentHeight * .2 * .5;
            btnPlayPause.width(length);
            btnPlayPause.height(4 * length);
            btnPlayPause.css('border', '0');
            btnPlayPause.css('border-right', length + "px solid white");
            btnPlayPause.css('border-left', length + "px solid white");
            btnPlayPause.css('border-top', 0);
            btnPlayPause.css('border-bottom', 0);
            btnPlayPause.click(function () {
                _this.pause();
            });
        };
        this.updateProgressUI = function (time, duration) {
            var ctx = _this.canvas.getContext('2d');
            var percent = time / duration;
            if (!percent || percent == NaN) {
                percent = 0;
            }
            ctx.beginPath();
            ctx.fillStyle = "#ffa79c";
            ctx.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, percent * _this.canvas.width, _this.canvas.height);
            $("#cc_time").text(_this.format(time));
            $("#cc_duration").text(_this.format(duration));
        };
        this.setPlayerContent = function (media, time) {
            _this.removeSource();
            var newmp3 = $(document.createElement('source'));
            newmp3.attr('id', 'mp3Source');
            newmp3.attr('type', 'audio/mp3');
            newmp3.appendTo(_this.audio);
            newmp3.attr('src', media.MP3Source);
            _this.audio.load();
            _this.audio.currentTime = time;
            $("#cc_title").text('loading...');
            _this.audio.oncanplay = function () {
                $("#cc_show").text(media.Show);
                $("#cc_title").text(media.Title);
            };
            if (_this.mobileBrowser) {
                _this.pause();
            }
            else {
                _this.play();
            }
            _this.updateProgressUI(0, 0);
        };
        this.play = function () {
            _this.uiBtnPause();
            _this.audio.play();
        };
        this.pause = function () {
            _this.uiBtnPlay();
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
        this.canvas = document.getElementById('canvas_progress');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
        $("#btn_next").click(nextMedia);
        $("#btn_previous").click(previousMedia);
    }
    ;
    PodcastPlayer.prototype.audioTimeUpdate = function () {
        var duration = this.audio.duration == 0 ? 1 : this.audio.duration;
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
    PodcastPlayer.prototype.removeSource = function () {
        var mp3 = $("#mp3Source");
        mp3.remove();
    };
    return PodcastPlayer;
}());
exports.PodcastPlayer = PodcastPlayer;
//# sourceMappingURL=PodcastPlayer.js.map