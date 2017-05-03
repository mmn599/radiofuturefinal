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
        this.ui = ui;
        this.mobileBrowser = mobileBrowser;
        this.audio = <HTMLAudioElement>document.getElementById('html5audio');
        this.mp3source = document.getElementById('mp3Source');
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas_podcast');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
    };

    audioTimeUpdate() {
        var percentage = this.audio.currentTime / this.audio.duration;
        this.updatePlayerUI(percentage);
    }

    initPlayer = (onPlayerStateChange) => {
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.updatePlayerUI(0);
        this.audio.onended = () => {
            onPlayerStateChange({ data: 0 });
        }
        this.audio.ontimeupdate = () => {
            this.audioTimeUpdate();
        }
    }

    sine = (A, i, num): number => {
        return A * Math.sin((i / (this.canvas.width / num)) * 2 * Math.PI);
    }

    updatePlayerUI = (percentage: number) => {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.lineWidth = 2;
        var A = 200;
        var num = 3;
        var mid = Math.floor(percentage * this.canvas.width);

        ctx.beginPath();
        ctx.strokeStyle = "blue";
        ctx.moveTo(0, this.canvas.height / 2);
        for (var i = 0; i < mid; i += 1) {
            ctx.lineTo(i, -1 * this.sine(A, i, num) + this.canvas.height / 2);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "black";
        for (var i = mid; i < this.canvas.width; i += 1) {
            ctx.lineTo(i, -1 * this.sine(A, i, num) + this.canvas.height / 2);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.arc(mid, -1 * this.sine(A, mid, num) + this.canvas.height / 2, 10, 0, Math.PI * 2, true);
        ctx.fill();
    }

    setPlayerContent = (media: Media, time: number) => {
        this.mp3source.setAttribute('src', media.MP3Source);
        this.audio.load();
        this.audio.play();
        this.ui.updateCurrentContent(media);
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

    isStopped = () : boolean => {
        return this.audio.currentTime >= this.audio.duration;
    }

}