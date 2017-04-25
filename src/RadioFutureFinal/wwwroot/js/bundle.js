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
//TODO: All this code is miserably awful. At some point it should be completely reworked.
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function youtubeAPIInit() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9QbGF5ZXIudHMiLCJUeXBlU2NyaXB0cy9Sb29tLnRzIiwiVHlwZVNjcmlwdHMvU29ja2V0cy50cyIsIlR5cGVTY3JpcHRzL2ZyYW1lLnRzIiwiVHlwZVNjcmlwdHMvdWkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FDO0lBQUE7SUFPRCxDQUFDO0lBQUQsWUFBQztBQUFELENBUEMsQUFPQSxJQUFBO0FBUGEsc0JBQUs7QUFTbkI7SUFBQTtJQUlBLENBQUM7SUFBRCxhQUFDO0FBQUQsQ0FKQSxBQUlDLElBQUE7QUFKWSx3QkFBTTtBQU1uQjtJQUFBO0lBS0EsQ0FBQztJQUFELGdCQUFDO0FBQUQsQ0FMQSxBQUtDLElBQUE7QUFMWSw4QkFBUztBQU90QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDekJ0QjtJQU9JLGdCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxtQ0FBa0IsR0FBekIsVUFBMEIsbUJBQW1CO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtZQUMzQyxNQUFNLEVBQUUsTUFBTTtZQUNkLEtBQUssRUFBRSxNQUFNO1lBQ2IsVUFBVSxFQUFFO2dCQUNSLFFBQVEsRUFBRSxDQUFDO2dCQUNYLFFBQVEsRUFBRSxDQUFDO2dCQUNYLFFBQVEsRUFBRSxDQUFDO2FBQ2Q7WUFDRCxNQUFNLEVBQUU7Z0JBQ0osU0FBUyxF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QUFHLEdBQUcsR0FBRyxjQUFjLENBQUM7UUFDckksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBQ0wsU0FBQztBQUFELENBeE5BLEFBd05DLElBQUE7QUF4TlksZ0JBQUUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwi77u/ZXhwb3J0IGNsYXNzIE1lZGlhIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBVc2VySWQ6IG51bWJlcjtcclxuICAgIFVzZXJOYW1lOiBzdHJpbmc7XHJcbiAgICBZVFZpZGVvSUQ6IG51bWJlcjtcclxuICAgIFZpZGVvVGl0bGU6IHN0cmluZztcclxuICAgIFRodW1iVVJMOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNeVVzZXIge1xyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIFN0YXRlOiBVc2VyU3RhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVc2VyU3RhdGUge1xyXG4gICAgVGltZTogbnVtYmVyO1xyXG4gICAgUXVldWVQb3NpdGlvbjogbnVtYmVyO1xyXG4gICAgWVRQbGF5ZXJTdGF0ZTogbnVtYmVyO1xyXG4gICAgV2FpdGluZzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNlc3Npb24ge1xyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIFVzZXJzOiBNeVVzZXJbXTtcclxuICAgIFF1ZXVlOiBNZWRpYVtdO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV3NNZXNzYWdlIHtcclxuICAgIEFjdGlvbjogc3RyaW5nO1xyXG4gICAgU2Vzc2lvbjogU2Vzc2lvbjtcclxuICAgIE1lZGlhOiBNZWRpYTtcclxuICAgIFVzZXI6IE15VXNlcjtcclxuICAgIENoYXRNZXNzYWdlOiBzdHJpbmc7XHJcbn0iLCLvu79kZWNsYXJlIHZhciBZVDogYW55O1xyXG5cclxuaW1wb3J0IHsgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBsYXllciB7XHJcblxyXG4gICAgcHJpdmF0ZSB5dFBsYXllcjogYW55O1xyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5cclxuICAgIHB1YmxpYyBwbGF5ZXJSZWFkeTogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXRpYWxpemVZdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllciA9IG5ldyBZVC5QbGF5ZXIoJ2Rpdl95dF9wbGF5ZXInLCB7XHJcbiAgICAgICAgICAgIGhlaWdodDogJ2F1dG8nLFxyXG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICBwbGF5ZXJWYXJzOiB7XHJcbiAgICAgICAgICAgICAgICBjb250cm9sczogMSxcclxuICAgICAgICAgICAgICAgIHNob3dpbmZvOiAwLFxyXG4gICAgICAgICAgICAgICAgYXV0b3BsYXk6IDBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAnb25SZWFkeSc6IHRoaXMub25QbGF5ZXJSZWFkeSxcclxuICAgICAgICAgICAgICAgICdvblN0YXRlQ2hhbmdlJzogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRpdl9wbGF5ZXIgPSAkKFwiI2Rpdl9wbGF5ZXJcIik7XHJcbiAgICAgICAgICAgIGRpdl9wbGF5ZXIuaGVpZ2h0KGRpdl9wbGF5ZXIud2lkdGgoKSAqIDkuMCAvIDE2LjApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0UGxheWVyQ29udGVudChxdWV1ZTogTWVkaWFbXSwgdXNlclN0YXRlOiBVc2VyU3RhdGUpIHtcclxuICAgICAgICBpZiAodXNlclN0YXRlLlF1ZXVlUG9zaXRpb24gIT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIG1lZGlhID0gcXVldWVbdXNlclN0YXRlLlF1ZXVlUG9zaXRpb25dO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBsYXllclVJKG1lZGlhLCB1c2VyU3RhdGUuVGltZSk7XHRcdFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGxheSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBsYXlWaWRlbygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYXVzZSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBhdXNlVmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVBsYXllclVJKG1lZGlhOiBNZWRpYSwgdGltZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5sb2FkVmlkZW9CeUlkKG1lZGlhLllUVmlkZW9JRCwgdGltZSwgXCJsYXJnZVwiKTtcdFxyXG4gICAgICAgICQoXCIjcF9jY19zdW1tYXJ5XCIpLnRleHQobWVkaWEuVmlkZW9UaXRsZSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGh0bWwgPVxyXG4gICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGltZyBzdHlsZT1cImhlaWdodDogOTBweDsgd2lkdGg6IDE2MHB4OyBtYXJnaW4tcmlnaHQ6IDE2cHg7XCIgc3JjPVwiJyArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDtcIj4nICsgbWVkaWEuVmlkZW9UaXRsZSArICc8YnI+JyArICdSZWNvbW1lbmRlZCBieTogJyArIG1lZGlhLlVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikuaHRtbChodG1sKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFN0YXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uUGxheWVyUmVhZHkoZXZlbnQpIHtcclxuICAgICAgICB0aGlzLnBsYXllclJlYWR5ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcbn0iLCLvu78vL1RPRE86IEFsbCB0aGlzIGNvZGUgaXMgbWlzZXJhYmx5IGF3ZnVsLiBBdCBzb21lIHBvaW50IGl0IHNob3VsZCBiZSBjb21wbGV0ZWx5IHJld29ya2VkLlxyXG5cclxudmFyIENPTE9SX0xJU1QgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImJsdWVcIiwgXCJ2aW9sZXRcIl07XHJcblxyXG5pbXBvcnQgeyBNeVVzZXIsIE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUsIFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBVSUNhbGxiYWNrcywgVUkgfSBmcm9tIFwiLi91aVwiO1xyXG5pbXBvcnQgeyBNeVNvY2tldCB9IGZyb20gXCIuL1NvY2tldHNcIlxyXG5pbXBvcnQgeyBQbGF5ZXIgfSBmcm9tIFwiLi9QbGF5ZXJcIlxyXG5cclxuZGVjbGFyZSB2YXIgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuZGVjbGFyZSB2YXIgZ2FwaTogYW55O1xyXG5cclxudmFyIG1NZVVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbnZhciBtU2Vzc2lvbiA9IG5ldyBTZXNzaW9uKCk7XHJcbnZhciBtVUk6IFVJO1xyXG52YXIgbVBsYXllcjogUGxheWVyO1xyXG52YXIgbVNvY2tldDogTXlTb2NrZXQ7XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgdmFyIGNhbGxiYWNrcyA9IG5ldyBVSUNhbGxiYWNrcygpO1xyXG4gICAgY2FsbGJhY2tzLm9uU2VuZENoYXRNZXNzYWdlID0gc2VuZENoYXRNZXNzYWdlO1xyXG4gICAgY2FsbGJhY2tzLm5hbWVDaGFuZ2UgPSBzYXZlVXNlck5hbWVDaGFuZ2U7XHJcbiAgICBjYWxsYmFja3MubmV4dE1lZGlhID0gbmV4dFZpZGVvSW5RdWV1ZTtcclxuICAgIGNhbGxiYWNrcy5wYXVzZU1lZGlhID0gcGF1c2VWaWRlbztcclxuICAgIGNhbGxiYWNrcy5wbGF5TWVkaWEgPSBwbGF5VmlkZW87XHJcbiAgICBjYWxsYmFja3MucHJldmlvdXNNZWRpYSA9IHByZXZpb3VzVmlkZW9JblF1ZXVlO1xyXG4gICAgY2FsbGJhY2tzLnNlYXJjaCA9IHNlYXJjaFZpZGVvcztcclxuXHJcbiAgICBtVUkgPSBuZXcgVUkobW9iaWxlQnJvd3NlciwgY2FsbGJhY2tzKTtcclxuICAgIG1QbGF5ZXIgPSBuZXcgUGxheWVyKG1vYmlsZUJyb3dzZXIpO1xyXG4gICAgbVNvY2tldCA9IG5ldyBNeVNvY2tldChtTWVzc2FnZUZ1bmN0aW9ucyk7XHJcbiAgICBzZXR1cEphbVNlc3Npb24oKTtcclxufSk7XHJcblxyXG5cclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRnVuY3Rpb25zIGF1dG9tYXRpY2FsbHkgY2FsbGVkIHdoZW4geW91dHViZSBhcGkncyBhcmUgcmVhZHlcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuZnVuY3Rpb24gb25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkoKSB7XHJcbiAgICBtUGxheWVyLmluaXRpYWxpemVZdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24geW91dHViZUFQSUluaXQoKSB7XHJcblx0Z2FwaS5jbGllbnQuc2V0QXBpS2V5KFwiQUl6YVN5QzRBLWRzR2staGFfYi1lRHBieGFWUXQ1YlI3Y09VZGRjXCIpO1xyXG5cdGdhcGkuY2xpZW50LmxvYWQoXCJ5b3V0dWJlXCIsIFwidjNcIiwgZnVuY3Rpb24oKSB7fSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUGxheWVyU3RhdGVDaGFuZ2UoZXZlbnQpIHtcclxuICAgIGlmKGV2ZW50LmRhdGE9PTApIHtcclxuICAgIFx0bmV4dFZpZGVvSW5RdWV1ZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBCYWNrZW5kIHZpZGVvIGFuZCBxdWV1ZSBjb250cm9sIGZ1bmN0aW9uc1xyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5mdW5jdGlvbiBkZWxldGVWaWRlb0luUXVldWUoUXVldWVQb3NpdGlvbjogbnVtYmVyKSB7XHJcblx0dmFyIGlkID0gbVNlc3Npb24uUXVldWVbUXVldWVQb3NpdGlvbl0uSWQ7XHJcblx0bVNlc3Npb24uUXVldWUuc3BsaWNlKFF1ZXVlUG9zaXRpb24sIDEpO1xyXG5cclxuICAgIG1VSS51cGRhdGVRdWV1ZShtU2Vzc2lvbi5RdWV1ZSwgbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMSk7XHJcblxyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICB2YXIgbWVkaWFUb0RlbGV0ZSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgbWVkaWFUb0RlbGV0ZS5JZCA9IGlkO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnRGVsZXRlTWVkaWFGcm9tU2Vzc2lvbic7XHJcbiAgICBtZXNzYWdlLk1lZGlhID0gbWVkaWFUb0RlbGV0ZTtcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlcXVlc3RTeW5jV2l0aFVzZXIodXNlcklkKSB7XHJcbiAgICBjb25zb2xlLmxvZygncmVxdWVzdCBzeW5jIHdpdGggdXNlcicpO1xyXG5cclxuICAgIHZhciB1c2VyID0gbmV3IE15VXNlcigpO1xyXG4gICAgdXNlci5JZCA9IHVzZXJJZDtcclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnUmVxdWVzdFN5bmNXaXRoVXNlcic7XHJcbiAgICBtZXNzYWdlLlVzZXIgPSB1c2VyO1xyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBXZWJTb2NrZXQgbWVzc2FnZSByZXNwb25zZSBmdW5jdGlvbnNcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbnZhciBtTWVzc2FnZUZ1bmN0aW9ucyA9IHtcclxuICAgICd1cGRhdGVVc2VyJzogb25VcGRhdGVNZVVzZXIsXHJcbiAgICAnc2Vzc2lvblJlYWR5Jzogb25TZXNzaW9uUmVhZHksXHJcbiAgICAndXBkYXRlVXNlcnNMaXN0Jzogb25VcGRhdGVVc2Vyc0xpc3QsXHJcbiAgICAndXBkYXRlUXVldWUnOiBvblVwZGF0ZVF1ZXVlLFxyXG4gICAgJ2NoYXRNZXNzYWdlJzogb25SZWNlaXZlZENoYXRNZXNzYWdlLFxyXG4gICAgJ3JlcXVlc3RVc2VyU3RhdGUnOiBvblJlcXVlc3RNeVVzZXJTdGF0ZSxcclxuICAgICdwcm92aWRlVXNlclN0YXRlJzogb25Vc2VyU3RhdGVQcm92aWRlZFxyXG59XHJcblxyXG5mdW5jdGlvbiBvblVzZXJTdGF0ZVByb3ZpZGVkKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXJUb1N5bmNXaXRoID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdXNlclRvU3luY1dpdGguU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgIG1NZVVzZXIuU3RhdGUuVGltZSA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlRpbWU7XHJcbiAgICBtTWVVc2VyLlN0YXRlLllUUGxheWVyU3RhdGUgPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5ZVFBsYXllclN0YXRlO1xyXG4gICAgbVVJLnVwZGF0ZVF1ZXVlKG1TZXNzaW9uLlF1ZXVlLCBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gKyAxKTtcclxuICAgIG1QbGF5ZXIuc2V0UGxheWVyQ29udGVudChtU2Vzc2lvbi5RdWV1ZSwgbU1lVXNlci5TdGF0ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUmVxdWVzdE15VXNlclN0YXRlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXJEYXRhID0gbmV3IE15VXNlcigpO1xyXG4gICAgdXNlckRhdGEuSWQgPSBtZXNzYWdlLlVzZXIuSWQ7IC8vIFRPRE86IGJhZCBiYWQgYmFkXHJcbiAgICB1c2VyRGF0YS5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uO1xyXG4gICAgdXNlckRhdGEuU3RhdGUuVGltZSA9IE1hdGgucm91bmQobVBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIHVzZXJEYXRhLlN0YXRlLllUUGxheWVyU3RhdGUgPSBtUGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpO1xyXG5cclxuICAgIHZhciBvdXRnb2luZ01zZyA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG91dGdvaW5nTXNnLkFjdGlvbiA9ICdQcm92aWRlU3luY1RvVXNlcic7XHJcbiAgICBvdXRnb2luZ01zZy5Vc2VyID0gdXNlckRhdGE7XHJcbiAgICBtU29ja2V0LmVtaXQob3V0Z29pbmdNc2cpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gb25VcGRhdGVNZVVzZXIobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlciA9IG1lc3NhZ2UuVXNlcjtcclxuICAgIG1NZVVzZXIgPSB1c2VyO1x0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uU2Vzc2lvblJlYWR5KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgbVNlc3Npb24gPSBtZXNzYWdlLlNlc3Npb247XHJcbiAgICBtTWVVc2VyID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgaWYgKG1TZXNzaW9uLlF1ZXVlLmxlbmd0aCA9PSAwKSB7XHJcblx0XHQkKFwiI3BfY3VycmVudF9jb250ZW50X2luZm9cIikudGV4dChcIlF1ZXVlIHVwIGEgc29uZyFcIik7XHJcblx0XHQkKFwiI3BfY3VycmVudF9yZWNvbW1lbmRlcl9pbmZvXCIpLnRleHQoXCJVc2UgdGhlIHNlYXJjaCBiYXIgYWJvdmUuXCIpO1xyXG5cdH1cclxuICAgIG5leHRWaWRlb0luUXVldWUoKTtcclxuICAgIG1VSS51cGRhdGVVc2Vyc0xpc3QobVNlc3Npb24uVXNlcnMsIG1NZVVzZXIuSWQpO1xyXG4gICAgbVVJLnNlc3Npb25SZWFkeSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvblVwZGF0ZVVzZXJzTGlzdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIHZhciB1c2VycyA9IG1lc3NhZ2UuU2Vzc2lvbi5Vc2VycztcclxuICAgIG1TZXNzaW9uLlVzZXJzID0gdXNlcnM7XHJcbiAgICBtVUkudXBkYXRlVXNlcnNMaXN0KG1TZXNzaW9uLlVzZXJzLCBtTWVVc2VyLklkKTtcdFxyXG59XHJcblxyXG5mdW5jdGlvbiBvblVwZGF0ZVF1ZXVlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHF1ZXVlID0gbWVzc2FnZS5TZXNzaW9uLlF1ZXVlO1xyXG4gICAgbVNlc3Npb24uUXVldWUgPSBxdWV1ZTtcclxuICAgIG1VSS51cGRhdGVRdWV1ZShxdWV1ZSwgbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMSk7XHJcbiAgICBpZiAobU1lVXNlci5TdGF0ZS5XYWl0aW5nKSB7XHJcbiAgICAgICAgbmV4dFZpZGVvSW5RdWV1ZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBvblJlY2VpdmVkQ2hhdE1lc3NhZ2UoZGF0YSkge1xyXG5cdHZhciBtc2cgPSBkYXRhLkNoYXRNZXNzYWdlO1xyXG4gICAgdmFyIHVzZXJOYW1lID0gZGF0YS5Vc2VyLk5hbWU7XHJcbiAgICBtVUkub25DaGF0TWVzc2FnZSh1c2VyTmFtZSwgbXNnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0dXBKYW1TZXNzaW9uKCkge1xyXG5cdHZhciBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuXHR2YXIgZW5jb2RlZFNlc3Npb25OYW1lID0gcGF0aG5hbWUucmVwbGFjZSgnXFwvcm9vbXMvJywgJycpO1xyXG5cclxuICAgIG1TZXNzaW9uLk5hbWUgPSBkZWNvZGVVUkkoZW5jb2RlZFNlc3Npb25OYW1lKTtcclxuICAgIG1NZVVzZXIuTmFtZSA9ICdBbm9ueW1vdXMnO1xyXG5cclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnVXNlckpvaW5TZXNzaW9uJztcclxuICAgIG1lc3NhZ2UuVXNlciA9IG1NZVVzZXI7XHJcbiAgICBtZXNzYWdlLlNlc3Npb24gPSBtU2Vzc2lvbjtcclxuXHJcblx0bVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZW5kQ2hhdE1lc3NhZ2UobXNnOiBzdHJpbmcpIHtcclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnQ2hhdE1lc3NhZ2UnO1xyXG4gICAgbWVzc2FnZS5DaGF0TWVzc2FnZSA9IG1zZztcclxuICAgIG1lc3NhZ2UuVXNlciA9IG1NZVVzZXI7XHJcbiAgICBtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlYXJjaFZpZGVvcyhxdWVyeSwgY2FsbGJhY2spIHtcclxuXHR2YXIgcmVxdWVzdCA9IGdhcGkuY2xpZW50LnlvdXR1YmUuc2VhcmNoLmxpc3Qoe1xyXG4gICAgICAgIHBhcnQ6IFwic25pcHBldFwiLFxyXG4gICAgICAgIHR5cGU6IFwidmlkZW9cIixcclxuXHQgICAgcTogZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KS5yZXBsYWNlKC8lMjAvZywgXCIrXCIpLFxyXG5cdCAgICBtYXhSZXN1bHRzOiA1XHJcbiAgICB9KTtcclxuXHJcblx0cmVxdWVzdC5leGVjdXRlKGNhbGxiYWNrKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2F2ZVVzZXJOYW1lQ2hhbmdlKG5ld05hbWUpIHtcclxuICAgIG1NZVVzZXIuTmFtZSA9IG5ld05hbWU7XHJcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG1lc3NhZ2UuVXNlciA9IG1NZVVzZXI7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdTYXZlVXNlck5hbWVDaGFuZ2UnO1xyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBuZXh0VmlkZW9JblF1ZXVlKCkge1xyXG4gICAgbU1lVXNlci5TdGF0ZS5UaW1lID0gMDtcclxuICAgIHZhciBxdWV1ZSA9IG1TZXNzaW9uLlF1ZXVlO1xyXG5cdGlmKChtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24rMSk8cXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMTtcclxuICAgICAgICBtUGxheWVyLnNldFBsYXllckNvbnRlbnQobVNlc3Npb24uUXVldWUsIG1NZVVzZXIuU3RhdGUpO1xyXG4gICAgICAgIG1NZVVzZXIuU3RhdGUuV2FpdGluZyA9IGZhbHNlO1xyXG5cdH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIG1NZVVzZXIuU3RhdGUuV2FpdGluZyA9IHRydWU7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBwYXVzZVZpZGVvKCkge1xyXG4gICAgbVBsYXllci5wYXVzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwbGF5VmlkZW8oKSB7XHJcbiAgICBtUGxheWVyLnBsYXkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcHJldmlvdXNWaWRlb0luUXVldWUoKSB7XHJcbiAgICBtTWVVc2VyLlN0YXRlLlRpbWUgPSAwO1xyXG4gICAgdmFyIHF1ZXVlID0gbVNlc3Npb24uUXVldWU7XHJcblx0aWYobU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID4gMCkge1xyXG4gICAgICAgIG1NZVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IG1NZVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiAtIDE7XHJcbiAgICAgICAgbVBsYXllci5zZXRQbGF5ZXJDb250ZW50KG1TZXNzaW9uLlF1ZXVlLCBtTWVVc2VyLlN0YXRlKTtcclxuXHRcdG1NZVVzZXIuU3RhdGUuV2FpdGluZyA9IGZhbHNlO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFRoZXNlIGZ1bmN0aW9ucyBhcmUgY2FsbGVkIGRpcmVjdGx5IGVtYmVkZGVkIGludG8gdGhlIGh0bWwuLi4ga2luZGEgd2VpcmRcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuZnVuY3Rpb24gcXVldWVTZWxlY3RlZFZpZGVvKGVsbW50KSB7XHJcblx0JChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIikuZmFkZU91dCgpO1xyXG5cdCQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbChcIlwiKTtcclxuXHR2YXIgVmlkZW9JZCA9IGVsbW50LmdldEF0dHJpYnV0ZSgnZGF0YS1WaWRlb0lkJyk7XHJcblx0dmFyIFRpdGxlID0gZWxtbnQuaW5uZXJUZXh0IHx8IGVsbW50LnRleHRDb250ZW50O1xyXG5cdHZhciBUaHVtYlVSTCA9IGVsbW50LmdldEF0dHJpYnV0ZSgnZGF0YS1UaHVtYlVSTCcpO1xyXG5cclxuICAgIHZhciBtZWRpYSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgbWVkaWEuVmlkZW9UaXRsZSA9IFRpdGxlO1xyXG4gICAgbWVkaWEuVmlkZW9UaXRsZSA9IFZpZGVvSWQ7XHJcbiAgICBtZWRpYS5UaHVtYlVSTCA9IFRodW1iVVJMO1xyXG4gICAgbWVkaWEuVXNlcklkID0gbU1lVXNlci5JZDtcclxuICAgIG1lZGlhLlVzZXJOYW1lID0gbU1lVXNlci5OYW1lO1xyXG5cclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnQWRkTWVkaWFUb1Nlc3Npb24nO1xyXG4gICAgbWVzc2FnZS5NZWRpYSA9IG1lZGlhO1xyXG5cclxuICAgIC8vVE9ETzogbG9jYWwgYWRkIG1lZGlhXHJcblxyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG4iLCLvu79pbXBvcnQgeyBXc01lc3NhZ2UgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBNeVNvY2tldCB7XHJcblxyXG4gICAgcHJpdmF0ZSBzb2NrZXQ6IFdlYlNvY2tldDtcclxuICAgIHByaXZhdGUgcmVzcG9uc2VfZnVuY3Rpb25zOiB7IFthY3Rpb246IHN0cmluZ106IChkYXRhOiBhbnkpID0+IHZvaWQgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZXNwb25zZV9mdW5jdGlvbnM6IHsgW2FjdGlvbjogc3RyaW5nXTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZCB9KSB7XHJcbiAgICAgICAgdGhpcy5yZXNwb25zZV9mdW5jdGlvbnMgPSByZXNwb25zZV9mdW5jdGlvbnM7XHJcbiAgICAgICAgdmFyIHVyaSA9IFwid3M6Ly9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgXCIvd3NcIjtcclxuICAgICAgICB2YXIgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmkpO1xyXG4gICAgICAgIHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG4gICAgICAgIHNvY2tldC5vbmNsb3NlID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuICAgICAgICBzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IG1lc3NhZ2UuQWN0aW9uO1xyXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2VmdW5jID0gcmVzcG9uc2VfZnVuY3Rpb25zW2FjdGlvbl07XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGV4Y2VwdGlvbiB3aGVuIG5vdCBmb3VuZFxyXG4gICAgICAgICAgICByZXNwb25zZWZ1bmMobWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge307XHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVtaXQobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IHRoaXMuc29ja2V0LkNPTk5FQ1RJTkcpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XHJcbiAgICB9O1xyXG5cclxufVxyXG4iLCLvu79leHBvcnQgY2xhc3MgRnJhbWVCdWlsZGVyIHtcclxuXHJcbiAgICBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyTWUoY29sb3I6IHN0cmluZywgdXNlck5hbWU6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8ZGl2IGNsYXNzPVwiZGl2X3VzZXJcIiBzdHlsZT1cImJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+IHlvdSA8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZsb2F0OiBsZWZ0OyBjdXJzb3I6IHBvaW50ZXI7IG1hcmdpbi1yaWdodDogMTZweDsgaGVpZ2h0OiA0OHB4OyB3aWR0aDogNDhweDsgYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj55b3U8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7IGZsb2F0OiByaWdodDtcIj4nICsgdXNlck5hbWUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXNlcihjb2xvcjogc3RyaW5nLCB1c2VySWQ6IG51bWJlciwgdXNlck5hbWU6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8ZGl2IG9uY2xpY2s9XCJyZXF1ZXN0U3luY1dpdGhVc2VyKCcgKyB1c2VySWQgKyAnKVwiIGNsYXNzPVwiZGl2X3VzZXJcIiBzdHlsZT1cImJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+c3luYyB3aXRoICcgKyB1c2VyTmFtZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IG9uY2xpY2s9XCJyZXF1ZXN0U3luY1dpdGhVc2VyKCcgKyB1c2VySWQgKyAnKVwiIHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZsb2F0OiBsZWZ0OyBjdXJzb3I6IHBvaW50ZXI7IG1hcmdpbi1yaWdodDogMTZweDsgaGVpZ2h0OiA0OHB4OyB3aWR0aDogNDhweDsgYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj5zeW5jPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4OyBmbG9hdDogcmlnaHQ7XCI+JyArIHVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudEhUTUw7XHJcbiAgICB9XHJcbn0iLCLvu79pbXBvcnQgeyBGcmFtZUJ1aWxkZXIgfSBmcm9tIFwiLi9mcmFtZVwiO1xyXG5pbXBvcnQgeyBNZWRpYSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZGVjbGFyZSB2YXIgU3Bpbm5lcjogYW55O1xyXG5cclxuZXhwb3J0IGNsYXNzIFVJQ2FsbGJhY2tzIHtcclxuICAgIHByZXZpb3VzTWVkaWE6IGFueTtcclxuICAgIG5leHRNZWRpYTogYW55O1xyXG4gICAgcGxheU1lZGlhOiBhbnk7XHJcbiAgICBwYXVzZU1lZGlhOiBhbnk7XHJcbiAgICBvblNlbmRDaGF0TWVzc2FnZTogYW55O1xyXG4gICAgLy8gc2VhcmNoKHF1ZXJ5OiBzdHJpbmcsIGNhbGxiYWNrOiAocmVzdWx0czogYW55KSA9PiB2b2lkKTogYW55O1xyXG4gICAgc2VhcmNoOiBhbnk7XHJcbiAgICBuYW1lQ2hhbmdlOiBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVSSB7XHJcblxyXG4gICAgcHJpdmF0ZSBzcGlubmVyOiBhbnk7XHJcbiAgICBwcml2YXRlIGNhbGxiYWNrczogVUlDYWxsYmFja3M7XHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGZyYW1lQnVpbGRlcjogRnJhbWVCdWlsZGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4sIGNhbGxiYWNrczogVUlDYWxsYmFja3MpIHtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgICAgIHRoaXMuZnJhbWVCdWlsZGVyID0gbmV3IEZyYW1lQnVpbGRlcihtb2JpbGVCcm93c2VyKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IGNhbGxiYWNrcztcclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR1cFNwaW5uZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbmZvUm9sbG92ZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbnB1dFVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cFBsYXllckNvbnRyb2xCdXR0b25zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNlc3Npb25SZWFkeSgpIHtcclxuICAgICAgICAkKFwiI2Rpdl9sb2FkaW5nXCIpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xyXG4gICAgICAgICQoXCIjZGl2X2V2ZXJ5dGhpbmdcIikuYW5pbWF0ZSh7b3BhY2l0eTogMX0sICdmYXN0Jyk7XHJcbiAgICB9IFxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBTcGlubmVyVUkoKSB7XHJcbiAgICAgICAgdmFyIG9wdHMgPSB7XHJcbiAgICAgICAgICAgIGxpbmVzOiAxMyAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcclxuICAgICAgICAgICAgLCBsZW5ndGg6IDI4IC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXHJcbiAgICAgICAgICAgICwgd2lkdGg6IDE0IC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xyXG4gICAgICAgICAgICAsIHJhZGl1czogNDIgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXHJcbiAgICAgICAgICAgICwgc2NhbGU6IDEgLy8gU2NhbGVzIG92ZXJhbGwgc2l6ZSBvZiB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIGNvcm5lcnM6IDEgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcclxuICAgICAgICAgICAgLCBjb2xvcjogJyMwMDAnIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcclxuICAgICAgICAgICAgLCBvcGFjaXR5OiAwLjI1IC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXHJcbiAgICAgICAgICAgICwgcm90YXRlOiAwIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcclxuICAgICAgICAgICAgLCBkaXJlY3Rpb246IDEgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxyXG4gICAgICAgICAgICAsIHNwZWVkOiAxIC8vIFJvdW5kcyBwZXIgc2Vjb25kXHJcbiAgICAgICAgICAgICwgdHJhaWw6IDYwIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICwgZnBzOiAyMCAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKSBhcyBhIGZhbGxiYWNrIGZvciBDU1NcclxuICAgICAgICAgICAgLCB6SW5kZXg6IDJlOSAvLyBUaGUgei1pbmRleCAoZGVmYXVsdHMgdG8gMjAwMDAwMDAwMClcclxuICAgICAgICAgICAgLCBjbGFzc05hbWU6ICdzcGlubmVyJyAvLyBUaGUgQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIHRvcDogJzUwJScgLy8gVG9wIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIGxlZnQ6ICc1MCUnIC8vIExlZnQgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XHJcbiAgICAgICAgICAgICwgc2hhZG93OiBmYWxzZSAvLyBXaGV0aGVyIHRvIHJlbmRlciBhIHNoYWRvd1xyXG4gICAgICAgICAgICAsIGh3YWNjZWw6IGZhbHNlIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxyXG4gICAgICAgICAgICAsIHBvc2l0aW9uOiAnYWJzb2x1dGUnIC8vIEVsZW1lbnQgcG9zaXRpb25pbmdcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZfbG9hZGluZycpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4odGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwRmFkZVVJKG92ZXJhbGwsIHJlc3VsdHMpIHtcclxuICAgICAgICBvdmVyYWxsLm1vdXNlZW50ZXIoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVJbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWxlYXZlKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBJbmZvUm9sbG92ZXJVSSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X3VzZXJzX292ZXJhbGxcIiksICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfcXVldWVfb3ZlcmFsbFwiKSwgJChcIiNkaXZfcXVldWVfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfY2hhdF9vdmVyYWxsXCIpLCAkKFwiI2Rpdl9jaGF0X3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X2NjX292ZXJhbGxcIiksICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlYXJjaFRleHRDaGFuZ2VkKHRleHQpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGlmKHRleHQubGVuZ3RoPT0wKSB7XHJcbiAgICAgICAgICAgIGRpdlJlc3VsdHMuZmFkZU91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwSW5wdXRVSSgpIHtcclxuICAgICAgICB2YXIgaW5wdXRTZWFyY2ggPSAkKFwiI2lucHV0X3NlYXJjaFwiKTtcclxuICAgICAgICBpbnB1dFNlYXJjaC5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hFbnRlclByZXNzZWQoaW5wdXRTZWFyY2gpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGlucHV0X25hbWUgPSAkKFwiI2lucHV0X25hbWVcIik7XHJcbiAgICAgICAgaW5wdXRfbmFtZS5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyTmFtZUNoYW5nZShpbnB1dF9uYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0X2NoYXQgPSAkKFwiI2lucHV0X2NoYXRcIik7XHJcbiAgICAgICAgICAgIGlucHV0X2NoYXQua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja3Mub25TZW5kQ2hhdE1lc3NhZ2UoaW5wdXRfY2hhdC52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRfY2hhdC52YWwoXCJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKS5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbChcIlwiKTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5iaW5kKFwicHJvcGVydHljaGFuZ2UgaW5wdXQgcGFzdGVcIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoVGV4dENoYW5nZWQoJChcIiNpbnB1dF9zZWFyY2hcIikudmFsKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBQbGF5ZXJDb250cm9sQnV0dG9ucygpIHtcclxuICAgICAgICAkKFwiI2J0bl9wcmV2aW91c1wiKS5jbGljayh0aGlzLmNhbGxiYWNrcy5wcmV2aW91c01lZGlhKTtcclxuICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BhdXNlXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgJChcIiNidG5fcGxheVwiKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnBhdXNlTWVkaWEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiI2J0bl9wbGF5XCIpLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgJChcIiNidG5fcGxheVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3Vhc2VcIikuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5wbGF5TWVkaWEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiI2J0bl9uZXh0XCIpLmNsaWNrKHRoaXMuY2FsbGJhY2tzLm5leHRNZWRpYSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWFyY2hFbnRlclByZXNzZWQoaW5wdXRfc2VhcmNoKSB7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCJcIik7XHJcbiAgICAgICAgdmFyIHJlc3BvbnNlID0gdGhpcy5jYWxsYmFja3Muc2VhcmNoKGlucHV0X3NlYXJjaC52YWwoKSwgKHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgJC5lYWNoKHJlc3BvbnNlLml0ZW1zLCAoaW5kZXgsIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgIGRpdlJlc3VsdHMuaHRtbChkaXZSZXN1bHRzLmh0bWwoKSArIFwiPGRpdiBjbGFzcz0nZGl2X3NlYXJjaF9yZXN1bHQnIG9uQ2xpY2s9J3F1ZXVlU2VsZWN0ZWRWaWRlbyh0aGlzKScgZGF0YS1WaWRlb0lkPSdcIiArIGl0ZW0uaWQudmlkZW9JZCArIFwiJyBkYXRhLVRodW1iVVJMPSdcIitpdGVtLnNuaXBwZXQudGh1bWJuYWlscy5tZWRpdW0udXJsK1wiJz5cIiArICc8cCBjbGFzcz1cInRleHRfc2VhcmNoX3Jlc3VsdFwiPicgKyAgaXRlbS5zbmlwcGV0LnRpdGxlKyAnPC9wPjwvZGl2PicgKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlucHV0X3NlYXJjaC5ibHVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYoIWRpdlJlc3VsdHMuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgZGl2UmVzdWx0cy5mYWRlSW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVF1ZXVlKHF1ZXVlLCBxdWV1ZVBvc2l0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcXVldWUubGVuZ3RoO1xyXG4gICAgICAgIHZhciBsZW5ndGhVcE5leHQgPSBxdWV1ZS5sZW5ndGggLSBxdWV1ZVBvc2l0aW9uO1xyXG4gICAgICAgIHZhciBzdW1tYXJ5ID0gbGVuZ3RoVXBOZXh0ICsgXCIgdGhpbmdzIHVwIG5leHRcIjtcclxuICAgICAgICBcclxuICAgICAgICBpZiAobGVuZ3RoVXBOZXh0ID09IDEpIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IGxlbmd0aFVwTmV4dCArIFwiIHRoaW5nIHVwIG5leHRcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobGVuZ3RoVXBOZXh0IDw9IDApIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IFwiTm90aGluZyB1cCBuZXh0LiBRdWV1ZSBzb21ldGhpbmchXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjcF9xdWV1ZV9zdW1tYXJ5XCIpLnRleHQoc3VtbWFyeSk7XHJcblxyXG4gICAgICAgIHZhciBxdWV1ZVJlc3VsdHMgPSAkKFwiI2Rpdl9xdWV1ZV9yZXN1bHRzXCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gW107XHJcbiAgICAgICAgaWYgKGxlbmd0aFVwTmV4dCA+IDApIHtcclxuICAgICAgICAgICAgLy9UT0RPOiBwdXQgc3R5bGUgaW4gY3NzIGFuZCBtYWtlIHNjcm9sbGV5XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBxdWV1ZVBvc2l0aW9uOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBtZWRpYSA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8aW1nIHN0eWxlPVwiZmxvYXQ6IGxlZnQ7IHdpZHRoOiAzMy4zMyU7IGhlaWdodDogMjB2dztcIiBzcmM9XCInICArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGltZyBzdHlsZT1cImhlaWdodDogOTBweDsgd2lkdGg6IDE2MHB4OyBtYXJnaW4tcmlnaHQ6IDE2cHg7XCIgc3JjPVwiJyArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDtcIj4nICsgbWVkaWEuVmlkZW9UaXRsZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcXVldWVSZXN1bHRzLmh0bWwoaHRtbC5qb2luKFwiXCIpKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVVzZXJzTGlzdCh1c2VycywgdXNlcklkTWU6IG51bWJlcikge1xyXG4gICAgICAgIHZhciBudW0gPSB1c2Vycy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHN1bW1hcnkgPSB1c2Vycy5sZW5ndGggKyBcIiB1c2VycyBpbiB0aGUgcm9vbVwiO1xyXG4gICAgICAgIGlmIChudW0gPT0gMSkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gdXNlcnMubGVuZ3RoICsgXCIgdXNlciBpbiB0aGUgcm9vbVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiI3BfdXNlcnNfc3VtbWFyeVwiKS50ZXh0KHN1bW1hcnkpO1xyXG4gICAgICAgIHZhciB1c2VyUmVzdWx0cyA9ICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKTtcclxuICAgICAgICB2YXIgaHRtbCA9IFtdO1xyXG4gICAgICAgIC8vVE9ETzogcHV0IHN0eWxlIGluIGNzcyBhbmQgbWFrZSBzY3JvbGxleVxyXG4gICAgICAgICQuZWFjaCh1c2VycywgKGluZGV4LCB1c2VyKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciB0aGlzSXNNZSA9ICh1c2VyLklkID09PSB1c2VySWRNZSk7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50SFRNTDtcclxuICAgICAgICAgICAgaWYgKHRoaXNJc01lKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50SFRNTCA9IHRoaXMuZnJhbWVCdWlsZGVyLnVzZXJNZSgnZ3JlZW4nLCB1c2VyLk5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEhUTUwgPSB0aGlzLmZyYW1lQnVpbGRlci51c2VyKCdncmVlbicsIHVzZXIuSWQsIHVzZXIuTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB1c2VyUmVzdWx0cy5odG1sKGh0bWwuam9pbihcIlwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZXJOYW1lQ2hhbmdlKG5hbWVfaW5wdXQpIHtcclxuICAgICAgICBuYW1lX2lucHV0LmhpZGUoKTtcclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5mYWRlSW4oKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5uYW1lQ2hhbmdlKG5hbWVfaW5wdXQudmFsKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkNoYXRNZXNzYWdlKHVzZXJOYW1lOiBzdHJpbmcsIG1zZzogc3RyaW5nKSB7XHJcbiAgICAgICAgLy9UT0RPOiBjb2xvciBzdHVmZlxyXG4gICAgICAgIHZhciBodG1sID0gJzxsaSBjbGFzcz1cImNoYXRcIj48c3BhbiBzdHlsZT1cIm1hcmdpbjogMDsgY29sb3I6ICcgKyAnYmx1ZScgKyAnO1wiPicgKyB1c2VyTmFtZSArICc6IDwvc3Bhbj48c3Bhbj4nICsgbXNnICsgJzwvc3Bhbj48L2xpPic7XHJcbiAgICAgICAgJChcIiN1bF9jaGF0XCIpLmFwcGVuZChodG1sKTtcclxuICAgIH1cclxufSJdfQ==
