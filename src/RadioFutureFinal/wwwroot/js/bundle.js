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
                'onReady': this.onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        if (this.mobileBrowser) {
            var div_player = $("#div_player");
            div_player.height(div_player.width() * 9.0 / 16.0);
        }
    };
    Player.prototype.setPlayerContent = function (queue, userState) {
        if (userState.QueuePosition != -1) {
            var media = queue[userState.QueuePosition];
            this.updatePlayerUI(media, userState.Time);
        }
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
    Player.prototype.onPlayerReady = function (event) {
        this.playerReady = true;
    };
    return Player;
}());
exports.Player = Player;
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.ytApiReady = ytApiReady;
//TODO: All this code is miserably awful. At some point it should be completely reworked.
var COLOR_LIST = ["red", "orange", "yellow", "green", "blue", "violet"];
var Contracts_1 = require("./Contracts");
var ui_1 = require("./ui");
var Sockets_1 = require("./Sockets");
var Player_1 = require("./Player");
var mMeUser = new Contracts_1.MyUser();
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
//==================================================================
// Functions automatically called when youtube api's are ready
//==================================================================
function onYouTubeIframeAPIReady() {
    console.log('foo');
    mPlayer.initializeYtPlayer(onPlayerStateChange);
}
function ytApiReady() {
    console.log('bar');
    gapi.client.setApiKey("AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc");
    gapi.client.load("youtube", "v3", function () { });
}
function onPlayerStateChange(event) {
    if (event.data == 0) {
        nextVideoInQueue();
    }
}
//==================================================================
// Backend video and queue control functions
//==================================================================
function deleteVideoInQueue(QueuePosition) {
    var id = mSession.Queue[QueuePosition].Id;
    mSession.Queue.splice(QueuePosition, 1);
    mUI.updateQueue(mSession.Queue, mMeUser.State.QueuePosition + 1);
    var message = new Contracts_1.WsMessage();
    var mediaToDelete = new Contracts_1.Media();
    mediaToDelete.Id = id;
    message.Action = 'DeleteMediaFromSession';
    message.Media = mediaToDelete;
    mSocket.emit(message);
}
function requestSyncWithUser(userId) {
    console.log('request sync with user');
    var user = new Contracts_1.MyUser();
    user.Id = userId;
    var message = new Contracts_1.WsMessage();
    message.Action = 'RequestSyncWithUser';
    message.User = user;
    mSocket.emit(message);
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
    mMeUser.State.QueuePosition = userToSyncWith.State.QueuePosition;
    mMeUser.State.Time = userToSyncWith.State.Time;
    mMeUser.State.YTPlayerState = userToSyncWith.State.YTPlayerState;
    mUI.updateQueue(mSession.Queue, mMeUser.State.QueuePosition + 1);
    mPlayer.setPlayerContent(mSession.Queue, mMeUser.State);
}
function onRequestMyUserState(message) {
    var userData = new Contracts_1.MyUser();
    userData.Id = message.User.Id; // TODO: bad bad bad
    userData.State.QueuePosition = mMeUser.State.QueuePosition;
    userData.State.Time = Math.round(mPlayer.getCurrentTime());
    userData.State.YTPlayerState = mPlayer.getCurrentState();
    var outgoingMsg = new Contracts_1.WsMessage();
    outgoingMsg.Action = 'ProvideSyncToUser';
    outgoingMsg.User = userData;
    mSocket.emit(outgoingMsg);
}
function onUpdateMeUser(message) {
    var user = message.User;
    mMeUser = user;
}
function onSessionReady(message) {
    mSession = message.Session;
    mMeUser = message.User;
    if (mSession.Queue.length == 0) {
        $("#p_current_content_info").text("Queue up a song!");
        $("#p_current_recommender_info").text("Use the search bar above.");
    }
    nextVideoInQueue();
    mUI.updateUsersList(mSession.Users, mMeUser.Id);
    mUI.sessionReady();
}
function onUpdateUsersList(message) {
    var users = message.Session.Users;
    mSession.Users = users;
    mUI.updateUsersList(mSession.Users, mMeUser.Id);
}
function onUpdateQueue(message) {
    var queue = message.Session.Queue;
    mSession.Queue = queue;
    mUI.updateQueue(queue, mMeUser.State.QueuePosition + 1);
    if (mMeUser.State.Waiting) {
        nextVideoInQueue();
    }
}
function onReceivedChatMessage(data) {
    var msg = data.ChatMessage;
    var userName = data.User.Name;
    mUI.onChatMessage(userName, msg);
}
function setupJamSession() {
    var pathname = window.location.pathname;
    var encodedSessionName = pathname.replace('\/rooms/', '');
    mSession.Name = decodeURI(encodedSessionName);
    mMeUser.Name = 'Anonymous';
    var message = new Contracts_1.WsMessage();
    message.Action = 'UserJoinSession';
    message.User = mMeUser;
    message.Session = mSession;
    mSocket.emit(message);
}
function sendChatMessage(msg) {
    var message = new Contracts_1.WsMessage();
    message.Action = 'ChatMessage';
    message.ChatMessage = msg;
    message.User = mMeUser;
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
    mMeUser.Name = newName;
    var message = new Contracts_1.WsMessage();
    message.User = mMeUser;
    message.Action = 'SaveUserNameChange';
    mSocket.emit(message);
}
function nextVideoInQueue() {
    mMeUser.State.Time = 0;
    var queue = mSession.Queue;
    if ((mMeUser.State.QueuePosition + 1) < queue.length) {
        mMeUser.State.QueuePosition = mMeUser.State.QueuePosition + 1;
        mPlayer.setPlayerContent(mSession.Queue, mMeUser.State);
        mMeUser.State.Waiting = false;
    }
    else {
        mMeUser.State.Waiting = true;
    }
}
function pauseVideo() {
    mPlayer.pause();
}
function playVideo() {
    mPlayer.play();
}
function previousVideoInQueue() {
    mMeUser.State.Time = 0;
    var queue = mSession.Queue;
    if (mMeUser.State.QueuePosition > 0) {
        mMeUser.State.QueuePosition = mMeUser.State.QueuePosition - 1;
        mPlayer.setPlayerContent(mSession.Queue, mMeUser.State);
        mMeUser.State.Waiting = false;
    }
}
//==================================================================
// These functions are called directly embedded into the html... kinda weird
//==================================================================
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
    media.UserId = mMeUser.Id;
    media.UserName = mMeUser.Name;
    var message = new Contracts_1.WsMessage();
    message.Action = 'AddMediaToSession';
    message.Media = media;
    //TODO: local add media
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
        var response = this.callbacks.search(input_search.val(), function (results) {
            $.each(response.items, function (index, item) {
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
        if (lengthUpNext > 0) {
            //TODO: put style in css and make scrolley
            for (var i = queuePosition; i < length; i++) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9QbGF5ZXIudHMiLCJUeXBlU2NyaXB0cy9Sb29tLnRzIiwiVHlwZVNjcmlwdHMvU29ja2V0cy50cyIsIlR5cGVTY3JpcHRzL2ZyYW1lLnRzIiwiVHlwZVNjcmlwdHMvdWkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FDO0lBQUE7SUFPRCxDQUFDO0lBQUQsWUFBQztBQUFELENBUEMsQUFPQSxJQUFBO0FBUGEsc0JBQUs7QUFTbkI7SUFBQTtJQUlBLENBQUM7SUFBRCxhQUFDO0FBQUQsQ0FKQSxBQUlDLElBQUE7QUFKWSx3QkFBTTtBQU1uQjtJQUFBO0lBS0EsQ0FBQztJQUFELGdCQUFDO0FBQUQsQ0FMQSxBQUtDLElBQUE7QUFMWSw4QkFBUztBQU90QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDekJ0QjtJQU9JLGdCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxtQ0FBa0IsR0FBekIsVUFBMEIsbUJBQW1CO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtZQUMzQyxNQUFNLEVBQUUsTUFBTTtZQUNkLEtBQUssRUFBRSxNQUFNO1lBQ2IsVUFBVSxFQUFFO2dCQUNSLFFBQVEsRUFBRSxDQUFDO2dCQUNYLFFBQVEsRUFBRSxDQUFDO2dCQUNYLFFBQVEsRUFBRSxDQUFDO2FBQ2Q7WUFDRCxNQUFNLEVBQUU7Z0JBQ0osU0FBUyxF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QUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU0sMEJBQWEsR0FBcEIsVUFBcUIsUUFBZ0IsRUFBRSxHQUFXO1FBQzlDLG1CQUFtQjtRQUNuQixJQUFJLElBQUksR0FBRyxrREFBa0QsR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLFFBQVEsR0FBRyxpQkFBaUIsR0FBRyxHQUFHLEdBQUcsY0FBYyxDQUFDO1FBQ3JJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNMLFNBQUM7QUFBRCxDQXhOQSxBQXdOQyxJQUFBO0FBeE5ZLGdCQUFFIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7v2V4cG9ydCBjbGFzcyBNZWRpYSB7XHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgVXNlcklkOiBudW1iZXI7XHJcbiAgICBVc2VyTmFtZTogc3RyaW5nO1xyXG4gICAgWVRWaWRlb0lEOiBudW1iZXI7XHJcbiAgICBWaWRlb1RpdGxlOiBzdHJpbmc7XHJcbiAgICBUaHVtYlVSTDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTXlVc2VyIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBTdGF0ZTogVXNlclN0YXRlO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVXNlclN0YXRlIHtcclxuICAgIFRpbWU6IG51bWJlcjtcclxuICAgIFF1ZXVlUG9zaXRpb246IG51bWJlcjtcclxuICAgIFlUUGxheWVyU3RhdGU6IG51bWJlcjtcclxuICAgIFdhaXRpbmc6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXNzaW9uIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBVc2VyczogTXlVc2VyW107XHJcbiAgICBRdWV1ZTogTWVkaWFbXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFdzTWVzc2FnZSB7XHJcbiAgICBBY3Rpb246IHN0cmluZztcclxuICAgIFNlc3Npb246IFNlc3Npb247XHJcbiAgICBNZWRpYTogTWVkaWE7XHJcbiAgICBVc2VyOiBNeVVzZXI7XHJcbiAgICBDaGF0TWVzc2FnZTogc3RyaW5nO1xyXG59Iiwi77u/ZGVjbGFyZSB2YXIgWVQ6IGFueTtcclxuXHJcbmltcG9ydCB7IE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXIge1xyXG5cclxuICAgIHByaXZhdGUgeXRQbGF5ZXI6IGFueTtcclxuICAgIHByaXZhdGUgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgcGxheWVyUmVhZHk6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMucGxheWVyUmVhZHkgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0aWFsaXplWXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSkge1xyXG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCdkaXZfeXRfcGxheWVyJywge1xyXG4gICAgICAgICAgICBoZWlnaHQ6ICdhdXRvJyxcclxuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgcGxheWVyVmFyczoge1xyXG4gICAgICAgICAgICAgICAgY29udHJvbHM6IDEsXHJcbiAgICAgICAgICAgICAgICBzaG93aW5mbzogMCxcclxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGV2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgJ29uUmVhZHknOiB0aGlzLm9uUGxheWVyUmVhZHksXHJcbiAgICAgICAgICAgICAgICAnb25TdGF0ZUNoYW5nZSc6IG9uUGxheWVyU3RhdGVDaGFuZ2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBkaXZfcGxheWVyID0gJChcIiNkaXZfcGxheWVyXCIpO1xyXG4gICAgICAgICAgICBkaXZfcGxheWVyLmhlaWdodChkaXZfcGxheWVyLndpZHRoKCkgKiA5LjAgLyAxNi4wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBsYXllckNvbnRlbnQocXVldWU6IE1lZGlhW10sIHVzZXJTdGF0ZTogVXNlclN0YXRlKSB7XHJcbiAgICAgICAgaWYgKHVzZXJTdGF0ZS5RdWV1ZVBvc2l0aW9uICE9IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBtZWRpYSA9IHF1ZXVlW3VzZXJTdGF0ZS5RdWV1ZVBvc2l0aW9uXTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVQbGF5ZXJVSShtZWRpYSwgdXNlclN0YXRlLlRpbWUpO1x0XHRcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wbGF5VmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGF1c2UoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wYXVzZVZpZGVvKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVQbGF5ZXJVSShtZWRpYTogTWVkaWEsIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueXRQbGF5ZXIubG9hZFZpZGVvQnlJZChtZWRpYS5ZVFZpZGVvSUQsIHRpbWUsIFwibGFyZ2VcIik7XHRcclxuICAgICAgICAkKFwiI3BfY2Nfc3VtbWFyeVwiKS50ZXh0KG1lZGlhLlZpZGVvVGl0bGUpO1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBodG1sID1cclxuICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpbWcgc3R5bGU9XCJoZWlnaHQ6IDkwcHg7IHdpZHRoOiAxNjBweDsgbWFyZ2luLXJpZ2h0OiAxNnB4O1wiIHNyYz1cIicgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7XCI+JyArIG1lZGlhLlZpZGVvVGl0bGUgKyAnPGJyPicgKyAnUmVjb21tZW5kZWQgYnk6ICcgKyBtZWRpYS5Vc2VyTmFtZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl9jY19yZXN1bHRzXCIpLmh0bWwoaHRtbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDdXJyZW50VGltZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHRoaXMueXRQbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRTdGF0ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHRoaXMueXRQbGF5ZXIuZ2V0UGxheWVyU3RhdGUoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvblBsYXllclJlYWR5KGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG59Iiwi77u/KDxhbnk+d2luZG93KS5vbllvdVR1YmVJZnJhbWVBUElSZWFkeSA9IG9uWW91VHViZUlmcmFtZUFQSVJlYWR5O1xyXG4oPGFueT53aW5kb3cpLnl0QXBpUmVhZHkgPSB5dEFwaVJlYWR5O1xyXG4vL1RPRE86IEFsbCB0aGlzIGNvZGUgaXMgbWlzZXJhYmx5IGF3ZnVsLiBBdCBzb21lIHBvaW50IGl0IHNob3VsZCBiZSBjb21wbGV0ZWx5IHJld29ya2VkLlxyXG5cclxudmFyIENPTE9SX0xJU1QgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImJsdWVcIiwgXCJ2aW9sZXRcIl07XHJcblxyXG5pbXBvcnQgeyBNeVVzZXIsIE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUsIFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBVSUNhbGxiYWNrcywgVUkgfSBmcm9tIFwiLi91aVwiO1xyXG5pbXBvcnQgeyBNeVNvY2tldCB9IGZyb20gXCIuL1NvY2tldHNcIlxyXG5pbXBvcnQgeyBQbGF5ZXIgfSBmcm9tIFwiLi9QbGF5ZXJcIlxyXG5cclxuZGVjbGFyZSB2YXIgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuZGVjbGFyZSB2YXIgZ2FwaTogYW55O1xyXG5cclxudmFyIG1NZVVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbnZhciBtU2Vzc2lvbiA9IG5ldyBTZXNzaW9uKCk7XHJcbnZhciBtVUk6IFVJO1xyXG52YXIgbVBsYXllcjogUGxheWVyO1xyXG52YXIgbVNvY2tldDogTXlTb2NrZXQ7XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgdmFyIGNhbGxiYWNrcyA9IG5ldyBVSUNhbGxiYWNrcygpO1xyXG4gICAgY2FsbGJhY2tzLm9uU2VuZENoYXRNZXNzYWdlID0gc2VuZENoYXRNZXNzYWdlO1xyXG4gICAgY2FsbGJhY2tzLm5hbWVDaGFuZ2UgPSBzYXZlVXNlck5hbWVDaGFuZ2U7XHJcbiAgICBjYWxsYmFja3MubmV4dE1lZGlhID0gbmV4dFZpZGVvSW5RdWV1ZTtcclxuICAgIGNhbGxiYWNrcy5wYXVzZU1lZGlhID0gcGF1c2VWaWRlbztcclxuICAgIGNhbGxiYWNrcy5wbGF5TWVkaWEgPSBwbGF5VmlkZW87XHJcbiAgICBjYWxsYmFja3MucHJldmlvdXNNZWRpYSA9IHByZXZpb3VzVmlkZW9JblF1ZXVlO1xyXG4gICAgY2FsbGJhY2tzLnNlYXJjaCA9IHNlYXJjaFZpZGVvcztcclxuXHJcbiAgICBtVUkgPSBuZXcgVUkobW9iaWxlQnJvd3NlciwgY2FsbGJhY2tzKTtcclxuICAgIG1QbGF5ZXIgPSBuZXcgUGxheWVyKG1vYmlsZUJyb3dzZXIpO1xyXG4gICAgbVNvY2tldCA9IG5ldyBNeVNvY2tldChtTWVzc2FnZUZ1bmN0aW9ucyk7XHJcblxyXG4gICAgc2V0dXBKYW1TZXNzaW9uKCk7XHJcbn0pO1xyXG5cclxuXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZ1bmN0aW9ucyBhdXRvbWF0aWNhbGx5IGNhbGxlZCB3aGVuIHlvdXR1YmUgYXBpJ3MgYXJlIHJlYWR5XHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbmZ1bmN0aW9uIG9uWW91VHViZUlmcmFtZUFQSVJlYWR5KCkge1xyXG4gICAgY29uc29sZS5sb2coJ2ZvbycpO1xyXG4gICAgbVBsYXllci5pbml0aWFsaXplWXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHl0QXBpUmVhZHkoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnYmFyJyk7XHJcblx0Z2FwaS5jbGllbnQuc2V0QXBpS2V5KFwiQUl6YVN5QzRBLWRzR2staGFfYi1lRHBieGFWUXQ1YlI3Y09VZGRjXCIpO1xyXG5cdGdhcGkuY2xpZW50LmxvYWQoXCJ5b3V0dWJlXCIsIFwidjNcIiwgZnVuY3Rpb24oKSB7fSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUGxheWVyU3RhdGVDaGFuZ2UoZXZlbnQpIHtcclxuICAgIGlmKGV2ZW50LmRhdGE9PTApIHtcclxuICAgIFx0bmV4dFZpZGVvSW5RdWV1ZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBCYWNrZW5kIHZpZGVvIGFuZCBxdWV1ZSBjb250cm9sIGZ1bmN0aW9uc1xyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5mdW5jdGlvbiBkZWxldGVWaWRlb0luUXVldWUoUXVldWVQb3NpdGlvbjogbnVtYmVyKSB7XHJcblx0dmFyIGlkID0gbVNlc3Npb24uUXVldWVbUXVldWVQb3NpdGlvbl0uSWQ7XHJcblx0bVNlc3Npb24uUXVldWUuc3BsaWNlKFF1ZXVlUG9zaXRpb24sIDEpO1xyXG5cclxuICAgIG1VSS51cGRhdGVRdWV1ZShtU2Vzc2lvbi5RdWV1ZSwgbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMSk7XHJcblxyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICB2YXIgbWVkaWFUb0RlbGV0ZSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgbWVkaWFUb0RlbGV0ZS5JZCA9IGlkO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnRGVsZXRlTWVkaWFGcm9tU2Vzc2lvbic7XHJcbiAgICBtZXNzYWdlLk1lZGlhID0gbWVkaWFUb0RlbGV0ZTtcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlcXVlc3RTeW5jV2l0aFVzZXIodXNlcklkKSB7XHJcbiAgICBjb25zb2xlLmxvZygncmVxdWVzdCBzeW5jIHdpdGggdXNlcicpO1xyXG5cclxuICAgIHZhciB1c2VyID0gbmV3IE15VXNlcigpO1xyXG4gICAgdXNlci5JZCA9IHVzZXJJZDtcclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnUmVxdWVzdFN5bmNXaXRoVXNlcic7XHJcbiAgICBtZXNzYWdlLlVzZXIgPSB1c2VyO1xyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBXZWJTb2NrZXQgbWVzc2FnZSByZXNwb25zZSBmdW5jdGlvbnNcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbnZhciBtTWVzc2FnZUZ1bmN0aW9ucyA9IHtcclxuICAgICd1cGRhdGVVc2VyJzogb25VcGRhdGVNZVVzZXIsXHJcbiAgICAnc2Vzc2lvblJlYWR5Jzogb25TZXNzaW9uUmVhZHksXHJcbiAgICAndXBkYXRlVXNlcnNMaXN0Jzogb25VcGRhdGVVc2Vyc0xpc3QsXHJcbiAgICAndXBkYXRlUXVldWUnOiBvblVwZGF0ZVF1ZXVlLFxyXG4gICAgJ2NoYXRNZXNzYWdlJzogb25SZWNlaXZlZENoYXRNZXNzYWdlLFxyXG4gICAgJ3JlcXVlc3RVc2VyU3RhdGUnOiBvblJlcXVlc3RNeVVzZXJTdGF0ZSxcclxuICAgICdwcm92aWRlVXNlclN0YXRlJzogb25Vc2VyU3RhdGVQcm92aWRlZFxyXG59XHJcblxyXG5mdW5jdGlvbiBvblVzZXJTdGF0ZVByb3ZpZGVkKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXJUb1N5bmNXaXRoID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdXNlclRvU3luY1dpdGguU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgIG1NZVVzZXIuU3RhdGUuVGltZSA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlRpbWU7XHJcbiAgICBtTWVVc2VyLlN0YXRlLllUUGxheWVyU3RhdGUgPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5ZVFBsYXllclN0YXRlO1xyXG4gICAgbVVJLnVwZGF0ZVF1ZXVlKG1TZXNzaW9uLlF1ZXVlLCBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gKyAxKTtcclxuICAgIG1QbGF5ZXIuc2V0UGxheWVyQ29udGVudChtU2Vzc2lvbi5RdWV1ZSwgbU1lVXNlci5TdGF0ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUmVxdWVzdE15VXNlclN0YXRlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXJEYXRhID0gbmV3IE15VXNlcigpO1xyXG4gICAgdXNlckRhdGEuSWQgPSBtZXNzYWdlLlVzZXIuSWQ7IC8vIFRPRE86IGJhZCBiYWQgYmFkXHJcbiAgICB1c2VyRGF0YS5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uO1xyXG4gICAgdXNlckRhdGEuU3RhdGUuVGltZSA9IE1hdGgucm91bmQobVBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIHVzZXJEYXRhLlN0YXRlLllUUGxheWVyU3RhdGUgPSBtUGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpO1xyXG5cclxuICAgIHZhciBvdXRnb2luZ01zZyA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG91dGdvaW5nTXNnLkFjdGlvbiA9ICdQcm92aWRlU3luY1RvVXNlcic7XHJcbiAgICBvdXRnb2luZ01zZy5Vc2VyID0gdXNlckRhdGE7XHJcbiAgICBtU29ja2V0LmVtaXQob3V0Z29pbmdNc2cpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gb25VcGRhdGVNZVVzZXIobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlciA9IG1lc3NhZ2UuVXNlcjtcclxuICAgIG1NZVVzZXIgPSB1c2VyO1x0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uU2Vzc2lvblJlYWR5KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgbVNlc3Npb24gPSBtZXNzYWdlLlNlc3Npb247XHJcbiAgICBtTWVVc2VyID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgaWYgKG1TZXNzaW9uLlF1ZXVlLmxlbmd0aCA9PSAwKSB7XHJcblx0XHQkKFwiI3BfY3VycmVudF9jb250ZW50X2luZm9cIikudGV4dChcIlF1ZXVlIHVwIGEgc29uZyFcIik7XHJcblx0XHQkKFwiI3BfY3VycmVudF9yZWNvbW1lbmRlcl9pbmZvXCIpLnRleHQoXCJVc2UgdGhlIHNlYXJjaCBiYXIgYWJvdmUuXCIpO1xyXG5cdH1cclxuICAgIG5leHRWaWRlb0luUXVldWUoKTtcclxuICAgIG1VSS51cGRhdGVVc2Vyc0xpc3QobVNlc3Npb24uVXNlcnMsIG1NZVVzZXIuSWQpO1xyXG4gICAgbVVJLnNlc3Npb25SZWFkeSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvblVwZGF0ZVVzZXJzTGlzdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIHZhciB1c2VycyA9IG1lc3NhZ2UuU2Vzc2lvbi5Vc2VycztcclxuICAgIG1TZXNzaW9uLlVzZXJzID0gdXNlcnM7XHJcbiAgICBtVUkudXBkYXRlVXNlcnNMaXN0KG1TZXNzaW9uLlVzZXJzLCBtTWVVc2VyLklkKTtcdFxyXG59XHJcblxyXG5mdW5jdGlvbiBvblVwZGF0ZVF1ZXVlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHF1ZXVlID0gbWVzc2FnZS5TZXNzaW9uLlF1ZXVlO1xyXG4gICAgbVNlc3Npb24uUXVldWUgPSBxdWV1ZTtcclxuICAgIG1VSS51cGRhdGVRdWV1ZShxdWV1ZSwgbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMSk7XHJcbiAgICBpZiAobU1lVXNlci5TdGF0ZS5XYWl0aW5nKSB7XHJcbiAgICAgICAgbmV4dFZpZGVvSW5RdWV1ZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBvblJlY2VpdmVkQ2hhdE1lc3NhZ2UoZGF0YSkge1xyXG5cdHZhciBtc2cgPSBkYXRhLkNoYXRNZXNzYWdlO1xyXG4gICAgdmFyIHVzZXJOYW1lID0gZGF0YS5Vc2VyLk5hbWU7XHJcbiAgICBtVUkub25DaGF0TWVzc2FnZSh1c2VyTmFtZSwgbXNnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0dXBKYW1TZXNzaW9uKCkge1xyXG5cdHZhciBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuXHR2YXIgZW5jb2RlZFNlc3Npb25OYW1lID0gcGF0aG5hbWUucmVwbGFjZSgnXFwvcm9vbXMvJywgJycpO1xyXG5cclxuICAgIG1TZXNzaW9uLk5hbWUgPSBkZWNvZGVVUkkoZW5jb2RlZFNlc3Npb25OYW1lKTtcclxuICAgIG1NZVVzZXIuTmFtZSA9ICdBbm9ueW1vdXMnO1xyXG5cclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnVXNlckpvaW5TZXNzaW9uJztcclxuICAgIG1lc3NhZ2UuVXNlciA9IG1NZVVzZXI7XHJcbiAgICBtZXNzYWdlLlNlc3Npb24gPSBtU2Vzc2lvbjtcclxuXHJcblx0bVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZW5kQ2hhdE1lc3NhZ2UobXNnOiBzdHJpbmcpIHtcclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnQ2hhdE1lc3NhZ2UnO1xyXG4gICAgbWVzc2FnZS5DaGF0TWVzc2FnZSA9IG1zZztcclxuICAgIG1lc3NhZ2UuVXNlciA9IG1NZVVzZXI7XHJcbiAgICBtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlYXJjaFZpZGVvcyhxdWVyeSwgY2FsbGJhY2spIHtcclxuXHR2YXIgcmVxdWVzdCA9IGdhcGkuY2xpZW50LnlvdXR1YmUuc2VhcmNoLmxpc3Qoe1xyXG4gICAgICAgIHBhcnQ6IFwic25pcHBldFwiLFxyXG4gICAgICAgIHR5cGU6IFwidmlkZW9cIixcclxuXHQgICAgcTogZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KS5yZXBsYWNlKC8lMjAvZywgXCIrXCIpLFxyXG5cdCAgICBtYXhSZXN1bHRzOiA1XHJcbiAgICB9KTtcclxuXHJcblx0cmVxdWVzdC5leGVjdXRlKGNhbGxiYWNrKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2F2ZVVzZXJOYW1lQ2hhbmdlKG5ld05hbWUpIHtcclxuICAgIG1NZVVzZXIuTmFtZSA9IG5ld05hbWU7XHJcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG1lc3NhZ2UuVXNlciA9IG1NZVVzZXI7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdTYXZlVXNlck5hbWVDaGFuZ2UnO1xyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBuZXh0VmlkZW9JblF1ZXVlKCkge1xyXG4gICAgbU1lVXNlci5TdGF0ZS5UaW1lID0gMDtcclxuICAgIHZhciBxdWV1ZSA9IG1TZXNzaW9uLlF1ZXVlO1xyXG5cdGlmKChtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24rMSk8cXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMTtcclxuICAgICAgICBtUGxheWVyLnNldFBsYXllckNvbnRlbnQobVNlc3Npb24uUXVldWUsIG1NZVVzZXIuU3RhdGUpO1xyXG4gICAgICAgIG1NZVVzZXIuU3RhdGUuV2FpdGluZyA9IGZhbHNlO1xyXG5cdH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIG1NZVVzZXIuU3RhdGUuV2FpdGluZyA9IHRydWU7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBwYXVzZVZpZGVvKCkge1xyXG4gICAgbVBsYXllci5wYXVzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwbGF5VmlkZW8oKSB7XHJcbiAgICBtUGxheWVyLnBsYXkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcHJldmlvdXNWaWRlb0luUXVldWUoKSB7XHJcbiAgICBtTWVVc2VyLlN0YXRlLlRpbWUgPSAwO1xyXG4gICAgdmFyIHF1ZXVlID0gbVNlc3Npb24uUXVldWU7XHJcblx0aWYobU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID4gMCkge1xyXG4gICAgICAgIG1NZVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IG1NZVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiAtIDE7XHJcbiAgICAgICAgbVBsYXllci5zZXRQbGF5ZXJDb250ZW50KG1TZXNzaW9uLlF1ZXVlLCBtTWVVc2VyLlN0YXRlKTtcclxuXHRcdG1NZVVzZXIuU3RhdGUuV2FpdGluZyA9IGZhbHNlO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFRoZXNlIGZ1bmN0aW9ucyBhcmUgY2FsbGVkIGRpcmVjdGx5IGVtYmVkZGVkIGludG8gdGhlIGh0bWwuLi4ga2luZGEgd2VpcmRcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuZnVuY3Rpb24gcXVldWVTZWxlY3RlZFZpZGVvKGVsbW50KSB7XHJcblx0JChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIikuZmFkZU91dCgpO1xyXG5cdCQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbChcIlwiKTtcclxuXHR2YXIgVmlkZW9JZCA9IGVsbW50LmdldEF0dHJpYnV0ZSgnZGF0YS1WaWRlb0lkJyk7XHJcblx0dmFyIFRpdGxlID0gZWxtbnQuaW5uZXJUZXh0IHx8IGVsbW50LnRleHRDb250ZW50O1xyXG5cdHZhciBUaHVtYlVSTCA9IGVsbW50LmdldEF0dHJpYnV0ZSgnZGF0YS1UaHVtYlVSTCcpO1xyXG5cclxuICAgIHZhciBtZWRpYSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgbWVkaWEuVmlkZW9UaXRsZSA9IFRpdGxlO1xyXG4gICAgbWVkaWEuVmlkZW9UaXRsZSA9IFZpZGVvSWQ7XHJcbiAgICBtZWRpYS5UaHVtYlVSTCA9IFRodW1iVVJMO1xyXG4gICAgbWVkaWEuVXNlcklkID0gbU1lVXNlci5JZDtcclxuICAgIG1lZGlhLlVzZXJOYW1lID0gbU1lVXNlci5OYW1lO1xyXG5cclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnQWRkTWVkaWFUb1Nlc3Npb24nO1xyXG4gICAgbWVzc2FnZS5NZWRpYSA9IG1lZGlhO1xyXG5cclxuICAgIC8vVE9ETzogbG9jYWwgYWRkIG1lZGlhXHJcblxyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG4iLCLvu79pbXBvcnQgeyBXc01lc3NhZ2UgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBNeVNvY2tldCB7XHJcblxyXG4gICAgcHJpdmF0ZSBzb2NrZXQ6IFdlYlNvY2tldDtcclxuICAgIHByaXZhdGUgcmVzcG9uc2VfZnVuY3Rpb25zOiB7IFthY3Rpb246IHN0cmluZ106IChkYXRhOiBhbnkpID0+IHZvaWQgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZXNwb25zZV9mdW5jdGlvbnM6IHsgW2FjdGlvbjogc3RyaW5nXTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZCB9KSB7XHJcbiAgICAgICAgdGhpcy5yZXNwb25zZV9mdW5jdGlvbnMgPSByZXNwb25zZV9mdW5jdGlvbnM7XHJcbiAgICAgICAgdmFyIHVyaSA9IFwid3M6Ly9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgXCIvd3NcIjtcclxuICAgICAgICB2YXIgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmkpO1xyXG4gICAgICAgIHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG4gICAgICAgIHNvY2tldC5vbmNsb3NlID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuICAgICAgICBzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IG1lc3NhZ2UuQWN0aW9uO1xyXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2VmdW5jID0gcmVzcG9uc2VfZnVuY3Rpb25zW2FjdGlvbl07XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGV4Y2VwdGlvbiB3aGVuIG5vdCBmb3VuZFxyXG4gICAgICAgICAgICByZXNwb25zZWZ1bmMobWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge307XHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVtaXQobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IHRoaXMuc29ja2V0LkNPTk5FQ1RJTkcpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XHJcbiAgICB9O1xyXG5cclxufVxyXG4iLCLvu79leHBvcnQgY2xhc3MgRnJhbWVCdWlsZGVyIHtcclxuXHJcbiAgICBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyTWUoY29sb3I6IHN0cmluZywgdXNlck5hbWU6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8ZGl2IGNsYXNzPVwiZGl2X3VzZXJcIiBzdHlsZT1cImJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+IHlvdSA8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZsb2F0OiBsZWZ0OyBjdXJzb3I6IHBvaW50ZXI7IG1hcmdpbi1yaWdodDogMTZweDsgaGVpZ2h0OiA0OHB4OyB3aWR0aDogNDhweDsgYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj55b3U8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7IGZsb2F0OiByaWdodDtcIj4nICsgdXNlck5hbWUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXNlcihjb2xvcjogc3RyaW5nLCB1c2VySWQ6IG51bWJlciwgdXNlck5hbWU6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8ZGl2IG9uY2xpY2s9XCJyZXF1ZXN0U3luY1dpdGhVc2VyKCcgKyB1c2VySWQgKyAnKVwiIGNsYXNzPVwiZGl2X3VzZXJcIiBzdHlsZT1cImJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+c3luYyB3aXRoICcgKyB1c2VyTmFtZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IG9uY2xpY2s9XCJyZXF1ZXN0U3luY1dpdGhVc2VyKCcgKyB1c2VySWQgKyAnKVwiIHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZsb2F0OiBsZWZ0OyBjdXJzb3I6IHBvaW50ZXI7IG1hcmdpbi1yaWdodDogMTZweDsgaGVpZ2h0OiA0OHB4OyB3aWR0aDogNDhweDsgYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj5zeW5jPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4OyBmbG9hdDogcmlnaHQ7XCI+JyArIHVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudEhUTUw7XHJcbiAgICB9XHJcbn0iLCLvu79pbXBvcnQgeyBGcmFtZUJ1aWxkZXIgfSBmcm9tIFwiLi9mcmFtZVwiO1xyXG5pbXBvcnQgeyBNZWRpYSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZGVjbGFyZSB2YXIgU3Bpbm5lcjogYW55O1xyXG5cclxuZXhwb3J0IGNsYXNzIFVJQ2FsbGJhY2tzIHtcclxuICAgIHByZXZpb3VzTWVkaWE6IGFueTtcclxuICAgIG5leHRNZWRpYTogYW55O1xyXG4gICAgcGxheU1lZGlhOiBhbnk7XHJcbiAgICBwYXVzZU1lZGlhOiBhbnk7XHJcbiAgICBvblNlbmRDaGF0TWVzc2FnZTogYW55O1xyXG4gICAgLy8gc2VhcmNoKHF1ZXJ5OiBzdHJpbmcsIGNhbGxiYWNrOiAocmVzdWx0czogYW55KSA9PiB2b2lkKTogYW55O1xyXG4gICAgc2VhcmNoOiBhbnk7XHJcbiAgICBuYW1lQ2hhbmdlOiBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVSSB7XHJcblxyXG4gICAgcHJpdmF0ZSBzcGlubmVyOiBhbnk7XHJcbiAgICBwcml2YXRlIGNhbGxiYWNrczogVUlDYWxsYmFja3M7XHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGZyYW1lQnVpbGRlcjogRnJhbWVCdWlsZGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4sIGNhbGxiYWNrczogVUlDYWxsYmFja3MpIHtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgICAgIHRoaXMuZnJhbWVCdWlsZGVyID0gbmV3IEZyYW1lQnVpbGRlcihtb2JpbGVCcm93c2VyKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IGNhbGxiYWNrcztcclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR1cFNwaW5uZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbmZvUm9sbG92ZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbnB1dFVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cFBsYXllckNvbnRyb2xCdXR0b25zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNlc3Npb25SZWFkeSgpIHtcclxuICAgICAgICAkKFwiI2Rpdl9sb2FkaW5nXCIpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xyXG4gICAgICAgICQoXCIjZGl2X2V2ZXJ5dGhpbmdcIikuYW5pbWF0ZSh7b3BhY2l0eTogMX0sICdmYXN0Jyk7XHJcbiAgICB9IFxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBTcGlubmVyVUkoKSB7XHJcbiAgICAgICAgdmFyIG9wdHMgPSB7XHJcbiAgICAgICAgICAgIGxpbmVzOiAxMyAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcclxuICAgICAgICAgICAgLCBsZW5ndGg6IDI4IC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXHJcbiAgICAgICAgICAgICwgd2lkdGg6IDE0IC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xyXG4gICAgICAgICAgICAsIHJhZGl1czogNDIgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXHJcbiAgICAgICAgICAgICwgc2NhbGU6IDEgLy8gU2NhbGVzIG92ZXJhbGwgc2l6ZSBvZiB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIGNvcm5lcnM6IDEgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcclxuICAgICAgICAgICAgLCBjb2xvcjogJyMwMDAnIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcclxuICAgICAgICAgICAgLCBvcGFjaXR5OiAwLjI1IC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXHJcbiAgICAgICAgICAgICwgcm90YXRlOiAwIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcclxuICAgICAgICAgICAgLCBkaXJlY3Rpb246IDEgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxyXG4gICAgICAgICAgICAsIHNwZWVkOiAxIC8vIFJvdW5kcyBwZXIgc2Vjb25kXHJcbiAgICAgICAgICAgICwgdHJhaWw6IDYwIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICwgZnBzOiAyMCAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKSBhcyBhIGZhbGxiYWNrIGZvciBDU1NcclxuICAgICAgICAgICAgLCB6SW5kZXg6IDJlOSAvLyBUaGUgei1pbmRleCAoZGVmYXVsdHMgdG8gMjAwMDAwMDAwMClcclxuICAgICAgICAgICAgLCBjbGFzc05hbWU6ICdzcGlubmVyJyAvLyBUaGUgQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIHRvcDogJzUwJScgLy8gVG9wIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIGxlZnQ6ICc1MCUnIC8vIExlZnQgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XHJcbiAgICAgICAgICAgICwgc2hhZG93OiBmYWxzZSAvLyBXaGV0aGVyIHRvIHJlbmRlciBhIHNoYWRvd1xyXG4gICAgICAgICAgICAsIGh3YWNjZWw6IGZhbHNlIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxyXG4gICAgICAgICAgICAsIHBvc2l0aW9uOiAnYWJzb2x1dGUnIC8vIEVsZW1lbnQgcG9zaXRpb25pbmdcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZfbG9hZGluZycpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4odGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwRmFkZVVJKG92ZXJhbGwsIHJlc3VsdHMpIHtcclxuICAgICAgICBvdmVyYWxsLm1vdXNlZW50ZXIoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVJbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWxlYXZlKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBJbmZvUm9sbG92ZXJVSSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X3VzZXJzX292ZXJhbGxcIiksICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfcXVldWVfb3ZlcmFsbFwiKSwgJChcIiNkaXZfcXVldWVfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfY2hhdF9vdmVyYWxsXCIpLCAkKFwiI2Rpdl9jaGF0X3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X2NjX292ZXJhbGxcIiksICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlYXJjaFRleHRDaGFuZ2VkKHRleHQpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGlmKHRleHQubGVuZ3RoPT0wKSB7XHJcbiAgICAgICAgICAgIGRpdlJlc3VsdHMuZmFkZU91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwSW5wdXRVSSgpIHtcclxuICAgICAgICB2YXIgaW5wdXRTZWFyY2ggPSAkKFwiI2lucHV0X3NlYXJjaFwiKTtcclxuICAgICAgICBpbnB1dFNlYXJjaC5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hFbnRlclByZXNzZWQoaW5wdXRTZWFyY2gpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGlucHV0X25hbWUgPSAkKFwiI2lucHV0X25hbWVcIik7XHJcbiAgICAgICAgaW5wdXRfbmFtZS5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyTmFtZUNoYW5nZShpbnB1dF9uYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0X2NoYXQgPSAkKFwiI2lucHV0X2NoYXRcIik7XHJcbiAgICAgICAgICAgIGlucHV0X2NoYXQua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja3Mub25TZW5kQ2hhdE1lc3NhZ2UoaW5wdXRfY2hhdC52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRfY2hhdC52YWwoXCJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKS5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbChcIlwiKTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5iaW5kKFwicHJvcGVydHljaGFuZ2UgaW5wdXQgcGFzdGVcIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoVGV4dENoYW5nZWQoJChcIiNpbnB1dF9zZWFyY2hcIikudmFsKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBQbGF5ZXJDb250cm9sQnV0dG9ucygpIHtcclxuICAgICAgICAkKFwiI2J0bl9wcmV2aW91c1wiKS5jbGljayh0aGlzLmNhbGxiYWNrcy5wcmV2aW91c01lZGlhKTtcclxuICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BhdXNlXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgJChcIiNidG5fcGxheVwiKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnBhdXNlTWVkaWEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiI2J0bl9wbGF5XCIpLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgJChcIiNidG5fcGxheVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3Vhc2VcIikuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5wbGF5TWVkaWEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiI2J0bl9uZXh0XCIpLmNsaWNrKHRoaXMuY2FsbGJhY2tzLm5leHRNZWRpYSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWFyY2hFbnRlclByZXNzZWQoaW5wdXRfc2VhcmNoKSB7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCJcIik7XHJcbiAgICAgICAgdmFyIHJlc3BvbnNlID0gdGhpcy5jYWxsYmFja3Muc2VhcmNoKGlucHV0X3NlYXJjaC52YWwoKSwgKHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgJC5lYWNoKHJlc3BvbnNlLml0ZW1zLCAoaW5kZXgsIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgIGRpdlJlc3VsdHMuaHRtbChkaXZSZXN1bHRzLmh0bWwoKSArIFwiPGRpdiBjbGFzcz0nZGl2X3NlYXJjaF9yZXN1bHQnIG9uQ2xpY2s9J3F1ZXVlU2VsZWN0ZWRWaWRlbyh0aGlzKScgZGF0YS1WaWRlb0lkPSdcIiArIGl0ZW0uaWQudmlkZW9JZCArIFwiJyBkYXRhLVRodW1iVVJMPSdcIitpdGVtLnNuaXBwZXQudGh1bWJuYWlscy5tZWRpdW0udXJsK1wiJz5cIiArICc8cCBjbGFzcz1cInRleHRfc2VhcmNoX3Jlc3VsdFwiPicgKyAgaXRlbS5zbmlwcGV0LnRpdGxlKyAnPC9wPjwvZGl2PicgKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlucHV0X3NlYXJjaC5ibHVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYoIWRpdlJlc3VsdHMuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgZGl2UmVzdWx0cy5mYWRlSW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVF1ZXVlKHF1ZXVlLCBxdWV1ZVBvc2l0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcXVldWUubGVuZ3RoO1xyXG4gICAgICAgIHZhciBsZW5ndGhVcE5leHQgPSBxdWV1ZS5sZW5ndGggLSBxdWV1ZVBvc2l0aW9uO1xyXG4gICAgICAgIHZhciBzdW1tYXJ5ID0gbGVuZ3RoVXBOZXh0ICsgXCIgdGhpbmdzIHVwIG5leHRcIjtcclxuICAgICAgICBcclxuICAgICAgICBpZiAobGVuZ3RoVXBOZXh0ID09IDEpIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IGxlbmd0aFVwTmV4dCArIFwiIHRoaW5nIHVwIG5leHRcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobGVuZ3RoVXBOZXh0IDw9IDApIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IFwiTm90aGluZyB1cCBuZXh0LiBRdWV1ZSBzb21ldGhpbmchXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjcF9xdWV1ZV9zdW1tYXJ5XCIpLnRleHQoc3VtbWFyeSk7XHJcblxyXG4gICAgICAgIHZhciBxdWV1ZVJlc3VsdHMgPSAkKFwiI2Rpdl9xdWV1ZV9yZXN1bHRzXCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gW107XHJcbiAgICAgICAgaWYgKGxlbmd0aFVwTmV4dCA+IDApIHtcclxuICAgICAgICAgICAgLy9UT0RPOiBwdXQgc3R5bGUgaW4gY3NzIGFuZCBtYWtlIHNjcm9sbGV5XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBxdWV1ZVBvc2l0aW9uOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBtZWRpYSA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8aW1nIHN0eWxlPVwiZmxvYXQ6IGxlZnQ7IHdpZHRoOiAzMy4zMyU7IGhlaWdodDogMjB2dztcIiBzcmM9XCInICArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGltZyBzdHlsZT1cImhlaWdodDogOTBweDsgd2lkdGg6IDE2MHB4OyBtYXJnaW4tcmlnaHQ6IDE2cHg7XCIgc3JjPVwiJyArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDtcIj4nICsgbWVkaWEuVmlkZW9UaXRsZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcXVldWVSZXN1bHRzLmh0bWwoaHRtbC5qb2luKFwiXCIpKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVVzZXJzTGlzdCh1c2VycywgdXNlcklkTWU6IG51bWJlcikge1xyXG4gICAgICAgIHZhciBudW0gPSB1c2Vycy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHN1bW1hcnkgPSB1c2Vycy5sZW5ndGggKyBcIiB1c2VycyBpbiB0aGUgcm9vbVwiO1xyXG4gICAgICAgIGlmIChudW0gPT0gMSkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gdXNlcnMubGVuZ3RoICsgXCIgdXNlciBpbiB0aGUgcm9vbVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiI3BfdXNlcnNfc3VtbWFyeVwiKS50ZXh0KHN1bW1hcnkpO1xyXG4gICAgICAgIHZhciB1c2VyUmVzdWx0cyA9ICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKTtcclxuICAgICAgICB2YXIgaHRtbCA9IFtdO1xyXG4gICAgICAgIC8vVE9ETzogcHV0IHN0eWxlIGluIGNzcyBhbmQgbWFrZSBzY3JvbGxleVxyXG4gICAgICAgICQuZWFjaCh1c2VycywgKGluZGV4LCB1c2VyKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciB0aGlzSXNNZSA9ICh1c2VyLklkID09PSB1c2VySWRNZSk7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50SFRNTDtcclxuICAgICAgICAgICAgaWYgKHRoaXNJc01lKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50SFRNTCA9IHRoaXMuZnJhbWVCdWlsZGVyLnVzZXJNZSgnZ3JlZW4nLCB1c2VyLk5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEhUTUwgPSB0aGlzLmZyYW1lQnVpbGRlci51c2VyKCdncmVlbicsIHVzZXIuSWQsIHVzZXIuTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB1c2VyUmVzdWx0cy5odG1sKGh0bWwuam9pbihcIlwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZXJOYW1lQ2hhbmdlKG5hbWVfaW5wdXQpIHtcclxuICAgICAgICBuYW1lX2lucHV0LmhpZGUoKTtcclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5mYWRlSW4oKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5uYW1lQ2hhbmdlKG5hbWVfaW5wdXQudmFsKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkNoYXRNZXNzYWdlKHVzZXJOYW1lOiBzdHJpbmcsIG1zZzogc3RyaW5nKSB7XHJcbiAgICAgICAgLy9UT0RPOiBjb2xvciBzdHVmZlxyXG4gICAgICAgIHZhciBodG1sID0gJzxsaSBjbGFzcz1cImNoYXRcIj48c3BhbiBzdHlsZT1cIm1hcmdpbjogMDsgY29sb3I6ICcgKyAnYmx1ZScgKyAnO1wiPicgKyB1c2VyTmFtZSArICc6IDwvc3Bhbj48c3Bhbj4nICsgbXNnICsgJzwvc3Bhbj48L2xpPic7XHJcbiAgICAgICAgJChcIiN1bF9jaGF0XCIpLmFwcGVuZChodG1sKTtcclxuICAgIH1cclxufSJdfQ==
