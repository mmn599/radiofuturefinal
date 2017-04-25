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
// TODO: find a better way to expose these functions
window.queueSelectedVideo = queueSelectedVideo;
window.requestSyncWithUser = requestSyncWithUser;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9QbGF5ZXIudHMiLCJUeXBlU2NyaXB0cy9Sb29tLnRzIiwiVHlwZVNjcmlwdHMvU29ja2V0cy50cyIsIlR5cGVTY3JpcHRzL2ZyYW1lLnRzIiwiVHlwZVNjcmlwdHMvdWkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FDO0lBQUE7SUFPRCxDQUFDO0lBQUQsWUFBQztBQUFELENBUEMsQUFPQSxJQUFBO0FBUGEsc0JBQUs7QUFTbkI7SUFBQTtJQUlBLENBQUM7SUFBRCxhQUFDO0FBQUQsQ0FKQSxBQUlDLElBQUE7QUFKWSx3QkFBTTtBQU1uQjtJQUFBO0lBS0EsQ0FBQztJQUFELGdCQUFDO0FBQUQsQ0FMQSxBQUtDLElBQUE7QUFMWSw4QkFBUztBQU90QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDekJ0QjtJQU9JLGdCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxtQ0FBa0IsR0FBekIsVUFBMEIsbUJBQW1CO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtZQUMzQyxNQUFNLEVBQUUsTUFBTTtZQUNkLEtBQUssRUFBRSxNQUFNO1lBQ2IsVUFBVSxFQUFFO2dCQUNSLFFBQVEsRUFBRSxDQUFDO2dCQUNYLFFBQVEsRUFBRSxDQUFDO2dCQUNYLFFBQVEsRUFBRSxDQUFDO2FBQ2Q7WUFDRCxNQUFNLEVBQUU7Z0JBQ0osZUFBZSxF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a0QsR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLFFBQVEsR0FBRyxpQkFBaUIsR0FBRyxHQUFHLEdBQUcsY0FBYyxDQUFDO1FBQ3JJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNMLFNBQUM7QUFBRCxDQXhOQSxBQXdOQyxJQUFBO0FBeE5ZLGdCQUFFIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7v2V4cG9ydCBjbGFzcyBNZWRpYSB7XHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgVXNlcklkOiBudW1iZXI7XHJcbiAgICBVc2VyTmFtZTogc3RyaW5nO1xyXG4gICAgWVRWaWRlb0lEOiBudW1iZXI7XHJcbiAgICBWaWRlb1RpdGxlOiBzdHJpbmc7XHJcbiAgICBUaHVtYlVSTDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTXlVc2VyIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBTdGF0ZTogVXNlclN0YXRlO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVXNlclN0YXRlIHtcclxuICAgIFRpbWU6IG51bWJlcjtcclxuICAgIFF1ZXVlUG9zaXRpb246IG51bWJlcjtcclxuICAgIFlUUGxheWVyU3RhdGU6IG51bWJlcjtcclxuICAgIFdhaXRpbmc6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXNzaW9uIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBVc2VyczogTXlVc2VyW107XHJcbiAgICBRdWV1ZTogTWVkaWFbXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFdzTWVzc2FnZSB7XHJcbiAgICBBY3Rpb246IHN0cmluZztcclxuICAgIFNlc3Npb246IFNlc3Npb247XHJcbiAgICBNZWRpYTogTWVkaWE7XHJcbiAgICBVc2VyOiBNeVVzZXI7XHJcbiAgICBDaGF0TWVzc2FnZTogc3RyaW5nO1xyXG59Iiwi77u/ZGVjbGFyZSB2YXIgWVQ6IGFueTtcclxuXHJcbmltcG9ydCB7IE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXIge1xyXG5cclxuICAgIHByaXZhdGUgeXRQbGF5ZXI6IGFueTtcclxuICAgIHByaXZhdGUgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuXHJcbiAgICBwdWJsaWMgcGxheWVyUmVhZHk6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMucGxheWVyUmVhZHkgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0aWFsaXplWXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSkge1xyXG4gICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCdkaXZfeXRfcGxheWVyJywge1xyXG4gICAgICAgICAgICBoZWlnaHQ6ICdhdXRvJyxcclxuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgcGxheWVyVmFyczoge1xyXG4gICAgICAgICAgICAgICAgY29udHJvbHM6IDEsXHJcbiAgICAgICAgICAgICAgICBzaG93aW5mbzogMCxcclxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGV2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgJ29uU3RhdGVDaGFuZ2UnOiBvblBsYXllclN0YXRlQ2hhbmdlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB2YXIgZGl2X3BsYXllciA9ICQoXCIjZGl2X3BsYXllclwiKTtcclxuICAgICAgICAgICAgZGl2X3BsYXllci5oZWlnaHQoZGl2X3BsYXllci53aWR0aCgpICogOS4wIC8gMTYuMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRQbGF5ZXJDb250ZW50KHF1ZXVlOiBNZWRpYVtdLCB1c2VyU3RhdGU6IFVzZXJTdGF0ZSkge1xyXG4gICAgICAgIGlmICh1c2VyU3RhdGUuUXVldWVQb3NpdGlvbiAhPSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgbWVkaWEgPSBxdWV1ZVt1c2VyU3RhdGUuUXVldWVQb3NpdGlvbl07XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUGxheWVyVUkobWVkaWEsIHVzZXJTdGF0ZS5UaW1lKTtcdFx0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwbGF5KCkge1xyXG4gICAgICAgIHRoaXMueXRQbGF5ZXIucGxheVZpZGVvKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBhdXNlKCkge1xyXG4gICAgICAgIHRoaXMueXRQbGF5ZXIucGF1c2VWaWRlbygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdXBkYXRlUGxheWVyVUkobWVkaWE6IE1lZGlhLCB0aW1lOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLmxvYWRWaWRlb0J5SWQobWVkaWEuWVRWaWRlb0lELCB0aW1lLCBcImxhcmdlXCIpO1x0XHJcbiAgICAgICAgJChcIiNwX2NjX3N1bW1hcnlcIikudGV4dChtZWRpYS5WaWRlb1RpdGxlKTtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB2YXIgaHRtbCA9XHJcbiAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aW1nIHN0eWxlPVwiaGVpZ2h0OiA5MHB4OyB3aWR0aDogMTYwcHg7IG1hcmdpbi1yaWdodDogMTZweDtcIiBzcmM9XCInICsgbWVkaWEuVGh1bWJVUkwgKyAnXCIvPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4O1wiPicgKyBtZWRpYS5WaWRlb1RpdGxlICsgJzxicj4nICsgJ1JlY29tbWVuZGVkIGJ5OiAnICsgbWVkaWEuVXNlck5hbWUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAnPC9kaXY+JztcclxuICAgICAgICAgICAgJChcIiNkaXZfY2NfcmVzdWx0c1wiKS5odG1sKGh0bWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFRpbWUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDdXJyZW50U3RhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLnl0UGxheWVyLmdldFBsYXllclN0YXRlKCkpO1xyXG4gICAgfVxyXG5cclxufSIsIu+7vyg8YW55PndpbmRvdykub25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkgPSBvbllvdVR1YmVJZnJhbWVBUElSZWFkeTtcclxuKDxhbnk+d2luZG93KS55dEFwaVJlYWR5ID0geXRBcGlSZWFkeTtcclxuLy9UT0RPOiBBbGwgdGhpcyBjb2RlIGlzIG1pc2VyYWJseSBhd2Z1bC4gQXQgc29tZSBwb2ludCBpdCBzaG91bGQgYmUgY29tcGxldGVseSByZXdvcmtlZC5cclxuXHJcbnZhciBDT0xPUl9MSVNUID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJibHVlXCIsIFwidmlvbGV0XCJdO1xyXG5cclxuaW1wb3J0IHsgTXlVc2VyLCBNZWRpYSwgU2Vzc2lvbiwgVXNlclN0YXRlLCBXc01lc3NhZ2UgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuaW1wb3J0IHsgVUlDYWxsYmFja3MsIFVJIH0gZnJvbSBcIi4vdWlcIjtcclxuaW1wb3J0IHsgTXlTb2NrZXQgfSBmcm9tIFwiLi9Tb2NrZXRzXCJcclxuaW1wb3J0IHsgUGxheWVyIH0gZnJvbSBcIi4vUGxheWVyXCJcclxuXHJcbmRlY2xhcmUgdmFyIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbmRlY2xhcmUgdmFyIGdhcGk6IGFueTtcclxuXHJcbnZhciBtTWVVc2VyID0gbmV3IE15VXNlcigpO1xyXG52YXIgbVNlc3Npb24gPSBuZXcgU2Vzc2lvbigpO1xyXG52YXIgbVVJOiBVSTtcclxudmFyIG1QbGF5ZXI6IFBsYXllcjtcclxudmFyIG1Tb2NrZXQ6IE15U29ja2V0O1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIHZhciBjYWxsYmFja3MgPSBuZXcgVUlDYWxsYmFja3MoKTtcclxuICAgIGNhbGxiYWNrcy5vblNlbmRDaGF0TWVzc2FnZSA9IHNlbmRDaGF0TWVzc2FnZTtcclxuICAgIGNhbGxiYWNrcy5uYW1lQ2hhbmdlID0gc2F2ZVVzZXJOYW1lQ2hhbmdlO1xyXG4gICAgY2FsbGJhY2tzLm5leHRNZWRpYSA9IG5leHRWaWRlb0luUXVldWU7XHJcbiAgICBjYWxsYmFja3MucGF1c2VNZWRpYSA9IHBhdXNlVmlkZW87XHJcbiAgICBjYWxsYmFja3MucGxheU1lZGlhID0gcGxheVZpZGVvO1xyXG4gICAgY2FsbGJhY2tzLnByZXZpb3VzTWVkaWEgPSBwcmV2aW91c1ZpZGVvSW5RdWV1ZTtcclxuICAgIGNhbGxiYWNrcy5zZWFyY2ggPSBzZWFyY2hWaWRlb3M7XHJcblxyXG4gICAgbVVJID0gbmV3IFVJKG1vYmlsZUJyb3dzZXIsIGNhbGxiYWNrcyk7XHJcbiAgICBtUGxheWVyID0gbmV3IFBsYXllcihtb2JpbGVCcm93c2VyKTtcclxuICAgIG1Tb2NrZXQgPSBuZXcgTXlTb2NrZXQobU1lc3NhZ2VGdW5jdGlvbnMpO1xyXG5cclxuICAgIHNldHVwSmFtU2Vzc2lvbigpO1xyXG59KTtcclxuXHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGdW5jdGlvbnMgYXV0b21hdGljYWxseSBjYWxsZWQgd2hlbiB5b3V0dWJlIGFwaSdzIGFyZSByZWFkeVxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5mdW5jdGlvbiBvbllvdVR1YmVJZnJhbWVBUElSZWFkeSgpIHtcclxuICAgIG1QbGF5ZXIuaW5pdGlhbGl6ZVl0UGxheWVyKG9uUGxheWVyU3RhdGVDaGFuZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB5dEFwaVJlYWR5KCkge1xyXG5cdGdhcGkuY2xpZW50LnNldEFwaUtleShcIkFJemFTeUM0QS1kc0drLWhhX2ItZURwYnhhVlF0NWJSN2NPVWRkY1wiKTtcclxuXHRnYXBpLmNsaWVudC5sb2FkKFwieW91dHViZVwiLCBcInYzXCIsIGZ1bmN0aW9uKCkge30pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvblBsYXllclN0YXRlQ2hhbmdlKGV2ZW50KSB7XHJcbiAgICBpZihldmVudC5kYXRhPT0wKSB7XHJcbiAgICBcdG5leHRWaWRlb0luUXVldWUoKTtcclxuICAgIH1cclxufVxyXG5cclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gQmFja2VuZCB2aWRlbyBhbmQgcXVldWUgY29udHJvbCBmdW5jdGlvbnNcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuZnVuY3Rpb24gZGVsZXRlVmlkZW9JblF1ZXVlKFF1ZXVlUG9zaXRpb246IG51bWJlcikge1xyXG5cdHZhciBpZCA9IG1TZXNzaW9uLlF1ZXVlW1F1ZXVlUG9zaXRpb25dLklkO1xyXG5cdG1TZXNzaW9uLlF1ZXVlLnNwbGljZShRdWV1ZVBvc2l0aW9uLCAxKTtcclxuXHJcbiAgICBtVUkudXBkYXRlUXVldWUobVNlc3Npb24uUXVldWUsIG1NZVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiArIDEpO1xyXG5cclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgdmFyIG1lZGlhVG9EZWxldGUgPSBuZXcgTWVkaWEoKTtcclxuICAgIG1lZGlhVG9EZWxldGUuSWQgPSBpZDtcclxuICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0RlbGV0ZU1lZGlhRnJvbVNlc3Npb24nO1xyXG4gICAgbWVzc2FnZS5NZWRpYSA9IG1lZGlhVG9EZWxldGU7XHJcbiAgICBtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFdlYlNvY2tldCBtZXNzYWdlIHJlc3BvbnNlIGZ1bmN0aW9uc1xyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxudmFyIG1NZXNzYWdlRnVuY3Rpb25zID0ge1xyXG4gICAgJ3VwZGF0ZVVzZXInOiBvblVwZGF0ZU1lVXNlcixcclxuICAgICdzZXNzaW9uUmVhZHknOiBvblNlc3Npb25SZWFkeSxcclxuICAgICd1cGRhdGVVc2Vyc0xpc3QnOiBvblVwZGF0ZVVzZXJzTGlzdCxcclxuICAgICd1cGRhdGVRdWV1ZSc6IG9uVXBkYXRlUXVldWUsXHJcbiAgICAnY2hhdE1lc3NhZ2UnOiBvblJlY2VpdmVkQ2hhdE1lc3NhZ2UsXHJcbiAgICAncmVxdWVzdFVzZXJTdGF0ZSc6IG9uUmVxdWVzdE15VXNlclN0YXRlLFxyXG4gICAgJ3Byb3ZpZGVVc2VyU3RhdGUnOiBvblVzZXJTdGF0ZVByb3ZpZGVkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uVXNlclN0YXRlUHJvdmlkZWQobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlclRvU3luY1dpdGggPSBtZXNzYWdlLlVzZXI7XHJcbiAgICBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5RdWV1ZVBvc2l0aW9uO1xyXG4gICAgbU1lVXNlci5TdGF0ZS5UaW1lID0gdXNlclRvU3luY1dpdGguU3RhdGUuVGltZTtcclxuICAgIG1NZVVzZXIuU3RhdGUuWVRQbGF5ZXJTdGF0ZSA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLllUUGxheWVyU3RhdGU7XHJcbiAgICBtVUkudXBkYXRlUXVldWUobVNlc3Npb24uUXVldWUsIG1NZVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiArIDEpO1xyXG4gICAgbVBsYXllci5zZXRQbGF5ZXJDb250ZW50KG1TZXNzaW9uLlF1ZXVlLCBtTWVVc2VyLlN0YXRlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25SZXF1ZXN0TXlVc2VyU3RhdGUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlckRhdGEgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICB1c2VyRGF0YS5JZCA9IG1lc3NhZ2UuVXNlci5JZDsgLy8gVE9ETzogYmFkIGJhZCBiYWRcclxuICAgIHVzZXJEYXRhLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICB1c2VyRGF0YS5TdGF0ZS5UaW1lID0gTWF0aC5yb3VuZChtUGxheWVyLmdldEN1cnJlbnRUaW1lKCkpO1xyXG4gICAgdXNlckRhdGEuU3RhdGUuWVRQbGF5ZXJTdGF0ZSA9IG1QbGF5ZXIuZ2V0Q3VycmVudFN0YXRlKCk7XHJcblxyXG4gICAgdmFyIG91dGdvaW5nTXNnID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgb3V0Z29pbmdNc2cuQWN0aW9uID0gJ1Byb3ZpZGVTeW5jVG9Vc2VyJztcclxuICAgIG91dGdvaW5nTXNnLlVzZXIgPSB1c2VyRGF0YTtcclxuICAgIG1Tb2NrZXQuZW1pdChvdXRnb2luZ01zZyk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBvblVwZGF0ZU1lVXNlcihtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIHZhciB1c2VyID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgbU1lVXNlciA9IHVzZXI7XHRcclxufVxyXG5cclxuZnVuY3Rpb24gb25TZXNzaW9uUmVhZHkobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICBtU2Vzc2lvbiA9IG1lc3NhZ2UuU2Vzc2lvbjtcclxuICAgIG1NZVVzZXIgPSBtZXNzYWdlLlVzZXI7XHJcbiAgICBpZiAobVNlc3Npb24uUXVldWUubGVuZ3RoID09IDApIHtcclxuXHRcdCQoXCIjcF9jdXJyZW50X2NvbnRlbnRfaW5mb1wiKS50ZXh0KFwiUXVldWUgdXAgYSBzb25nIVwiKTtcclxuXHRcdCQoXCIjcF9jdXJyZW50X3JlY29tbWVuZGVyX2luZm9cIikudGV4dChcIlVzZSB0aGUgc2VhcmNoIGJhciBhYm92ZS5cIik7XHJcblx0fVxyXG4gICAgbmV4dFZpZGVvSW5RdWV1ZSgpO1xyXG4gICAgbVVJLnVwZGF0ZVVzZXJzTGlzdChtU2Vzc2lvbi5Vc2VycywgbU1lVXNlci5JZCk7XHJcbiAgICBtVUkuc2Vzc2lvblJlYWR5KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uVXBkYXRlVXNlcnNMaXN0KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXJzID0gbWVzc2FnZS5TZXNzaW9uLlVzZXJzO1xyXG4gICAgbVNlc3Npb24uVXNlcnMgPSB1c2VycztcclxuICAgIG1VSS51cGRhdGVVc2Vyc0xpc3QobVNlc3Npb24uVXNlcnMsIG1NZVVzZXIuSWQpO1x0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uVXBkYXRlUXVldWUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgcXVldWUgPSBtZXNzYWdlLlNlc3Npb24uUXVldWU7XHJcbiAgICBtU2Vzc2lvbi5RdWV1ZSA9IHF1ZXVlO1xyXG4gICAgbVVJLnVwZGF0ZVF1ZXVlKHF1ZXVlLCBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gKyAxKTtcclxuICAgIGlmIChtTWVVc2VyLlN0YXRlLldhaXRpbmcpIHtcclxuICAgICAgICBuZXh0VmlkZW9JblF1ZXVlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUmVjZWl2ZWRDaGF0TWVzc2FnZShkYXRhKSB7XHJcblx0dmFyIG1zZyA9IGRhdGEuQ2hhdE1lc3NhZ2U7XHJcbiAgICB2YXIgdXNlck5hbWUgPSBkYXRhLlVzZXIuTmFtZTtcclxuICAgIG1VSS5vbkNoYXRNZXNzYWdlKHVzZXJOYW1lLCBtc2cpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXR1cEphbVNlc3Npb24oKSB7XHJcblx0dmFyIHBhdGhuYW1lID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG5cdHZhciBlbmNvZGVkU2Vzc2lvbk5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKCdcXC9yb29tcy8nLCAnJyk7XHJcblxyXG4gICAgbVNlc3Npb24uTmFtZSA9IGRlY29kZVVSSShlbmNvZGVkU2Vzc2lvbk5hbWUpO1xyXG4gICAgbU1lVXNlci5OYW1lID0gJ0Fub255bW91cyc7XHJcblxyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdVc2VySm9pblNlc3Npb24nO1xyXG4gICAgbWVzc2FnZS5Vc2VyID0gbU1lVXNlcjtcclxuICAgIG1lc3NhZ2UuU2Vzc2lvbiA9IG1TZXNzaW9uO1xyXG5cclxuXHRtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbmRDaGF0TWVzc2FnZShtc2c6IHN0cmluZykge1xyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdDaGF0TWVzc2FnZSc7XHJcbiAgICBtZXNzYWdlLkNoYXRNZXNzYWdlID0gbXNnO1xyXG4gICAgbWVzc2FnZS5Vc2VyID0gbU1lVXNlcjtcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VhcmNoVmlkZW9zKHF1ZXJ5LCBjYWxsYmFjaykge1xyXG5cdHZhciByZXF1ZXN0ID0gZ2FwaS5jbGllbnQueW91dHViZS5zZWFyY2gubGlzdCh7XHJcbiAgICAgICAgcGFydDogXCJzbmlwcGV0XCIsXHJcbiAgICAgICAgdHlwZTogXCJ2aWRlb1wiLFxyXG5cdCAgICBxOiBlbmNvZGVVUklDb21wb25lbnQocXVlcnkpLnJlcGxhY2UoLyUyMC9nLCBcIitcIiksXHJcblx0ICAgIG1heFJlc3VsdHM6IDVcclxuICAgIH0pO1xyXG5cclxuXHRyZXF1ZXN0LmV4ZWN1dGUoY2FsbGJhY2spO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlVXNlck5hbWVDaGFuZ2UobmV3TmFtZSkge1xyXG4gICAgbU1lVXNlci5OYW1lID0gbmV3TmFtZTtcclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5Vc2VyID0gbU1lVXNlcjtcclxuICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1NhdmVVc2VyTmFtZUNoYW5nZSc7XHJcbiAgICBtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5leHRWaWRlb0luUXVldWUoKSB7XHJcbiAgICBtTWVVc2VyLlN0YXRlLlRpbWUgPSAwO1xyXG4gICAgdmFyIHF1ZXVlID0gbVNlc3Npb24uUXVldWU7XHJcblx0aWYoKG1NZVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbisxKTxxdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgICBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gKyAxO1xyXG4gICAgICAgIG1QbGF5ZXIuc2V0UGxheWVyQ29udGVudChtU2Vzc2lvbi5RdWV1ZSwgbU1lVXNlci5TdGF0ZSk7XHJcbiAgICAgICAgbU1lVXNlci5TdGF0ZS5XYWl0aW5nID0gZmFsc2U7XHJcblx0fVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgbU1lVXNlci5TdGF0ZS5XYWl0aW5nID0gdHJ1ZTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhdXNlVmlkZW8oKSB7XHJcbiAgICBtUGxheWVyLnBhdXNlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBsYXlWaWRlbygpIHtcclxuICAgIG1QbGF5ZXIucGxheSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcmV2aW91c1ZpZGVvSW5RdWV1ZSgpIHtcclxuICAgIG1NZVVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICB2YXIgcXVldWUgPSBtU2Vzc2lvbi5RdWV1ZTtcclxuXHRpZihtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPiAwKSB7XHJcbiAgICAgICAgbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIC0gMTtcclxuICAgICAgICBtUGxheWVyLnNldFBsYXllckNvbnRlbnQobVNlc3Npb24uUXVldWUsIG1NZVVzZXIuU3RhdGUpO1xyXG5cdFx0bU1lVXNlci5TdGF0ZS5XYWl0aW5nID0gZmFsc2U7XHJcblx0fVxyXG59XHJcblxyXG5cclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gVGhlc2UgZnVuY3Rpb25zIGFyZSBjYWxsZWQgZGlyZWN0bHkgZW1iZWRkZWQgaW50byB0aGUgaHRtbC4uLiBraW5kYSB3ZWlyZFxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBUT0RPOiBmaW5kIGEgYmV0dGVyIHdheSB0byBleHBvc2UgdGhlc2UgZnVuY3Rpb25zXHJcbig8YW55PndpbmRvdykucXVldWVTZWxlY3RlZFZpZGVvID0gcXVldWVTZWxlY3RlZFZpZGVvO1xyXG4oPGFueT53aW5kb3cpLnJlcXVlc3RTeW5jV2l0aFVzZXIgPSByZXF1ZXN0U3luY1dpdGhVc2VyO1xyXG5cclxuZnVuY3Rpb24gcmVxdWVzdFN5bmNXaXRoVXNlcih1c2VySWQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdyZXF1ZXN0IHN5bmMgd2l0aCB1c2VyJyk7XHJcblxyXG4gICAgdmFyIHVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICB1c2VyLklkID0gdXNlcklkO1xyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdSZXF1ZXN0U3luY1dpdGhVc2VyJztcclxuICAgIG1lc3NhZ2UuVXNlciA9IHVzZXI7XHJcbiAgICBtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHF1ZXVlU2VsZWN0ZWRWaWRlbyhlbG1udCkge1xyXG5cdCQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpLmZhZGVPdXQoKTtcclxuXHQkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoXCJcIik7XHJcblx0dmFyIFZpZGVvSWQgPSBlbG1udC5nZXRBdHRyaWJ1dGUoJ2RhdGEtVmlkZW9JZCcpO1xyXG5cdHZhciBUaXRsZSA9IGVsbW50LmlubmVyVGV4dCB8fCBlbG1udC50ZXh0Q29udGVudDtcclxuXHR2YXIgVGh1bWJVUkwgPSBlbG1udC5nZXRBdHRyaWJ1dGUoJ2RhdGEtVGh1bWJVUkwnKTtcclxuXHJcbiAgICB2YXIgbWVkaWEgPSBuZXcgTWVkaWEoKTtcclxuICAgIG1lZGlhLlZpZGVvVGl0bGUgPSBUaXRsZTtcclxuICAgIG1lZGlhLlZpZGVvVGl0bGUgPSBWaWRlb0lkO1xyXG4gICAgbWVkaWEuVGh1bWJVUkwgPSBUaHVtYlVSTDtcclxuICAgIG1lZGlhLlVzZXJJZCA9IG1NZVVzZXIuSWQ7XHJcbiAgICBtZWRpYS5Vc2VyTmFtZSA9IG1NZVVzZXIuTmFtZTtcclxuXHJcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0FkZE1lZGlhVG9TZXNzaW9uJztcclxuICAgIG1lc3NhZ2UuTWVkaWEgPSBtZWRpYTtcclxuXHJcbiAgICAvL1RPRE86IGxvY2FsIGFkZCBtZWRpYVxyXG5cclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufSIsIu+7v2ltcG9ydCB7IFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE15U29ja2V0IHtcclxuXHJcbiAgICBwcml2YXRlIHNvY2tldDogV2ViU29ja2V0O1xyXG4gICAgcHJpdmF0ZSByZXNwb25zZV9mdW5jdGlvbnM6IHsgW2FjdGlvbjogc3RyaW5nXTogKGRhdGE6IGFueSkgPT4gdm9pZCB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHJlc3BvbnNlX2Z1bmN0aW9uczogeyBbYWN0aW9uOiBzdHJpbmddOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkIH0pIHtcclxuICAgICAgICB0aGlzLnJlc3BvbnNlX2Z1bmN0aW9ucyA9IHJlc3BvbnNlX2Z1bmN0aW9ucztcclxuICAgICAgICB2YXIgdXJpID0gXCJ3czovL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyBcIi93c1wiO1xyXG4gICAgICAgIHZhciBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVyaSk7XHJcbiAgICAgICAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uIChldmVudCkge307XHJcbiAgICAgICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG4gICAgICAgIHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gbWVzc2FnZS5BY3Rpb247XHJcbiAgICAgICAgICAgIHZhciByZXNwb25zZWZ1bmMgPSByZXNwb25zZV9mdW5jdGlvbnNbYWN0aW9uXTtcclxuICAgICAgICAgICAgLy8gVE9ETzogZXhjZXB0aW9uIHdoZW4gbm90IGZvdW5kXHJcbiAgICAgICAgICAgIHJlc3BvbnNlZnVuYyhtZXNzYWdlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuICAgICAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZW1pdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICBpZiAodGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gdGhpcy5zb2NrZXQuQ09OTkVDVElORykge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcclxuICAgIH07XHJcblxyXG59XHJcbiIsIu+7v2V4cG9ydCBjbGFzcyBGcmFtZUJ1aWxkZXIge1xyXG5cclxuICAgIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZXJNZShjb2xvcjogc3RyaW5nLCB1c2VyTmFtZTogc3RyaW5nKSA6IHN0cmluZyB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gJzxkaXYgY2xhc3M9XCJkaXZfdXNlclwiIHN0eWxlPVwiYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj4geW91IDwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgZmxvYXQ6IGxlZnQ7IGN1cnNvcjogcG9pbnRlcjsgbWFyZ2luLXJpZ2h0OiAxNnB4OyBoZWlnaHQ6IDQ4cHg7IHdpZHRoOiA0OHB4OyBiYWNrZ3JvdW5kOiAnICsgY29sb3IgKyAnO1wiPnlvdTwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDsgZmxvYXQ6IHJpZ2h0O1wiPicgKyB1c2VyTmFtZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRIVE1MO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyKGNvbG9yOiBzdHJpbmcsIHVzZXJJZDogbnVtYmVyLCB1c2VyTmFtZTogc3RyaW5nKSA6IHN0cmluZyB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gJzxkaXYgb25jbGljaz1cInJlcXVlc3RTeW5jV2l0aFVzZXIoJyArIHVzZXJJZCArICcpXCIgY2xhc3M9XCJkaXZfdXNlclwiIHN0eWxlPVwiYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj5zeW5jIHdpdGggJyArIHVzZXJOYW1lICsgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgb25jbGljaz1cInJlcXVlc3RTeW5jV2l0aFVzZXIoJyArIHVzZXJJZCArICcpXCIgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgZmxvYXQ6IGxlZnQ7IGN1cnNvcjogcG9pbnRlcjsgbWFyZ2luLXJpZ2h0OiAxNnB4OyBoZWlnaHQ6IDQ4cHg7IHdpZHRoOiA0OHB4OyBiYWNrZ3JvdW5kOiAnICsgY29sb3IgKyAnO1wiPnN5bmM8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7IGZsb2F0OiByaWdodDtcIj4nICsgdXNlck5hbWUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxufSIsIu+7v2ltcG9ydCB7IEZyYW1lQnVpbGRlciB9IGZyb20gXCIuL2ZyYW1lXCI7XHJcbmltcG9ydCB7IE1lZGlhIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5kZWNsYXJlIHZhciBTcGlubmVyOiBhbnk7XHJcblxyXG5leHBvcnQgY2xhc3MgVUlDYWxsYmFja3Mge1xyXG4gICAgcHJldmlvdXNNZWRpYTogYW55O1xyXG4gICAgbmV4dE1lZGlhOiBhbnk7XHJcbiAgICBwbGF5TWVkaWE6IGFueTtcclxuICAgIHBhdXNlTWVkaWE6IGFueTtcclxuICAgIG9uU2VuZENoYXRNZXNzYWdlOiBhbnk7XHJcbiAgICAvLyBzZWFyY2gocXVlcnk6IHN0cmluZywgY2FsbGJhY2s6IChyZXN1bHRzOiBhbnkpID0+IHZvaWQpOiBhbnk7XHJcbiAgICBzZWFyY2g6IGFueTtcclxuICAgIG5hbWVDaGFuZ2U6IGFueTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFVJIHtcclxuXHJcbiAgICBwcml2YXRlIHNwaW5uZXI6IGFueTtcclxuICAgIHByaXZhdGUgY2FsbGJhY2tzOiBVSUNhbGxiYWNrcztcclxuICAgIHByaXZhdGUgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgZnJhbWVCdWlsZGVyOiBGcmFtZUJ1aWxkZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbiwgY2FsbGJhY2tzOiBVSUNhbGxiYWNrcykge1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICAgICAgdGhpcy5mcmFtZUJ1aWxkZXIgPSBuZXcgRnJhbWVCdWlsZGVyKG1vYmlsZUJyb3dzZXIpO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0gY2FsbGJhY2tzO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICB0aGlzLnNldHVwU3Bpbm5lclVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cEluZm9Sb2xsb3ZlclVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cElucHV0VUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwUGxheWVyQ29udHJvbEJ1dHRvbnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2Vzc2lvblJlYWR5KCkge1xyXG4gICAgICAgICQoXCIjZGl2X2xvYWRpbmdcIikuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lci5zdG9wKCk7XHJcbiAgICAgICAgJChcIiNkaXZfZXZlcnl0aGluZ1wiKS5hbmltYXRlKHtvcGFjaXR5OiAxfSwgJ2Zhc3QnKTtcclxuICAgIH0gXHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cFNwaW5uZXJVSSgpIHtcclxuICAgICAgICB2YXIgb3B0cyA9IHtcclxuICAgICAgICAgICAgbGluZXM6IDEzIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xyXG4gICAgICAgICAgICAsIGxlbmd0aDogMjggLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcclxuICAgICAgICAgICAgLCB3aWR0aDogMTQgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXHJcbiAgICAgICAgICAgICwgcmFkaXVzOiA0MiAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcclxuICAgICAgICAgICAgLCBzY2FsZTogMSAvLyBTY2FsZXMgb3ZlcmFsbCBzaXplIG9mIHRoZSBzcGlubmVyXHJcbiAgICAgICAgICAgICwgY29ybmVyczogMSAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxyXG4gICAgICAgICAgICAsIGNvbG9yOiAnIzAwMCcgLy8gI3JnYiBvciAjcnJnZ2JiIG9yIGFycmF5IG9mIGNvbG9yc1xyXG4gICAgICAgICAgICAsIG9wYWNpdHk6IDAuMjUgLy8gT3BhY2l0eSBvZiB0aGUgbGluZXNcclxuICAgICAgICAgICAgLCByb3RhdGU6IDAgLy8gVGhlIHJvdGF0aW9uIG9mZnNldFxyXG4gICAgICAgICAgICAsIGRpcmVjdGlvbjogMSAvLyAxOiBjbG9ja3dpc2UsIC0xOiBjb3VudGVyY2xvY2t3aXNlXHJcbiAgICAgICAgICAgICwgc3BlZWQ6IDEgLy8gUm91bmRzIHBlciBzZWNvbmRcclxuICAgICAgICAgICAgLCB0cmFpbDogNjAgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcclxuICAgICAgICAgICAgLCBmcHM6IDIwIC8vIEZyYW1lcyBwZXIgc2Vjb25kIHdoZW4gdXNpbmcgc2V0VGltZW91dCgpIGFzIGEgZmFsbGJhY2sgZm9yIENTU1xyXG4gICAgICAgICAgICAsIHpJbmRleDogMmU5IC8vIFRoZSB6LWluZGV4IChkZWZhdWx0cyB0byAyMDAwMDAwMDAwKVxyXG4gICAgICAgICAgICAsIGNsYXNzTmFtZTogJ3NwaW5uZXInIC8vIFRoZSBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBzcGlubmVyXHJcbiAgICAgICAgICAgICwgdG9wOiAnNTAlJyAvLyBUb3AgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XHJcbiAgICAgICAgICAgICwgbGVmdDogJzUwJScgLy8gTGVmdCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcclxuICAgICAgICAgICAgLCBzaGFkb3c6IGZhbHNlIC8vIFdoZXRoZXIgdG8gcmVuZGVyIGEgc2hhZG93XHJcbiAgICAgICAgICAgICwgaHdhY2NlbDogZmFsc2UgLy8gV2hldGhlciB0byB1c2UgaGFyZHdhcmUgYWNjZWxlcmF0aW9uXHJcbiAgICAgICAgICAgICwgcG9zaXRpb246ICdhYnNvbHV0ZScgLy8gRWxlbWVudCBwb3NpdGlvbmluZ1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpdl9sb2FkaW5nJyk7XHJcbiAgICAgICAgdGhpcy5zcGlubmVyID0gbmV3IFNwaW5uZXIob3B0cykuc3Bpbih0YXJnZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBGYWRlVUkob3ZlcmFsbCwgcmVzdWx0cykge1xyXG4gICAgICAgIG92ZXJhbGwubW91c2VlbnRlcigoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdHMuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMuZmFkZUluKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBvdmVyYWxsLm1vdXNlbGVhdmUoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdHMuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cEluZm9Sb2xsb3ZlclVJKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfdXNlcnNfb3ZlcmFsbFwiKSwgJChcIiNkaXZfdXNlcl9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9xdWV1ZV9vdmVyYWxsXCIpLCAkKFwiI2Rpdl9xdWV1ZV9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9jaGF0X292ZXJhbGxcIiksICQoXCIjZGl2X2NoYXRfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfY2Nfb3ZlcmFsbFwiKSwgJChcIiNkaXZfY2NfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VhcmNoVGV4dENoYW5nZWQodGV4dCkge1xyXG4gICAgICAgIHZhciBkaXZSZXN1bHRzID0gJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgaWYodGV4dC5sZW5ndGg9PTApIHtcclxuICAgICAgICAgICAgZGl2UmVzdWx0cy5mYWRlT3V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBJbnB1dFVJKCkge1xyXG4gICAgICAgIHZhciBpbnB1dFNlYXJjaCA9ICQoXCIjaW5wdXRfc2VhcmNoXCIpO1xyXG4gICAgICAgIGlucHV0U2VhcmNoLmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaEVudGVyUHJlc3NlZChpbnB1dFNlYXJjaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgaW5wdXRfbmFtZSA9ICQoXCIjaW5wdXRfbmFtZVwiKTtcclxuICAgICAgICBpbnB1dF9uYW1lLmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJOYW1lQ2hhbmdlKGlucHV0X25hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB2YXIgaW5wdXRfY2hhdCA9ICQoXCIjaW5wdXRfY2hhdFwiKTtcclxuICAgICAgICAgICAgaW5wdXRfY2hhdC5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5vblNlbmRDaGF0TWVzc2FnZShpbnB1dF9jaGF0LnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dF9jaGF0LnZhbChcIlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikudmFsKFwiXCIpO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmJpbmQoXCJwcm9wZXJ0eWNoYW5nZSBpbnB1dCBwYXN0ZVwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hUZXh0Q2hhbmdlZCgkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cFBsYXllckNvbnRyb2xCdXR0b25zKCkge1xyXG4gICAgICAgICQoXCIjYnRuX3ByZXZpb3VzXCIpLmNsaWNrKHRoaXMuY2FsbGJhY2tzLnByZXZpb3VzTWVkaWEpO1xyXG4gICAgICAgICQoXCIjYnRuX3BhdXNlXCIpLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgJChcIiNidG5fcGF1c2VcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wbGF5XCIpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MucGF1c2VNZWRpYSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoXCIjYnRuX3BsYXlcIikuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wbGF5XCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgJChcIiNidG5fdWFzZVwiKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnBsYXlNZWRpYSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoXCIjYnRuX25leHRcIikuY2xpY2sodGhpcy5jYWxsYmFja3MubmV4dE1lZGlhKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlYXJjaEVudGVyUHJlc3NlZChpbnB1dF9zZWFyY2gpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuaHRtbChcIlwiKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5zZWFyY2goaW5wdXRfc2VhcmNoLnZhbCgpLCAocmVzdWx0cykgPT4ge1xyXG4gICAgICAgICAgICAkLmVhY2gocmVzdWx0cy5pdGVtcywgKGluZGV4LCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkaXZSZXN1bHRzLmh0bWwoZGl2UmVzdWx0cy5odG1sKCkgKyBcIjxkaXYgY2xhc3M9J2Rpdl9zZWFyY2hfcmVzdWx0JyBvbkNsaWNrPSdxdWV1ZVNlbGVjdGVkVmlkZW8odGhpcyknIGRhdGEtVmlkZW9JZD0nXCIgKyBpdGVtLmlkLnZpZGVvSWQgKyBcIicgZGF0YS1UaHVtYlVSTD0nXCIraXRlbS5zbmlwcGV0LnRodW1ibmFpbHMubWVkaXVtLnVybCtcIic+XCIgKyAnPHAgY2xhc3M9XCJ0ZXh0X3NlYXJjaF9yZXN1bHRcIj4nICsgIGl0ZW0uc25pcHBldC50aXRsZSsgJzwvcD48L2Rpdj4nICk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpbnB1dF9zZWFyY2guYmx1cigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmKCFkaXZSZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgIGRpdlJlc3VsdHMuZmFkZUluKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVRdWV1ZShxdWV1ZSwgcXVldWVQb3NpdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHF1ZXVlLmxlbmd0aDtcclxuICAgICAgICB2YXIgbGVuZ3RoVXBOZXh0ID0gcXVldWUubGVuZ3RoIC0gcXVldWVQb3NpdGlvbjtcclxuICAgICAgICB2YXIgc3VtbWFyeSA9IGxlbmd0aFVwTmV4dCArIFwiIHRoaW5ncyB1cCBuZXh0XCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGxlbmd0aFVwTmV4dCA9PSAxKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSBsZW5ndGhVcE5leHQgKyBcIiB0aGluZyB1cCBuZXh0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGxlbmd0aFVwTmV4dCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSBcIk5vdGhpbmcgdXAgbmV4dC4gUXVldWUgc29tZXRoaW5nIVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiI3BfcXVldWVfc3VtbWFyeVwiKS50ZXh0KHN1bW1hcnkpO1xyXG5cclxuICAgICAgICB2YXIgcXVldWVSZXN1bHRzID0gJChcIiNkaXZfcXVldWVfcmVzdWx0c1wiKTtcclxuICAgICAgICB2YXIgaHRtbCA9IFtdO1xyXG4gICAgICAgIGlmIChsZW5ndGhVcE5leHQgPiAwKSB7XHJcbiAgICAgICAgICAgIC8vVE9ETzogcHV0IHN0eWxlIGluIGNzcyBhbmQgbWFrZSBzY3JvbGxleVxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gcXVldWVQb3NpdGlvbjsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWVkaWEgPSBxdWV1ZVtpXTtcclxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEhUTUwgPSAnPGltZyBzdHlsZT1cImZsb2F0OiBsZWZ0OyB3aWR0aDogMzMuMzMlOyBoZWlnaHQ6IDIwdnc7XCIgc3JjPVwiJyAgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRIVE1MID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxpbWcgc3R5bGU9XCJoZWlnaHQ6IDkwcHg7IHdpZHRoOiAxNjBweDsgbWFyZ2luLXJpZ2h0OiAxNnB4O1wiIHNyYz1cIicgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7XCI+JyArIG1lZGlhLlZpZGVvVGl0bGUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGh0bWwucHVzaChjdXJyZW50SFRNTCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHF1ZXVlUmVzdWx0cy5odG1sKGh0bWwuam9pbihcIlwiKSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVVc2Vyc0xpc3QodXNlcnMsIHVzZXJJZE1lOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbnVtID0gdXNlcnMubGVuZ3RoO1xyXG4gICAgICAgIHZhciBzdW1tYXJ5ID0gdXNlcnMubGVuZ3RoICsgXCIgdXNlcnMgaW4gdGhlIHJvb21cIjtcclxuICAgICAgICBpZiAobnVtID09IDEpIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IHVzZXJzLmxlbmd0aCArIFwiIHVzZXIgaW4gdGhlIHJvb21cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJChcIiNwX3VzZXJzX3N1bW1hcnlcIikudGV4dChzdW1tYXJ5KTtcclxuICAgICAgICB2YXIgdXNlclJlc3VsdHMgPSAkKFwiI2Rpdl91c2VyX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgdmFyIGh0bWwgPSBbXTtcclxuICAgICAgICAvL1RPRE86IHB1dCBzdHlsZSBpbiBjc3MgYW5kIG1ha2Ugc2Nyb2xsZXlcclxuICAgICAgICAkLmVhY2godXNlcnMsIChpbmRleCwgdXNlcikgPT4ge1xyXG4gICAgICAgICAgICB2YXIgdGhpc0lzTWUgPSAodXNlci5JZCA9PT0gdXNlcklkTWUpO1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudEhUTUw7XHJcbiAgICAgICAgICAgIGlmICh0aGlzSXNNZSkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEhUTUwgPSB0aGlzLmZyYW1lQnVpbGRlci51c2VyTWUoJ2dyZWVuJywgdXNlci5OYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gdGhpcy5mcmFtZUJ1aWxkZXIudXNlcignZ3JlZW4nLCB1c2VyLklkLCB1c2VyLk5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGh0bWwucHVzaChjdXJyZW50SFRNTCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdXNlclJlc3VsdHMuaHRtbChodG1sLmpvaW4oXCJcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyTmFtZUNoYW5nZShuYW1lX2lucHV0KSB7XHJcbiAgICAgICAgbmFtZV9pbnB1dC5oaWRlKCk7XHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuZmFkZUluKCk7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MubmFtZUNoYW5nZShuYW1lX2lucHV0LnZhbCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DaGF0TWVzc2FnZSh1c2VyTmFtZTogc3RyaW5nLCBtc2c6IHN0cmluZykge1xyXG4gICAgICAgIC8vVE9ETzogY29sb3Igc3R1ZmZcclxuICAgICAgICB2YXIgaHRtbCA9ICc8bGkgY2xhc3M9XCJjaGF0XCI+PHNwYW4gc3R5bGU9XCJtYXJnaW46IDA7IGNvbG9yOiAnICsgJ2JsdWUnICsgJztcIj4nICsgdXNlck5hbWUgKyAnOiA8L3NwYW4+PHNwYW4+JyArIG1zZyArICc8L3NwYW4+PC9saT4nO1xyXG4gICAgICAgICQoXCIjdWxfY2hhdFwiKS5hcHBlbmQoaHRtbCk7XHJcbiAgICB9XHJcbn0iXX0=
