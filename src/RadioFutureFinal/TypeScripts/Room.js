"use strict";
var Contracts_1 = require("./Contracts");
var UI_1 = require("./UI");
var Sockets_1 = require("./Sockets");
var PodcastPlayer_1 = require("./PodcastPlayer");
var YtPlayer_1 = require("./YtPlayer");
var YtSearcher_1 = require("./YtSearcher");
var PodcastSearcher_1 = require("./PodcastSearcher");
var RoomManager = (function () {
    function RoomManager(roomType, mobileBrowser) {
        var _this = this;
        //==================================================================
        // These functions are called directly embedded into the html... kinda weird
        //==================================================================
        this.requestSyncWithUser = function (userId) {
            console.log('request sync with user');
            var user = new Contracts_1.MyUser();
            user.Id = userId;
            var message = new Contracts_1.WsMessage();
            message.Action = 'RequestSyncWithUser';
            message.User = user;
            _this.socket.emit(message);
        };
        this.queueSelectedVideo = function (elmnt) {
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
            media.UserId = _this.user.Id;
            media.UserName = _this.user.Name;
            var message = new Contracts_1.WsMessage();
            message.Action = 'AddMediaToSession';
            message.Media = media;
            //TODO: local add media
            _this.socket.emit(message);
        };
        this.deleteMedia = function (mediaId, position) {
            _this.session.Queue.splice(position, 1);
            if (_this.user.State.QueuePosition >= position) {
                _this.user.State.QueuePosition -= 1;
                _this.userStateChange();
            }
            _this.ui.updateQueue(_this.session.Queue, _this.user.Id, _this.user.State.QueuePosition);
            var mediaToDelete = new Contracts_1.Media();
            mediaToDelete.Id = mediaId;
            var message = new Contracts_1.WsMessage();
            message.Action = 'DeleteMediaFromSession';
            message.Media = mediaToDelete;
            _this.socket.emit(message);
        };
        // TODO: find a better way to expose these functions to html?
        window.queueSelectedVideo = this.queueSelectedVideo;
        window.requestSyncWithUser = this.requestSyncWithUser;
        window.deleteMedia = this.deleteMedia;
        this.roomType = roomType;
        this.mobileBrowser = mobileBrowser;
    }
    RoomManager.prototype.init = function (encodedSessionName) {
        this.user = new Contracts_1.MyUser();
        this.session = new Contracts_1.Session();
        if (this.roomType == "podcasts") {
            this.player = new PodcastPlayer_1.PodcastPlayer(this.mobileBrowser);
            this.searcher = new PodcastSearcher_1.PodcastSearcher();
        }
        else {
            // TODO: get rid of this key
            this.searcher = new YtSearcher_1.YtSearcher('AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc');
            this.player = new YtPlayer_1.YtPlayer(this.mobileBrowser);
        }
        this.ui = new UI_1.UI(this.mobileBrowser, this);
        this.socket = new Sockets_1.MySocket(this);
        this.setupJamSession(encodedSessionName);
        this.player.initPlayer(this.onPlayerStateChange);
    };
    RoomManager.prototype.setupJamSession = function (encodedSessionName) {
        this.session.Name = decodeURI(encodedSessionName);
        this.user.Name = 'Anonymous';
        var message = new Contracts_1.WsMessage();
        message.Action = 'UserJoinSession';
        message.User = this.user;
        message.Session = this.session;
        this.socket.emit(message);
    };
    //==================================================================
    // WebSocket message response functions
    //==================================================================
    RoomManager.prototype.clientProvideUserState = function (message) {
        var userToSyncWith = message.User;
        this.user.State.QueuePosition = userToSyncWith.State.QueuePosition;
        this.user.State.Time = userToSyncWith.State.Time;
        this.user.State.YTPlayerState = userToSyncWith.State.YTPlayerState;
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        var currentMedia = this.session.Queue[this.user.State.QueuePosition];
        this.userStateChange();
    };
    RoomManager.prototype.clientRequestUserState = function (message) {
        var userData = new Contracts_1.MyUser();
        userData.Id = message.User.Id; // TODO: bad bad bad
        userData.State.QueuePosition = this.user.State.QueuePosition;
        userData.State.Time = Math.round(this.player.getCurrentTime());
        userData.State.YTPlayerState = this.player.getCurrentState();
        var outgoingMsg = new Contracts_1.WsMessage();
        outgoingMsg.Action = 'ProvideSyncToUser';
        outgoingMsg.User = userData;
        this.socket.emit(outgoingMsg);
    };
    RoomManager.prototype.clientUpdateUser = function (message) {
        var user = message.User;
        this.user = user;
    };
    RoomManager.prototype.clientSessionReady = function (message) {
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
    };
    RoomManager.prototype.clientUpdateUsersList = function (message) {
        var users = message.Session.Users;
        this.session.Users = users;
        this.ui.updateUsersList(this.session.Users, this.user.Id);
    };
    RoomManager.prototype.clientUpdateQueue = function (message) {
        this.session.Queue = message.Session.Queue;
        if (this.user.State.Waiting) {
            this.nextMedia();
        }
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
    };
    RoomManager.prototype.clientChatMessage = function (message) {
        var chatMessage = message.ChatMessage;
        var userName = message.User.Name;
        this.ui.onChatMessage(userName, chatMessage);
    };
    RoomManager.prototype.clientSetupAudioAPI = function (message) {
        // TODO: better mechanism for different players
        if (this.roomType == "podcasts") {
            // TODO: better message structure
            // TODO: ensure this isn't awfully insecure
            var id = message.User.Name;
            var secret = message.Media.Title;
            this.searcher.init(secret, id);
        }
    };
    RoomManager.prototype.clientSetupYTAPI = function (message) {
        if (this.roomType != "podcasts") {
            var secret = message.Media.Title;
            this.searcher.init(secret);
        }
    };
    //
    // Mostly UI callback functions
    //
    RoomManager.prototype.onSendChatMessage = function (msg) {
        var message = new Contracts_1.WsMessage();
        message.Action = 'ChatMessage';
        message.ChatMessage = msg;
        message.User = this.user;
        this.socket.emit(message);
    };
    RoomManager.prototype.onPlayerStateChange = function (event) {
        if (event.data == 0) {
            this.nextMedia();
        }
    };
    RoomManager.prototype.search = function (query, callback) {
        this.searcher.search(query, callback);
    };
    RoomManager.prototype.nameChange = function (newName) {
        this.user.Name = newName;
        var message = new Contracts_1.WsMessage();
        message.User = this.user;
        message.Action = 'SaveUserNameChange';
        this.socket.emit(message);
    };
    RoomManager.prototype.userStateChange = function () {
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
    };
    RoomManager.prototype.nextMedia = function () {
        this.user.State.Time = 0;
        var queue = this.session.Queue;
        if (this.user.State.QueuePosition + 1 < queue.length) {
            this.user.State.QueuePosition = this.user.State.QueuePosition + 1;
        }
        else if (this.user.State.QueuePosition >= 0) {
            this.user.State.QueuePosition = queue.length;
        }
        this.userStateChange();
    };
    RoomManager.prototype.pauseMedia = function () {
        this.player.pause();
    };
    RoomManager.prototype.playMedia = function () {
        this.player.play();
    };
    RoomManager.prototype.previousMedia = function () {
        this.user.State.Time = 0;
        var queue = this.session.Queue;
        if (this.user.State.QueuePosition > 0) {
            this.user.State.QueuePosition = this.user.State.QueuePosition - 1;
            this.userStateChange();
        }
    };
    return RoomManager;
}());
var mRoomManager = new RoomManager(roomType, mobileBrowser);
$(document).ready(function () {
    mRoomManager.init(roomName);
});
//# sourceMappingURL=Room.js.map