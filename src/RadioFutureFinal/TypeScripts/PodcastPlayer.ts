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