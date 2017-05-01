"use strict";
var Player = (function () {
    function Player(mobileBrowser, podcasts) {
        var _this = this;
        this.onPlayerReady = function () {
            _this.playerReady = true;
        };
        this.playerReady = false;
        this.mobileBrowser = mobileBrowser;
        this.podcasts = podcasts;
    }
    Player.prototype.initPlayer = function (onPlayerStateChange) {
        var _this = this;
        if (!this.podcasts) {
            $("#div_yt_player").show();
            $("#div_podcast_player").hide();
            if (YT && YT.Player) {
                this.ytPlayer = new YT.Player('div_yt_player', {
                    height: 'auto',
                    width: '100%',
                    playerVars: {
                        controls: 1,
                        showinfo: 0,
                        autoplay: 0
                    },
                    events: {
                        'onReady': this.onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                });
            }
            else {
                setTimeout(function () { _this.initPlayer(onPlayerStateChange); }, 50);
            }
        }
        else {
            $("#div_yt_player").hide();
            $("#div_podcast_player").show();
        }
        if (this.mobileBrowser) {
            var div_player = $("#div_yt_player");
            div_player.height(div_player.width() * 9.0 / 16.0);
        }
    };
    Player.prototype.setPlayerContent = function (media, time) {
        var _this = this;
        if (!this.playerReady) {
            console.log('player not ready!');
            setTimeout(function () { _this.setPlayerContent(media, time); }, 50);
        }
        else {
            this.updatePlayerUI(media, time);
            this.play();
        }
    };
    Player.prototype.play = function () {
        this.ytPlayer.playVideo();
    };
    Player.prototype.pause = function () {
        this.ytPlayer.pauseVideo();
    };
    Player.prototype.getCurrentTime = function () {
        return Math.round(this.ytPlayer.getCurrentTime());
    };
    Player.prototype.getCurrentState = function () {
        return Math.round(this.ytPlayer.getPlayerState());
    };
    Player.prototype.updatePlayerUI = function (media, time) {
        this.ytPlayer.loadVideoById(media.YTVideoID, time, "large");
        $("#p_cc_summary").text(media.VideoTitle);
        if (!this.mobileBrowser) {
            var html = '<div style="text-align: left; display: flex; align-items: center;">' +
                '<img style="height: 90px; width: 160px; margin-right: 16px;" src="' + media.ThumbURL + '"/>' +
                '<span style="margin-right: 16px;">' + media.VideoTitle + '<br>' + 'Recommended by: ' + media.UserName + '</span>' +
                '</div>';
            $("#div_cc_results").html(html);
        }
    };
    return Player;
}());
exports.Player = Player;
//# sourceMappingURL=Player.js.map