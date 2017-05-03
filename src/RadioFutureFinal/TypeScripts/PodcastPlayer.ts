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

    constructor(ui: UI, mobileBrowser: boolean) {
        this.ui = ui;
        this.mobileBrowser = mobileBrowser;
        this.audio = <HTMLAudioElement>document.getElementById('html5audio');
        this.mp3source = document.getElementById('mp3Source');
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas_progress');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
    };

    initPlayer = (onPlayerStateChange) => {
        this.canvas.style.width = '30%';
        this.canvas.style.height = '5%';
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.setupControls();
        this.updateProgressUI(0);
        this.audio.onended = () => {
            onPlayerStateChange({ data: 0 });
        }
        this.audio.ontimeupdate = () => {
            this.audioTimeUpdate();
        }
    }

    audioTimeUpdate() {
        var percentage = this.audio.currentTime / this.audio.duration;
        this.updateProgressUI(percentage);
    }

    setupControls = () => {
        var btnPlayPause = $("#btn_play_pause");
        btnPlayPause.attr('class', 'play_btn');
        btnPlayPause.click(() => {
            if (btnPlayPause.hasClass('play_btn')) {
                this.play();
            }
            else {
                this.pause();
            }
        });
    }

    updateProgressUI = (percentage: number) => {
        var ctx = this.canvas.getContext('2d');
        ctx.moveTo(0, 0);
        ctx.fillStyle = 'grey';
        ctx.rect(0, 0, percentage * this.canvas.width, this.canvas.height);
        ctx.fill();
    }

    setPlayerContent = (media: Media, time: number) => {
        this.mp3source.setAttribute('src', media.MP3Source);
        this.audio.load();
        this.audio.play();
        this.updateInfoUI(media);
    }

    updateInfoUI(media: Media) {
        $("#p_cc_show").text('Radiolab');
        $("#p_cc_title").text(media.Title);
    }

    play = () => {
        this.audio.play();
        $("#btn_play_pause").removeClass('play_btn').addClass('pause_btn');
    }

    pause = () => {
        this.audio.pause();
        $("btn_play_pause").removeClass('pause_btn').addClass('play_btn');
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