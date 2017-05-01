import { Media } from "./Contracts";

export interface IPlayer {

    initPlayer(onPlayerStateChange): void;
    setPlayerContent(media: Media, time: number): void;
    play(): void;
    pause(): void;
    getCurrentTime(): number;
    getCurrentState(): number;

}