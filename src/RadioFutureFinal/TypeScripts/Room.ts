import { Media, Session } from "./Contracts";
import { UICallbacks, UI } from "./UI";
import { PodcastPlayer } from "./PodcastPlayer";

class RoomManager implements UICallbacks {

    session: Session;
    player: PodcastPlayer; 
    ui: UI;
    mobileBrowser: boolean;

    constructor(mobileBrowser: boolean) {
        this.mobileBrowser = mobileBrowser;
    }

    public init(encodedSessionName: string) {
        this.session = new Session();
        this.ui = new UI(this.mobileBrowser, this);
        this.player = new PodcastPlayer(this.ui, this.mobileBrowser, this.uiNextMedia, this.uiPreviousMedia);
        this.setupJamSession(encodedSessionName);
        this.player.initPlayer(this.onPlayerStateChange);
    }

    setupJamSession(encodedSessionName: string) {
        this.session.Name = decodeURI(encodedSessionName);
        this.socket.JoinSession(this.session.Name);
    }

    //==================================================================
    // WebSocket message response functions
    //==================================================================

    clientSessionReady(msg) {
        this.session = msg.session;
        this.user = msg.user;
        this.uiNextMedia();
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        this.ui.updateUsersList(this.session.Users, this.user.Id);
        this.ui.sessionReady();
    }

    clientUpdateQueue(msg) {
        var wasWaiting = this.isUserWaiting();
        this.session.Queue = msg.queue;
        if (wasWaiting) {
            this.uiNextMedia();
        }
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
    }

    clientSearchResults(msg) {
        this.ui.onSearchResults(msg.searchResults);
    }

    //
    // Mostly UI callback functions
    //

    uiSearch(query: string, page: number) {
        this.socket.Search(query, page);
    }

    uiGoToMedia(newQueuePosition: number) {
        this.user.State.QueuePosition = newQueuePosition;
        this.user.State.Time = 0;
        this.onUserStateChange();
    }

    uiNextMedia = () => {
        var queue = this.session.Queue;
        if(this.user.State.QueuePosition + 1 < queue.length) {
            this.user.State.Time = 0;
            this.user.State.QueuePosition += 1;
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
        this.user.State.Time = 0;
        var queue = this.session.Queue;
        if(this.user.State.QueuePosition > 0) {
            this.user.State.QueuePosition = this.user.State.QueuePosition - 1;
            this.onUserStateChange();
        }
    }

    uiQueueMedia = (media: Media) => {
        // TODO: awkward
        media.UserId = this.user.Id;
        media.UserName = this.user.Name;
        this.socket.AddMediaToSession(media);
    }

    uiDeleteMedia = (mediaId: number, position: number) => {
        // TODO: important: this should be done once the update is sent from server
        this.session.Queue.splice(position, 1);
        if (this.user.State.QueuePosition >= position) {
            this.user.State.QueuePosition -= 1;
            this.onUserStateChange();
        }
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);

        this.socket.DeleteMediaFromSession(mediaId);
    }


    //
    // Misc
    //

    onUserStateChange() {
        if (this.user.State.QueuePosition >= 0 && this.user.State.QueuePosition < this.session.Queue.length) {
            this.player.setPlayerContent(this.session.Queue[this.user.State.QueuePosition], this.user.State.Time);
            this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        }
        else if (this.user.State.QueuePosition < 0) {
            this.player.nothingPlaying();
        }
        else if (this.user.State.QueuePosition >= this.session.Queue.length) {
            this.user.State.QueuePosition = this.session.Queue.length;
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


