declare var YT: any;

import { IPlayer } from "./IPlayer";
import { Media, Session, UserState } from "./Contracts";
import { UI } from "./UI";

export class PodcastPlayer implements IPlayer {

    private mobileBrowser: boolean;
    private audio: HTMLAudioElement;
    private mp3source: any;
    private ui: UI;
    private canvas: HTMLCanvasElement;

    constructor(ui: UI, mobileBrowser: boolean, nextMedia, previousMedia) {
        this.ui = ui;
        this.mobileBrowser = mobileBrowser;
        this.audio = <HTMLAudioElement>document.getElementById('html5audio');
        this.mp3source = document.getElementById('mp3Source');
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas_progress');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
        $("#btn_next").click(nextMedia);
        $("#btn_previous").click(previousMedia);
    };

    initPlayer = (onPlayerStateChange) => {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.setupControls();
        this.nothingPlaying();
        this.audio.onended = () => {
            onPlayerStateChange({ data: 0 });
        }
        this.audio.ontimeupdate = () => {
            this.audioTimeUpdate();
        }
    }

    public nothingPlaying = () => {
        $("#cc_title").text('Nothing currently playing.');
        $("#cc_show").text('Queue something up!');
        this.updateProgressUI(0, 1);
    }

    audioTimeUpdate() {
        var percentage = this.audio.currentTime / this.audio.duration;
        this.updateProgressUI(this.audio.currentTime, this.audio.duration);
    }

    setupControls = () => {
        var btnPlayPause = $("#btn_play_pause");
        btnPlayPause.attr('class', 'play_btn');
        btnPlayPause.click(() => {
            if (this.audio.paused) {
                this.play();
            }
            else {
                this.pause();
            }
        });
    }

    format(seconds) {
        if (!seconds || seconds == NaN) {
            seconds = 0;
        }
        seconds = Math.round(seconds);
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return this.format2Digit(hours) + ":" + this.format2Digit(minutes) + ":" + this.format2Digit(secs);
    }

    format2Digit(num: number) {
        if (num < 10) {
            return "0" + num.toString();
        }
        return num.toString();
    }

    updateProgressUI = (time: number, duration: number) => {
        var ctx = this.canvas.getContext('2d');
        ctx.moveTo(0, 0);
        ctx.fillStyle = 'white';
        if (duration == 0) { duration = 1; }
        ctx.rect(0, 0, time / duration * this.canvas.width, this.canvas.height);
        ctx.fill();
        $("#cc_time").text(this.format(time));
        $("#cc_duration").text(this.format(duration));
    }

    setPlayerContent = (media: Media, time: number) => {
        this.mp3source.setAttribute('src', media.MP3Source);
        this.audio.load();
        this.updateInfoUI(media);
        this.play();
    }

    updateInfoUI(media: Media) {
        $("#cc_show").text('Radiolab');
        $("#cc_title").text(media.Title);
    }

    play = () => {
        $("#btn_play_pause").removeClass('play_btn').addClass('pause_btn');
        this.audio.play();
    }

    pause = () => {
        $("#btn_play_pause").removeClass('pause_btn').addClass('play_btn');
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