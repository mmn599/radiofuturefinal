declare var YT: any;

import { IPlayer } from "./IPlayer";
import { Media, Session, UserState } from "./Contracts";

export class YtPlayer implements IPlayer {

    private ytPlayer: any;
    private mobileBrowser: boolean;
    public playerReady: boolean;

    constructor(mobileBrowser: boolean) {
        this.playerReady = false;
        this.mobileBrowser = mobileBrowser;
        $("#div_yt_player").show();
        $("#div_podcast_player").hide();
    }

    public initPlayer(onPlayerStateChange) {

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
                    'onReady' : this.onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }
        else {
            setTimeout(() => { this.initPlayer(onPlayerStateChange) }, 50);
        }

        if (this.mobileBrowser) {
            var div_player = $("#div_yt_player");
            div_player.height(div_player.width() * 9.0 / 16.0);
        }
    }

    public onPlayerReady = () => {
        this.playerReady = true;
    }

    public setPlayerContent(media: Media, time: number) {
        if (!this.playerReady) {
            console.log('player not ready!');
            setTimeout(() => { this.setPlayerContent(media, time) }, 50);
        }
        else {
            this.updatePlayerUI(media, time);
            this.play();
        }
    }

    public play() {
        this.ytPlayer.playVideo();
    }

    public pause() {
        this.ytPlayer.pauseVideo();
    }

    public getCurrentTime(): number {
        return Math.round(this.ytPlayer.getCurrentTime());
    }

    public getCurrentState(): number {
        return Math.round(this.ytPlayer.getPlayerState());
    }


    private updatePlayerUI(media: Media, time: number) {
        this.ytPlayer.loadVideoById(media.YTVideoID, time, "large");	
        $("#p_cc_summary").text(media.Title);
        if (!this.mobileBrowser) {
            var html =
            '<div style="text-align: left; display: flex; align-items: center;">' +
                '<img style="height: 90px; width: 160px; margin-right: 16px;" src="' + media.ThumbURL + '"/>' +
                '<span style="margin-right: 16px;">' + media.Title + '<br>' + 'Recommended by: ' + media.UserName + '</span>' +
            '</div>';
            $("#div_cc_results").html(html);
        }
    }

}