import { MyUser, Media, Session, UserState, WsMessage } from "./Contracts";
import { UICallbacks, UI } from "./UI";
import { MySocket, ClientActions } from "./Sockets";
import { IPlayer } from "./IPlayer";
import { PodcastPlayer } from "./PodcastPlayer";
import { YtPlayer } from "./YtPlayer";

class RoomManager implements UICallbacks, ClientActions {

    user: MyUser;
    session: Session;
    player: PodcastPlayer; 
    socket: MySocket;
    ui: UI;
    roomType: string;
    mobileBrowser: boolean;

    constructor(roomType: string, mobileBrowser: boolean) {
        // TODO: find a better way to expose these functions to html?
        (<any>window).requestSyncWithUser = this.requestSyncWithUser;
        (<any>window).deleteMedia = this.deleteMedia;
        this.roomType = roomType;
        this.mobileBrowser = mobileBrowser;
    }

    public init(encodedSessionName: string) {
        this.user = new MyUser();
        this.session = new Session();
        this.ui = new UI(this.mobileBrowser, this);
        //if (this.roomType == "podcasts") {
        this.player = new PodcastPlayer(this.ui, this.mobileBrowser, this.uiNextMedia, this.uiPreviousMedia);
        //}
        //else {
        //    this.player = new YtPlayer(this.ui, this.mobileBrowser);
        //}
        this.socket = new MySocket(this);
        this.setupJamSession(encodedSessionName);
        this.player.initPlayer(this.onPlayerStateChange);
    }

    setupJamSession(encodedSessionName: string) {
        this.session.Name = decodeURI(encodedSessionName);
        this.user.Name = 'Anonymous';
        var message = new WsMessage();
        message.Action = 'UserJoinSession';
        message.User = this.user;
        message.Session = this.session;
        this.socket.emit(message);
    }

    //==================================================================
    // WebSocket message response functions
    //==================================================================

    clientProvideUserState(message: WsMessage) {
        var userToSyncWith = message.User;
        this.user.State.QueuePosition = userToSyncWith.State.QueuePosition;
        this.user.State.Time = userToSyncWith.State.Time;
        this.user.State.PlayerState = userToSyncWith.State.PlayerState;
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        this.onUserStateChange();
    }

    clientRequestUserState(message: WsMessage) {
        var userData = new MyUser();
        userData.Id = message.User.Id; // TODO: bad bad bad
        userData.State.QueuePosition = this.user.State.QueuePosition;
        userData.State.Time = Math.round(this.player.getCurrentTime());
        userData.State.PlayerState = this.player.getCurrentState();

        var outgoingMsg = new WsMessage();
        outgoingMsg.Action = 'ProvideSyncToUser';
        outgoingMsg.User = userData;
        this.socket.emit(outgoingMsg);
    }

    clientSessionReady(message: WsMessage) {
        this.session = message.Session;
        this.user = message.User;
        this.uiNextMedia();
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        this.ui.updateUsersList(this.session.Users, this.user.Id);
        this.ui.sessionReady();
    }

    clientUpdateUsersList(message: WsMessage) {
        var users = message.Session.Users;
        this.session.Users = users;
        this.ui.updateUsersList(this.session.Users, this.user.Id);	
    }

    clientUpdateQueue(message: WsMessage) {
        var wasWaiting = this.isUserWaiting();
        this.session.Queue = message.Session.Queue;
        if (wasWaiting) {
            this.uiNextMedia();
        }
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
    }

    clientChatMessage(message: WsMessage) {
        var chatMessage = message.ChatMessage;
        var userName = message.User.Name;
        this.ui.onChatMessage(userName, chatMessage, 'blue');
    }

    clientSearchResults(message: WsMessage) {
        // TODO: dumb
        var results = message.Session.Queue;
        this.ui.onSearchResults(results);
    }

    isUserWaiting = (): boolean => {
        var pos = this.user.State.QueuePosition;
        var length = this.session.Queue.length;
        return pos < 0 || ((pos == (length - 1)) && this.player.isStopped());
    }

    //
    // Mostly UI callback functions
    //
    uiSendChatMessage(msg: string) {
        var message = new WsMessage();
        message.Action = 'ChatMessage';
        message.ChatMessage = msg;
        message.User = this.user;
        this.socket.emit(message);
   }

    onPlayerStateChange = (event) => {
        if(event.data==0) {
            this.uiNextMedia();
        }
    }

    uiSearch(query: string, page: number) {
        var message = new WsMessage();
        message.Action = 'Search';
        // TODO: dumb
        message.ChatMessage = query;
        message.Media = new Media();
        message.Media.Id = page;
        this.socket.emit(message);
    }

    uiNameChange(newName) {
        this.user.Name = newName;
        var message = new WsMessage();
        message.User = this.user;
        message.Action = 'SaveUserNameChange';
        this.socket.emit(message);
    }

    uiGoToMedia(newQueuePosition: number) {
        console.log('poop: ' + newQueuePosition);
        this.user.State.QueuePosition = newQueuePosition;
        this.user.State.Time = 0;
        this.onUserStateChange();
    }

    onUserStateChange() {
        if (this.user.State.QueuePosition >= 0 && this.user.State.QueuePosition < this.session.Queue.length) {
            this.player.setPlayerContent(this.session.Queue[this.user.State.QueuePosition], this.user.State.Time);
            this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        }
        else if (this.user.State.QueuePosition < 0) {
            this.player.nothingPlaying();
        }
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


    //==================================================================
    // These functions are called directly embedded into the html... kinda weird
    //==================================================================

    onFatalError = () => {
        $("#div_everything").hide();
        $("#div_error").show();
    }

    requestSyncWithUser = (userId) => {
        console.log('request sync with user');

        var user = new MyUser();
        user.Id = userId;
        var message = new WsMessage();
        message.Action = 'RequestSyncWithUser';
        message.User = user;
        this.socket.emit(message);
    }

    uiQueueMedia = (media: Media) => {
        media.UserId = this.user.Id;
        media.UserName = this.user.Name;
        var message = new WsMessage();
        message.Action = 'AddMediaToSession';
        message.Media = media;
        //TODO: local add media
        this.socket.emit(message);
    }

    deleteMedia = (mediaId: number, position: number) => {

        this.session.Queue.splice(position, 1);
        if (this.user.State.QueuePosition >= position) {
            this.user.State.QueuePosition -= 1;
            this.onUserStateChange();
        }
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);

        var mediaToDelete = new Media();
        mediaToDelete.Id = mediaId;

        var message = new WsMessage();
        message.Action = 'DeleteMediaFromSession';
        message.Media = mediaToDelete;

        this.socket.emit(message);
    }

}

declare var mobileBrowser: boolean;
declare var roomType: string;
declare var roomName: string;

var mRoomManager = new RoomManager(roomType, mobileBrowser);
$(document).ready(function () {
    mRoomManager.init(roomName);
});


