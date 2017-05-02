import { MyUser, Media, Session, UserState, WsMessage } from "./Contracts";
import { UICallbacks, UI } from "./UI";
import { MySocket, ClientActions } from "./Sockets";
import { IPlayer } from "./IPlayer";
import { PodcastPlayer } from "./PodcastPlayer";
import { YtPlayer } from "./YtPlayer";
import { ISearcher } from "./ISearcher";
import { YtSearcher } from "./YtSearcher";
import { PodcastSearcher } from "./PodcastSearcher";

class RoomManager implements UICallbacks, ClientActions {

    user: MyUser;
    session: Session;
    searcher: ISearcher;
    player: IPlayer; 
    socket: MySocket;
    ui: UI;

    roomType: string;
    mobileBrowser: boolean;

    constructor(roomType: string, mobileBrowser: boolean) {
        // TODO: find a better way to expose these functions to html?
        (<any>window).queueSelectedVideo = this.queueSelectedVideo;
        (<any>window).requestSyncWithUser = this.requestSyncWithUser;
        (<any>window).deleteMedia = this.deleteMedia;
        this.roomType = roomType;
        this.mobileBrowser = mobileBrowser;
    }

    public init(encodedSessionName: string) {
        this.user = new MyUser();
        this.session = new Session();
        if (this.roomType == "podcasts") {
            this.player = new PodcastPlayer(this.mobileBrowser);
            this.searcher = new PodcastSearcher();
        }
        else {
            // TODO: get rid of this key
            this.searcher = new YtSearcher('AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc');
            this.player = new YtPlayer(this.mobileBrowser);
        }
        this.ui = new UI(this.mobileBrowser, this);
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
        this.user.State.YTPlayerState = userToSyncWith.State.YTPlayerState;

        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);

        var currentMedia = this.session.Queue[this.user.State.QueuePosition];

        this.userStateChange();
    }

    clientRequestUserState(message: WsMessage) {
        var userData = new MyUser();
        userData.Id = message.User.Id; // TODO: bad bad bad
        userData.State.QueuePosition = this.user.State.QueuePosition;
        userData.State.Time = Math.round(this.player.getCurrentTime());
        userData.State.YTPlayerState = this.player.getCurrentState();

        var outgoingMsg = new WsMessage();
        outgoingMsg.Action = 'ProvideSyncToUser';
        outgoingMsg.User = userData;
        this.socket.emit(outgoingMsg);
    }


    clientUpdateUser(message: WsMessage) {
        var user = message.User;
        this.user = user;	
    }

    clientSessionReady(message: WsMessage) {
        this.session = message.Session;
        this.user = message.User;

        // TODO: get rid of this bullshit
        if (this.session.Queue.length == 0) {
            $("#p_current_content_info").text("Queue up a song!");
            $("#p_current_recommender_info").text("Use the search bar above.");
        }

        this.nextMedia();
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
        this.session.Queue = message.Session.Queue;
        if (this.user.State.Waiting) {
            this.nextMedia();
        }
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
    }

    clientChatMessage(message: WsMessage) {
        var chatMessage = message.ChatMessage;
        var userName = message.User.Name;
        this.ui.onChatMessage(userName, chatMessage, 'blue');
    }

    clientSetupAudioAPI(message: WsMessage) {
        // TODO: better mechanism for different players
        if (this.roomType == "podcasts") {
            // TODO: better message structure
            // TODO: ensure this isn't awfully insecure
            var id = message.User.Name;
            var secret = message.Media.Title;
            this.searcher.init(secret, id);
        }
    }

    clientSetupYTAPI(message: WsMessage) {
        if (this.roomType != "podcasts") {
            var secret = message.Media.Title;
            this.searcher.init(secret);
        }
    }

    //
    // Mostly UI callback functions
    //

    onSendChatMessage(msg: string) {
        var message = new WsMessage();
        message.Action = 'ChatMessage';
        message.ChatMessage = msg;
        message.User = this.user;
        this.socket.emit(message);
    }

    onPlayerStateChange(event) {
        if(event.data==0) {
            this.nextMedia();
        }
    }

    search(query, callback: (media: Media[]) => void) {
        this.searcher.search(query, callback);
    }

    nameChange(newName) {
        this.user.Name = newName;
        var message = new WsMessage();
        message.User = this.user;
        message.Action = 'SaveUserNameChange';
        this.socket.emit(message);
    }

    userStateChange() {
        if (this.user.State.QueuePosition >= 0 && this.user.State.QueuePosition < this.session.Queue.length) {
            this.player.setPlayerContent(this.session.Queue[this.user.State.QueuePosition], this.user.State.Time); 
            this.user.State.Waiting = false;
        }
        else if (this.user.State.QueuePosition < 0 || this.user.State.QueuePosition == this.session.Queue.length) {
            // TODO: set player content to 'waiting on next video'
            this.user.State.Waiting = true;
        }
        else if (this.user.State.QueuePosition == this.session.Queue.length) {

        }
    }

    nextMedia() {
        this.user.State.Time = 0;
        var queue = this.session.Queue;

        if(this.user.State.QueuePosition + 1 < queue.length) {
            this.user.State.QueuePosition = this.user.State.QueuePosition + 1;
        }
        else if (this.user.State.QueuePosition >= 0) {
            this.user.State.QueuePosition = queue.length;
        }

        this.userStateChange();
    }

    pauseMedia() {
        this.player.pause();
    }

    playMedia() {
        this.player.play();
    }

    previousMedia() {
        this.user.State.Time = 0;
        var queue = this.session.Queue;
        if(this.user.State.QueuePosition > 0) {
            this.user.State.QueuePosition = this.user.State.QueuePosition - 1;
            this.userStateChange();
        }
    }


    //==================================================================
    // These functions are called directly embedded into the html... kinda weird
    //==================================================================

    requestSyncWithUser = (userId) => {
        console.log('request sync with user');

        var user = new MyUser();
        user.Id = userId;
        var message = new WsMessage();
        message.Action = 'RequestSyncWithUser';
        message.User = user;
        this.socket.emit(message);
    }

    queueSelectedVideo = (elmnt) => {

        $("#div_search_results").fadeOut();
        $("#input_search").val("");
        var videoId = elmnt.getAttribute('data-VideoId');
        var title = elmnt.innerText || elmnt.textContent;
        var thumbURL = elmnt.getAttribute('data-ThumbURL');
        var mp3Source = elmnt.getAttribute('data-MP3Source');
        var oggSource = elmnt.getAttribute('data-OGGSource');

        var media = new Media();
        media.YTVideoID = videoId;
        media.Title = title;
        media.ThumbURL = thumbURL;
        media.MP3Source = mp3Source;
        media.OGGSource = oggSource;
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
            this.userStateChange();
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


