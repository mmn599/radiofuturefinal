declare var YT: any;

import { IPlayer } from "./IPlayer";
import { Media, Session, UserState } from "./Contracts";
import { UI } from "./UI";

export class PodcastPlayer implements IPlayer {

    private mobileBrowser: boolean;
    private audio: HTMLAudioElement;
    private ui: UI;
    private canvas: HTMLCanvasElement;

    constructor(ui: UI, mobileBrowser: boolean, nextMedia, previousMedia) {
        this.ui = ui;
        this.mobileBrowser = mobileBrowser;
        this.audio = <HTMLAudioElement>document.getElementById('html5audio');
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas_progress');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
        $("#btn_next").click(nextMedia);
        $("#btn_previous").click(previousMedia);
    };

    initPlayer = (onPlayerStateChange) => {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        $(this.canvas).click((e) => {
            var xPos = e.clientX - this.canvas.getBoundingClientRect().left;
            if (xPos < 0) {
                xPos = 0;
            }
            var percentage = xPos / this.canvas.width;
            var time = percentage * this.audio.duration;
            if (time < 0 || time == NaN) {
                time = 0;
            }
            this.updatePlayerTime(time);
        });

        this.setupControls();
        this.nothingPlaying();
        this.audio.onended = () => {
            onPlayerStateChange({ data: 0 });
        }
        this.audio.ontimeupdate = () => {
            this.audioTimeUpdate();
        }
    }

    public updatePlayerTime = (time: number) => {
        if (time != NaN) {
            this.audio.currentTime = time;
        }
    }

    public nothingPlaying = () => {
        $("#cc_title").text('Nothing currently playing.');
        $("#cc_show").text('Queue something up!');
        this.audio.pause();
        this.audio.currentTime = 0;
        this.removeSource();
        this.audio.load;
        // $("#btn_play_pause").css('visibility', 'hidden');
        setTimeout(() => {
            this.updateProgressUI(0, 0);
        }, 100);
    }

    audioTimeUpdate() {
        var duration = this.audio.duration == 0 ? 1 : this.audio.duration;
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

        var percent = time / duration;
        if (!percent || percent == NaN) { percent = 0;}

        ctx.beginPath();
        ctx.fillStyle = "#ffa79c";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, percent * this.canvas.width, this.canvas.height);
        $("#cc_time").text(this.format(time));
        $("#cc_duration").text(this.format(duration));
    }

    private removeSource() {
        let mp3 = $("#mp3Source");
        mp3.remove();
    }

    setPlayerContent = (media: Media, time: number) => {
        this.removeSource();
        let newmp3 = $(document.createElement('source'));
        newmp3.attr('id', 'mp3Source');
        newmp3.attr('type', 'audio/mp3');
        newmp3.appendTo(this.audio);
        newmp3.attr('src', media.MP3Source);
        this.updateInfoUI(media);
        this.audio.load();
        this.audio.currentTime = time;
        this.audio.play();
        this.updateProgressUI(0, 0);
        // $("#btn_play_pause").css('visibility', 'visible');
    }

    updateInfoUI(media: Media) {
        $("#cc_show").text(media.Show);
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