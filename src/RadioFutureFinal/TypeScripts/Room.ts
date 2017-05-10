import { Media, Session } from "./Contracts";
import { UICallbacks, UI } from "./UI";
import { PodcastPlayer } from "./PodcastPlayer";
import { Requestor } from "./Requestor";

class RoomManager implements UICallbacks {

    session: Session;
    player: PodcastPlayer; 
    ui: UI;
    requestor: Requestor;
    mobileBrowser: boolean;
    queuePosition: number;


    constructor(mobileBrowser: boolean) {
        this.queuePosition = -1;
        this.mobileBrowser = mobileBrowser;
        this.ui = new UI(this.mobileBrowser, this);
        this.player = new PodcastPlayer(this.ui, this.mobileBrowser, this.uiNextMedia, this.uiPreviousMedia,
            this.onPlayerStateChange);
        this.requestor = new Requestor();
    }

    public init(encodedSessionName: string) {
        var sessionName = decodeURI(encodedSessionName);
        this.requestor.JoinSession(sessionName, this.clientSessionReady);
    }

    //==================================================================
    // Webrequestor message response functions
    //==================================================================

    clientSessionReady(session: Session) {
        this.session = session;
        this.uiNextMedia();
        this.ui.updateQueue(this.session.Queue, this.queuePosition);
        this.ui.sessionReady();
    }

    clientSearchResults(searchResults: Media[]) {
        this.ui.onSearchResults(searchResults);
    }

    clientUpdateQueue(updatedQueue: Media[]) {
        var wasWaiting = this.isUserWaiting();
        this.session.Queue = updatedQueue;
        if (wasWaiting) {
            this.uiNextMedia();
        }
        this.ui.updateQueue(this.session.Queue, this.queuePosition);
    }


    //
    // Mostly UI callback functions
    //

    uiSearch(query: string, page: number) {
        this.requestor.Search(query, page, this.clientSearchResults);
    }

    uiGoToMedia(newQueuePosition: number) {
        this.queuePosition = newQueuePosition;
        this.onUserStateChange();
    }

    uiNextMedia = () => {
        var queue = this.session.Queue;
        if(this.queuePosition + 1 < queue.length) {
            this.queuePosition += 1;
            this.onUserStateChange();
        }
    }

    uiPauseMedia = () => {
        this.player.pause();
    }

    uiPlayMedia = () => {
        this.player.play();
    }

    uiPreviousMedia = () => {
        var queue = this.session.Queue;
        if(this.queuePosition > 0) {
            this.queuePosition = this.queuePosition - 1;
            this.onUserStateChange();
        }
    }

    uiQueueMedia = (media: Media) => {
        this.requestor.AddMediaToSession(media, this.clientUpdateQueue);
    }

    uiDeleteMedia = (mediaId: number, position: number) => {
        this.session.Queue.splice(position, 1);
        if (this.queuePosition >= position) {
            this.queuePosition -= 1;
            this.onUserStateChange();
        }
        this.ui.updateQueue(this.session.Queue, this.queuePosition);
        this.requestor.DeleteMediaFromSession(mediaId, this.clientUpdateQueue);
    }


    //
    // Misc
    //

    isUserWaiting = (): boolean => {
        var pos = this.queuePosition;
        var length = this.session.Queue.length;
        return pos < 0 || ((pos == (length - 1)) && this.player.isStopped());
    }

    onUserStateChange() {
        if (this.queuePosition >= 0 && this.queuePosition < this.session.Queue.length) {
            this.player.setPlayerContent(this.session.Queue[this.queuePosition]);
            this.ui.updateQueue(this.session.Queue, this.queuePosition);
        }
        else if (this.queuePosition < 0) {
            this.player.nothingPlaying();
        }
        else if (this.queuePosition >= this.session.Queue.length) {
            this.queuePosition = this.session.Queue.length;
        }
    }

    onPlayerStateChange = (event) => {
        if(event.data==0) {
            this.uiNextMedia();
        }
    }

    onFatalError = () => {
        $("#div_everything").hide();
        $("#div_error").show();
    }

}

declare var mobileBrowser: boolean;
declare var roomName: string;

var mRoomManager = new RoomManager(mobileBrowser);
$(document).ready(function () {
    mRoomManager.init(roomName);
});


