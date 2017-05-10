"use strict";
var UI_1 = require("./UI");
var PodcastPlayer_1 = require("./PodcastPlayer");
var Requestor_1 = require("./Requestor");
var RoomManager = (function () {
    function RoomManager(mobileBrowser) {
        var _this = this;
        this.uiNextMedia = function () {
            var queue = _this.session.Queue;
            if (_this.queuePosition + 1 < queue.length) {
                _this.queuePosition += 1;
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
            var queue = _this.session.Queue;
            if (_this.queuePosition > 0) {
                _this.queuePosition = _this.queuePosition - 1;
                _this.onUserStateChange();
            }
        };
        this.uiQueueMedia = function (media) {
            _this.requestor.AddMediaToSession(_this.session.Id, media, _this.clientUpdateQueue);
        };
        this.uiDeleteMedia = function (mediaId, position) {
            _this.session.Queue.splice(position, 1);
            if (_this.queuePosition >= position) {
                _this.queuePosition -= 1;
                _this.onUserStateChange();
            }
            _this.ui.updateQueue(_this.session.Queue, _this.queuePosition);
            _this.requestor.DeleteMediaFromSession(_this.session.Id, mediaId, _this.clientUpdateQueue);
        };
        //
        // Misc
        //
        this.isUserWaiting = function () {
            var pos = _this.queuePosition;
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
        this.queuePosition = -1;
        this.mobileBrowser = mobileBrowser;
        this.ui = new UI_1.UI(this.mobileBrowser, this);
        this.player = new PodcastPlayer_1.PodcastPlayer(this.ui, this.mobileBrowser, this.uiNextMedia, this.uiPreviousMedia, this.onPlayerStateChange);
        this.requestor = new Requestor_1.Requestor();
    }
    RoomManager.prototype.init = function (encodedSessionName) {
        var sessionName = decodeURI(encodedSessionName);
        this.requestor.JoinSession(sessionName, this.clientSessionReady);
    };
    //==================================================================
    // Webrequestor message response functions
    //==================================================================
    RoomManager.prototype.clientSessionReady = function (session) {
        this.session = session;
        this.uiNextMedia();
        this.ui.updateQueue(this.session.Queue, this.queuePosition);
        this.ui.sessionReady();
    };
    RoomManager.prototype.clientSearchResults = function (searchResults) {
        this.ui.onSearchResults(searchResults);
    };
    RoomManager.prototype.clientUpdateQueue = function (updatedQueue) {
        var wasWaiting = this.isUserWaiting();
        this.session.Queue = updatedQueue;
        if (wasWaiting) {
            this.uiNextMedia();
        }
        this.ui.updateQueue(this.session.Queue, this.queuePosition);
    };
    //
    // Mostly UI callback functions
    //
    RoomManager.prototype.uiSearch = function (query, page) {
        this.requestor.Search(query, page, this.clientSearchResults);
    };
    RoomManager.prototype.uiGoToMedia = function (newQueuePosition) {
        this.queuePosition = newQueuePosition;
        this.onUserStateChange();
    };
    RoomManager.prototype.onUserStateChange = function () {
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
    };
    return RoomManager;
}());
var mRoomManager = new RoomManager(mobileBrowser);
$(document).ready(function () {
    mRoomManager.init(roomName);
});
//# sourceMappingURL=Room.js.map