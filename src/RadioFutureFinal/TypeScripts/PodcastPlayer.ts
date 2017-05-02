declare var YT: any;

import { IPlayer } from "./IPlayer";
import { Media, Session, UserState } from "./Contracts";

export class PodcastPlayer implements IPlayer {

    private mobileBrowser: boolean;
    private html5audio: HTMLAudioElement;

    constructor(mobileBrowser: boolean) {
        this.mobileBrowser = mobileBrowser;
        this.html5audio = <HTMLAudioElement> document.getElementById('html5audio');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
    }

    initPlayer(onPlayerStateChange) {
        // TODO: add this
    }

    setPlayerContent(media: Media, time: number) {
        // TODO: this should be in super class
        $("#p_cc_summary").text(media.Title);
        if (!this.mobileBrowser) {
            var html =
                '<div style="text-align: left; display: flex; align-items: center;">' +
                '<img style="height: 90px; width: 160px; margin-right: 16px;" src="' + media.ThumbURL + '"/>' +
                '<span style="margin-right: 16px;">' + media.Title + '<br>' + 'Recommended by: ' + media.UserName + '</span>' +
                '</div>';
            $("#div_cc_results").html(html);
        }
        this.html5audio.src = media.MP3Source;
        this.html5audio.currentTime = time;
    }

    play() {
        this.html5audio.play();
    }

    pause() {
        this.html5audio.pause();
    }

    getCurrentTime = () => {
        return this.html5audio.currentTime;
    }

    getCurrentState = () => {
        // TODO: implement
        // return this.html5audio.sta
        return 0;
    }


}