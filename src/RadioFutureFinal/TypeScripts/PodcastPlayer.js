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
        this.mp3source = document.getElementById('mp3Source');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
    }
    PodcastPlayer.prototype.initPlayer = function (onPlayerStateChange) {
        // TODO: add this
    };
    PodcastPlayer.prototype.setPlayerContent = function (media, time) {
        // TODO: this should be in super class
        $("#p_cc_summary").text(media.Title);
        if (!this.mobileBrowser) {
            var html = '<div style="text-align: left; display: flex; align-items: center;">' +
                '<img style="height: 90px; width: 160px; margin-right: 16px;" src="' + media.ThumbURL + '"/>' +
                '<span style="margin-right: 16px;">' + media.Title + '<br>' + 'Recommended by: ' + media.UserName + '</span>' +
                '</div>';
            $("#div_cc_results").html(html);
        }
        // this.html5audio.currentTime = time;
        this.mp3source.src = media.MP3Source;
        this.html5audio.play(); //call this to play the song right away
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