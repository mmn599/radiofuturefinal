// This is all pretty bad code. Should be thoroughly reorganized.
"use strict";
var Contracts_1 = require("./Contracts");
var UI_1 = require("./UI");
var Sockets_1 = require("./Sockets");
var PodcastPlayer_1 = require("./PodcastPlayer");
var YtPlayer_1 = require("./YtPlayer");
var YtSearcher_1 = require("./YtSearcher");
var RoomManager = (function () {
    function RoomManager() {
        // TODO: find a better way to expose these functions to html?
        window.queueSelectedVideo = this.queueSelectedVideo;
        window.requestSyncWithUser = this.requestSyncWithUser;
        window.deleteMedia = this.deleteMedia;
        this.mUser = new Contracts_1.MyUser();
        this.mSession = new Contracts_1.Session();
        // TODO: remove
        var playerType = "podcasts";
        if (playerType == "podcasts") {
            this.mPlayer = new PodcastPlayer_1.PodcastPlayer(mobileBrowser);
        }
        else {
            this.mPlayer = new YtPlayer_1.YtPlayer(mobileBrowser);
            // TODO: get rid of this key
            this.mSearcher = new YtSearcher_1.YtSearcher('AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc');
        }
        this.mUI = new UI_1.UI(mobileBrowser, this);
        this.mSocket = new Sockets_1.MySocket(this);
        this.setupJamSession();
        this.mPlayer.initPlayer(this.onPlayerStateChange);
    }
    RoomManager.prototype.setupJamSession = function () {
        var pathname = window.location.pathname;
        var encodedSessionName = pathname.replace('\/rooms/', '');
        this.mSession.Name = decodeURI(encodedSessionName);
        this.mUser.Name = 'Anonymous';
        var message = new Contracts_1.WsMessage();
        message.Action = 'UserJoinSession';
        message.User = this.mUser;
        message.Session = this.mSession;
        this.mSocket.emit(message);
    };
    //==================================================================
    // WebSocket message response functions
    //==================================================================
    RoomManager.prototype.clientProvideUserState = function (message) {
        var userToSyncWith = message.User;
        this.mUser.State.QueuePosition = userToSyncWith.State.QueuePosition;
        this.mUser.State.Time = userToSyncWith.State.Time;
        this.mUser.State.YTPlayerState = userToSyncWith.State.YTPlayerState;
        this.mUI.updateQueue(this.mSession.Queue, this.mUser.Id, this.mUser.State.QueuePosition);
        var currentMedia = this.mSession.Queue[this.mUser.State.QueuePosition];
        this.userStateChange();
    };
    RoomManager.prototype.clientRequestUserState = function (message) {
        var userData = new Contracts_1.MyUser();
        userData.Id = message.User.Id; // TODO: bad bad bad
        userData.State.QueuePosition = this.mUser.State.QueuePosition;
        userData.State.Time = Math.round(this.mPlayer.getCurrentTime());
        userData.State.YTPlayerState = this.mPlayer.getCurrentState();
        var outgoingMsg = new Contracts_1.WsMessage();
        outgoingMsg.Action = 'ProvideSyncToUser';
        outgoingMsg.User = userData;
        this.mSocket.emit(outgoingMsg);
    };
    RoomManager.prototype.clientUpdateUser = function (message) {
        var user = message.User;
        this.mUser = user;
    };
    RoomManager.prototype.clientSessionReady = function (message) {
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
    };
    RoomManager.prototype.clientUpdateUsersList = function (message) {
        var users = message.Session.Users;
        this.mSession.Users = users;
        this.mUI.updateUsersList(this.mSession.Users, this.mUser.Id);
    };
    RoomManager.prototype.clientUpdateQueue = function (message) {
        this.mSession.Queue = message.Session.Queue;
        if (this.mUser.State.Waiting) {
            this.nextMedia();
        }
        this.mUI.updateQueue(this.mSession.Queue, this.mUser.Id, this.mUser.State.QueuePosition);
    };
    RoomManager.prototype.clientChatMessage = function (message) {
        var chatMessage = message.ChatMessage;
        var userName = message.User.Name;
        this.mUI.onChatMessage(userName, chatMessage);
    };
    //
    // Mostly UI callback functions
    //
    RoomManager.prototype.onSendChatMessage = function (msg) {
        var message = new Contracts_1.WsMessage();
        message.Action = 'ChatMessage';
        message.ChatMessage = msg;
        message.User = this.mUser;
        this.mSocket.emit(message);
    };
    RoomManager.prototype.onPlayerStateChange = function (event) {
        if (event.data == 0) {
            this.nextMedia();
        }
    };
    RoomManager.prototype.search = function (query, callback) {
    };
    RoomManager.prototype.nameChange = function (newName) {
        this.mUser.Name = newName;
        var message = new Contracts_1.WsMessage();
        message.User = this.mUser;
        message.Action = 'SaveUserNameChange';
        this.mSocket.emit(message);
    };
    RoomManager.prototype.userStateChange = function () {
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
    };
    RoomManager.prototype.nextMedia = function () {
        this.mUser.State.Time = 0;
        var queue = this.mSession.Queue;
        if (this.mUser.State.QueuePosition + 1 < queue.length) {
            this.mUser.State.QueuePosition = this.mUser.State.QueuePosition + 1;
        }
        else if (this.mUser.State.QueuePosition >= 0) {
            this.mUser.State.QueuePosition = queue.length;
        }
        this.userStateChange();
    };
    RoomManager.prototype.pauseMedia = function () {
        this.mPlayer.pause();
    };
    RoomManager.prototype.playMedia = function () {
        this.mPlayer.play();
    };
    RoomManager.prototype.previousMedia = function () {
        this.mUser.State.Time = 0;
        var queue = this.mSession.Queue;
        if (this.mUser.State.QueuePosition > 0) {
            this.mUser.State.QueuePosition = this.mUser.State.QueuePosition - 1;
            this.userStateChange();
        }
    };
    //==================================================================
    // These functions are called directly embedded into the html... kinda weird
    //==================================================================
    RoomManager.prototype.requestSyncWithUser = function (userId) {
        console.log('request sync with user');
        var user = new Contracts_1.MyUser();
        user.Id = userId;
        var message = new Contracts_1.WsMessage();
        message.Action = 'RequestSyncWithUser';
        message.User = user;
        this.mSocket.emit(message);
    };
    RoomManager.prototype.queueSelectedVideo = function (elmnt) {
        $("#div_search_results").fadeOut();
        $("#input_search").val("");
        var videoId = elmnt.getAttribute('data-VideoId');
        var title = elmnt.innerText || elmnt.textContent;
        var thumbURL = elmnt.getAttribute('data-ThumbURL');
        var mp3Source = elmnt.getAttribute('data-MP3Source');
        var oggSource = elmnt.getAttribute('data-OGGSource');
        var media = new Contracts_1.Media();
        media.YTVideoID = videoId;
        media.Title = title;
        media.ThumbURL = thumbURL;
        media.MP3Source = mp3Source;
        media.OGGSource = oggSource;
        media.UserId = this.mUser.Id;
        media.UserName = this.mUser.Name;
        var message = new Contracts_1.WsMessage();
        message.Action = 'AddMediaToSession';
        message.Media = media;
        //TODO: local add media
        this.mSocket.emit(message);
    };
    RoomManager.prototype.deleteMedia = function (mediaId, position) {
        this.mSession.Queue.splice(position, 1);
        if (this.mUser.State.QueuePosition >= position) {
            this.mUser.State.QueuePosition -= 1;
            this.userStateChange();
        }
        this.mUI.updateQueue(this.mSession.Queue, this.mUser.Id, this.mUser.State.QueuePosition);
        var mediaToDelete = new Contracts_1.Media();
        mediaToDelete.Id = mediaId;
        var message = new Contracts_1.WsMessage();
        message.Action = 'DeleteMediaFromSession';
        message.Media = mediaToDelete;
        this.mSocket.emit(message);
    };
    return RoomManager;
}());
$(document).ready(function () {
});
//# sourceMappingURL=Room.js.map