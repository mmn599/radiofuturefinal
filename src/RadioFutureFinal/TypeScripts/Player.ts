declare var YT: any;

import { Media, Session, UserState } from "./Contracts";

export class Player {

    private ytPlayer: any;
    private mobileBrowser: boolean;

    public playerReady: boolean;

    constructor(mobileBrowser: boolean) {
        this.playerReady = false;
        this.mobileBrowser = mobileBrowser;
    }

    public initializeYtPlayer(onPlayerStateChange) {
        this.ytPlayer = new YT.Player('div_yt_player', {
            height: 'auto',
            width: '100%',
            playerVars: {
                controls: 1,
                showinfo: 0,
                autoplay: 0
            },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });

        if (this.mobileBrowser) {
            var div_player = $("#div_player");
            div_player.height(div_player.width() * 9.0 / 16.0);
        }
    }

    public setPlayerContent(media: Media, time: number) {
        var media = media;
        this.updatePlayerUI(media, time);
        this.play();
    }

    public play() {
        this.ytPlayer.playVideo();
    }

    public pause() {
        this.ytPlayer.pauseVideo();
    }

    private updatePlayerUI(media: Media, time: number) {
        this.ytPlayer.loadVideoById(media.YTVideoID, time, "large");	
        $("#p_cc_summary").text(media.VideoTitle);
        if (!this.mobileBrowser) {
            var html =
            '<div style="text-align: left; display: flex; align-items: center;">' +
                '<img style="height: 90px; width: 160px; margin-right: 16px;" src="' + media.ThumbURL + '"/>' +
                '<span style="margin-right: 16px;">' + media.VideoTitle + '<br>' + 'Recommended by: ' + media.UserName + '</span>' +
            '</div>';
            $("#div_cc_results").html(html);
        }
    }

    public getCurrentTime(): number {
        return Math.round(this.ytPlayer.getCurrentTime());
    }

    public getCurrentState(): number {
        return Math.round(this.ytPlayer.getPlayerState());
    }

}