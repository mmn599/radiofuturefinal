declare var YT: any;

import { IPlayer } from "./IPlayer";
import { Media, Session, UserState } from "./Contracts";
import { UI } from "./UI";

export class PodcastPlayer implements IPlayer {

    private mobileBrowser: boolean;
    private audio: HTMLAudioElement;
    private mp3source: any;
    private canvas: HTMLCanvasElement;
    private ui: UI;

    constructor(ui: UI, mobileBrowser: boolean) {
        this.mobileBrowser = mobileBrowser;
        this.audio = <HTMLAudioElement>document.getElementById('html5audio');
        this.mp3source = document.getElementById('mp3Source');
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas_podcast');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
    }

    initPlayer = (onPlayerStateChange) => {
        // TODO: add thi
    }

    setPlayerContent = (media: Media, time: number) => {
        this.mp3source.src = media.MP3Source;
        this.audio.play();
        $(this.audio).bind('canplay', function () {
            this.currentTime = time;
        });
    }

    play = () => {
        this.audio.play();
    }

    pause = () => {
        this.audio.pause();
    }

    getCurrentTime = () => {
        return this.audio.currentTime;
    }

    getCurrentState = () => {
        if (this.audio.paused) {
            return 0;
        }
        else {
            return 1;
        }
    }

}