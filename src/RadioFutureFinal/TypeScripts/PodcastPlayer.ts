declare var YT: any;

import { IPlayer } from "./IPlayer";
import { Media, Session, UserState } from "./Contracts";
import { UI } from "./UI";

export class PodcastPlayer implements IPlayer {

    private mobileBrowser: boolean;
    private audio: HTMLAudioElement;
    private mp3source: any;
    private ui: UI;

    constructor(ui: UI, mobileBrowser: boolean) {
        this.ui = ui;
        this.mobileBrowser = mobileBrowser;
        this.audio = <HTMLAudioElement>document.getElementById('html5audio');
        this.mp3source = document.getElementById('mp3Source');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
    };

    audioTimeUpdate() {
        var percentage = this.audio.currentTime / this.audio.duration;
        this.updatePlayerUI(this.audio.paused, percentage);
    }

    setupControls = () => {
        var btnPlayPause = $("#btn_play_pause");
        btnPlayPause.attr('class', 'play_btn');
        btnPlayPause.click(() => {
            if (btnPlayPause.hasClass('play_btn')) {
                this.play();
                btnPlayPause.removeClass('play_btn');
                btnPlayPause.addClass('pause_btn');
            }
            else {
                this.pause();
                btnPlayPause.removeClass('pause_btn');
                btnPlayPause.addClass('play_btn');
            }
        });
    }

    initPlayer = (onPlayerStateChange) => {
        this.setupControls();
        this.updatePlayerUI(true, 0);
        this.audio.onended = () => {
            onPlayerStateChange({ data: 0 });
        }
        this.audio.ontimeupdate = () => {
            this.audioTimeUpdate();
        }
    }

    updatePlayerUI = (isPaused: boolean, percentage: number) => {

     
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