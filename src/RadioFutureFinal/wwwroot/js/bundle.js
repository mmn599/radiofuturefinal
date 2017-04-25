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
                'onStateChange': onPlayerStateChange
            }
        });
        if (this.mobileBrowser) {
            var div_player = $("#div_player");
            div_player.height(div_player.width() * 9.0 / 16.0);
        }
    };
    Player.prototype.setPlayerContent = function (media, time) {
        var media = media;
        this.updatePlayerUI(media, time);
        this.play();
    };
    Player.prototype.play = function () {
        this.ytPlayer.playVideo();
    };
    Player.prototype.pause = function () {
        this.ytPlayer.pauseVideo();
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
    Player.prototype.getCurrentTime = function () {
        return Math.round(this.ytPlayer.getCurrentTime());
    };
    Player.prototype.getCurrentState = function () {
        return Math.round(this.ytPlayer.getPlayerState());
    };
    return Player;
}());
exports.Player = Player;
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.ytApiReady = ytApiReady;
// TODO: find a better way to expose these functions to html?
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
    'chatMessage': onReceivedChatMessage,
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
    media.VideoTitle = Title;
    media.VideoTitle = VideoId;
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
        if (this.mobileBrowser) {
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
        var lengthUpNext = queue.length - queuePosition;
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
        for (var i = 0; i < length; i++) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9QbGF5ZXIudHMiLCJUeXBlU2NyaXB0cy9Sb29tLnRzIiwiVHlwZVNjcmlwdHMvU29ja2V0cy50cyIsIlR5cGVTY3JpcHRzL2ZyYW1lLnRzIiwiVHlwZVNjcmlwdHMvdWkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FDO0lBQUE7SUFPRCxDQUFDO0lBQUQsWUFBQztBQUFELENBUEMsQUFPQSxJQUFBO0FBUGEsc0JBQUs7QUFTbkI7SUFBQTtJQUlBLENBQUM7SUFBRCxhQUFDO0FBQUQsQ0FKQSxBQUlDLElBQUE7QUFKWSx3QkFBTTtBQU1uQjtJQUFBO0lBS0EsQ0FBQztJQUFELGdCQUFDO0FBQUQsQ0FMQSxBQUtDLElBQUE7QUFMWSw4QkFBUztBQU90QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDekJ0QjtJQU9JLGdCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxtQ0FBa0IsR0FBekIsVUFBMEIsbUJBQW1CO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtZQUMzQyxNQUFNLEVBQUUsTUFBTTtZQUNkLEtBQUssRUFBRSxNQUFNO1lBQ2IsVUFBVSxFQUFFO2dCQUNSLFFBQVEsRUFBRSxDQUFDO2dCQUNYLFFBQVEsRUFBRSxDQUFDO2dCQUNYLFFBQVEsRUFBRSxDQUFDO2FBQ2Q7WUFDRCxNQUFNLEVBQUU7Z0JBQ0osZUFBZSxF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IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwi77u/ZXhwb3J0IGNsYXNzIE1lZGlhIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBVc2VySWQ6IG51bWJlcjtcclxuICAgIFVzZXJOYW1lOiBzdHJpbmc7XHJcbiAgICBZVFZpZGVvSUQ6IG51bWJlcjtcclxuICAgIFZpZGVvVGl0bGU6IHN0cmluZztcclxuICAgIFRodW1iVVJMOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNeVVzZXIge1xyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIFN0YXRlOiBVc2VyU3RhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVc2VyU3RhdGUge1xyXG4gICAgVGltZTogbnVtYmVyO1xyXG4gICAgUXVldWVQb3NpdGlvbjogbnVtYmVyO1xyXG4gICAgWVRQbGF5ZXJTdGF0ZTogbnVtYmVyO1xyXG4gICAgV2FpdGluZzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNlc3Npb24ge1xyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIFVzZXJzOiBNeVVzZXJbXTtcclxuICAgIFF1ZXVlOiBNZWRpYVtdO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV3NNZXNzYWdlIHtcclxuICAgIEFjdGlvbjogc3RyaW5nO1xyXG4gICAgU2Vzc2lvbjogU2Vzc2lvbjtcclxuICAgIE1lZGlhOiBNZWRpYTtcclxuICAgIFVzZXI6IE15VXNlcjtcclxuICAgIENoYXRNZXNzYWdlOiBzdHJpbmc7XHJcbn0iLCLvu79kZWNsYXJlIHZhciBZVDogYW55O1xyXG5cclxuaW1wb3J0IHsgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBsYXllciB7XHJcblxyXG4gICAgcHJpdmF0ZSB5dFBsYXllcjogYW55O1xyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5cclxuICAgIHB1YmxpYyBwbGF5ZXJSZWFkeTogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXRpYWxpemVZdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllciA9IG5ldyBZVC5QbGF5ZXIoJ2Rpdl95dF9wbGF5ZXInLCB7XHJcbiAgICAgICAgICAgIGhlaWdodDogJ2F1dG8nLFxyXG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICBwbGF5ZXJWYXJzOiB7XHJcbiAgICAgICAgICAgICAgICBjb250cm9sczogMSxcclxuICAgICAgICAgICAgICAgIHNob3dpbmZvOiAwLFxyXG4gICAgICAgICAgICAgICAgYXV0b3BsYXk6IDBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAnb25TdGF0ZUNoYW5nZSc6IG9uUGxheWVyU3RhdGVDaGFuZ2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBkaXZfcGxheWVyID0gJChcIiNkaXZfcGxheWVyXCIpO1xyXG4gICAgICAgICAgICBkaXZfcGxheWVyLmhlaWdodChkaXZfcGxheWVyLndpZHRoKCkgKiA5LjAgLyAxNi4wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBsYXllckNvbnRlbnQobWVkaWE6IE1lZGlhLCB0aW1lOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbWVkaWEgPSBtZWRpYTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVBsYXllclVJKG1lZGlhLCB0aW1lKTtcclxuICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGxheSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBsYXlWaWRlbygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYXVzZSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBhdXNlVmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVBsYXllclVJKG1lZGlhOiBNZWRpYSwgdGltZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5sb2FkVmlkZW9CeUlkKG1lZGlhLllUVmlkZW9JRCwgdGltZSwgXCJsYXJnZVwiKTtcdFxyXG4gICAgICAgICQoXCIjcF9jY19zdW1tYXJ5XCIpLnRleHQobWVkaWEuVmlkZW9UaXRsZSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGh0bWwgPVxyXG4gICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGltZyBzdHlsZT1cImhlaWdodDogOTBweDsgd2lkdGg6IDE2MHB4OyBtYXJnaW4tcmlnaHQ6IDE2cHg7XCIgc3JjPVwiJyArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDtcIj4nICsgbWVkaWEuVmlkZW9UaXRsZSArICc8YnI+JyArICdSZWNvbW1lbmRlZCBieTogJyArIG1lZGlhLlVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikuaHRtbChodG1sKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFN0YXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpKTtcclxuICAgIH1cclxuXHJcbn0iLCLvu78oPGFueT53aW5kb3cpLm9uWW91VHViZUlmcmFtZUFQSVJlYWR5ID0gb25Zb3VUdWJlSWZyYW1lQVBJUmVhZHk7XHJcbig8YW55PndpbmRvdykueXRBcGlSZWFkeSA9IHl0QXBpUmVhZHk7XHJcbi8vIFRPRE86IGZpbmQgYSBiZXR0ZXIgd2F5IHRvIGV4cG9zZSB0aGVzZSBmdW5jdGlvbnMgdG8gaHRtbD9cclxuKDxhbnk+d2luZG93KS5xdWV1ZVNlbGVjdGVkVmlkZW8gPSBxdWV1ZVNlbGVjdGVkVmlkZW87XHJcbig8YW55PndpbmRvdykucmVxdWVzdFN5bmNXaXRoVXNlciA9IHJlcXVlc3RTeW5jV2l0aFVzZXI7XHJcblxyXG5pbXBvcnQgeyBNeVVzZXIsIE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUsIFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBVSUNhbGxiYWNrcywgVUkgfSBmcm9tIFwiLi91aVwiO1xyXG5pbXBvcnQgeyBNeVNvY2tldCB9IGZyb20gXCIuL1NvY2tldHNcIlxyXG5pbXBvcnQgeyBQbGF5ZXIgfSBmcm9tIFwiLi9QbGF5ZXJcIlxyXG5cclxuZGVjbGFyZSB2YXIgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuZGVjbGFyZSB2YXIgZ2FwaTogYW55O1xyXG5cclxudmFyIG1Vc2VyID0gbmV3IE15VXNlcigpO1xyXG52YXIgbVNlc3Npb24gPSBuZXcgU2Vzc2lvbigpO1xyXG52YXIgbVVJOiBVSTtcclxudmFyIG1QbGF5ZXI6IFBsYXllcjtcclxudmFyIG1Tb2NrZXQ6IE15U29ja2V0O1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIHZhciBjYWxsYmFja3MgPSBuZXcgVUlDYWxsYmFja3MoKTtcclxuICAgIGNhbGxiYWNrcy5vblNlbmRDaGF0TWVzc2FnZSA9IHNlbmRDaGF0TWVzc2FnZTtcclxuICAgIGNhbGxiYWNrcy5uYW1lQ2hhbmdlID0gc2F2ZVVzZXJOYW1lQ2hhbmdlO1xyXG4gICAgY2FsbGJhY2tzLm5leHRNZWRpYSA9IG5leHRWaWRlb0luUXVldWU7XHJcbiAgICBjYWxsYmFja3MucGF1c2VNZWRpYSA9IHBhdXNlVmlkZW87XHJcbiAgICBjYWxsYmFja3MucGxheU1lZGlhID0gcGxheVZpZGVvO1xyXG4gICAgY2FsbGJhY2tzLnByZXZpb3VzTWVkaWEgPSBwcmV2aW91c1ZpZGVvSW5RdWV1ZTtcclxuICAgIGNhbGxiYWNrcy5zZWFyY2ggPSBzZWFyY2hWaWRlb3M7XHJcblxyXG4gICAgbVVJID0gbmV3IFVJKG1vYmlsZUJyb3dzZXIsIGNhbGxiYWNrcyk7XHJcbiAgICBtUGxheWVyID0gbmV3IFBsYXllcihtb2JpbGVCcm93c2VyKTtcclxuICAgIG1Tb2NrZXQgPSBuZXcgTXlTb2NrZXQobU1lc3NhZ2VGdW5jdGlvbnMpO1xyXG5cclxuICAgIHNldHVwSmFtU2Vzc2lvbigpO1xyXG59KTtcclxuXHJcblxyXG5mdW5jdGlvbiBzZXR1cEphbVNlc3Npb24oKSB7XHJcblx0dmFyIHBhdGhuYW1lID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG5cdHZhciBlbmNvZGVkU2Vzc2lvbk5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKCdcXC9yb29tcy8nLCAnJyk7XHJcblxyXG4gICAgbVNlc3Npb24uTmFtZSA9IGRlY29kZVVSSShlbmNvZGVkU2Vzc2lvbk5hbWUpO1xyXG4gICAgbVVzZXIuTmFtZSA9ICdBbm9ueW1vdXMnO1xyXG5cclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnVXNlckpvaW5TZXNzaW9uJztcclxuICAgIG1lc3NhZ2UuVXNlciA9IG1Vc2VyO1xyXG4gICAgbWVzc2FnZS5TZXNzaW9uID0gbVNlc3Npb247XHJcblxyXG5cdG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRnVuY3Rpb25zIGF1dG9tYXRpY2FsbHkgY2FsbGVkIHdoZW4geW91dHViZSBhcGkncyBhcmUgcmVhZHlcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuZnVuY3Rpb24gb25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkoKSB7XHJcbiAgICBtUGxheWVyLmluaXRpYWxpemVZdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24geXRBcGlSZWFkeSgpIHtcclxuXHRnYXBpLmNsaWVudC5zZXRBcGlLZXkoXCJBSXphU3lDNEEtZHNHay1oYV9iLWVEcGJ4YVZRdDViUjdjT1VkZGNcIik7XHJcblx0Z2FwaS5jbGllbnQubG9hZChcInlvdXR1YmVcIiwgXCJ2M1wiLCBmdW5jdGlvbigpIHt9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25QbGF5ZXJTdGF0ZUNoYW5nZShldmVudCkge1xyXG4gICAgaWYoZXZlbnQuZGF0YT09MCkge1xyXG4gICAgXHRuZXh0VmlkZW9JblF1ZXVlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFdlYlNvY2tldCBtZXNzYWdlIHJlc3BvbnNlIGZ1bmN0aW9uc1xyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxudmFyIG1NZXNzYWdlRnVuY3Rpb25zID0ge1xyXG4gICAgJ3VwZGF0ZVVzZXInOiBvblVwZGF0ZU1lVXNlcixcclxuICAgICdzZXNzaW9uUmVhZHknOiBvblNlc3Npb25SZWFkeSxcclxuICAgICd1cGRhdGVVc2Vyc0xpc3QnOiBvblVwZGF0ZVVzZXJzTGlzdCxcclxuICAgICd1cGRhdGVRdWV1ZSc6IG9uVXBkYXRlUXVldWUsXHJcbiAgICAnY2hhdE1lc3NhZ2UnOiBvblJlY2VpdmVkQ2hhdE1lc3NhZ2UsXHJcbiAgICAncmVxdWVzdFVzZXJTdGF0ZSc6IG9uUmVxdWVzdE15VXNlclN0YXRlLFxyXG4gICAgJ3Byb3ZpZGVVc2VyU3RhdGUnOiBvblVzZXJTdGF0ZVByb3ZpZGVkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uVXNlclN0YXRlUHJvdmlkZWQobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlclRvU3luY1dpdGggPSBtZXNzYWdlLlVzZXI7XHJcblxyXG4gICAgbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICBtVXNlci5TdGF0ZS5UaW1lID0gdXNlclRvU3luY1dpdGguU3RhdGUuVGltZTtcclxuICAgIG1Vc2VyLlN0YXRlLllUUGxheWVyU3RhdGUgPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5ZVFBsYXllclN0YXRlO1xyXG5cclxuICAgIG1VSS51cGRhdGVRdWV1ZShtU2Vzc2lvbi5RdWV1ZSwgbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcblxyXG4gICAgdmFyIGN1cnJlbnRNZWRpYSA9IG1TZXNzaW9uLlF1ZXVlW21Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb25dO1xyXG4gICAgbVBsYXllci5zZXRQbGF5ZXJDb250ZW50KGN1cnJlbnRNZWRpYSwgbVVzZXIuU3RhdGUuVGltZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUmVxdWVzdE15VXNlclN0YXRlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXJEYXRhID0gbmV3IE15VXNlcigpO1xyXG4gICAgdXNlckRhdGEuSWQgPSBtZXNzYWdlLlVzZXIuSWQ7IC8vIFRPRE86IGJhZCBiYWQgYmFkXHJcbiAgICB1c2VyRGF0YS5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgIHVzZXJEYXRhLlN0YXRlLlRpbWUgPSBNYXRoLnJvdW5kKG1QbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSk7XHJcbiAgICB1c2VyRGF0YS5TdGF0ZS5ZVFBsYXllclN0YXRlID0gbVBsYXllci5nZXRDdXJyZW50U3RhdGUoKTtcclxuXHJcbiAgICB2YXIgb3V0Z29pbmdNc2cgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBvdXRnb2luZ01zZy5BY3Rpb24gPSAnUHJvdmlkZVN5bmNUb1VzZXInO1xyXG4gICAgb3V0Z29pbmdNc2cuVXNlciA9IHVzZXJEYXRhO1xyXG4gICAgbVNvY2tldC5lbWl0KG91dGdvaW5nTXNnKTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIG9uVXBkYXRlTWVVc2VyKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXIgPSBtZXNzYWdlLlVzZXI7XHJcbiAgICBtVXNlciA9IHVzZXI7XHRcclxufVxyXG5cclxuZnVuY3Rpb24gb25TZXNzaW9uUmVhZHkobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICBtU2Vzc2lvbiA9IG1lc3NhZ2UuU2Vzc2lvbjtcclxuICAgIG1Vc2VyID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgaWYgKG1TZXNzaW9uLlF1ZXVlLmxlbmd0aCA9PSAwKSB7XHJcblx0XHQkKFwiI3BfY3VycmVudF9jb250ZW50X2luZm9cIikudGV4dChcIlF1ZXVlIHVwIGEgc29uZyFcIik7XHJcblx0XHQkKFwiI3BfY3VycmVudF9yZWNvbW1lbmRlcl9pbmZvXCIpLnRleHQoXCJVc2UgdGhlIHNlYXJjaCBiYXIgYWJvdmUuXCIpO1xyXG5cdH1cclxuICAgIG5leHRWaWRlb0luUXVldWUoKTtcclxuICAgIG1VSS51cGRhdGVVc2Vyc0xpc3QobVNlc3Npb24uVXNlcnMsIG1Vc2VyLklkKTtcclxuICAgIG1VSS5zZXNzaW9uUmVhZHkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25VcGRhdGVVc2Vyc0xpc3QobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlcnMgPSBtZXNzYWdlLlNlc3Npb24uVXNlcnM7XHJcbiAgICBtU2Vzc2lvbi5Vc2VycyA9IHVzZXJzO1xyXG4gICAgbVVJLnVwZGF0ZVVzZXJzTGlzdChtU2Vzc2lvbi5Vc2VycywgbVVzZXIuSWQpO1x0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uVXBkYXRlUXVldWUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICBtU2Vzc2lvbi5RdWV1ZSA9IG1lc3NhZ2UuU2Vzc2lvbi5RdWV1ZTtcclxuICAgIGlmIChtVXNlci5TdGF0ZS5XYWl0aW5nKSB7XHJcbiAgICAgICAgbmV4dFZpZGVvSW5RdWV1ZSgpO1xyXG4gICAgfVxyXG4gICAgbVVJLnVwZGF0ZVF1ZXVlKG1TZXNzaW9uLlF1ZXVlLCBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25SZWNlaXZlZENoYXRNZXNzYWdlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIGNoYXRNZXNzYWdlID0gbWVzc2FnZS5DaGF0TWVzc2FnZTtcclxuICAgIHZhciB1c2VyTmFtZSA9IG1lc3NhZ2UuVXNlci5OYW1lO1xyXG4gICAgbVVJLm9uQ2hhdE1lc3NhZ2UodXNlck5hbWUsIGNoYXRNZXNzYWdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VuZENoYXRNZXNzYWdlKG1zZzogc3RyaW5nKSB7XHJcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0NoYXRNZXNzYWdlJztcclxuICAgIG1lc3NhZ2UuQ2hhdE1lc3NhZ2UgPSBtc2c7XHJcbiAgICBtZXNzYWdlLlVzZXIgPSBtVXNlcjtcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VhcmNoVmlkZW9zKHF1ZXJ5LCBjYWxsYmFjaykge1xyXG5cdHZhciByZXF1ZXN0ID0gZ2FwaS5jbGllbnQueW91dHViZS5zZWFyY2gubGlzdCh7XHJcbiAgICAgICAgcGFydDogXCJzbmlwcGV0XCIsXHJcbiAgICAgICAgdHlwZTogXCJ2aWRlb1wiLFxyXG5cdCAgICBxOiBlbmNvZGVVUklDb21wb25lbnQocXVlcnkpLnJlcGxhY2UoLyUyMC9nLCBcIitcIiksXHJcblx0ICAgIG1heFJlc3VsdHM6IDVcclxuICAgIH0pO1xyXG5cclxuXHRyZXF1ZXN0LmV4ZWN1dGUoY2FsbGJhY2spO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlVXNlck5hbWVDaGFuZ2UobmV3TmFtZSkge1xyXG4gICAgbVVzZXIuTmFtZSA9IG5ld05hbWU7XHJcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG1lc3NhZ2UuVXNlciA9IG1Vc2VyO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnU2F2ZVVzZXJOYW1lQ2hhbmdlJztcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbmV4dFZpZGVvSW5RdWV1ZSgpIHtcclxuICAgIG1Vc2VyLlN0YXRlLlRpbWUgPSAwO1xyXG4gICAgdmFyIHF1ZXVlID0gbVNlc3Npb24uUXVldWU7XHJcblxyXG5cdGlmKG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gKyAxIDwgcXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gKyAxO1xyXG4gICAgICAgIG1QbGF5ZXIuc2V0UGxheWVyQ29udGVudChtU2Vzc2lvbi5RdWV1ZVttVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uXSwgbVVzZXIuU3RhdGUuVGltZSk7XHJcbiAgICAgICAgbVVzZXIuU3RhdGUuV2FpdGluZyA9IGZhbHNlO1xyXG5cdH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIG1Vc2VyLlN0YXRlLldhaXRpbmcgPSB0cnVlO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gcGF1c2VWaWRlbygpIHtcclxuICAgIG1QbGF5ZXIucGF1c2UoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGxheVZpZGVvKCkge1xyXG4gICAgbVBsYXllci5wbGF5KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHByZXZpb3VzVmlkZW9JblF1ZXVlKCkge1xyXG4gICAgbVVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICB2YXIgcXVldWUgPSBtU2Vzc2lvbi5RdWV1ZTtcclxuXHRpZihtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID4gMCkge1xyXG4gICAgICAgIG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIC0gMTtcclxuICAgICAgICBtUGxheWVyLnNldFBsYXllckNvbnRlbnQobVNlc3Npb24uUXVldWVbbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbl0sIG1Vc2VyLlN0YXRlLlRpbWUpO1xyXG5cdFx0bVVzZXIuU3RhdGUuV2FpdGluZyA9IGZhbHNlO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFRoZXNlIGZ1bmN0aW9ucyBhcmUgY2FsbGVkIGRpcmVjdGx5IGVtYmVkZGVkIGludG8gdGhlIGh0bWwuLi4ga2luZGEgd2VpcmRcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmZ1bmN0aW9uIHJlcXVlc3RTeW5jV2l0aFVzZXIodXNlcklkKSB7XHJcbiAgICBjb25zb2xlLmxvZygncmVxdWVzdCBzeW5jIHdpdGggdXNlcicpO1xyXG5cclxuICAgIHZhciB1c2VyID0gbmV3IE15VXNlcigpO1xyXG4gICAgdXNlci5JZCA9IHVzZXJJZDtcclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnUmVxdWVzdFN5bmNXaXRoVXNlcic7XHJcbiAgICBtZXNzYWdlLlVzZXIgPSB1c2VyO1xyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBxdWV1ZVNlbGVjdGVkVmlkZW8oZWxtbnQpIHtcclxuXHJcblx0JChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIikuZmFkZU91dCgpO1xyXG5cdCQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbChcIlwiKTtcclxuXHR2YXIgVmlkZW9JZCA9IGVsbW50LmdldEF0dHJpYnV0ZSgnZGF0YS1WaWRlb0lkJyk7XHJcblx0dmFyIFRpdGxlID0gZWxtbnQuaW5uZXJUZXh0IHx8IGVsbW50LnRleHRDb250ZW50O1xyXG5cdHZhciBUaHVtYlVSTCA9IGVsbW50LmdldEF0dHJpYnV0ZSgnZGF0YS1UaHVtYlVSTCcpO1xyXG5cclxuICAgIHZhciBtZWRpYSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgbWVkaWEuVmlkZW9UaXRsZSA9IFRpdGxlO1xyXG4gICAgbWVkaWEuVmlkZW9UaXRsZSA9IFZpZGVvSWQ7XHJcbiAgICBtZWRpYS5UaHVtYlVSTCA9IFRodW1iVVJMO1xyXG4gICAgbWVkaWEuVXNlcklkID0gbVVzZXIuSWQ7XHJcbiAgICBtZWRpYS5Vc2VyTmFtZSA9IG1Vc2VyLk5hbWU7XHJcblxyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdBZGRNZWRpYVRvU2Vzc2lvbic7XHJcbiAgICBtZXNzYWdlLk1lZGlhID0gbWVkaWE7XHJcblxyXG4gICAgLy9UT0RPOiBsb2NhbCBhZGQgbWVkaWFcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuLy8gVE9ETzogZml4IHRoaXNcclxuZnVuY3Rpb24gZGVsZXRlVmlkZW9JblF1ZXVlKFF1ZXVlUG9zaXRpb246IG51bWJlcikge1xyXG5cdHZhciBpZCA9IG1TZXNzaW9uLlF1ZXVlW1F1ZXVlUG9zaXRpb25dLklkO1xyXG5cdG1TZXNzaW9uLlF1ZXVlLnNwbGljZShRdWV1ZVBvc2l0aW9uLCAxKTtcclxuXHJcbiAgICBtVUkudXBkYXRlUXVldWUobVNlc3Npb24uUXVldWUsIG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG5cclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgdmFyIG1lZGlhVG9EZWxldGUgPSBuZXcgTWVkaWEoKTtcclxuICAgIG1lZGlhVG9EZWxldGUuSWQgPSBpZDtcclxuICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0RlbGV0ZU1lZGlhRnJvbVNlc3Npb24nO1xyXG4gICAgbWVzc2FnZS5NZWRpYSA9IG1lZGlhVG9EZWxldGU7XHJcbiAgICBtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuIiwi77u/aW1wb3J0IHsgV3NNZXNzYWdlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTXlTb2NrZXQge1xyXG5cclxuICAgIHByaXZhdGUgc29ja2V0OiBXZWJTb2NrZXQ7XHJcbiAgICBwcml2YXRlIHJlc3BvbnNlX2Z1bmN0aW9uczogeyBbYWN0aW9uOiBzdHJpbmddOiAoZGF0YTogYW55KSA9PiB2b2lkIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IocmVzcG9uc2VfZnVuY3Rpb25zOiB7IFthY3Rpb246IHN0cmluZ106IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQgfSkge1xyXG4gICAgICAgIHRoaXMucmVzcG9uc2VfZnVuY3Rpb25zID0gcmVzcG9uc2VfZnVuY3Rpb25zO1xyXG4gICAgICAgIHZhciB1cmkgPSBcIndzOi8vXCIgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArIFwiL3dzXCI7XHJcbiAgICAgICAgdmFyIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQodXJpKTtcclxuICAgICAgICBzb2NrZXQub25vcGVuID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuICAgICAgICBzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uIChldmVudCkge307XHJcbiAgICAgICAgc29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XHJcbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBtZXNzYWdlLkFjdGlvbjtcclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlZnVuYyA9IHJlc3BvbnNlX2Z1bmN0aW9uc1thY3Rpb25dO1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBleGNlcHRpb24gd2hlbiBub3QgZm91bmRcclxuICAgICAgICAgICAgcmVzcG9uc2VmdW5jKG1lc3NhZ2UpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBlbWl0KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSB0aGlzLnNvY2tldC5DT05ORUNUSU5HKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xyXG4gICAgfTtcclxuXHJcbn1cclxuIiwi77u/ZXhwb3J0IGNsYXNzIEZyYW1lQnVpbGRlciB7XHJcblxyXG4gICAgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXNlck1lKGNvbG9yOiBzdHJpbmcsIHVzZXJOYW1lOiBzdHJpbmcpIDogc3RyaW5nIHtcclxuICAgICAgICB2YXIgY3VycmVudEhUTUwgPSBcIlwiO1xyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPSAnPGRpdiBjbGFzcz1cImRpdl91c2VyXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAnICsgY29sb3IgKyAnO1wiPiB5b3UgPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID1cclxuICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBmbG9hdDogbGVmdDsgY3Vyc29yOiBwb2ludGVyOyBtYXJnaW4tcmlnaHQ6IDE2cHg7IGhlaWdodDogNDhweDsgd2lkdGg6IDQ4cHg7IGJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+eW91PC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4OyBmbG9hdDogcmlnaHQ7XCI+JyArIHVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudEhUTUw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZXIoY29sb3I6IHN0cmluZywgdXNlcklkOiBudW1iZXIsIHVzZXJOYW1lOiBzdHJpbmcpIDogc3RyaW5nIHtcclxuICAgICAgICB2YXIgY3VycmVudEhUTUwgPSBcIlwiO1xyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPSAnPGRpdiBvbmNsaWNrPVwicmVxdWVzdFN5bmNXaXRoVXNlcignICsgdXNlcklkICsgJylcIiBjbGFzcz1cImRpdl91c2VyXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAnICsgY29sb3IgKyAnO1wiPnN5bmMgd2l0aCAnICsgdXNlck5hbWUgKyAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID1cclxuICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBvbmNsaWNrPVwicmVxdWVzdFN5bmNXaXRoVXNlcignICsgdXNlcklkICsgJylcIiBzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBmbG9hdDogbGVmdDsgY3Vyc29yOiBwb2ludGVyOyBtYXJnaW4tcmlnaHQ6IDE2cHg7IGhlaWdodDogNDhweDsgd2lkdGg6IDQ4cHg7IGJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+c3luYzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDsgZmxvYXQ6IHJpZ2h0O1wiPicgKyB1c2VyTmFtZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRIVE1MO1xyXG4gICAgfVxyXG59Iiwi77u/aW1wb3J0IHsgRnJhbWVCdWlsZGVyIH0gZnJvbSBcIi4vZnJhbWVcIjtcclxuaW1wb3J0IHsgTWVkaWEgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmRlY2xhcmUgdmFyIFNwaW5uZXI6IGFueTtcclxuXHJcbmV4cG9ydCBjbGFzcyBVSUNhbGxiYWNrcyB7XHJcbiAgICBwcmV2aW91c01lZGlhOiBhbnk7XHJcbiAgICBuZXh0TWVkaWE6IGFueTtcclxuICAgIHBsYXlNZWRpYTogYW55O1xyXG4gICAgcGF1c2VNZWRpYTogYW55O1xyXG4gICAgb25TZW5kQ2hhdE1lc3NhZ2U6IGFueTtcclxuICAgIC8vIHNlYXJjaChxdWVyeTogc3RyaW5nLCBjYWxsYmFjazogKHJlc3VsdHM6IGFueSkgPT4gdm9pZCk6IGFueTtcclxuICAgIHNlYXJjaDogYW55O1xyXG4gICAgbmFtZUNoYW5nZTogYW55O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVUkge1xyXG5cclxuICAgIHByaXZhdGUgc3Bpbm5lcjogYW55O1xyXG4gICAgcHJpdmF0ZSBjYWxsYmFja3M6IFVJQ2FsbGJhY2tzO1xyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBmcmFtZUJ1aWxkZXI6IEZyYW1lQnVpbGRlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuLCBjYWxsYmFja3M6IFVJQ2FsbGJhY2tzKSB7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgICAgICB0aGlzLmZyYW1lQnVpbGRlciA9IG5ldyBGcmFtZUJ1aWxkZXIobW9iaWxlQnJvd3Nlcik7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSBjYWxsYmFja3M7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplKCkge1xyXG4gICAgICAgIHRoaXMuc2V0dXBTcGlubmVyVUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwSW5mb1JvbGxvdmVyVUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwSW5wdXRVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBQbGF5ZXJDb250cm9sQnV0dG9ucygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXNzaW9uUmVhZHkoKSB7XHJcbiAgICAgICAgJChcIiNkaXZfbG9hZGluZ1wiKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zcGlubmVyLnN0b3AoKTtcclxuICAgICAgICAkKFwiI2Rpdl9ldmVyeXRoaW5nXCIpLmFuaW1hdGUoe29wYWNpdHk6IDF9LCAnZmFzdCcpO1xyXG4gICAgfSBcclxuXHJcbiAgICBwcml2YXRlIHNldHVwU3Bpbm5lclVJKCkge1xyXG4gICAgICAgIHZhciBvcHRzID0ge1xyXG4gICAgICAgICAgICBsaW5lczogMTMgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XHJcbiAgICAgICAgICAgICwgbGVuZ3RoOiAyOCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxyXG4gICAgICAgICAgICAsIHdpZHRoOiAxNCAvLyBUaGUgbGluZSB0aGlja25lc3NcclxuICAgICAgICAgICAgLCByYWRpdXM6IDQyIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxyXG4gICAgICAgICAgICAsIHNjYWxlOiAxIC8vIFNjYWxlcyBvdmVyYWxsIHNpemUgb2YgdGhlIHNwaW5uZXJcclxuICAgICAgICAgICAgLCBjb3JuZXJzOiAxIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXHJcbiAgICAgICAgICAgICwgY29sb3I6ICcjMDAwJyAvLyAjcmdiIG9yICNycmdnYmIgb3IgYXJyYXkgb2YgY29sb3JzXHJcbiAgICAgICAgICAgICwgb3BhY2l0eTogMC4yNSAvLyBPcGFjaXR5IG9mIHRoZSBsaW5lc1xyXG4gICAgICAgICAgICAsIHJvdGF0ZTogMCAvLyBUaGUgcm90YXRpb24gb2Zmc2V0XHJcbiAgICAgICAgICAgICwgZGlyZWN0aW9uOiAxIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcclxuICAgICAgICAgICAgLCBzcGVlZDogMSAvLyBSb3VuZHMgcGVyIHNlY29uZFxyXG4gICAgICAgICAgICAsIHRyYWlsOiA2MCAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxyXG4gICAgICAgICAgICAsIGZwczogMjAgLy8gRnJhbWVzIHBlciBzZWNvbmQgd2hlbiB1c2luZyBzZXRUaW1lb3V0KCkgYXMgYSBmYWxsYmFjayBmb3IgQ1NTXHJcbiAgICAgICAgICAgICwgekluZGV4OiAyZTkgLy8gVGhlIHotaW5kZXggKGRlZmF1bHRzIHRvIDIwMDAwMDAwMDApXHJcbiAgICAgICAgICAgICwgY2xhc3NOYW1lOiAnc3Bpbm5lcicgLy8gVGhlIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIHNwaW5uZXJcclxuICAgICAgICAgICAgLCB0b3A6ICc1MCUnIC8vIFRvcCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcclxuICAgICAgICAgICAgLCBsZWZ0OiAnNTAlJyAvLyBMZWZ0IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIHNoYWRvdzogZmFsc2UgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcclxuICAgICAgICAgICAgLCBod2FjY2VsOiBmYWxzZSAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb25cclxuICAgICAgICAgICAgLCBwb3NpdGlvbjogJ2Fic29sdXRlJyAvLyBFbGVtZW50IHBvc2l0aW9uaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2X2xvYWRpbmcnKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihvcHRzKS5zcGluKHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cEZhZGVVSShvdmVyYWxsLCByZXN1bHRzKSB7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWVudGVyKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mYWRlSW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG92ZXJhbGwubW91c2VsZWF2ZSgoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwSW5mb1JvbGxvdmVyVUkoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl91c2Vyc19vdmVyYWxsXCIpLCAkKFwiI2Rpdl91c2VyX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X3F1ZXVlX292ZXJhbGxcIiksICQoXCIjZGl2X3F1ZXVlX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X2NoYXRfb3ZlcmFsbFwiKSwgJChcIiNkaXZfY2hhdF9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9jY19vdmVyYWxsXCIpLCAkKFwiI2Rpdl9jY19yZXN1bHRzXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWFyY2hUZXh0Q2hhbmdlZCh0ZXh0KSB7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBpZih0ZXh0Lmxlbmd0aD09MCkge1xyXG4gICAgICAgICAgICBkaXZSZXN1bHRzLmZhZGVPdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cElucHV0VUkoKSB7XHJcbiAgICAgICAgdmFyIGlucHV0U2VhcmNoID0gJChcIiNpbnB1dF9zZWFyY2hcIik7XHJcbiAgICAgICAgaW5wdXRTZWFyY2gua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoRW50ZXJQcmVzc2VkKGlucHV0U2VhcmNoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBpbnB1dF9uYW1lID0gJChcIiNpbnB1dF9uYW1lXCIpO1xyXG4gICAgICAgIGlucHV0X25hbWUua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlck5hbWVDaGFuZ2UoaW5wdXRfbmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dF9jaGF0ID0gJChcIiNpbnB1dF9jaGF0XCIpO1xyXG4gICAgICAgICAgICBpbnB1dF9jaGF0LmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uU2VuZENoYXRNZXNzYWdlKGlucHV0X2NoYXQudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0X2NoYXQudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIikuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoXCJcIik7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuYmluZChcInByb3BlcnR5Y2hhbmdlIGlucHV0IHBhc3RlXCIsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaFRleHRDaGFuZ2VkKCQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbCgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwUGxheWVyQ29udHJvbEJ1dHRvbnMoKSB7XHJcbiAgICAgICAgJChcIiNidG5fcHJldmlvdXNcIikuY2xpY2sodGhpcy5jYWxsYmFja3MucHJldmlvdXNNZWRpYSk7XHJcbiAgICAgICAgJChcIiNidG5fcGF1c2VcIikuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BsYXlcIikuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5wYXVzZU1lZGlhKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChcIiNidG5fcGxheVwiKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BsYXlcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2J0bl91YXNlXCIpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MucGxheU1lZGlhKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChcIiNidG5fbmV4dFwiKS5jbGljayh0aGlzLmNhbGxiYWNrcy5uZXh0TWVkaWEpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VhcmNoRW50ZXJQcmVzc2VkKGlucHV0X3NlYXJjaCkge1xyXG4gICAgICAgIHZhciBkaXZSZXN1bHRzID0gJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgZGl2UmVzdWx0cy5odG1sKFwiXCIpO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnNlYXJjaChpbnB1dF9zZWFyY2gudmFsKCksIChyZXN1bHRzKSA9PiB7XHJcbiAgICAgICAgICAgICQuZWFjaChyZXN1bHRzLml0ZW1zLCAoaW5kZXgsIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgIGRpdlJlc3VsdHMuaHRtbChkaXZSZXN1bHRzLmh0bWwoKSArIFwiPGRpdiBjbGFzcz0nZGl2X3NlYXJjaF9yZXN1bHQnIG9uQ2xpY2s9J3F1ZXVlU2VsZWN0ZWRWaWRlbyh0aGlzKScgZGF0YS1WaWRlb0lkPSdcIiArIGl0ZW0uaWQudmlkZW9JZCArIFwiJyBkYXRhLVRodW1iVVJMPSdcIitpdGVtLnNuaXBwZXQudGh1bWJuYWlscy5tZWRpdW0udXJsK1wiJz5cIiArICc8cCBjbGFzcz1cInRleHRfc2VhcmNoX3Jlc3VsdFwiPicgKyAgaXRlbS5zbmlwcGV0LnRpdGxlKyAnPC9wPjwvZGl2PicgKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlucHV0X3NlYXJjaC5ibHVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYoIWRpdlJlc3VsdHMuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgZGl2UmVzdWx0cy5mYWRlSW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVF1ZXVlKHF1ZXVlOiBNZWRpYVtdLCBxdWV1ZVBvc2l0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcXVldWUubGVuZ3RoO1xyXG4gICAgICAgIHZhciBsZW5ndGhVcE5leHQgPSBxdWV1ZS5sZW5ndGggLSBxdWV1ZVBvc2l0aW9uO1xyXG4gICAgICAgIHZhciBzdW1tYXJ5ID0gbGVuZ3RoVXBOZXh0ICsgXCIgdGhpbmdzIHVwIG5leHRcIjtcclxuICAgICAgICBpZiAobGVuZ3RoVXBOZXh0ID09IDEpIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IGxlbmd0aFVwTmV4dCArIFwiIHRoaW5nIHVwIG5leHRcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobGVuZ3RoVXBOZXh0IDw9IDApIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IFwiTm90aGluZyB1cCBuZXh0LiBRdWV1ZSBzb21ldGhpbmchXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjcF9xdWV1ZV9zdW1tYXJ5XCIpLnRleHQoc3VtbWFyeSk7XHJcblxyXG4gICAgICAgIHZhciBxdWV1ZVJlc3VsdHMgPSAkKFwiI2Rpdl9xdWV1ZV9yZXN1bHRzXCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgbWVkaWEgPSBxdWV1ZVtpXTtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEhUTUwgPSAnPGltZyBzdHlsZT1cImZsb2F0OiBsZWZ0OyB3aWR0aDogMzMuMzMlOyBoZWlnaHQ6IDIwdnc7XCIgc3JjPVwiJyAgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRIVE1MID1cclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICc8aW1nIHN0eWxlPVwiaGVpZ2h0OiA5MHB4OyB3aWR0aDogMTYwcHg7IG1hcmdpbi1yaWdodDogMTZweDtcIiBzcmM9XCInICsgbWVkaWEuVGh1bWJVUkwgKyAnXCIvPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7XCI+JyArIG1lZGlhLlZpZGVvVGl0bGUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGh0bWwucHVzaChjdXJyZW50SFRNTCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBxdWV1ZVJlc3VsdHMuaHRtbChodG1sLmpvaW4oXCJcIikpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlVXNlcnNMaXN0KHVzZXJzLCB1c2VySWRNZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG51bSA9IHVzZXJzLmxlbmd0aDtcclxuICAgICAgICB2YXIgc3VtbWFyeSA9IHVzZXJzLmxlbmd0aCArIFwiIHVzZXJzIGluIHRoZSByb29tXCI7XHJcbiAgICAgICAgaWYgKG51bSA9PSAxKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSB1c2Vycy5sZW5ndGggKyBcIiB1c2VyIGluIHRoZSByb29tXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjcF91c2Vyc19zdW1tYXJ5XCIpLnRleHQoc3VtbWFyeSk7XHJcbiAgICAgICAgdmFyIHVzZXJSZXN1bHRzID0gJChcIiNkaXZfdXNlcl9yZXN1bHRzXCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gW107XHJcbiAgICAgICAgLy9UT0RPOiBwdXQgc3R5bGUgaW4gY3NzIGFuZCBtYWtlIHNjcm9sbGV5XHJcbiAgICAgICAgJC5lYWNoKHVzZXJzLCAoaW5kZXgsIHVzZXIpID0+IHtcclxuICAgICAgICAgICAgdmFyIHRoaXNJc01lID0gKHVzZXIuSWQgPT09IHVzZXJJZE1lKTtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MO1xyXG4gICAgICAgICAgICBpZiAodGhpc0lzTWUpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gdGhpcy5mcmFtZUJ1aWxkZXIudXNlck1lKCdncmVlbicsIHVzZXIuTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50SFRNTCA9IHRoaXMuZnJhbWVCdWlsZGVyLnVzZXIoJ2dyZWVuJywgdXNlci5JZCwgdXNlci5OYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBodG1sLnB1c2goY3VycmVudEhUTUwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVzZXJSZXN1bHRzLmh0bWwoaHRtbC5qb2luKFwiXCIpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXNlck5hbWVDaGFuZ2UobmFtZV9pbnB1dCkge1xyXG4gICAgICAgIG5hbWVfaW5wdXQuaGlkZSgpO1xyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmZhZGVJbigpO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLm5hbWVDaGFuZ2UobmFtZV9pbnB1dC52YWwoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQ2hhdE1lc3NhZ2UodXNlck5hbWU6IHN0cmluZywgbXNnOiBzdHJpbmcpIHtcclxuICAgICAgICAvL1RPRE86IGNvbG9yIHN0dWZmXHJcbiAgICAgICAgdmFyIGh0bWwgPSAnPGxpIGNsYXNzPVwiY2hhdFwiPjxzcGFuIHN0eWxlPVwibWFyZ2luOiAwOyBjb2xvcjogJyArICdibHVlJyArICc7XCI+JyArIHVzZXJOYW1lICsgJzogPC9zcGFuPjxzcGFuPicgKyBtc2cgKyAnPC9zcGFuPjwvbGk+JztcclxuICAgICAgICAkKFwiI3VsX2NoYXRcIikuYXBwZW5kKGh0bWwpO1xyXG4gICAgfVxyXG59Il19
