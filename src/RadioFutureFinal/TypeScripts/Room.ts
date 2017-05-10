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
        this.player = new PodcastPlayer(this.ui, mobileBrowser);
        this.requestor = new Requestor();
    }

    public init(sessionName: string) {
        this.ui.initialize();
        this.player.initialize(this.onPlayerStateChange, this.uiNextMedia, this.uiPreviousMedia);
        var sessionName = decodeURI(sessionName);
        this.requestor.JoinSession(sessionName, this.clientSessionReady);
    }

    //==================================================================
    // Webrequestor message response functions
    //==================================================================

    clientSessionReady = (session: Session) => {
        this.session = session;
        this.uiNextMedia();
        this.ui.updateQueue(this.session.queue, this.queuePosition);
        this.ui.sessionReady(session);
    }

    clientSearchResults = (searchResults: Media[]) => {
        this.ui.onSearchResults(searchResults);
    }

    clientUpdateQueue = (updatedQueue: Media[]) => {

        // Checks for redundant updates because queue is locally updated

        // TODO: more robust equality check (this just checks if someone else added something)
        if (updatedQueue.length != this.session.queue.length) {
            var wasWaiting = this.isUserWaiting();
            this.session.queue = updatedQueue;
            if (wasWaiting) {
                this.uiNextMedia();
            }
            this.ui.updateQueue(this.session.queue, this.queuePosition);
        }

    }

    //
    // Mostly UI callback functions
    //

    uiSearch(query: string, page: number) {
        this.requestor.Search(query, page, this.clientSearchResults, (error) => { this.ui.onSearchError } );
    }

    uiGoToMedia(newQueuePosition: number) {
        this.queuePosition = newQueuePosition;
        this.onUserStateChange();
    }

    uiNextMedia = () => {
        var queue = this.session.queue;
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
        var queue = this.session.queue;
        if(this.queuePosition > 0) {
            this.queuePosition = this.queuePosition - 1;
            this.onUserStateChange();
        }
    }

    uiQueueMedia = (media: Media) => {

        // Local add
        this.session.queue.push(media);
        var wasWaiting = this.isUserWaiting();
        if (wasWaiting) {
            this.uiNextMedia();
        }
        this.ui.updateQueue(this.session.queue, this.queuePosition);

        // Notify the server
        this.requestor.AddMediaToSession(this.session.id, media, this.clientUpdateQueue);

    }

    uiDeleteMedia = (mediaId: number, position: number) => {

        // Local delete
        this.session.queue.splice(position, 1);
        if (this.queuePosition >= position) {
            this.queuePosition -= 1;
            this.onUserStateChange();
        }
        this.ui.updateQueue(this.session.queue, this.queuePosition);

        // Notify the server
        this.requestor.DeleteMediaFromSession(this.session.id, mediaId, this.clientUpdateQueue);

    }

    uiLock = () => {
        console.log('locking');
    }

    //
    // Misc
    //

    isUserWaiting = (): boolean => {
        var pos = this.queuePosition;
        var length = this.session.queue.length;
        return pos < 0 || ((pos == (length - 1)) && this.player.isStopped());
    }

    onUserStateChange() {

        let length = this.session.queue.length;

        if (this.queuePosition >= 0 && this.queuePosition < length) {
            this.player.setPlayerContent(this.session.queue[this.queuePosition]);
            this.ui.updateQueue(this.session.queue, this.queuePosition);
        }
        else if (this.queuePosition < 0) {
            if (length > 0) {
                this.uiNextMedia();
            }
            else {
                this.player.nothingPlaying();
            }
        }
        else if (this.queuePosition >= length) {
            this.queuePosition = this.session.queue.length;
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


