"use strict";
var UI_1 = require("./UI");
var PodcastPlayer_1 = require("./PodcastPlayer");
var Requestor_1 = require("./Requestor");
var RoomManager = (function () {
    function RoomManager(mobileBrowser) {
        var _this = this;
        //==================================================================
        // Webrequestor message response functions
        //==================================================================
        this.clientSessionReady = function (session) {
            _this.session = session;
            _this.uiNextMedia();
            _this.ui.updateQueue(_this.session.queue, _this.queuePosition);
            _this.ui.sessionReady();
        };
        this.clientSearchResults = function (searchResults) {
            _this.ui.onSearchResults(searchResults);
        };
        this.clientUpdateQueue = function (updatedQueue) {
            var wasWaiting = _this.isUserWaiting();
            _this.session.queue = updatedQueue;
            if (wasWaiting) {
                _this.uiNextMedia();
            }
            _this.ui.updateQueue(_this.session.queue, _this.queuePosition);
        };
        this.uiNextMedia = function () {
            var queue = _this.session.queue;
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
            var queue = _this.session.queue;
            if (_this.queuePosition > 0) {
                _this.queuePosition = _this.queuePosition - 1;
                _this.onUserStateChange();
            }
        };
        this.uiQueueMedia = function (media) {
            _this.requestor.AddMediaToSession(_this.session.id, media, _this.clientUpdateQueue);
        };
        this.uiDeleteMedia = function (mediaId, position) {
            _this.session.queue.splice(position, 1);
            if (_this.queuePosition >= position) {
                _this.queuePosition -= 1;
                _this.onUserStateChange();
            }
            _this.ui.updateQueue(_this.session.queue, _this.queuePosition);
            _this.requestor.DeleteMediaFromSession(_this.session.id, mediaId, _this.clientUpdateQueue);
        };
        //
        // Misc
        //
        this.isUserWaiting = function () {
            var pos = _this.queuePosition;
            var length = _this.session.queue.length;
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
        this.player = new PodcastPlayer_1.PodcastPlayer(this.ui, mobileBrowser);
        this.requestor = new Requestor_1.Requestor();
    }
    RoomManager.prototype.init = function (sessionName) {
        this.ui.initialize();
        this.player.initialize(this.onPlayerStateChange, this.uiNextMedia, this.uiPreviousMedia);
        var sessionName = decodeURI(sessionName);
        this.requestor.JoinSession(sessionName, this.clientSessionReady);
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
        if (this.queuePosition >= 0 && this.queuePosition < this.session.queue.length) {
            this.player.setPlayerContent(this.session.queue[this.queuePosition]);
            this.ui.updateQueue(this.session.queue, this.queuePosition);
        }
        else if (this.queuePosition < 0) {
            this.player.nothingPlaying();
        }
        else if (this.queuePosition >= this.session.queue.length) {
            this.queuePosition = this.session.queue.length;
        }
    };
    return RoomManager;
}());
var mRoomManager = new RoomManager(mobileBrowser);
$(document).ready(function () {
    mRoomManager.init(roomName);
});
//# sourceMappingURL=Room.js.map