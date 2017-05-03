declare var YT: any;

import { IPlayer } from "./IPlayer";
import { Media, Session, UserState } from "./Contracts";
import { UI } from "./UI";

export class YtPlayer implements IPlayer {

    private ytPlayer: any;
    private mobileBrowser: boolean;
    private ui: UI;
    public playerReady: boolean;

    constructor(ui: UI, mobileBrowser: boolean) {
        this.playerReady = false;
        this.mobileBrowser = mobileBrowser;
        this.ui = ui;
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
            this.ytPlayer.loadVideoById(media.YTVideoID, time, "large");
            this.ui.updateCurrentContent(media);
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

    public isStopped(): boolean {
        return this.getCurrentState() == 0;
    }

}