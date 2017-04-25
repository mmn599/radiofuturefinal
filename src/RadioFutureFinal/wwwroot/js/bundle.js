(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Media = (function () {
    function Media() {
    }
    return Media;
}());
exports.Media = Media;
var MyUser = (function () {
    function MyUser() {
        this.State = new UserState();
    }
    return MyUser;
}());
exports.MyUser = MyUser;
var UserState = (function () {
    function UserState() {
    }
    return UserState;
}());
exports.UserState = UserState;
var Session = (function () {
    function Session() {
    }
    return Session;
}());
exports.Session = Session;
var WsMessage = (function () {
    function WsMessage() {
    }
    return WsMessage;
}());
exports.WsMessage = WsMessage;
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Player = (function () {
    function Player(mobileBrowser) {
        var _this = this;
        this.onPlayerReady = function () {
            _this.playerReady = true;
        };
        this.playerReady = false;
        this.mobileBrowser = mobileBrowser;
    }
    Player.prototype.initializeYtPlayer = function (onPlayerStateChange) {
        this.ytPlayer = new YT.Player('div_yt_player', {
            height: 'auto',
            width: '100%',
            playerVars: {
                controls: 1,
                showinfo: 0,
                autoplay: 0
            },
            events: {
                'onReady': this.onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        if (this.mobileBrowser) {
            var div_player = $("#div_player");
            div_player.height(div_player.width() * 9.0 / 16.0);
        }
    };
    Player.prototype.setPlayerContent = function (media, time) {
        var _this = this;
        if (!this.playerReady) {
            console.log('player not ready!');
            setTimeout(function (media, time) { _this.setPlayerContent(media, time); }, 50);
        }
        else {
            this.updatePlayerUI(media, time);
            this.play();
        }
    };
    Player.prototype.play = function () {
        this.ytPlayer.playVideo();
    };
    Player.prototype.pause = function () {
        this.ytPlayer.pauseVideo();
    };
    Player.prototype.getCurrentTime = function () {
        return Math.round(this.ytPlayer.getCurrentTime());
    };
    Player.prototype.getCurrentState = function () {
        return Math.round(this.ytPlayer.getPlayerState());
    };
    Player.prototype.updatePlayerUI = function (media, time) {
        this.ytPlayer.loadVideoById(media.YTVideoID, time, "large");
        $("#p_cc_summary").text(media.VideoTitle);
        if (!this.mobileBrowser) {
            var html = '<div style="text-align: left; display: flex; align-items: center;">' +
                '<img style="height: 90px; width: 160px; margin-right: 16px;" src="' + media.ThumbURL + '"/>' +
                '<span style="margin-right: 16px;">' + media.VideoTitle + '<br>' + 'Recommended by: ' + media.UserName + '</span>' +
                '</div>';
            $("#div_cc_results").html(html);
        }
    };
    return Player;
}());
exports.Player = Player;
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: find a better way to expose these functions to html?
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.ytApiReady = ytApiReady;
window.queueSelectedVideo = queueSelectedVideo;
window.requestSyncWithUser = requestSyncWithUser;
var Contracts_1 = require("./Contracts");
var ui_1 = require("./ui");
var Sockets_1 = require("./Sockets");
var Player_1 = require("./Player");
var mUser = new Contracts_1.MyUser();
var mSession = new Contracts_1.Session();
var mUI;
var mPlayer;
var mSocket;
$(document).ready(function () {
    var callbacks = new ui_1.UICallbacks();
    callbacks.onSendChatMessage = sendChatMessage;
    callbacks.nameChange = saveUserNameChange;
    callbacks.nextMedia = nextVideoInQueue;
    callbacks.pauseMedia = pauseVideo;
    callbacks.playMedia = playVideo;
    callbacks.previousMedia = previousVideoInQueue;
    callbacks.search = searchVideos;
    mUI = new ui_1.UI(mobileBrowser, callbacks);
    mPlayer = new Player_1.Player(mobileBrowser);
    mSocket = new Sockets_1.MySocket(mMessageFunctions);
    setupJamSession();
});
function setupJamSession() {
    var pathname = window.location.pathname;
    var encodedSessionName = pathname.replace('\/rooms/', '');
    mSession.Name = decodeURI(encodedSessionName);
    mUser.Name = 'Anonymous';
    var message = new Contracts_1.WsMessage();
    message.Action = 'UserJoinSession';
    message.User = mUser;
    message.Session = mSession;
    mSocket.emit(message);
}
//==================================================================
// Functions automatically called when youtube api's are ready
//==================================================================
function onYouTubeIframeAPIReady() {
    mPlayer.initializeYtPlayer(onPlayerStateChange);
}
function ytApiReady() {
    gapi.client.setApiKey("AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc");
    gapi.client.load("youtube", "v3", function () { });
}
function onPlayerStateChange(event) {
    if (event.data == 0) {
        nextVideoInQueue();
    }
}
//==================================================================
// WebSocket message response functions
//==================================================================
var mMessageFunctions = {
    'updateUser': onUpdateMeUser,
    'sessionReady': onSessionReady,
    'updateUsersList': onUpdateUsersList,
    'updateQueue': onUpdateQueue,
    'ChatMessage': onReceivedChatMessage,
    'requestUserState': onRequestMyUserState,
    'provideUserState': onUserStateProvided
};
function onUserStateProvided(message) {
    var userToSyncWith = message.User;
    mUser.State.QueuePosition = userToSyncWith.State.QueuePosition;
    mUser.State.Time = userToSyncWith.State.Time;
    mUser.State.YTPlayerState = userToSyncWith.State.YTPlayerState;
    mUI.updateQueue(mSession.Queue, mUser.State.QueuePosition);
    var currentMedia = mSession.Queue[mUser.State.QueuePosition];
    mPlayer.setPlayerContent(currentMedia, mUser.State.Time);
}
function onRequestMyUserState(message) {
    var userData = new Contracts_1.MyUser();
    userData.Id = message.User.Id; // TODO: bad bad bad
    userData.State.QueuePosition = mUser.State.QueuePosition;
    userData.State.Time = Math.round(mPlayer.getCurrentTime());
    userData.State.YTPlayerState = mPlayer.getCurrentState();
    var outgoingMsg = new Contracts_1.WsMessage();
    outgoingMsg.Action = 'ProvideSyncToUser';
    outgoingMsg.User = userData;
    mSocket.emit(outgoingMsg);
}
function onUpdateMeUser(message) {
    var user = message.User;
    mUser = user;
}
function onSessionReady(message) {
    mSession = message.Session;
    mUser = message.User;
    if (mSession.Queue.length == 0) {
        $("#p_current_content_info").text("Queue up a song!");
        $("#p_current_recommender_info").text("Use the search bar above.");
    }
    nextVideoInQueue();
    mUI.updateUsersList(mSession.Users, mUser.Id);
    mUI.sessionReady();
}
function onUpdateUsersList(message) {
    var users = message.Session.Users;
    mSession.Users = users;
    mUI.updateUsersList(mSession.Users, mUser.Id);
}
function onUpdateQueue(message) {
    mSession.Queue = message.Session.Queue;
    if (mUser.State.Waiting) {
        nextVideoInQueue();
    }
    mUI.updateQueue(mSession.Queue, mUser.State.QueuePosition);
}
function onReceivedChatMessage(message) {
    var chatMessage = message.ChatMessage;
    var userName = message.User.Name;
    mUI.onChatMessage(userName, chatMessage);
}
function sendChatMessage(msg) {
    var message = new Contracts_1.WsMessage();
    message.Action = 'ChatMessage';
    message.ChatMessage = msg;
    message.User = mUser;
    mSocket.emit(message);
}
function searchVideos(query, callback) {
    var request = gapi.client.youtube.search.list({
        part: "snippet",
        type: "video",
        q: encodeURIComponent(query).replace(/%20/g, "+"),
        maxResults: 5
    });
    request.execute(callback);
}
function saveUserNameChange(newName) {
    mUser.Name = newName;
    var message = new Contracts_1.WsMessage();
    message.User = mUser;
    message.Action = 'SaveUserNameChange';
    mSocket.emit(message);
}
function nextVideoInQueue() {
    mUser.State.Time = 0;
    var queue = mSession.Queue;
    if (mUser.State.QueuePosition + 1 < queue.length) {
        mUser.State.QueuePosition = mUser.State.QueuePosition + 1;
        mPlayer.setPlayerContent(mSession.Queue[mUser.State.QueuePosition], mUser.State.Time);
        mUser.State.Waiting = false;
    }
    else {
        mUser.State.Waiting = true;
    }
}
function pauseVideo() {
    mPlayer.pause();
}
function playVideo() {
    mPlayer.play();
}
function previousVideoInQueue() {
    mUser.State.Time = 0;
    var queue = mSession.Queue;
    if (mUser.State.QueuePosition > 0) {
        mUser.State.QueuePosition = mUser.State.QueuePosition - 1;
        mPlayer.setPlayerContent(mSession.Queue[mUser.State.QueuePosition], mUser.State.Time);
        mUser.State.Waiting = false;
    }
}
//==================================================================
// These functions are called directly embedded into the html... kinda weird
//==================================================================
function requestSyncWithUser(userId) {
    console.log('request sync with user');
    var user = new Contracts_1.MyUser();
    user.Id = userId;
    var message = new Contracts_1.WsMessage();
    message.Action = 'RequestSyncWithUser';
    message.User = user;
    mSocket.emit(message);
}
function queueSelectedVideo(elmnt) {
    $("#div_search_results").fadeOut();
    $("#input_search").val("");
    var VideoId = elmnt.getAttribute('data-VideoId');
    var Title = elmnt.innerText || elmnt.textContent;
    var ThumbURL = elmnt.getAttribute('data-ThumbURL');
    var media = new Contracts_1.Media();
    media.YTVideoID = VideoId;
    media.VideoTitle = Title;
    media.ThumbURL = ThumbURL;
    media.UserId = mUser.Id;
    media.UserName = mUser.Name;
    var message = new Contracts_1.WsMessage();
    message.Action = 'AddMediaToSession';
    message.Media = media;
    //TODO: local add media
    mSocket.emit(message);
}
// TODO: fix this
function deleteVideoInQueue(QueuePosition) {
    var id = mSession.Queue[QueuePosition].Id;
    mSession.Queue.splice(QueuePosition, 1);
    mUI.updateQueue(mSession.Queue, mUser.State.QueuePosition);
    var message = new Contracts_1.WsMessage();
    var mediaToDelete = new Contracts_1.Media();
    mediaToDelete.Id = id;
    message.Action = 'DeleteMediaFromSession';
    message.Media = mediaToDelete;
    mSocket.emit(message);
}
},{"./Contracts":1,"./Player":2,"./Sockets":4,"./ui":6}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MySocket = (function () {
    function MySocket(response_functions) {
        this.response_functions = response_functions;
        var uri = "ws://" + window.location.host + "/ws";
        var socket = new WebSocket(uri);
        socket.onopen = function (event) { };
        socket.onclose = function (event) { };
        socket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            var action = message.Action;
            var responsefunc = response_functions[action];
            // TODO: exception when not found
            responsefunc(message);
        };
        socket.onerror = function (event) { };
        this.socket = socket;
    }
    MySocket.prototype.emit = function (message) {
        var _this = this;
        if (this.socket.readyState === this.socket.CONNECTING) {
            setTimeout(function () {
                _this.emit(message);
            }, 100);
            return;
        }
        this.socket.send(JSON.stringify(message));
    };
    ;
    return MySocket;
}());
exports.MySocket = MySocket;
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FrameBuilder = (function () {
    function FrameBuilder(mobileBrowser) {
        this.mobileBrowser = mobileBrowser;
    }
    FrameBuilder.prototype.userMe = function (color, userName) {
        var currentHTML = "";
        if (this.mobileBrowser) {
            currentHTML = '<div class="div_user" style="background: ' + color + ';"> you </div>';
        }
        else {
            currentHTML =
                '<div style="text-align: left; display: flex; align-items: center;">' +
                    '<div style="display: flex; align-items: center; justify-content: center; float: left; cursor: pointer; margin-right: 16px; height: 48px; width: 48px; background: ' + color + ';">you</div>' +
                    '<span style="margin-right: 16px; float: right;">' + userName + '</span>' +
                    '</div>';
        }
        return currentHTML;
    };
    FrameBuilder.prototype.user = function (color, userId, userName) {
        var currentHTML = "";
        if (this.mobileBrowser) {
            currentHTML = '<div onclick="requestSyncWithUser(' + userId + ')" class="div_user" style="background: ' + color + ';">sync with ' + userName + '</div>';
        }
        else {
            currentHTML =
                '<div style="text-align: left; display: flex; align-items: center;">' +
                    '<div onclick="requestSyncWithUser(' + userId + ')" style="display: flex; align-items: center; justify-content: center; float: left; cursor: pointer; margin-right: 16px; height: 48px; width: 48px; background: ' + color + ';">sync</div>' +
                    '<span style="margin-right: 16px; float: right;">' + userName + '</span>' +
                    '</div>';
        }
        return currentHTML;
    };
    return FrameBuilder;
}());
exports.FrameBuilder = FrameBuilder;
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var frame_1 = require("./frame");
var UICallbacks = (function () {
    function UICallbacks() {
    }
    return UICallbacks;
}());
exports.UICallbacks = UICallbacks;
var UI = (function () {
    function UI(mobileBrowser, callbacks) {
        this.mobileBrowser = mobileBrowser;
        this.frameBuilder = new frame_1.FrameBuilder(mobileBrowser);
        this.callbacks = callbacks;
        this.initialize();
    }
    UI.prototype.initialize = function () {
        this.setupSpinnerUI();
        this.setupInfoRolloverUI();
        this.setupInputUI();
        this.setupPlayerControlButtons();
    };
    UI.prototype.sessionReady = function () {
        $("#div_loading").hide();
        this.spinner.stop();
        $("#div_everything").animate({ opacity: 1 }, 'fast');
    };
    UI.prototype.setupSpinnerUI = function () {
        var opts = {
            lines: 13 // The number of lines to draw
            ,
            length: 28 // The length of each line
            ,
            width: 14 // The line thickness
            ,
            radius: 42 // The radius of the inner circle
            ,
            scale: 1 // Scales overall size of the spinner
            ,
            corners: 1 // Corner roundness (0..1)
            ,
            color: '#000' // #rgb or #rrggbb or array of colors
            ,
            opacity: 0.25 // Opacity of the lines
            ,
            rotate: 0 // The rotation offset
            ,
            direction: 1 // 1: clockwise, -1: counterclockwise
            ,
            speed: 1 // Rounds per second
            ,
            trail: 60 // Afterglow percentage
            ,
            fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            ,
            zIndex: 2e9 // The z-index (defaults to 2000000000)
            ,
            className: 'spinner' // The CSS class to assign to the spinner
            ,
            top: '50%' // Top position relative to parent
            ,
            left: '50%' // Left position relative to parent
            ,
            shadow: false // Whether to render a shadow
            ,
            hwaccel: false // Whether to use hardware acceleration
            ,
            position: 'absolute' // Element positioning
        };
        var target = document.getElementById('div_loading');
        this.spinner = new Spinner(opts).spin(target);
    };
    UI.prototype.setupFadeUI = function (overall, results) {
        overall.mouseenter(function (e) {
            if (!results.is(':visible')) {
                results.fadeIn();
            }
        });
        overall.mouseleave(function (e) {
            if (results.is(':visible')) {
                results.fadeOut();
            }
        });
    };
    UI.prototype.setupInfoRolloverUI = function () {
        if (!this.mobileBrowser) {
            this.setupFadeUI($("#div_users_overall"), $("#div_user_results"));
            this.setupFadeUI($("#div_queue_overall"), $("#div_queue_results"));
            this.setupFadeUI($("#div_chat_overall"), $("#div_chat_results"));
            this.setupFadeUI($("#div_cc_overall"), $("#div_cc_results"));
        }
    };
    UI.prototype.searchTextChanged = function (text) {
        var divResults = $("#div_search_results");
        if (text.length == 0) {
            divResults.fadeOut();
        }
    };
    UI.prototype.setupInputUI = function () {
        var _this = this;
        var inputSearch = $("#input_search");
        inputSearch.keypress(function (e) {
            if (e.which == 13) {
                _this.searchEnterPressed(inputSearch);
            }
        });
        var input_name = $("#input_name");
        input_name.keypress(function (e) {
            if (e.which == 13) {
                _this.userNameChange(input_name);
            }
        });
        if (!this.mobileBrowser) {
            var input_chat = $("#input_chat");
            input_chat.keypress(function (e) {
                if (e.which == 13) {
                    _this.callbacks.onSendChatMessage(input_chat.val());
                    input_chat.val("");
                }
            });
        }
        document.body.addEventListener('click', function () {
            $("#div_search_results").fadeOut();
            $("#input_search").val("");
        }, true);
        $("#input_search").bind("propertychange input paste", function (event) {
            _this.searchTextChanged($("#input_search").val());
        });
    };
    UI.prototype.setupPlayerControlButtons = function () {
        var _this = this;
        $("#btn_previous").click(this.callbacks.previousMedia);
        $("#btn_pause").click(function () {
            $("#btn_pause").hide();
            $("#btn_play").show();
            _this.callbacks.pauseMedia();
        });
        $("#btn_play").click(function () {
            $("#btn_play").hide();
            $("#btn_uase").show();
            _this.callbacks.playMedia();
        });
        $("#btn_next").click(this.callbacks.nextMedia);
    };
    UI.prototype.searchEnterPressed = function (input_search) {
        var divResults = $("#div_search_results");
        divResults.html("");
        this.callbacks.search(input_search.val(), function (results) {
            $.each(results.items, function (index, item) {
                divResults.html(divResults.html() + "<div class='div_search_result' onClick='queueSelectedVideo(this)' data-VideoId='" + item.id.videoId + "' data-ThumbURL='" + item.snippet.thumbnails.medium.url + "'>" + '<p class="text_search_result">' + item.snippet.title + '</p></div>');
            });
            input_search.blur();
        });
        if (!divResults.is(':visible')) {
            divResults.fadeIn();
        }
    };
    UI.prototype.updateQueue = function (queue, queuePosition) {
        var length = queue.length;
        var lengthUpNext = queue.length - (queuePosition + 1);
        var summary = lengthUpNext + " things up next";
        if (lengthUpNext == 1) {
            summary = lengthUpNext + " thing up next";
        }
        else if (lengthUpNext <= 0) {
            summary = "Nothing up next. Queue something!";
        }
        $("#p_queue_summary").text(summary);
        var queueResults = $("#div_queue_results");
        var html = [];
        for (var i = (queuePosition + 1); i < length; i++) {
            var media = queue[i];
            var currentHTML = "";
            if (this.mobileBrowser) {
                currentHTML = '<img style="float: left; width: 33.33%; height: 20vw;" src="' + media.ThumbURL + '"/>';
            }
            else {
                currentHTML =
                    '<div style="text-align: left; display: flex; align-items: center;">' +
                        '<img style="height: 90px; width: 160px; margin-right: 16px;" src="' + media.ThumbURL + '"/>' +
                        '<span style="margin-right: 16px;">' + media.VideoTitle + '</span>' +
                        '</div>';
            }
            html.push(currentHTML);
        }
        queueResults.html(html.join(""));
    };
    UI.prototype.updateUsersList = function (users, userIdMe) {
        var _this = this;
        var num = users.length;
        var summary = users.length + " users in the room";
        if (num == 1) {
            summary = users.length + " user in the room";
        }
        $("#p_users_summary").text(summary);
        var userResults = $("#div_user_results");
        var html = [];
        //TODO: put style in css and make scrolley
        $.each(users, function (index, user) {
            var thisIsMe = (user.Id === userIdMe);
            var currentHTML;
            if (thisIsMe) {
                currentHTML = _this.frameBuilder.userMe('green', user.Name);
            }
            else {
                currentHTML = _this.frameBuilder.user('green', user.Id, user.Name);
            }
            html.push(currentHTML);
        });
        userResults.html(html.join(""));
    };
    UI.prototype.userNameChange = function (name_input) {
        name_input.hide();
        $("#input_search").fadeIn();
        this.callbacks.nameChange(name_input.val());
    };
    UI.prototype.onChatMessage = function (userName, msg) {
        //TODO: color stuff
        var html = '<li class="chat"><span style="margin: 0; color: ' + 'blue' + ';">' + userName + ': </span><span>' + msg + '</span></li>';
        $("#ul_chat").append(html);
    };
    return UI;
}());
exports.UI = UI;
},{"./frame":5}]},{},[1,5,2,3,4,6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9QbGF5ZXIudHMiLCJUeXBlU2NyaXB0cy9Sb29tLnRzIiwiVHlwZVNjcmlwdHMvU29ja2V0cy50cyIsIlR5cGVTY3JpcHRzL2ZyYW1lLnRzIiwiVHlwZVNjcmlwdHMvdWkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FDO0lBQUE7SUFPRCxDQUFDO0lBQUQsWUFBQztBQUFELENBUEMsQUFPQSxJQUFBO0FBUGEsc0JBQUs7QUFTbkI7SUFFSTtRQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBS0wsYUFBQztBQUFELENBVEEsQUFTQyxJQUFBO0FBVFksd0JBQU07QUFXbkI7SUFBQTtJQUtBLENBQUM7SUFBRCxnQkFBQztBQUFELENBTEEsQUFLQyxJQUFBO0FBTFksOEJBQVM7QUFPdEI7SUFBQTtJQUtBLENBQUM7SUFBRCxjQUFDO0FBQUQsQ0FMQSxBQUtDLElBQUE7QUFMWSwwQkFBTztBQU9wQjtJQUFBO0lBTUEsQ0FBQztJQUFELGdCQUFDO0FBQUQsQ0FOQSxBQU1DLElBQUE7QUFOWSw4QkFBUzs7OztBQzlCdEI7SUFNSSxnQkFBWSxhQUFzQjtRQUFsQyxpQkFHQztRQXdCTSxrQkFBYSxHQUFHO1lBQ25CLEtBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQzVCLENBQUMsQ0FBQTtRQTVCRyxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUN2QyxDQUFDO0lBRU0sbUNBQWtCLEdBQXpCLFVBQTBCLG1CQUFtQjtRQUV6QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7WUFDM0MsTUFBTSxFQUFFLE1BQU07WUFD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VUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU0sMEJBQWEsR0FBcEIsVUFBcUIsUUFBZ0IsRUFBRSxHQUFXO1FBQzlDLG1CQUFtQjtRQUNuQixJQUFJLElBQUksR0FBRyxrREFBa0QsR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLFFBQVEsR0FBRyxpQkFBaUIsR0FBRyxHQUFHLEdBQUcsY0FBYyxDQUFDO1FBQ3JJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNMLFNBQUM7QUFBRCxDQXBOQSxBQW9OQyxJQUFBO0FBcE5ZLGdCQUFFIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7v2V4cG9ydCBjbGFzcyBNZWRpYSB7XHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgVXNlcklkOiBudW1iZXI7XHJcbiAgICBVc2VyTmFtZTogc3RyaW5nO1xyXG4gICAgWVRWaWRlb0lEOiBudW1iZXI7XHJcbiAgICBWaWRlb1RpdGxlOiBzdHJpbmc7XHJcbiAgICBUaHVtYlVSTDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTXlVc2VyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLlN0YXRlID0gbmV3IFVzZXJTdGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBTdGF0ZTogVXNlclN0YXRlO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVXNlclN0YXRlIHtcclxuICAgIFRpbWU6IG51bWJlcjtcclxuICAgIFF1ZXVlUG9zaXRpb246IG51bWJlcjtcclxuICAgIFlUUGxheWVyU3RhdGU6IG51bWJlcjtcclxuICAgIFdhaXRpbmc6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXNzaW9uIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBVc2VyczogTXlVc2VyW107XHJcbiAgICBRdWV1ZTogTWVkaWFbXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFdzTWVzc2FnZSB7XHJcbiAgICBBY3Rpb246IHN0cmluZztcclxuICAgIFNlc3Npb246IFNlc3Npb247XHJcbiAgICBNZWRpYTogTWVkaWE7XHJcbiAgICBVc2VyOiBNeVVzZXI7XHJcbiAgICBDaGF0TWVzc2FnZTogc3RyaW5nO1xyXG59Iiwi77u/ZGVjbGFyZSB2YXIgWVQ6IGFueTtcclxuXHJcbmltcG9ydCB7IE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXIge1xyXG5cclxuICAgIHByaXZhdGUgeXRQbGF5ZXI6IGFueTtcclxuICAgIHByaXZhdGUgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuICAgIHB1YmxpYyBwbGF5ZXJSZWFkeTogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXRpYWxpemVZdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKSB7XHJcblxyXG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCdkaXZfeXRfcGxheWVyJywge1xyXG4gICAgICAgICAgICBoZWlnaHQ6ICdhdXRvJyxcclxuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgcGxheWVyVmFyczoge1xyXG4gICAgICAgICAgICAgICAgY29udHJvbHM6IDEsXHJcbiAgICAgICAgICAgICAgICBzaG93aW5mbzogMCxcclxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGV2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgJ29uUmVhZHknIDogdGhpcy5vblBsYXllclJlYWR5LFxyXG4gICAgICAgICAgICAgICAgJ29uU3RhdGVDaGFuZ2UnOiBvblBsYXllclN0YXRlQ2hhbmdlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB2YXIgZGl2X3BsYXllciA9ICQoXCIjZGl2X3BsYXllclwiKTtcclxuICAgICAgICAgICAgZGl2X3BsYXllci5oZWlnaHQoZGl2X3BsYXllci53aWR0aCgpICogOS4wIC8gMTYuMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvblBsYXllclJlYWR5ID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucGxheWVyUmVhZHkgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRQbGF5ZXJDb250ZW50KG1lZGlhOiBNZWRpYSwgdGltZTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBsYXllclJlYWR5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwbGF5ZXIgbm90IHJlYWR5IScpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KChtZWRpYSwgdGltZSkgPT4geyB0aGlzLnNldFBsYXllckNvbnRlbnQobWVkaWEsIHRpbWUpIH0sIDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUGxheWVyVUkobWVkaWEsIHRpbWUpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wbGF5VmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGF1c2UoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wYXVzZVZpZGVvKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFN0YXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVQbGF5ZXJVSShtZWRpYTogTWVkaWEsIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueXRQbGF5ZXIubG9hZFZpZGVvQnlJZChtZWRpYS5ZVFZpZGVvSUQsIHRpbWUsIFwibGFyZ2VcIik7XHRcclxuICAgICAgICAkKFwiI3BfY2Nfc3VtbWFyeVwiKS50ZXh0KG1lZGlhLlZpZGVvVGl0bGUpO1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBodG1sID1cclxuICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpbWcgc3R5bGU9XCJoZWlnaHQ6IDkwcHg7IHdpZHRoOiAxNjBweDsgbWFyZ2luLXJpZ2h0OiAxNnB4O1wiIHNyYz1cIicgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7XCI+JyArIG1lZGlhLlZpZGVvVGl0bGUgKyAnPGJyPicgKyAnUmVjb21tZW5kZWQgYnk6ICcgKyBtZWRpYS5Vc2VyTmFtZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl9jY19yZXN1bHRzXCIpLmh0bWwoaHRtbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSIsIu+7vy8vIFRPRE86IGZpbmQgYSBiZXR0ZXIgd2F5IHRvIGV4cG9zZSB0aGVzZSBmdW5jdGlvbnMgdG8gaHRtbD9cclxuKDxhbnk+d2luZG93KS5vbllvdVR1YmVJZnJhbWVBUElSZWFkeSA9IG9uWW91VHViZUlmcmFtZUFQSVJlYWR5O1xyXG4oPGFueT53aW5kb3cpLnl0QXBpUmVhZHkgPSB5dEFwaVJlYWR5O1xyXG4oPGFueT53aW5kb3cpLnF1ZXVlU2VsZWN0ZWRWaWRlbyA9IHF1ZXVlU2VsZWN0ZWRWaWRlbztcclxuKDxhbnk+d2luZG93KS5yZXF1ZXN0U3luY1dpdGhVc2VyID0gcmVxdWVzdFN5bmNXaXRoVXNlcjtcclxuXHJcbmltcG9ydCB7IE15VXNlciwgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSwgV3NNZXNzYWdlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcbmltcG9ydCB7IFVJQ2FsbGJhY2tzLCBVSSB9IGZyb20gXCIuL3VpXCI7XHJcbmltcG9ydCB7IE15U29ja2V0IH0gZnJvbSBcIi4vU29ja2V0c1wiXHJcbmltcG9ydCB7IFBsYXllciB9IGZyb20gXCIuL1BsYXllclwiXHJcblxyXG5kZWNsYXJlIHZhciBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5kZWNsYXJlIHZhciBnYXBpOiBhbnk7XHJcblxyXG52YXIgbVVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbnZhciBtU2Vzc2lvbiA9IG5ldyBTZXNzaW9uKCk7XHJcbnZhciBtVUk6IFVJO1xyXG52YXIgbVBsYXllcjogUGxheWVyO1xyXG52YXIgbVNvY2tldDogTXlTb2NrZXQ7XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgdmFyIGNhbGxiYWNrcyA9IG5ldyBVSUNhbGxiYWNrcygpO1xyXG4gICAgY2FsbGJhY2tzLm9uU2VuZENoYXRNZXNzYWdlID0gc2VuZENoYXRNZXNzYWdlO1xyXG4gICAgY2FsbGJhY2tzLm5hbWVDaGFuZ2UgPSBzYXZlVXNlck5hbWVDaGFuZ2U7XHJcbiAgICBjYWxsYmFja3MubmV4dE1lZGlhID0gbmV4dFZpZGVvSW5RdWV1ZTtcclxuICAgIGNhbGxiYWNrcy5wYXVzZU1lZGlhID0gcGF1c2VWaWRlbztcclxuICAgIGNhbGxiYWNrcy5wbGF5TWVkaWEgPSBwbGF5VmlkZW87XHJcbiAgICBjYWxsYmFja3MucHJldmlvdXNNZWRpYSA9IHByZXZpb3VzVmlkZW9JblF1ZXVlO1xyXG4gICAgY2FsbGJhY2tzLnNlYXJjaCA9IHNlYXJjaFZpZGVvcztcclxuXHJcbiAgICBtVUkgPSBuZXcgVUkobW9iaWxlQnJvd3NlciwgY2FsbGJhY2tzKTtcclxuICAgIG1QbGF5ZXIgPSBuZXcgUGxheWVyKG1vYmlsZUJyb3dzZXIpO1xyXG4gICAgbVNvY2tldCA9IG5ldyBNeVNvY2tldChtTWVzc2FnZUZ1bmN0aW9ucyk7XHJcblxyXG4gICAgc2V0dXBKYW1TZXNzaW9uKCk7XHJcbn0pO1xyXG5cclxuXHJcbmZ1bmN0aW9uIHNldHVwSmFtU2Vzc2lvbigpIHtcclxuXHR2YXIgcGF0aG5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcblx0dmFyIGVuY29kZWRTZXNzaW9uTmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoJ1xcL3Jvb21zLycsICcnKTtcclxuXHJcbiAgICBtU2Vzc2lvbi5OYW1lID0gZGVjb2RlVVJJKGVuY29kZWRTZXNzaW9uTmFtZSk7XHJcbiAgICBtVXNlci5OYW1lID0gJ0Fub255bW91cyc7XHJcblxyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdVc2VySm9pblNlc3Npb24nO1xyXG4gICAgbWVzc2FnZS5Vc2VyID0gbVVzZXI7XHJcbiAgICBtZXNzYWdlLlNlc3Npb24gPSBtU2Vzc2lvbjtcclxuXHJcblx0bVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGdW5jdGlvbnMgYXV0b21hdGljYWxseSBjYWxsZWQgd2hlbiB5b3V0dWJlIGFwaSdzIGFyZSByZWFkeVxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5mdW5jdGlvbiBvbllvdVR1YmVJZnJhbWVBUElSZWFkeSgpIHtcclxuICAgIG1QbGF5ZXIuaW5pdGlhbGl6ZVl0UGxheWVyKG9uUGxheWVyU3RhdGVDaGFuZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB5dEFwaVJlYWR5KCkge1xyXG5cdGdhcGkuY2xpZW50LnNldEFwaUtleShcIkFJemFTeUM0QS1kc0drLWhhX2ItZURwYnhhVlF0NWJSN2NPVWRkY1wiKTtcclxuXHRnYXBpLmNsaWVudC5sb2FkKFwieW91dHViZVwiLCBcInYzXCIsIGZ1bmN0aW9uKCkge30pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvblBsYXllclN0YXRlQ2hhbmdlKGV2ZW50KSB7XHJcbiAgICBpZihldmVudC5kYXRhPT0wKSB7XHJcbiAgICBcdG5leHRWaWRlb0luUXVldWUoKTtcclxuICAgIH1cclxufVxyXG5cclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gV2ViU29ja2V0IG1lc3NhZ2UgcmVzcG9uc2UgZnVuY3Rpb25zXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG52YXIgbU1lc3NhZ2VGdW5jdGlvbnMgPSB7XHJcbiAgICAndXBkYXRlVXNlcic6IG9uVXBkYXRlTWVVc2VyLFxyXG4gICAgJ3Nlc3Npb25SZWFkeSc6IG9uU2Vzc2lvblJlYWR5LFxyXG4gICAgJ3VwZGF0ZVVzZXJzTGlzdCc6IG9uVXBkYXRlVXNlcnNMaXN0LFxyXG4gICAgJ3VwZGF0ZVF1ZXVlJzogb25VcGRhdGVRdWV1ZSxcclxuICAgICdDaGF0TWVzc2FnZSc6IG9uUmVjZWl2ZWRDaGF0TWVzc2FnZSxcclxuICAgICdyZXF1ZXN0VXNlclN0YXRlJzogb25SZXF1ZXN0TXlVc2VyU3RhdGUsXHJcbiAgICAncHJvdmlkZVVzZXJTdGF0ZSc6IG9uVXNlclN0YXRlUHJvdmlkZWRcclxufVxyXG5cclxuZnVuY3Rpb24gb25Vc2VyU3RhdGVQcm92aWRlZChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIHZhciB1c2VyVG9TeW5jV2l0aCA9IG1lc3NhZ2UuVXNlcjtcclxuXHJcbiAgICBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdXNlclRvU3luY1dpdGguU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgIG1Vc2VyLlN0YXRlLlRpbWUgPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5UaW1lO1xyXG4gICAgbVVzZXIuU3RhdGUuWVRQbGF5ZXJTdGF0ZSA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLllUUGxheWVyU3RhdGU7XHJcblxyXG4gICAgbVVJLnVwZGF0ZVF1ZXVlKG1TZXNzaW9uLlF1ZXVlLCBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuXHJcbiAgICB2YXIgY3VycmVudE1lZGlhID0gbVNlc3Npb24uUXVldWVbbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbl07XHJcbiAgICBtUGxheWVyLnNldFBsYXllckNvbnRlbnQoY3VycmVudE1lZGlhLCBtVXNlci5TdGF0ZS5UaW1lKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25SZXF1ZXN0TXlVc2VyU3RhdGUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlckRhdGEgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICB1c2VyRGF0YS5JZCA9IG1lc3NhZ2UuVXNlci5JZDsgLy8gVE9ETzogYmFkIGJhZCBiYWRcclxuICAgIHVzZXJEYXRhLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uO1xyXG4gICAgdXNlckRhdGEuU3RhdGUuVGltZSA9IE1hdGgucm91bmQobVBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIHVzZXJEYXRhLlN0YXRlLllUUGxheWVyU3RhdGUgPSBtUGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpO1xyXG5cclxuICAgIHZhciBvdXRnb2luZ01zZyA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG91dGdvaW5nTXNnLkFjdGlvbiA9ICdQcm92aWRlU3luY1RvVXNlcic7XHJcbiAgICBvdXRnb2luZ01zZy5Vc2VyID0gdXNlckRhdGE7XHJcbiAgICBtU29ja2V0LmVtaXQob3V0Z29pbmdNc2cpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gb25VcGRhdGVNZVVzZXIobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlciA9IG1lc3NhZ2UuVXNlcjtcclxuICAgIG1Vc2VyID0gdXNlcjtcdFxyXG59XHJcblxyXG5mdW5jdGlvbiBvblNlc3Npb25SZWFkeShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIG1TZXNzaW9uID0gbWVzc2FnZS5TZXNzaW9uO1xyXG4gICAgbVVzZXIgPSBtZXNzYWdlLlVzZXI7XHJcbiAgICBpZiAobVNlc3Npb24uUXVldWUubGVuZ3RoID09IDApIHtcclxuXHRcdCQoXCIjcF9jdXJyZW50X2NvbnRlbnRfaW5mb1wiKS50ZXh0KFwiUXVldWUgdXAgYSBzb25nIVwiKTtcclxuXHRcdCQoXCIjcF9jdXJyZW50X3JlY29tbWVuZGVyX2luZm9cIikudGV4dChcIlVzZSB0aGUgc2VhcmNoIGJhciBhYm92ZS5cIik7XHJcblx0fVxyXG4gICAgbmV4dFZpZGVvSW5RdWV1ZSgpO1xyXG4gICAgbVVJLnVwZGF0ZVVzZXJzTGlzdChtU2Vzc2lvbi5Vc2VycywgbVVzZXIuSWQpO1xyXG4gICAgbVVJLnNlc3Npb25SZWFkeSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvblVwZGF0ZVVzZXJzTGlzdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIHZhciB1c2VycyA9IG1lc3NhZ2UuU2Vzc2lvbi5Vc2VycztcclxuICAgIG1TZXNzaW9uLlVzZXJzID0gdXNlcnM7XHJcbiAgICBtVUkudXBkYXRlVXNlcnNMaXN0KG1TZXNzaW9uLlVzZXJzLCBtVXNlci5JZCk7XHRcclxufVxyXG5cclxuZnVuY3Rpb24gb25VcGRhdGVRdWV1ZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIG1TZXNzaW9uLlF1ZXVlID0gbWVzc2FnZS5TZXNzaW9uLlF1ZXVlO1xyXG4gICAgaWYgKG1Vc2VyLlN0YXRlLldhaXRpbmcpIHtcclxuICAgICAgICBuZXh0VmlkZW9JblF1ZXVlKCk7XHJcbiAgICB9XHJcbiAgICBtVUkudXBkYXRlUXVldWUobVNlc3Npb24uUXVldWUsIG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvblJlY2VpdmVkQ2hhdE1lc3NhZ2UobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgY2hhdE1lc3NhZ2UgPSBtZXNzYWdlLkNoYXRNZXNzYWdlO1xyXG4gICAgdmFyIHVzZXJOYW1lID0gbWVzc2FnZS5Vc2VyLk5hbWU7XHJcbiAgICBtVUkub25DaGF0TWVzc2FnZSh1c2VyTmFtZSwgY2hhdE1lc3NhZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZW5kQ2hhdE1lc3NhZ2UobXNnOiBzdHJpbmcpIHtcclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnQ2hhdE1lc3NhZ2UnO1xyXG4gICAgbWVzc2FnZS5DaGF0TWVzc2FnZSA9IG1zZztcclxuICAgIG1lc3NhZ2UuVXNlciA9IG1Vc2VyO1xyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZWFyY2hWaWRlb3MocXVlcnksIGNhbGxiYWNrKSB7XHJcblx0dmFyIHJlcXVlc3QgPSBnYXBpLmNsaWVudC55b3V0dWJlLnNlYXJjaC5saXN0KHtcclxuICAgICAgICBwYXJ0OiBcInNuaXBwZXRcIixcclxuICAgICAgICB0eXBlOiBcInZpZGVvXCIsXHJcblx0ICAgIHE6IGVuY29kZVVSSUNvbXBvbmVudChxdWVyeSkucmVwbGFjZSgvJTIwL2csIFwiK1wiKSxcclxuXHQgICAgbWF4UmVzdWx0czogNVxyXG4gICAgfSk7XHJcblxyXG5cdHJlcXVlc3QuZXhlY3V0ZShjYWxsYmFjayk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVVc2VyTmFtZUNoYW5nZShuZXdOYW1lKSB7XHJcbiAgICBtVXNlci5OYW1lID0gbmV3TmFtZTtcclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5Vc2VyID0gbVVzZXI7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdTYXZlVXNlck5hbWVDaGFuZ2UnO1xyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBuZXh0VmlkZW9JblF1ZXVlKCkge1xyXG4gICAgbVVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICB2YXIgcXVldWUgPSBtU2Vzc2lvbi5RdWV1ZTtcclxuXHJcblx0aWYobVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiArIDEgPCBxdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgICBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiArIDE7XHJcbiAgICAgICAgbVBsYXllci5zZXRQbGF5ZXJDb250ZW50KG1TZXNzaW9uLlF1ZXVlW21Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb25dLCBtVXNlci5TdGF0ZS5UaW1lKTtcclxuICAgICAgICBtVXNlci5TdGF0ZS5XYWl0aW5nID0gZmFsc2U7XHJcblx0fVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgbVVzZXIuU3RhdGUuV2FpdGluZyA9IHRydWU7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBwYXVzZVZpZGVvKCkge1xyXG4gICAgbVBsYXllci5wYXVzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwbGF5VmlkZW8oKSB7XHJcbiAgICBtUGxheWVyLnBsYXkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcHJldmlvdXNWaWRlb0luUXVldWUoKSB7XHJcbiAgICBtVXNlci5TdGF0ZS5UaW1lID0gMDtcclxuICAgIHZhciBxdWV1ZSA9IG1TZXNzaW9uLlF1ZXVlO1xyXG5cdGlmKG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPiAwKSB7XHJcbiAgICAgICAgbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gLSAxO1xyXG4gICAgICAgIG1QbGF5ZXIuc2V0UGxheWVyQ29udGVudChtU2Vzc2lvbi5RdWV1ZVttVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uXSwgbVVzZXIuU3RhdGUuVGltZSk7XHJcblx0XHRtVXNlci5TdGF0ZS5XYWl0aW5nID0gZmFsc2U7XHJcblx0fVxyXG59XHJcblxyXG5cclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gVGhlc2UgZnVuY3Rpb25zIGFyZSBjYWxsZWQgZGlyZWN0bHkgZW1iZWRkZWQgaW50byB0aGUgaHRtbC4uLiBraW5kYSB3ZWlyZFxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZnVuY3Rpb24gcmVxdWVzdFN5bmNXaXRoVXNlcih1c2VySWQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdyZXF1ZXN0IHN5bmMgd2l0aCB1c2VyJyk7XHJcblxyXG4gICAgdmFyIHVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICB1c2VyLklkID0gdXNlcklkO1xyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdSZXF1ZXN0U3luY1dpdGhVc2VyJztcclxuICAgIG1lc3NhZ2UuVXNlciA9IHVzZXI7XHJcbiAgICBtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHF1ZXVlU2VsZWN0ZWRWaWRlbyhlbG1udCkge1xyXG5cclxuXHQkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKS5mYWRlT3V0KCk7XHJcblx0JChcIiNpbnB1dF9zZWFyY2hcIikudmFsKFwiXCIpO1xyXG5cdHZhciBWaWRlb0lkID0gZWxtbnQuZ2V0QXR0cmlidXRlKCdkYXRhLVZpZGVvSWQnKTtcclxuXHR2YXIgVGl0bGUgPSBlbG1udC5pbm5lclRleHQgfHwgZWxtbnQudGV4dENvbnRlbnQ7XHJcblx0dmFyIFRodW1iVVJMID0gZWxtbnQuZ2V0QXR0cmlidXRlKCdkYXRhLVRodW1iVVJMJyk7XHJcblxyXG4gICAgdmFyIG1lZGlhID0gbmV3IE1lZGlhKCk7XHJcbiAgICBtZWRpYS5ZVFZpZGVvSUQgPSBWaWRlb0lkO1xyXG4gICAgbWVkaWEuVmlkZW9UaXRsZSA9IFRpdGxlO1xyXG4gICAgbWVkaWEuVGh1bWJVUkwgPSBUaHVtYlVSTDtcclxuICAgIG1lZGlhLlVzZXJJZCA9IG1Vc2VyLklkO1xyXG4gICAgbWVkaWEuVXNlck5hbWUgPSBtVXNlci5OYW1lO1xyXG5cclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnQWRkTWVkaWFUb1Nlc3Npb24nO1xyXG4gICAgbWVzc2FnZS5NZWRpYSA9IG1lZGlhO1xyXG5cclxuICAgIC8vVE9ETzogbG9jYWwgYWRkIG1lZGlhXHJcbiAgICBtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuXHJcbi8vIFRPRE86IGZpeCB0aGlzXHJcbmZ1bmN0aW9uIGRlbGV0ZVZpZGVvSW5RdWV1ZShRdWV1ZVBvc2l0aW9uOiBudW1iZXIpIHtcclxuXHR2YXIgaWQgPSBtU2Vzc2lvbi5RdWV1ZVtRdWV1ZVBvc2l0aW9uXS5JZDtcclxuXHRtU2Vzc2lvbi5RdWV1ZS5zcGxpY2UoUXVldWVQb3NpdGlvbiwgMSk7XHJcblxyXG4gICAgbVVJLnVwZGF0ZVF1ZXVlKG1TZXNzaW9uLlF1ZXVlLCBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuXHJcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIHZhciBtZWRpYVRvRGVsZXRlID0gbmV3IE1lZGlhKCk7XHJcbiAgICBtZWRpYVRvRGVsZXRlLklkID0gaWQ7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdEZWxldGVNZWRpYUZyb21TZXNzaW9uJztcclxuICAgIG1lc3NhZ2UuTWVkaWEgPSBtZWRpYVRvRGVsZXRlO1xyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcbiIsIu+7v2ltcG9ydCB7IFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE15U29ja2V0IHtcclxuXHJcbiAgICBwcml2YXRlIHNvY2tldDogV2ViU29ja2V0O1xyXG4gICAgcHJpdmF0ZSByZXNwb25zZV9mdW5jdGlvbnM6IHsgW2FjdGlvbjogc3RyaW5nXTogKGRhdGE6IGFueSkgPT4gdm9pZCB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHJlc3BvbnNlX2Z1bmN0aW9uczogeyBbYWN0aW9uOiBzdHJpbmddOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkIH0pIHtcclxuICAgICAgICB0aGlzLnJlc3BvbnNlX2Z1bmN0aW9ucyA9IHJlc3BvbnNlX2Z1bmN0aW9ucztcclxuICAgICAgICB2YXIgdXJpID0gXCJ3czovL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyBcIi93c1wiO1xyXG4gICAgICAgIHZhciBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVyaSk7XHJcbiAgICAgICAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uIChldmVudCkge307XHJcbiAgICAgICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG4gICAgICAgIHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gbWVzc2FnZS5BY3Rpb247XHJcbiAgICAgICAgICAgIHZhciByZXNwb25zZWZ1bmMgPSByZXNwb25zZV9mdW5jdGlvbnNbYWN0aW9uXTtcclxuICAgICAgICAgICAgLy8gVE9ETzogZXhjZXB0aW9uIHdoZW4gbm90IGZvdW5kXHJcbiAgICAgICAgICAgIHJlc3BvbnNlZnVuYyhtZXNzYWdlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuICAgICAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZW1pdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICBpZiAodGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gdGhpcy5zb2NrZXQuQ09OTkVDVElORykge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcclxuICAgIH07XHJcblxyXG59XHJcbiIsIu+7v2V4cG9ydCBjbGFzcyBGcmFtZUJ1aWxkZXIge1xyXG5cclxuICAgIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZXJNZShjb2xvcjogc3RyaW5nLCB1c2VyTmFtZTogc3RyaW5nKSA6IHN0cmluZyB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gJzxkaXYgY2xhc3M9XCJkaXZfdXNlclwiIHN0eWxlPVwiYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj4geW91IDwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgZmxvYXQ6IGxlZnQ7IGN1cnNvcjogcG9pbnRlcjsgbWFyZ2luLXJpZ2h0OiAxNnB4OyBoZWlnaHQ6IDQ4cHg7IHdpZHRoOiA0OHB4OyBiYWNrZ3JvdW5kOiAnICsgY29sb3IgKyAnO1wiPnlvdTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDsgZmxvYXQ6IHJpZ2h0O1wiPicgKyB1c2VyTmFtZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRIVE1MO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyKGNvbG9yOiBzdHJpbmcsIHVzZXJJZDogbnVtYmVyLCB1c2VyTmFtZTogc3RyaW5nKSA6IHN0cmluZyB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gJzxkaXYgb25jbGljaz1cInJlcXVlc3RTeW5jV2l0aFVzZXIoJyArIHVzZXJJZCArICcpXCIgY2xhc3M9XCJkaXZfdXNlclwiIHN0eWxlPVwiYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj5zeW5jIHdpdGggJyArIHVzZXJOYW1lICsgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgb25jbGljaz1cInJlcXVlc3RTeW5jV2l0aFVzZXIoJyArIHVzZXJJZCArICcpXCIgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgZmxvYXQ6IGxlZnQ7IGN1cnNvcjogcG9pbnRlcjsgbWFyZ2luLXJpZ2h0OiAxNnB4OyBoZWlnaHQ6IDQ4cHg7IHdpZHRoOiA0OHB4OyBiYWNrZ3JvdW5kOiAnICsgY29sb3IgKyAnO1wiPnN5bmM8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7IGZsb2F0OiByaWdodDtcIj4nICsgdXNlck5hbWUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxufSIsIu+7v2ltcG9ydCB7IEZyYW1lQnVpbGRlciB9IGZyb20gXCIuL2ZyYW1lXCI7XHJcbmltcG9ydCB7IE1lZGlhIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5kZWNsYXJlIHZhciBTcGlubmVyOiBhbnk7XHJcblxyXG5leHBvcnQgY2xhc3MgVUlDYWxsYmFja3Mge1xyXG4gICAgcHJldmlvdXNNZWRpYTogYW55O1xyXG4gICAgbmV4dE1lZGlhOiBhbnk7XHJcbiAgICBwbGF5TWVkaWE6IGFueTtcclxuICAgIHBhdXNlTWVkaWE6IGFueTtcclxuICAgIG9uU2VuZENoYXRNZXNzYWdlOiBhbnk7XHJcbiAgICAvLyBzZWFyY2gocXVlcnk6IHN0cmluZywgY2FsbGJhY2s6IChyZXN1bHRzOiBhbnkpID0+IHZvaWQpOiBhbnk7XHJcbiAgICBzZWFyY2g6IGFueTtcclxuICAgIG5hbWVDaGFuZ2U6IGFueTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFVJIHtcclxuXHJcbiAgICBwcml2YXRlIHNwaW5uZXI6IGFueTtcclxuICAgIHByaXZhdGUgY2FsbGJhY2tzOiBVSUNhbGxiYWNrcztcclxuICAgIHByaXZhdGUgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgZnJhbWVCdWlsZGVyOiBGcmFtZUJ1aWxkZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbiwgY2FsbGJhY2tzOiBVSUNhbGxiYWNrcykge1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICAgICAgdGhpcy5mcmFtZUJ1aWxkZXIgPSBuZXcgRnJhbWVCdWlsZGVyKG1vYmlsZUJyb3dzZXIpO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0gY2FsbGJhY2tzO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICB0aGlzLnNldHVwU3Bpbm5lclVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cEluZm9Sb2xsb3ZlclVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cElucHV0VUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwUGxheWVyQ29udHJvbEJ1dHRvbnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2Vzc2lvblJlYWR5KCkge1xyXG4gICAgICAgICQoXCIjZGl2X2xvYWRpbmdcIikuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lci5zdG9wKCk7XHJcbiAgICAgICAgJChcIiNkaXZfZXZlcnl0aGluZ1wiKS5hbmltYXRlKHtvcGFjaXR5OiAxfSwgJ2Zhc3QnKTtcclxuICAgIH0gXHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cFNwaW5uZXJVSSgpIHtcclxuICAgICAgICB2YXIgb3B0cyA9IHtcclxuICAgICAgICAgICAgbGluZXM6IDEzIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xyXG4gICAgICAgICAgICAsIGxlbmd0aDogMjggLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcclxuICAgICAgICAgICAgLCB3aWR0aDogMTQgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXHJcbiAgICAgICAgICAgICwgcmFkaXVzOiA0MiAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcclxuICAgICAgICAgICAgLCBzY2FsZTogMSAvLyBTY2FsZXMgb3ZlcmFsbCBzaXplIG9mIHRoZSBzcGlubmVyXHJcbiAgICAgICAgICAgICwgY29ybmVyczogMSAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxyXG4gICAgICAgICAgICAsIGNvbG9yOiAnIzAwMCcgLy8gI3JnYiBvciAjcnJnZ2JiIG9yIGFycmF5IG9mIGNvbG9yc1xyXG4gICAgICAgICAgICAsIG9wYWNpdHk6IDAuMjUgLy8gT3BhY2l0eSBvZiB0aGUgbGluZXNcclxuICAgICAgICAgICAgLCByb3RhdGU6IDAgLy8gVGhlIHJvdGF0aW9uIG9mZnNldFxyXG4gICAgICAgICAgICAsIGRpcmVjdGlvbjogMSAvLyAxOiBjbG9ja3dpc2UsIC0xOiBjb3VudGVyY2xvY2t3aXNlXHJcbiAgICAgICAgICAgICwgc3BlZWQ6IDEgLy8gUm91bmRzIHBlciBzZWNvbmRcclxuICAgICAgICAgICAgLCB0cmFpbDogNjAgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcclxuICAgICAgICAgICAgLCBmcHM6IDIwIC8vIEZyYW1lcyBwZXIgc2Vjb25kIHdoZW4gdXNpbmcgc2V0VGltZW91dCgpIGFzIGEgZmFsbGJhY2sgZm9yIENTU1xyXG4gICAgICAgICAgICAsIHpJbmRleDogMmU5IC8vIFRoZSB6LWluZGV4IChkZWZhdWx0cyB0byAyMDAwMDAwMDAwKVxyXG4gICAgICAgICAgICAsIGNsYXNzTmFtZTogJ3NwaW5uZXInIC8vIFRoZSBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBzcGlubmVyXHJcbiAgICAgICAgICAgICwgdG9wOiAnNTAlJyAvLyBUb3AgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XHJcbiAgICAgICAgICAgICwgbGVmdDogJzUwJScgLy8gTGVmdCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcclxuICAgICAgICAgICAgLCBzaGFkb3c6IGZhbHNlIC8vIFdoZXRoZXIgdG8gcmVuZGVyIGEgc2hhZG93XHJcbiAgICAgICAgICAgICwgaHdhY2NlbDogZmFsc2UgLy8gV2hldGhlciB0byB1c2UgaGFyZHdhcmUgYWNjZWxlcmF0aW9uXHJcbiAgICAgICAgICAgICwgcG9zaXRpb246ICdhYnNvbHV0ZScgLy8gRWxlbWVudCBwb3NpdGlvbmluZ1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpdl9sb2FkaW5nJyk7XHJcbiAgICAgICAgdGhpcy5zcGlubmVyID0gbmV3IFNwaW5uZXIob3B0cykuc3Bpbih0YXJnZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBGYWRlVUkob3ZlcmFsbCwgcmVzdWx0cykge1xyXG4gICAgICAgIG92ZXJhbGwubW91c2VlbnRlcigoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdHMuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMuZmFkZUluKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBvdmVyYWxsLm1vdXNlbGVhdmUoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdHMuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cEluZm9Sb2xsb3ZlclVJKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfdXNlcnNfb3ZlcmFsbFwiKSwgJChcIiNkaXZfdXNlcl9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9xdWV1ZV9vdmVyYWxsXCIpLCAkKFwiI2Rpdl9xdWV1ZV9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9jaGF0X292ZXJhbGxcIiksICQoXCIjZGl2X2NoYXRfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfY2Nfb3ZlcmFsbFwiKSwgJChcIiNkaXZfY2NfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VhcmNoVGV4dENoYW5nZWQodGV4dCkge1xyXG4gICAgICAgIHZhciBkaXZSZXN1bHRzID0gJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgaWYodGV4dC5sZW5ndGg9PTApIHtcclxuICAgICAgICAgICAgZGl2UmVzdWx0cy5mYWRlT3V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBJbnB1dFVJKCkge1xyXG4gICAgICAgIHZhciBpbnB1dFNlYXJjaCA9ICQoXCIjaW5wdXRfc2VhcmNoXCIpO1xyXG4gICAgICAgIGlucHV0U2VhcmNoLmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaEVudGVyUHJlc3NlZChpbnB1dFNlYXJjaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgaW5wdXRfbmFtZSA9ICQoXCIjaW5wdXRfbmFtZVwiKTtcclxuICAgICAgICBpbnB1dF9uYW1lLmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJOYW1lQ2hhbmdlKGlucHV0X25hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0X2NoYXQgPSAkKFwiI2lucHV0X2NoYXRcIik7XHJcbiAgICAgICAgICAgIGlucHV0X2NoYXQua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja3Mub25TZW5kQ2hhdE1lc3NhZ2UoaW5wdXRfY2hhdC52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRfY2hhdC52YWwoXCJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKS5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbChcIlwiKTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5iaW5kKFwicHJvcGVydHljaGFuZ2UgaW5wdXQgcGFzdGVcIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoVGV4dENoYW5nZWQoJChcIiNpbnB1dF9zZWFyY2hcIikudmFsKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBQbGF5ZXJDb250cm9sQnV0dG9ucygpIHtcclxuICAgICAgICAkKFwiI2J0bl9wcmV2aW91c1wiKS5jbGljayh0aGlzLmNhbGxiYWNrcy5wcmV2aW91c01lZGlhKTtcclxuICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BhdXNlXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgJChcIiNidG5fcGxheVwiKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnBhdXNlTWVkaWEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiI2J0bl9wbGF5XCIpLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgJChcIiNidG5fcGxheVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3Vhc2VcIikuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5wbGF5TWVkaWEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiI2J0bl9uZXh0XCIpLmNsaWNrKHRoaXMuY2FsbGJhY2tzLm5leHRNZWRpYSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWFyY2hFbnRlclByZXNzZWQoaW5wdXRfc2VhcmNoKSB7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCJcIik7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3Muc2VhcmNoKGlucHV0X3NlYXJjaC52YWwoKSwgKHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgJC5lYWNoKHJlc3VsdHMuaXRlbXMsIChpbmRleCwgaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZGl2UmVzdWx0cy5odG1sKGRpdlJlc3VsdHMuaHRtbCgpICsgXCI8ZGl2IGNsYXNzPSdkaXZfc2VhcmNoX3Jlc3VsdCcgb25DbGljaz0ncXVldWVTZWxlY3RlZFZpZGVvKHRoaXMpJyBkYXRhLVZpZGVvSWQ9J1wiICsgaXRlbS5pZC52aWRlb0lkICsgXCInIGRhdGEtVGh1bWJVUkw9J1wiK2l0ZW0uc25pcHBldC50aHVtYm5haWxzLm1lZGl1bS51cmwrXCInPlwiICsgJzxwIGNsYXNzPVwidGV4dF9zZWFyY2hfcmVzdWx0XCI+JyArICBpdGVtLnNuaXBwZXQudGl0bGUrICc8L3A+PC9kaXY+JyApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaW5wdXRfc2VhcmNoLmJsdXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZighZGl2UmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICBkaXZSZXN1bHRzLmZhZGVJbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlUXVldWUocXVldWU6IE1lZGlhW10sIHF1ZXVlUG9zaXRpb246IG51bWJlcikge1xyXG4gICAgICAgIHZhciBsZW5ndGggPSBxdWV1ZS5sZW5ndGg7XHJcbiAgICAgICAgdmFyIGxlbmd0aFVwTmV4dCA9IHF1ZXVlLmxlbmd0aCAtIChxdWV1ZVBvc2l0aW9uICsgMSk7XHJcbiAgICAgICAgdmFyIHN1bW1hcnkgPSBsZW5ndGhVcE5leHQgKyBcIiB0aGluZ3MgdXAgbmV4dFwiO1xyXG4gICAgICAgIGlmIChsZW5ndGhVcE5leHQgPT0gMSkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gbGVuZ3RoVXBOZXh0ICsgXCIgdGhpbmcgdXAgbmV4dFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChsZW5ndGhVcE5leHQgPD0gMCkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gXCJOb3RoaW5nIHVwIG5leHQuIFF1ZXVlIHNvbWV0aGluZyFcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJChcIiNwX3F1ZXVlX3N1bW1hcnlcIikudGV4dChzdW1tYXJ5KTtcclxuXHJcbiAgICAgICAgdmFyIHF1ZXVlUmVzdWx0cyA9ICQoXCIjZGl2X3F1ZXVlX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgdmFyIGh0bWwgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gKHF1ZXVlUG9zaXRpb24gKyAxKTsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBtZWRpYSA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudEhUTUwgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8aW1nIHN0eWxlPVwiZmxvYXQ6IGxlZnQ7IHdpZHRoOiAzMy4zMyU7IGhlaWdodDogMjB2dztcIiBzcmM9XCInICArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJzxpbWcgc3R5bGU9XCJoZWlnaHQ6IDkwcHg7IHdpZHRoOiAxNjBweDsgbWFyZ2luLXJpZ2h0OiAxNnB4O1wiIHNyYz1cIicgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDtcIj4nICsgbWVkaWEuVmlkZW9UaXRsZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHF1ZXVlUmVzdWx0cy5odG1sKGh0bWwuam9pbihcIlwiKSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVVc2Vyc0xpc3QodXNlcnMsIHVzZXJJZE1lOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbnVtID0gdXNlcnMubGVuZ3RoO1xyXG4gICAgICAgIHZhciBzdW1tYXJ5ID0gdXNlcnMubGVuZ3RoICsgXCIgdXNlcnMgaW4gdGhlIHJvb21cIjtcclxuICAgICAgICBpZiAobnVtID09IDEpIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IHVzZXJzLmxlbmd0aCArIFwiIHVzZXIgaW4gdGhlIHJvb21cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJChcIiNwX3VzZXJzX3N1bW1hcnlcIikudGV4dChzdW1tYXJ5KTtcclxuICAgICAgICB2YXIgdXNlclJlc3VsdHMgPSAkKFwiI2Rpdl91c2VyX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgdmFyIGh0bWwgPSBbXTtcclxuICAgICAgICAvL1RPRE86IHB1dCBzdHlsZSBpbiBjc3MgYW5kIG1ha2Ugc2Nyb2xsZXlcclxuICAgICAgICAkLmVhY2godXNlcnMsIChpbmRleCwgdXNlcikgPT4ge1xyXG4gICAgICAgICAgICB2YXIgdGhpc0lzTWUgPSAodXNlci5JZCA9PT0gdXNlcklkTWUpO1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudEhUTUw7XHJcbiAgICAgICAgICAgIGlmICh0aGlzSXNNZSkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEhUTUwgPSB0aGlzLmZyYW1lQnVpbGRlci51c2VyTWUoJ2dyZWVuJywgdXNlci5OYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gdGhpcy5mcmFtZUJ1aWxkZXIudXNlcignZ3JlZW4nLCB1c2VyLklkLCB1c2VyLk5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGh0bWwucHVzaChjdXJyZW50SFRNTCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdXNlclJlc3VsdHMuaHRtbChodG1sLmpvaW4oXCJcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyTmFtZUNoYW5nZShuYW1lX2lucHV0KSB7XHJcbiAgICAgICAgbmFtZV9pbnB1dC5oaWRlKCk7XHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuZmFkZUluKCk7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MubmFtZUNoYW5nZShuYW1lX2lucHV0LnZhbCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DaGF0TWVzc2FnZSh1c2VyTmFtZTogc3RyaW5nLCBtc2c6IHN0cmluZykge1xyXG4gICAgICAgIC8vVE9ETzogY29sb3Igc3R1ZmZcclxuICAgICAgICB2YXIgaHRtbCA9ICc8bGkgY2xhc3M9XCJjaGF0XCI+PHNwYW4gc3R5bGU9XCJtYXJnaW46IDA7IGNvbG9yOiAnICsgJ2JsdWUnICsgJztcIj4nICsgdXNlck5hbWUgKyAnOiA8L3NwYW4+PHNwYW4+JyArIG1zZyArICc8L3NwYW4+PC9saT4nO1xyXG4gICAgICAgICQoXCIjdWxfY2hhdFwiKS5hcHBlbmQoaHRtbCk7XHJcbiAgICB9XHJcbn0iXX0=
