// This is all pretty bad code. Should be thoroughly reorganized.


import { MyUser, Media, Session, UserState, WsMessage } from "./Contracts";
import { UICallbacks, UI } from "./UI";
import { MySocket, ClientActions } from "./Sockets";
import { IPlayer } from "./IPlayer";
import { PodcastPlayer } from "./PodcastPlayer";
import { YtPlayer } from "./YtPlayer";
import { ISearcher } from "./ISearcher";
import { YtSearcher } from "./YtSearcher";

declare var mobileBrowser: boolean;
// declare var playerType: string;
declare var gapi: any;


class RoomManager implements UICallbacks, ClientActions {

    mUser: MyUser;
    mSession: Session;
    mSearcher: ISearcher;
    mPlayer: IPlayer; 
    mSocket: MySocket;
    mUI: UI;

    constructor() {

        // TODO: find a better way to expose these functions to html?
        (<any>window).queueSelectedVideo = this.queueSelectedVideo;
        (<any>window).requestSyncWithUser = this.requestSyncWithUser;
        (<any>window).deleteMedia = this.deleteMedia;

        this.mUser = new MyUser();
        this.mSession = new Session();

        // TODO: remove
        var playerType = "podcasts";
        if (playerType == "podcasts") {
            this.mPlayer = new PodcastPlayer(mobileBrowser);
        }
        else {
            this.mPlayer = new YtPlayer(mobileBrowser);
            // TODO: get rid of this key
            this.mSearcher = new YtSearcher('AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc');
        }

        this.mUI = new UI(mobileBrowser, this);
        this.mSocket = new MySocket(this);

        this.setupJamSession();
        this.mPlayer.initPlayer(this.onPlayerStateChange);

    }


    setupJamSession() {
        var pathname = window.location.pathname;
        var encodedSessionName = pathname.replace('\/rooms/', '');

        this.mSession.Name = decodeURI(encodedSessionName);
        this.mUser.Name = 'Anonymous';

        var message = new WsMessage();
        message.Action = 'UserJoinSession';
        message.User = this.mUser;
        message.Session = this.mSession;

        this.mSocket.emit(message);
    }

    //==================================================================
    // WebSocket message response functions
    //==================================================================

    clientProvideUserState(message: WsMessage) {
        var userToSyncWith = message.User;

        this.mUser.State.QueuePosition = userToSyncWith.State.QueuePosition;
        this.mUser.State.Time = userToSyncWith.State.Time;
        this.mUser.State.YTPlayerState = userToSyncWith.State.YTPlayerState;

        this.mUI.updateQueue(this.mSession.Queue, this.mUser.Id, this.mUser.State.QueuePosition);

        var currentMedia = this.mSession.Queue[this.mUser.State.QueuePosition];

        this.userStateChange();
    }

    clientRequestUserState(message: WsMessage) {
        var userData = new MyUser();
        userData.Id = message.User.Id; // TODO: bad bad bad
        userData.State.QueuePosition = this.mUser.State.QueuePosition;
        userData.State.Time = Math.round(this.mPlayer.getCurrentTime());
        userData.State.YTPlayerState = this.mPlayer.getCurrentState();

        var outgoingMsg = new WsMessage();
        outgoingMsg.Action = 'ProvideSyncToUser';
        outgoingMsg.User = userData;
        this.mSocket.emit(outgoingMsg);
    }


    clientUpdateUser(message: WsMessage) {
        var user = message.User;
        this.mUser = user;	
    }

    clientSessionReady(message: WsMessage) {
        this.mSession = message.Session;
        this.mUser = message.User;

        // TODO: get rid of this bullshit
        if (this.mSession.Queue.length == 0) {
            $("#p_current_content_info").text("Queue up a song!");
            $("#p_current_recommender_info").text("Use the search bar above.");
        }

        this.nextMedia();
        this.mUI.updateQueue(this.mSession.Queue, this.mUser.Id, this.mUser.State.QueuePosition);
        this.mUI.updateUsersList(this.mSession.Users, this.mUser.Id);
        this.mUI.sessionReady();
    }

    clientUpdateUsersList(message: WsMessage) {
        var users = message.Session.Users;
        this.mSession.Users = users;
        this.mUI.updateUsersList(this.mSession.Users, this.mUser.Id);	
    }

    clientUpdateQueue(message: WsMessage) {
        this.mSession.Queue = message.Session.Queue;
        if (this.mUser.State.Waiting) {
            this.nextMedia();
        }
        this.mUI.updateQueue(this.mSession.Queue, this.mUser.Id, this.mUser.State.QueuePosition);
    }

    clientChatMessage(message: WsMessage) {
        var chatMessage = message.ChatMessage;
        var userName = message.User.Name;
        this.mUI.onChatMessage(userName, chatMessage);
    }

    //
    // Mostly UI callback functions
    //

    onSendChatMessage(msg: string) {
        var message = new WsMessage();
        message.Action = 'ChatMessage';
        message.ChatMessage = msg;
        message.User = this.mUser;
        this.mSocket.emit(message);
    }

    onPlayerStateChange(event) {
        if(event.data==0) {
            this.nextMedia();
        }
    }

    search(query, callback: (media: Media[]) => void) {

    }

    nameChange(newName) {
        this.mUser.Name = newName;
        var message = new WsMessage();
        message.User = this.mUser;
        message.Action = 'SaveUserNameChange';
        this.mSocket.emit(message);
    }

    userStateChange() {
        if (this.mUser.State.QueuePosition >= 0 && this.mUser.State.QueuePosition < this.mSession.Queue.length) {
            this.mPlayer.setPlayerContent(this.mSession.Queue[this.mUser.State.QueuePosition], this.mUser.State.Time); 
            this.mUser.State.Waiting = false;
        }
        else if (this.mUser.State.QueuePosition < 0 || this.mUser.State.QueuePosition == this.mSession.Queue.length) {
            // TODO: set player content to 'waiting on next video'
            this.mUser.State.Waiting = true;
        }
        else if (this.mUser.State.QueuePosition == this.mSession.Queue.length) {
        }
    }

    nextMedia() {
        this.mUser.State.Time = 0;
        var queue = this.mSession.Queue;

        if(this.mUser.State.QueuePosition + 1 < queue.length) {
            this.mUser.State.QueuePosition = this.mUser.State.QueuePosition + 1;
        }
        else if (this.mUser.State.QueuePosition >= 0) {
            this.mUser.State.QueuePosition = queue.length;
        }

        this.userStateChange();
    }

    pauseMedia() {
        this.mPlayer.pause();
    }

    playMedia() {
        this.mPlayer.play();
    }

    previousMedia() {
        this.mUser.State.Time = 0;
        var queue = this.mSession.Queue;
        if(this.mUser.State.QueuePosition > 0) {
            this.mUser.State.QueuePosition = this.mUser.State.QueuePosition - 1;
            this.userStateChange();
        }
    }


    //==================================================================
    // These functions are called directly embedded into the html... kinda weird
    //==================================================================

    requestSyncWithUser(userId) {
        console.log('request sync with user');

        var user = new MyUser();
        user.Id = userId;
        var message = new WsMessage();
        message.Action = 'RequestSyncWithUser';
        message.User = user;
        this.mSocket.emit(message);
    }

    queueSelectedVideo(elmnt) {

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
        media.UserId = this.mUser.Id;
        media.UserName = this.mUser.Name;

        var message = new WsMessage();
        message.Action = 'AddMediaToSession';
        message.Media = media;

        //TODO: local add media
        this.mSocket.emit(message);
    }


    deleteMedia(mediaId: number, position: number) {

        this.mSession.Queue.splice(position, 1);
        if (this.mUser.State.QueuePosition >= position) {
            this.mUser.State.QueuePosition -= 1;
            this.userStateChange();
        }
        this.mUI.updateQueue(this.mSession.Queue, this.mUser.Id, this.mUser.State.QueuePosition);

        var mediaToDelete = new Media();
        mediaToDelete.Id = mediaId;

        var message = new WsMessage();
        message.Action = 'DeleteMediaFromSession';
        message.Media = mediaToDelete;

        this.mSocket.emit(message);
    }


}


$(document).ready(function () {

});


