"use strict";
var Contracts_1 = require("./Contracts");
var UI_1 = require("./UI");
var Sockets_1 = require("./Sockets");
var PodcastPlayer_1 = require("./PodcastPlayer");
var RoomManager = (function () {
    function RoomManager(roomType, mobileBrowser) {
        var _this = this;
        this.uiNextMedia = function () {
            var queue = _this.session.Queue;
            if (_this.user.State.QueuePosition + 1 < queue.length) {
                _this.user.State.Time = 0;
                _this.user.State.QueuePosition += 1;
                _this.onUserStateChange();
            }
        };
        this.uiPauseMedia = function () {
            _this.player.pause();
        };
        this.uiPlayMedia = function () {
            _this.player.play();
        };
        this.uiPreviousMedia = function () {
            _this.user.State.Time = 0;
            var queue = _this.session.Queue;
            if (_this.user.State.QueuePosition > 0) {
                _this.user.State.QueuePosition = _this.user.State.QueuePosition - 1;
                _this.onUserStateChange();
            }
        };
        this.uiQueueMedia = function (media) {
            // TODO: awkward
            media.UserId = _this.user.Id;
            media.UserName = _this.user.Name;
            _this.socket.AddMediaToSession(media);
        };
        this.uiDeleteMedia = function (mediaId, position) {
            // TODO: important: this should be done once the update is sent from server
            _this.session.Queue.splice(position, 1);
            if (_this.user.State.QueuePosition >= position) {
                _this.user.State.QueuePosition -= 1;
                _this.onUserStateChange();
            }
            _this.ui.updateQueue(_this.session.Queue, _this.user.Id, _this.user.State.QueuePosition);
            _this.socket.DeleteMediaFromSession(mediaId);
        };
        this.uiRequestSyncWithUser = function (userId) {
            _this.socket.RequestSyncWithUser(userId);
        };
        //
        // Misc
        //
        this.isUserWaiting = function () {
            var pos = _this.user.State.QueuePosition;
            var length = _this.session.Queue.length;
            return pos < 0 || ((pos == (length - 1)) && _this.player.isStopped());
        };
        this.onPlayerStateChange = function (event) {
            if (event.data == 0) {
                _this.uiNextMedia();
            }
        };
        this.onFatalError = function () {
            $("#div_everything").hide();
            $("#div_error").show();
        };
        this.roomType = roomType;
        this.mobileBrowser = mobileBrowser;
    }
    RoomManager.prototype.init = function (encodedSessionName) {
        this.user = new Contracts_1.MyUser();
        this.session = new Contracts_1.Session();
        this.ui = new UI_1.UI(this.mobileBrowser, this);
        //if (this.roomType == "podcasts") {
        this.player = new PodcastPlayer_1.PodcastPlayer(this.ui, this.mobileBrowser, this.uiNextMedia, this.uiPreviousMedia);
        //}
        //else {
        //    this.player = new YtPlayer(this.ui, this.mobileBrowser);
        //}
        this.socket = new Sockets_1.MySocket(this);
        this.setupJamSession(encodedSessionName);
        this.player.initPlayer(this.onPlayerStateChange);
    };
    RoomManager.prototype.setupJamSession = function (encodedSessionName) {
        this.session.Name = decodeURI(encodedSessionName);
        this.user.Name = 'Anonymous';
        this.socket.JoinSession(this.session.Name);
    };
    //==================================================================
    // WebSocket message response functions
    //==================================================================
    RoomManager.prototype.clientProvideUserState = function (msg) {
        this.user.State.QueuePosition = msg.userState.QueuePosition;
        this.user.State.Time = msg.userState.Time;
        this.user.State.PlayerState = msg.userState.PlayerState;
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        this.onUserStateChange();
    };
    RoomManager.prototype.clientRequestUserState = function (msg) {
        var myUserState = new Contracts_1.UserState();
        myUserState.QueuePosition = this.user.State.QueuePosition;
        myUserState.Time = Math.round(this.player.getCurrentTime());
        myUserState.PlayerState = this.player.getCurrentState();
        this.socket.ProvideSyncToUser(myUserState, msg.userIdRequestor);
    };
    RoomManager.prototype.clientSessionReady = function (msg) {
        this.session = msg.session;
        this.user = msg.user;
        this.uiNextMedia();
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        this.ui.updateUsersList(this.session.Users, this.user.Id);
        this.ui.sessionReady();
    };
    RoomManager.prototype.clientUpdateUsersList = function (msg) {
        this.session.Users = msg.users;
        this.ui.updateUsersList(this.session.Users, this.user.Id);
    };
    RoomManager.prototype.clientUpdateQueue = function (msg) {
        var wasWaiting = this.isUserWaiting();
        this.session.Queue = msg.queue;
        if (wasWaiting) {
            this.uiNextMedia();
        }
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
    };
    RoomManager.prototype.clientChatMessage = function (msg) {
        this.ui.onChatMessage(msg.userName, msg.message, 'blue');
    };
    RoomManager.prototype.clientSearchResults = function (msg) {
        this.ui.onSearchResults(msg.searchResults);
    };
    //
    // Mostly UI callback functions
    //
    RoomManager.prototype.uiSendChatMessage = function (msg) {
        this.socket.ChatMessage(msg, this.user.Name);
    };
    RoomManager.prototype.uiSearch = function (query, page) {
        this.socket.Search(query, page);
    };
    RoomManager.prototype.uiNameChange = function (newName) {
        this.user.Name = newName;
        this.socket.SaveUserNameChange(this.user.Id, this.user.Name);
    };
    RoomManager.prototype.uiGoToMedia = function (newQueuePosition) {
        this.user.State.QueuePosition = newQueuePosition;
        this.user.State.Time = 0;
        this.onUserStateChange();
    };
    RoomManager.prototype.onUserStateChange = function () {
        if (this.user.State.QueuePosition >= 0 && this.user.State.QueuePosition < this.session.Queue.length) {
            this.player.setPlayerContent(this.session.Queue[this.user.State.QueuePosition], this.user.State.Time);
            this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        }
        else if (this.user.State.QueuePosition < 0) {
            this.player.nothingPlaying();
        }
    };
    return RoomManager;
}());
var mRoomManager = new RoomManager(roomType, mobileBrowser);
$(document).ready(function () {
    mRoomManager.init(roomName);
});
//# sourceMappingURL=Room.js.map