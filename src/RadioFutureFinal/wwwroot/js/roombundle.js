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
        this.Time = 0;
        this.QueuePosition = -1;
        this.YTPlayerState = 0;
        this.Waiting = false;
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
var FrameBuilder = (function () {
    function FrameBuilder(mobileBrowser) {
        this.mobileBrowser = mobileBrowser;
    }
    FrameBuilder.prototype.user = function (color, userId, userName, thisIsMe) {
        var currentHTML = "";
        var meHtml = thisIsMe ? 'onclick="requestSyncWithUser(' + userId + ')" ' : "";
        var syncHTML = thisIsMe ? 'you' : 'sync';
        var syncHTMLMobile = thisIsMe ? 'you' : 'sync with ' + userName;
        if (this.mobileBrowser) {
            currentHTML = '<div ' + meHtml + 'class="div_user" style="background: ' + color + ';"> ' + syncHTMLMobile + '</div>';
        }
        else {
            currentHTML =
                '<div style="text-align: left; display: flex; align-items: center;">' +
                    '<div ' + meHtml + 'style="display: flex; align-items: center; justify-content: center; float: left; cursor: pointer; margin-right: 16px; height: 48px; width: 48px; background: ' + color + ';">' + syncHTML + '</div>' +
                    '<span style="margin-right: 16px; float: right;">' + userName + '</span>' +
                    '</div>';
        }
        return currentHTML;
    };
    FrameBuilder.prototype.media = function (media, position, recommendedByMe, onThis) {
        var currentHTML = "";
        var canDeleteThis = recommendedByMe && !onThis;
        var deleteThisHTML = canDeleteThis ? 'title="Click to delete this from the queue!" onclick="deleteMedia(' + media.Id + ', ' + position + ')" ' : "";
        var canDeleteStyle = canDeleteThis ? "cursor: pointer; " : "";
        var onThisStyle = onThis ? "border: 1px solid blue; " : "";
        if (this.mobileBrowser) {
            // TODO: add delete UI
            currentHTML = '<img style="' + onThisStyle + 'float: left; width: 33.33%; height: 20vw;" src="' + media.ThumbURL + '"/>';
        }
        else {
            currentHTML =
                '<div ' + deleteThisHTML + 'style="' + canDeleteStyle + onThisStyle + 'text-align: left; display: flex; align-items: center;">' +
                    '<img style="height: 90px; width: 160px; margin-right: 16px;" src="' + media.ThumbURL + '"/>' +
                    '<span style="margin-right: 16px;">' + media.VideoTitle + '</span>' +
                    '</div>';
        }
        return currentHTML;
    };
    return FrameBuilder;
}());
exports.FrameBuilder = FrameBuilder;
},{}],3:[function(require,module,exports){
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
            var div_player = $("#div_yt_player");
            div_player.height(div_player.width() * 9.0 / 16.0);
        }
    };
    Player.prototype.setPlayerContent = function (media, time) {
        var _this = this;
        if (!this.playerReady) {
            console.log('player not ready!');
            setTimeout(function () { _this.setPlayerContent(media, time); }, 50);
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
},{}],4:[function(require,module,exports){
"use strict";
// This is all pretty bad code. Should be thoroughly reorganized.
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: find a better way to expose these functions to html?
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.ytApiReady = ytApiReady;
window.queueSelectedVideo = queueSelectedVideo;
window.requestSyncWithUser = requestSyncWithUser;
window.deleteMedia = deleteMedia;
var Contracts_1 = require("./Contracts");
var UI_1 = require("./UI");
var Sockets_1 = require("./Sockets");
var Player_1 = require("./Player");
var mUser = new Contracts_1.MyUser();
var mSession = new Contracts_1.Session();
var mPlayer = new Player_1.Player(mobileBrowser);
var mSocket;
var mUI;
$(document).ready(function () {
    var callbacks = new UI_1.UICallbacks();
    callbacks.onSendChatMessage = sendChatMessage;
    callbacks.nameChange = saveUserNameChange;
    callbacks.nextMedia = nextVideoInQueue;
    callbacks.pauseMedia = pauseVideo;
    callbacks.playMedia = playVideo;
    callbacks.previousMedia = previousVideoInQueue;
    callbacks.search = searchVideos;
    mUI = new UI_1.UI(mobileBrowser, callbacks);
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
    mUI.updateQueue(mSession.Queue, mUser.Id, mUser.State.QueuePosition);
    var currentMedia = mSession.Queue[mUser.State.QueuePosition];
    userStateChange();
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
    // TODO: get rid of this bullshit
    if (mSession.Queue.length == 0) {
        $("#p_current_content_info").text("Queue up a song!");
        $("#p_current_recommender_info").text("Use the search bar above.");
    }
    nextVideoInQueue();
    mUI.updateQueue(mSession.Queue, mUser.Id, mUser.State.QueuePosition);
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
    mUI.updateQueue(mSession.Queue, mUser.Id, mUser.State.QueuePosition);
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
function userStateChange() {
    if (mUser.State.QueuePosition >= 0 && mUser.State.QueuePosition < mSession.Queue.length) {
        mPlayer.setPlayerContent(mSession.Queue[mUser.State.QueuePosition], mUser.State.Time);
        mUser.State.Waiting = false;
    }
    else if (mUser.State.QueuePosition < 0 || mUser.State.QueuePosition == mSession.Queue.length) {
        // TODO: set player content to 'waiting on next video'
        mUser.State.Waiting = true;
    }
    else if (mUser.State.QueuePosition == mSession.Queue.length) {
    }
}
function nextVideoInQueue() {
    mUser.State.Time = 0;
    var queue = mSession.Queue;
    if (mUser.State.QueuePosition + 1 < queue.length) {
        mUser.State.QueuePosition = mUser.State.QueuePosition + 1;
    }
    else if (mUser.State.QueuePosition >= 0) {
        mUser.State.QueuePosition = queue.length;
    }
    userStateChange();
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
        userStateChange();
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
function deleteMedia(mediaId, position) {
    mSession.Queue.splice(position, 1);
    if (mUser.State.QueuePosition >= position) {
        mUser.State.QueuePosition -= 1;
        userStateChange();
    }
    mUI.updateQueue(mSession.Queue, mUser.Id, mUser.State.QueuePosition);
    var mediaToDelete = new Contracts_1.Media();
    mediaToDelete.Id = mediaId;
    var message = new Contracts_1.WsMessage();
    message.Action = 'DeleteMediaFromSession';
    message.Media = mediaToDelete;
    mSocket.emit(message);
}
},{"./Contracts":1,"./Player":3,"./Sockets":5,"./UI":6}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FrameBuilder_1 = require("./FrameBuilder");
var UICallbacks = (function () {
    function UICallbacks() {
    }
    return UICallbacks;
}());
exports.UICallbacks = UICallbacks;
var UI = (function () {
    function UI(mobileBrowser, callbacks) {
        this.colors = ['red', 'orange', 'yellow', 'green', 'blue', 'violet'];
        this.mobileBrowser = mobileBrowser;
        this.frameBuilder = new FrameBuilder_1.FrameBuilder(mobileBrowser);
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
            $("#btn_pause").show();
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
    UI.prototype.updateQueue = function (queue, userIdMe, queuePosition) {
        var length = queue.length;
        var summary = length + " things in the playlist";
        if (length == 1) {
            summary = length + " thing in the playlist";
        }
        else if (length <= 0) {
            summary = "Nothing in the playlist. Queue something!";
        }
        $("#p_queue_summary").text(summary);
        var queueResults = $("#div_queue_results");
        var html = [];
        for (var i = 0; i < length; i++) {
            var media = queue[i];
            var onThis = i === queuePosition;
            var currentHTML = this.frameBuilder.media(media, i, media.UserId === userIdMe, onThis);
            html.push(currentHTML);
        }
        queueResults.html(html.join(""));
    };
    UI.prototype.updateUsersList = function (users, userIdMe) {
        var num = users.length;
        var summary = users.length + " users in the room";
        if (num == 1) {
            summary = users.length + " user in the room";
        }
        $("#p_users_summary").text(summary);
        var userResults = $("#div_user_results");
        var html = [];
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var thisIsMe = (user.Id === userIdMe);
            var currentHTML = this.frameBuilder.user(this.colors[i % this.colors.length], user.Id, user.Name, thisIsMe);
            html.push(currentHTML);
        }
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
},{"./FrameBuilder":2}]},{},[1,2,3,4,5,6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9GcmFtZUJ1aWxkZXIudHMiLCJUeXBlU2NyaXB0cy9QbGF5ZXIudHMiLCJUeXBlU2NyaXB0cy9Sb29tLnRzIiwiVHlwZVNjcmlwdHMvU29ja2V0cy50cyIsIlR5cGVTY3JpcHRzL1VJLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQztJQUFBO0lBT0QsQ0FBQztJQUFELFlBQUM7QUFBRCxDQVBDLEFBT0EsSUFBQTtBQVBhLHNCQUFLO0FBU25CO0lBRUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUtMLGFBQUM7QUFBRCxDQVRBLEFBU0MsSUFBQTtBQVRZLHdCQUFNO0FBV25CO0lBRUk7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDekIsQ0FBQztJQU1MLGdCQUFDO0FBQUQsQ0FiQSxBQWFDLElBQUE7QUFiWSw4QkFBUztBQWV0QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDeEN0QjtJQUlJLHNCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSwyQkFBSSxHQUFYLFVBQVksS0FBYSxFQUFFLE1BQWMsRUFBRSxRQUFnQixFQUFFLFFBQWlCO1FBQzFFLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLE1BQU0sR0FBRyxRQUFRLEdBQUcsK0JBQStCLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDOUUsSUFBSSxRQUFRLEdBQUcsUUFBUSxHQUFHLEtBQUssR0FBRyxNQUFNLENBQUM7UUFDekMsSUFBSSxjQUFjLEdBQUcsUUFBUSxHQUFHLEtBQUssR0FBRyxZQUFZLEdBQUcsUUFBUSxDQUFDO1FBQ2hFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLFdBQVcsR0FBRyxPQUFPLEdBQUcsTUFBTSxHQUFHLHNDQUFzQyxHQUFHLEtBQUssR0FBRyxNQUFNLEdBQUcsY0FBYyxHQUFHLFFBQVEsQ0FBQztRQUN6SCxDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDRixXQUFXO2dCQUNQLHFFQUFxRTtvQkFDckUsT0FBTyxHQUFHLE1BQU0sR0FBRywrSkFBK0osR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLFFBQVEsR0FBRyxRQUFRO29CQUNqTixrREFBa0QsR0FBRyxRQUFRLEdBQUcsU0FBUztvQkFDaEYsUUFBUSxDQUFDO1FBQ2pCLENBQUM7UUFDRCxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFFTSw0QkFBSyxHQUFaLFVBQWEsS0FBWSxFQUFFLFFBQWdCLEVBQUUsZUFBd0IsRUFBRSxNQUFlO1FBQ2xGLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLGFBQWEsR0FBRyxlQUFlLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDL0MsSUFBSSxjQUFjLEdBQUcsYUFBYSxHQUFHLG9FQUFvRSxHQUFHLEtBQUssQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLFFBQVEsR0FBRyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ3BKLElBQUksY0FBYyxHQUFHLGFBQWEsR0FBRyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7UUFDOUQsSUFBSSxXQUFXLEdBQUcsTUFBTSxHQUFHLDBCQUEwQixHQUFHLEVBQUUsQ0FBQztRQUUzRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNyQixzQkFBc0I7WUFDdEIsV0FBVyxHQUFHLGNBQWMsR0FBRyxXQUFXLEdBQUcsa0RBQWtELEdBQUksS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDOUgsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDO1lBQ0YsV0FBVztnQkFDUCxPQUFPLEdBQUcsY0FBYyxHQUFHLFNBQVMsR0FBRyxjQUFjLEdBQUcsV0FBVyxHQUFHLHlEQUF5RDtvQkFDM0gsb0VBQW9FLEdBQUcsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLO29CQUM3RixvQ0FBb0MsR0FBRyxLQUFLLENBQUMsVUFBVSxHQUFHLFNBQVM7b0JBQ3ZFLFFBQVEsQ0FBQztRQUNqQixDQUFDO1FBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUN2QixDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQTlDQSxBQThDQyxJQUFBO0FBOUNZLG9DQUFZOzs7O0FDRXpCO0lBTUksZ0JBQVksYUFBc0I7UUFBbEMsaUJBR0M7UUF3Qk0sa0JBQWEsR0FBRztZQUNuQixLQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUM1QixDQUFDLENBQUE7UUE1QkcsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFDdkMsQ0FBQztJQUVNLG1DQUFrQixHQUF6QixVQUEwQixtQkFBbUI7UUFFekMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFO1lBQzNDLE1BQU0sRUFBRSxNQUFNO1lBQ2QsS0FBSyxFQUFFLE1BQU07WUFDYixVQUFVLEVBQUU7Z0JBQ1IsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7YUFDZDtZQUNELE1BQU0sRUFBRTtnQkFDSixTQUFTLEVBQUcsSUFBSSxDQUFDLGFBQWE7Z0JBQzlCLGVBQWUsRUFBRSxtQkFBbUI7YUFDdkM7U0FDSixDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNyQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDdkQsQ0FBQztJQUNMLENBQUM7SUFNTSxpQ0FBZ0IsR0FBdkIsVUFBd0IsS0FBWSxFQUFFLElBQVk7UUFBbEQsaUJBU0M7UUFSRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNqQyxVQUFVLENBQUMsY0FBUSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztJQUVNLHFCQUFJLEdBQVg7UUFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFTSxzQkFBSyxHQUFaO1FBQ0ksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU0sK0JBQWMsR0FBckI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLGdDQUFlLEdBQXRCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFHTywrQkFBYyxHQUF0QixVQUF1QixLQUFZLEVBQUUsSUFBWTtRQUM3QyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1RCxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLElBQUksSUFBSSxHQUNSLHFFQUFxRTtnQkFDakUsb0VBQW9FLEdBQUcsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLO2dCQUM3RixvQ0FBb0MsR0FBRyxLQUFLLENBQUMsVUFBVSxHQUFHLE1BQU0sR0FBRyxrQkFBa0IsR0FBRyxLQUFLLENBQUMsUUFBUSxHQUFHLFNBQVM7Z0JBQ3RILFFBQVEsQ0FBQztZQUNULENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO0lBQ0wsQ0FBQztJQUVMLGFBQUM7QUFBRCxDQTlFQSxBQThFQyxJQUFBO0FBOUVZLHdCQUFNOzs7QUNKbEIsaUVBQWlFOztBQUVsRSw2REFBNkQ7QUFDdkQsTUFBTyxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0FBQzFELE1BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQ2hDLE1BQU8sQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztBQUNoRCxNQUFPLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7QUFDbEQsTUFBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFFeEMseUNBQTJFO0FBQzNFLDJCQUF1QztBQUN2QyxxQ0FBb0M7QUFDcEMsbUNBQWlDO0FBS2pDLElBQUksS0FBSyxHQUFHLElBQUksa0JBQU0sRUFBRSxDQUFDO0FBQ3pCLElBQUksUUFBUSxHQUFHLElBQUksbUJBQU8sRUFBRSxDQUFDO0FBQzdCLElBQUksT0FBTyxHQUFHLElBQUksZUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3hDLElBQUksT0FBaUIsQ0FBQztBQUN0QixJQUFJLEdBQU8sQ0FBQztBQUVaLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFFZCxJQUFJLFNBQVMsR0FBRyxJQUFJLGdCQUFXLEVBQUUsQ0FBQztJQUNsQyxTQUFTLENBQUMsaUJBQWlCLEdBQUcsZUFBZSxDQUFDO0lBQzlDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsa0JBQWtCLENBQUM7SUFDMUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztJQUN2QyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUNsQyxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUNoQyxTQUFTLENBQUMsYUFBYSxHQUFHLG9CQUFvQixDQUFDO0lBQy9DLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO0lBRWhDLEdBQUcsR0FBRyxJQUFJLE9BQUUsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDdkMsT0FBTyxHQUFHLElBQUksa0JBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRTFDLGVBQWUsRUFBRSxDQUFDO0FBQ3RCLENBQUMsQ0FBQyxDQUFDO0FBR0g7SUFDQyxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUN4QyxJQUFJLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRXZELFFBQVEsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDOUMsS0FBSyxDQUFDLElBQUksR0FBRyxXQUFXLENBQUM7SUFFekIsSUFBSSxPQUFPLEdBQUcsSUFBSSxxQkFBUyxFQUFFLENBQUM7SUFDOUIsT0FBTyxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQztJQUNuQyxPQUFPLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztJQUNyQixPQUFPLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztJQUU5QixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZCLENBQUM7QUFFRCxvRUFBb0U7QUFDcEUsOERBQThEO0FBQzlELG9FQUFvRTtBQUNwRTtJQUNJLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3BELENBQUM7QUFFRDtJQUNDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7SUFDakUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxjQUFZLENBQUMsQ0FBQyxDQUFDO0FBQ2xELENBQUM7QUFFRCw2QkFBNkIsS0FBSztJQUM5QixFQUFFLENBQUEsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsZ0JBQWdCLEVBQUUsQ0FBQztJQUNwQixDQUFDO0FBQ0wsQ0FBQztBQUVELG9FQUFvRTtBQUNwRSx1Q0FBdUM7QUFDdkMsb0VBQW9FO0FBRXBFLElBQUksaUJBQWlCLEdBQUc7SUFDcEIsWUFBWSxFQUFFLGNBQWM7SUFDNUIsY0FBYyxFQUFFLGNBQWM7SUFDOUIsaUJBQWlCLEVBQUUsaUJBQWlCO0lBQ3BDLGFBQWEsRUFBRSxhQUFhO0lBQzVCLGFBQWEsRUFBRSxxQkFBcUI7SUFDcEMsa0JBQWtCLEVBQUUsb0JBQW9CO0lBQ3hDLGtCQUFrQixFQUFFLG1CQUFtQjtDQUMxQyxDQUFBO0FBRUQsNkJBQTZCLE9BQWtCO0lBQzNDLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFFbEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7SUFDL0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFDN0MsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7SUFFL0QsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVyRSxJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFN0QsZUFBZSxFQUFFLENBQUM7QUFDdEIsQ0FBQztBQUVELDhCQUE4QixPQUFrQjtJQUM1QyxJQUFJLFFBQVEsR0FBRyxJQUFJLGtCQUFNLEVBQUUsQ0FBQztJQUM1QixRQUFRLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsb0JBQW9CO0lBQ25ELFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDO0lBQ3pELFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDM0QsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBRXpELElBQUksV0FBVyxHQUFHLElBQUkscUJBQVMsRUFBRSxDQUFDO0lBQ2xDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsbUJBQW1CLENBQUM7SUFDekMsV0FBVyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7SUFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBR0Qsd0JBQXdCLE9BQWtCO0lBQ3RDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDeEIsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixDQUFDO0FBRUQsd0JBQXdCLE9BQWtCO0lBQ3RDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQzNCLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBRXJCLGlDQUFpQztJQUNqQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRSxnQkFBZ0IsRUFBRSxDQUFDO0lBQ25CLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDckUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDdkIsQ0FBQztBQUVELDJCQUEyQixPQUFrQjtJQUN6QyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUNsQyxRQUFRLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixHQUFHLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2xELENBQUM7QUFFRCx1QkFBdUIsT0FBa0I7SUFDckMsUUFBUSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUN2QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDdEIsZ0JBQWdCLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBQ0QsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN6RSxDQUFDO0FBRUQsK0JBQStCLE9BQWtCO0lBQzdDLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7SUFDdEMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDakMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUVELHlCQUF5QixHQUFXO0lBQ2hDLElBQUksT0FBTyxHQUFHLElBQUkscUJBQVMsRUFBRSxDQUFDO0lBQzlCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDO0lBQy9CLE9BQU8sQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO0lBQzFCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVELHNCQUFzQixLQUFLLEVBQUUsUUFBUTtJQUNwQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3ZDLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLE9BQU87UUFDaEIsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO1FBQ2pELFVBQVUsRUFBRSxDQUFDO0tBQ2IsQ0FBQyxDQUFDO0lBRU4sT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBRUQsNEJBQTRCLE9BQU87SUFDL0IsS0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7SUFDckIsSUFBSSxPQUFPLEdBQUcsSUFBSSxxQkFBUyxFQUFFLENBQUM7SUFDOUIsT0FBTyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7SUFDckIsT0FBTyxDQUFDLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQztJQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFCLENBQUM7QUFFRDtJQUNJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdEYsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RGLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUNoQyxDQUFDO0lBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDM0Ysc0RBQXNEO1FBQ3RELEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUMvQixDQUFDO0lBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0FBQ0wsQ0FBQztBQUVEO0lBQ0ksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7SUFFOUIsRUFBRSxDQUFBLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzNDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNoRCxDQUFDO0lBRUUsZUFBZSxFQUFFLENBQUM7QUFDdEIsQ0FBQztBQUVEO0lBQ0ksT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3BCLENBQUM7QUFFRDtJQUNJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQ7SUFDSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7SUFDckIsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztJQUM5QixFQUFFLENBQUEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUMxRCxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0FBQ0YsQ0FBQztBQUdELG9FQUFvRTtBQUNwRSw0RUFBNEU7QUFDNUUsb0VBQW9FO0FBRXBFLDZCQUE2QixNQUFNO0lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUV0QyxJQUFJLElBQUksR0FBRyxJQUFJLGtCQUFNLEVBQUUsQ0FBQztJQUN4QixJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQztJQUNqQixJQUFJLE9BQU8sR0FBRyxJQUFJLHFCQUFTLEVBQUUsQ0FBQztJQUM5QixPQUFPLENBQUMsTUFBTSxHQUFHLHFCQUFxQixDQUFDO0lBQ3ZDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVELDRCQUE0QixLQUFLO0lBRWhDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25DLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDM0IsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNqRCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFDakQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUVoRCxJQUFJLEtBQUssR0FBRyxJQUFJLGlCQUFLLEVBQUUsQ0FBQztJQUN4QixLQUFLLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztJQUMxQixLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUN6QixLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMxQixLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7SUFDeEIsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBRTVCLElBQUksT0FBTyxHQUFHLElBQUkscUJBQVMsRUFBRSxDQUFDO0lBQzlCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsbUJBQW1CLENBQUM7SUFDckMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFFdEIsdUJBQXVCO0lBQ3ZCLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVELHFCQUFxQixPQUFlLEVBQUUsUUFBZ0I7SUFFbEQsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25DLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDeEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDO1FBQy9CLGVBQWUsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFDRCxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRXJFLElBQUksYUFBYSxHQUFHLElBQUksaUJBQUssRUFBRSxDQUFDO0lBQ2hDLGFBQWEsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTNCLElBQUksT0FBTyxHQUFHLElBQUkscUJBQVMsRUFBRSxDQUFDO0lBQzlCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsd0JBQXdCLENBQUM7SUFDMUMsT0FBTyxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUM7SUFFOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQixDQUFDOzs7O0FDMVJEO0lBS0ksa0JBQVksa0JBQXNFO1FBQzlFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztRQUM3QyxJQUFJLEdBQUcsR0FBRyxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2pELElBQUksTUFBTSxHQUFHLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsVUFBVSxLQUFLLElBQUcsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLElBQUcsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsVUFBVSxLQUFLO1lBQzlCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDNUIsSUFBSSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUMsaUNBQWlDO1lBQ2pDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUM7UUFDRixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsS0FBSyxJQUFHLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRU0sdUJBQUksR0FBWCxVQUFZLE9BQWtCO1FBQTlCLGlCQVFDO1FBUEcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3BELFVBQVUsQ0FBQztnQkFDUCxLQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNSLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUFBLENBQUM7SUFFTixlQUFDO0FBQUQsQ0FoQ0EsQUFnQ0MsSUFBQTtBQWhDWSw0QkFBUTs7OztBQ0ZwQiwrQ0FBOEM7QUFLL0M7SUFBQTtJQVFBLENBQUM7SUFBRCxrQkFBQztBQUFELENBUkEsQUFRQyxJQUFBO0FBUlksa0NBQVc7QUFVeEI7SUFRSSxZQUFZLGFBQXNCLEVBQUUsU0FBc0I7UUFDdEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFTyx1QkFBVSxHQUFsQjtRQUNJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVNLHlCQUFZLEdBQW5CO1FBQ0ksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEIsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFTywyQkFBYyxHQUF0QjtRQUNJLElBQUksSUFBSSxHQUFHO1lBQ1AsS0FBSyxFQUFFLEVBQUUsQ0FBQyw4QkFBOEI7O1lBQ3RDLE1BQU0sRUFBRSxFQUFFLENBQUMsMEJBQTBCOztZQUNyQyxLQUFLLEVBQUUsRUFBRSxDQUFDLHFCQUFxQjs7WUFDL0IsTUFBTSxFQUFFLEVBQUUsQ0FBQyxpQ0FBaUM7O1lBQzVDLEtBQUssRUFBRSxDQUFDLENBQUMscUNBQXFDOztZQUM5QyxPQUFPLEVBQUUsQ0FBQyxDQUFDLDBCQUEwQjs7WUFDckMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxxQ0FBcUM7O1lBQ25ELE9BQU8sRUFBRSxJQUFJLENBQUMsdUJBQXVCOztZQUNyQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQjs7WUFDaEMsU0FBUyxFQUFFLENBQUMsQ0FBQyxxQ0FBcUM7O1lBQ2xELEtBQUssRUFBRSxDQUFDLENBQUMsb0JBQW9COztZQUM3QixLQUFLLEVBQUUsRUFBRSxDQUFDLHVCQUF1Qjs7WUFDakMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxrRUFBa0U7O1lBQzFFLE1BQU0sRUFBRSxHQUFHLENBQUMsdUNBQXVDOztZQUNuRCxTQUFTLEVBQUUsU0FBUyxDQUFDLHlDQUF5Qzs7WUFDOUQsR0FBRyxFQUFFLEtBQUssQ0FBQyxrQ0FBa0M7O1lBQzdDLElBQUksRUFBRSxLQUFLLENBQUMsbUNBQW1DOztZQUMvQyxNQUFNLEVBQUUsS0FBSyxDQUFDLDZCQUE2Qjs7WUFDM0MsT0FBTyxFQUFFLEtBQUssQ0FBQyx1Q0FBdUM7O1lBQ3RELFFBQVEsRUFBRSxVQUFVLENBQUMsc0JBQXNCO1NBQ2hELENBQUE7UUFDRCxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTyx3QkFBVyxHQUFuQixVQUFvQixPQUFPLEVBQUUsT0FBTztRQUNoQyxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQUMsQ0FBQztZQUNqQixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDckIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFDLENBQUM7WUFDakIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN0QixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sZ0NBQW1CLEdBQTNCO1FBQ0ksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDakUsQ0FBQztJQUNMLENBQUM7SUFFTyw4QkFBaUIsR0FBekIsVUFBMEIsSUFBSTtRQUMxQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUMxQyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLENBQUM7SUFDTCxDQUFDO0lBRU8seUJBQVksR0FBcEI7UUFBQSxpQkE2QkM7UUE1QkcsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JDLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBQyxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEIsS0FBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3pDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNsQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQUMsQ0FBQztZQUNsQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLEtBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDbEMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFDLENBQUM7Z0JBQ2xCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDaEIsS0FBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDbkQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdkIsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO1lBQ3BDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25DLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxVQUFDLEtBQUs7WUFDeEQsS0FBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLHNDQUF5QixHQUFqQztRQUFBLGlCQWFDO1FBWkcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDbEIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0QixLQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNqQixDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZCLEtBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVPLCtCQUFrQixHQUExQixVQUEyQixZQUFZO1FBQ25DLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxFQUFFLFVBQUMsT0FBTztZQUM5QyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFBQyxLQUFLLEVBQUUsSUFBSTtnQkFDOUIsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEdBQUcsa0ZBQWtGLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLEdBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBQyxJQUFJLEdBQUcsZ0NBQWdDLEdBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUUsWUFBWSxDQUFFLENBQUM7WUFDcFIsQ0FBQyxDQUFDLENBQUM7WUFDSCxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN4QixDQUFDO0lBQ0wsQ0FBQztJQUVNLHdCQUFXLEdBQWxCLFVBQW1CLEtBQWMsRUFBRSxRQUFnQixFQUFFLGFBQXFCO1FBQ3RFLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDMUIsSUFBSSxPQUFPLEdBQUcsTUFBTSxHQUFHLHlCQUF5QixDQUFDO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2QsT0FBTyxHQUFHLE1BQU0sR0FBRyx3QkFBd0IsQ0FBQztRQUNoRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sR0FBRywyQ0FBMkMsQ0FBQztRQUMxRCxDQUFDO1FBQ0QsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXBDLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzNDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksTUFBTSxHQUFHLENBQUMsS0FBSyxhQUFhLENBQUM7WUFDakMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBR00sNEJBQWUsR0FBdEIsVUFBdUIsS0FBSyxFQUFFLFFBQWdCO1FBQzFDLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDdkIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQztRQUNsRCxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLG1CQUFtQixDQUFDO1FBQ2pELENBQUM7UUFDRCxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEMsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDekMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDcEMsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUMsQ0FBQztZQUN0QyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM1RyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRU0sMkJBQWMsR0FBckIsVUFBc0IsVUFBVTtRQUM1QixVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEIsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTSwwQkFBYSxHQUFwQixVQUFxQixRQUFnQixFQUFFLEdBQVc7UUFDOUMsbUJBQW1CO1FBQ25CLElBQUksSUFBSSxHQUFHLGtEQUFrRCxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsUUFBUSxHQUFHLGlCQUFpQixHQUFHLEdBQUcsR0FBRyxjQUFjLENBQUM7UUFDckksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBQ0wsU0FBQztBQUFELENBdE1BLEFBc01DLElBQUE7QUF0TVksZ0JBQUUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwi77u/ZXhwb3J0IGNsYXNzIE1lZGlhIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBVc2VySWQ6IG51bWJlcjtcclxuICAgIFVzZXJOYW1lOiBzdHJpbmc7XHJcbiAgICBZVFZpZGVvSUQ6IG51bWJlcjtcclxuICAgIFZpZGVvVGl0bGU6IHN0cmluZztcclxuICAgIFRodW1iVVJMOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNeVVzZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuU3RhdGUgPSBuZXcgVXNlclN0YXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIFN0YXRlOiBVc2VyU3RhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVc2VyU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuVGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5RdWV1ZVBvc2l0aW9uID0gLTE7XHJcbiAgICAgICAgdGhpcy5ZVFBsYXllclN0YXRlID0gMDtcclxuICAgICAgICB0aGlzLldhaXRpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBUaW1lOiBudW1iZXI7XHJcbiAgICBRdWV1ZVBvc2l0aW9uOiBudW1iZXI7XHJcbiAgICBZVFBsYXllclN0YXRlOiBudW1iZXI7XHJcbiAgICBXYWl0aW5nOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2Vzc2lvbiB7XHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgTmFtZTogc3RyaW5nO1xyXG4gICAgVXNlcnM6IE15VXNlcltdO1xyXG4gICAgUXVldWU6IE1lZGlhW107XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXc01lc3NhZ2Uge1xyXG4gICAgQWN0aW9uOiBzdHJpbmc7XHJcbiAgICBTZXNzaW9uOiBTZXNzaW9uO1xyXG4gICAgTWVkaWE6IE1lZGlhO1xyXG4gICAgVXNlcjogTXlVc2VyO1xyXG4gICAgQ2hhdE1lc3NhZ2U6IHN0cmluZztcclxufSIsIu+7v2ltcG9ydCB7IE1lZGlhIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRnJhbWVCdWlsZGVyIHtcclxuXHJcbiAgICBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyKGNvbG9yOiBzdHJpbmcsIHVzZXJJZDogbnVtYmVyLCB1c2VyTmFtZTogc3RyaW5nLCB0aGlzSXNNZTogYm9vbGVhbikgOiBzdHJpbmcge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgdmFyIG1lSHRtbCA9IHRoaXNJc01lID8gJ29uY2xpY2s9XCJyZXF1ZXN0U3luY1dpdGhVc2VyKCcgKyB1c2VySWQgKyAnKVwiICcgOiBcIlwiO1xyXG4gICAgICAgIHZhciBzeW5jSFRNTCA9IHRoaXNJc01lID8gJ3lvdScgOiAnc3luYyc7XHJcbiAgICAgICAgdmFyIHN5bmNIVE1MTW9iaWxlID0gdGhpc0lzTWUgPyAneW91JyA6ICdzeW5jIHdpdGggJyArIHVzZXJOYW1lO1xyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPSAnPGRpdiAnICsgbWVIdG1sICsgJ2NsYXNzPVwiZGl2X3VzZXJcIiBzdHlsZT1cImJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+ICcgKyBzeW5jSFRNTE1vYmlsZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgJyArIG1lSHRtbCArICdzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBmbG9hdDogbGVmdDsgY3Vyc29yOiBwb2ludGVyOyBtYXJnaW4tcmlnaHQ6IDE2cHg7IGhlaWdodDogNDhweDsgd2lkdGg6IDQ4cHg7IGJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+JyArIHN5bmNIVE1MICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDsgZmxvYXQ6IHJpZ2h0O1wiPicgKyB1c2VyTmFtZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRIVE1MO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtZWRpYShtZWRpYTogTWVkaWEsIHBvc2l0aW9uOiBudW1iZXIsIHJlY29tbWVuZGVkQnlNZTogYm9vbGVhbiwgb25UaGlzOiBib29sZWFuKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICB2YXIgY2FuRGVsZXRlVGhpcyA9IHJlY29tbWVuZGVkQnlNZSAmJiAhb25UaGlzO1xyXG4gICAgICAgIHZhciBkZWxldGVUaGlzSFRNTCA9IGNhbkRlbGV0ZVRoaXMgPyAndGl0bGU9XCJDbGljayB0byBkZWxldGUgdGhpcyBmcm9tIHRoZSBxdWV1ZSFcIiBvbmNsaWNrPVwiZGVsZXRlTWVkaWEoJyArIG1lZGlhLklkICsgJywgJyArIHBvc2l0aW9uICsgJylcIiAnIDogXCJcIjtcclxuICAgICAgICB2YXIgY2FuRGVsZXRlU3R5bGUgPSBjYW5EZWxldGVUaGlzID8gXCJjdXJzb3I6IHBvaW50ZXI7IFwiIDogXCJcIjtcclxuICAgICAgICB2YXIgb25UaGlzU3R5bGUgPSBvblRoaXMgPyBcImJvcmRlcjogMXB4IHNvbGlkIGJsdWU7IFwiIDogXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBhZGQgZGVsZXRlIFVJXHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gJzxpbWcgc3R5bGU9XCInICsgb25UaGlzU3R5bGUgKyAnZmxvYXQ6IGxlZnQ7IHdpZHRoOiAzMy4zMyU7IGhlaWdodDogMjB2dztcIiBzcmM9XCInICArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgJyArIGRlbGV0ZVRoaXNIVE1MICsgJ3N0eWxlPVwiJyArIGNhbkRlbGV0ZVN0eWxlICsgb25UaGlzU3R5bGUgKyAndGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGltZyBzdHlsZT1cImhlaWdodDogOTBweDsgd2lkdGg6IDE2MHB4OyBtYXJnaW4tcmlnaHQ6IDE2cHg7XCIgc3JjPVwiJyArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7XCI+JyArIG1lZGlhLlZpZGVvVGl0bGUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxufSIsIu+7v2RlY2xhcmUgdmFyIFlUOiBhbnk7XHJcblxyXG5pbXBvcnQgeyBNZWRpYSwgU2Vzc2lvbiwgVXNlclN0YXRlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcclxuXHJcbiAgICBwcml2YXRlIHl0UGxheWVyOiBhbnk7XHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgcGxheWVyUmVhZHk6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMucGxheWVyUmVhZHkgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0aWFsaXplWXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSkge1xyXG5cclxuICAgICAgICB0aGlzLnl0UGxheWVyID0gbmV3IFlULlBsYXllcignZGl2X3l0X3BsYXllcicsIHtcclxuICAgICAgICAgICAgaGVpZ2h0OiAnYXV0bycsXHJcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgIHBsYXllclZhcnM6IHtcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xzOiAxLFxyXG4gICAgICAgICAgICAgICAgc2hvd2luZm86IDAsXHJcbiAgICAgICAgICAgICAgICBhdXRvcGxheTogMFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBldmVudHM6IHtcclxuICAgICAgICAgICAgICAgICdvblJlYWR5JyA6IHRoaXMub25QbGF5ZXJSZWFkeSxcclxuICAgICAgICAgICAgICAgICdvblN0YXRlQ2hhbmdlJzogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRpdl9wbGF5ZXIgPSAkKFwiI2Rpdl95dF9wbGF5ZXJcIik7XHJcbiAgICAgICAgICAgIGRpdl9wbGF5ZXIuaGVpZ2h0KGRpdl9wbGF5ZXIud2lkdGgoKSAqIDkuMCAvIDE2LjApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25QbGF5ZXJSZWFkeSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnBsYXllclJlYWR5ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0UGxheWVyQ29udGVudChtZWRpYTogTWVkaWEsIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgIGlmICghdGhpcy5wbGF5ZXJSZWFkeSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygncGxheWVyIG5vdCByZWFkeSEnKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuc2V0UGxheWVyQ29udGVudChtZWRpYSwgdGltZSkgfSwgNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVQbGF5ZXJVSShtZWRpYSwgdGltZSk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGxheSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBsYXlWaWRlbygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYXVzZSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBhdXNlVmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFRpbWUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDdXJyZW50U3RhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLnl0UGxheWVyLmdldFBsYXllclN0YXRlKCkpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVBsYXllclVJKG1lZGlhOiBNZWRpYSwgdGltZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5sb2FkVmlkZW9CeUlkKG1lZGlhLllUVmlkZW9JRCwgdGltZSwgXCJsYXJnZVwiKTtcdFxyXG4gICAgICAgICQoXCIjcF9jY19zdW1tYXJ5XCIpLnRleHQobWVkaWEuVmlkZW9UaXRsZSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGh0bWwgPVxyXG4gICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGltZyBzdHlsZT1cImhlaWdodDogOTBweDsgd2lkdGg6IDE2MHB4OyBtYXJnaW4tcmlnaHQ6IDE2cHg7XCIgc3JjPVwiJyArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDtcIj4nICsgbWVkaWEuVmlkZW9UaXRsZSArICc8YnI+JyArICdSZWNvbW1lbmRlZCBieTogJyArIG1lZGlhLlVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikuaHRtbChodG1sKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59Iiwi77u/Ly8gVGhpcyBpcyBhbGwgcHJldHR5IGJhZCBjb2RlLiBTaG91bGQgYmUgdGhvcm91Z2hseSByZW9yZ2FuaXplZC5cclxuXHJcbi8vIFRPRE86IGZpbmQgYSBiZXR0ZXIgd2F5IHRvIGV4cG9zZSB0aGVzZSBmdW5jdGlvbnMgdG8gaHRtbD9cclxuKDxhbnk+d2luZG93KS5vbllvdVR1YmVJZnJhbWVBUElSZWFkeSA9IG9uWW91VHViZUlmcmFtZUFQSVJlYWR5O1xyXG4oPGFueT53aW5kb3cpLnl0QXBpUmVhZHkgPSB5dEFwaVJlYWR5O1xyXG4oPGFueT53aW5kb3cpLnF1ZXVlU2VsZWN0ZWRWaWRlbyA9IHF1ZXVlU2VsZWN0ZWRWaWRlbztcclxuKDxhbnk+d2luZG93KS5yZXF1ZXN0U3luY1dpdGhVc2VyID0gcmVxdWVzdFN5bmNXaXRoVXNlcjtcclxuKDxhbnk+d2luZG93KS5kZWxldGVNZWRpYSA9IGRlbGV0ZU1lZGlhO1xyXG5cclxuaW1wb3J0IHsgTXlVc2VyLCBNZWRpYSwgU2Vzc2lvbiwgVXNlclN0YXRlLCBXc01lc3NhZ2UgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuaW1wb3J0IHsgVUlDYWxsYmFja3MsIFVJIH0gZnJvbSBcIi4vVUlcIjtcclxuaW1wb3J0IHsgTXlTb2NrZXQgfSBmcm9tIFwiLi9Tb2NrZXRzXCJcclxuaW1wb3J0IHsgUGxheWVyIH0gZnJvbSBcIi4vUGxheWVyXCJcclxuXHJcbmRlY2xhcmUgdmFyIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbmRlY2xhcmUgdmFyIGdhcGk6IGFueTtcclxuXHJcbnZhciBtVXNlciA9IG5ldyBNeVVzZXIoKTtcclxudmFyIG1TZXNzaW9uID0gbmV3IFNlc3Npb24oKTtcclxudmFyIG1QbGF5ZXIgPSBuZXcgUGxheWVyKG1vYmlsZUJyb3dzZXIpO1xyXG52YXIgbVNvY2tldDogTXlTb2NrZXQ7XHJcbnZhciBtVUk6IFVJO1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIHZhciBjYWxsYmFja3MgPSBuZXcgVUlDYWxsYmFja3MoKTtcclxuICAgIGNhbGxiYWNrcy5vblNlbmRDaGF0TWVzc2FnZSA9IHNlbmRDaGF0TWVzc2FnZTtcclxuICAgIGNhbGxiYWNrcy5uYW1lQ2hhbmdlID0gc2F2ZVVzZXJOYW1lQ2hhbmdlO1xyXG4gICAgY2FsbGJhY2tzLm5leHRNZWRpYSA9IG5leHRWaWRlb0luUXVldWU7XHJcbiAgICBjYWxsYmFja3MucGF1c2VNZWRpYSA9IHBhdXNlVmlkZW87XHJcbiAgICBjYWxsYmFja3MucGxheU1lZGlhID0gcGxheVZpZGVvO1xyXG4gICAgY2FsbGJhY2tzLnByZXZpb3VzTWVkaWEgPSBwcmV2aW91c1ZpZGVvSW5RdWV1ZTtcclxuICAgIGNhbGxiYWNrcy5zZWFyY2ggPSBzZWFyY2hWaWRlb3M7XHJcblxyXG4gICAgbVVJID0gbmV3IFVJKG1vYmlsZUJyb3dzZXIsIGNhbGxiYWNrcyk7XHJcbiAgICBtU29ja2V0ID0gbmV3IE15U29ja2V0KG1NZXNzYWdlRnVuY3Rpb25zKTtcclxuXHJcbiAgICBzZXR1cEphbVNlc3Npb24oKTtcclxufSk7XHJcblxyXG5cclxuZnVuY3Rpb24gc2V0dXBKYW1TZXNzaW9uKCkge1xyXG5cdHZhciBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuXHR2YXIgZW5jb2RlZFNlc3Npb25OYW1lID0gcGF0aG5hbWUucmVwbGFjZSgnXFwvcm9vbXMvJywgJycpO1xyXG5cclxuICAgIG1TZXNzaW9uLk5hbWUgPSBkZWNvZGVVUkkoZW5jb2RlZFNlc3Npb25OYW1lKTtcclxuICAgIG1Vc2VyLk5hbWUgPSAnQW5vbnltb3VzJztcclxuXHJcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1VzZXJKb2luU2Vzc2lvbic7XHJcbiAgICBtZXNzYWdlLlVzZXIgPSBtVXNlcjtcclxuICAgIG1lc3NhZ2UuU2Vzc2lvbiA9IG1TZXNzaW9uO1xyXG5cclxuXHRtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZ1bmN0aW9ucyBhdXRvbWF0aWNhbGx5IGNhbGxlZCB3aGVuIHlvdXR1YmUgYXBpJ3MgYXJlIHJlYWR5XHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbmZ1bmN0aW9uIG9uWW91VHViZUlmcmFtZUFQSVJlYWR5KCkge1xyXG4gICAgbVBsYXllci5pbml0aWFsaXplWXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHl0QXBpUmVhZHkoKSB7XHJcblx0Z2FwaS5jbGllbnQuc2V0QXBpS2V5KFwiQUl6YVN5QzRBLWRzR2staGFfYi1lRHBieGFWUXQ1YlI3Y09VZGRjXCIpO1xyXG5cdGdhcGkuY2xpZW50LmxvYWQoXCJ5b3V0dWJlXCIsIFwidjNcIiwgZnVuY3Rpb24oKSB7fSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUGxheWVyU3RhdGVDaGFuZ2UoZXZlbnQpIHtcclxuICAgIGlmKGV2ZW50LmRhdGE9PTApIHtcclxuICAgIFx0bmV4dFZpZGVvSW5RdWV1ZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBXZWJTb2NrZXQgbWVzc2FnZSByZXNwb25zZSBmdW5jdGlvbnNcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbnZhciBtTWVzc2FnZUZ1bmN0aW9ucyA9IHtcclxuICAgICd1cGRhdGVVc2VyJzogb25VcGRhdGVNZVVzZXIsXHJcbiAgICAnc2Vzc2lvblJlYWR5Jzogb25TZXNzaW9uUmVhZHksXHJcbiAgICAndXBkYXRlVXNlcnNMaXN0Jzogb25VcGRhdGVVc2Vyc0xpc3QsXHJcbiAgICAndXBkYXRlUXVldWUnOiBvblVwZGF0ZVF1ZXVlLFxyXG4gICAgJ0NoYXRNZXNzYWdlJzogb25SZWNlaXZlZENoYXRNZXNzYWdlLFxyXG4gICAgJ3JlcXVlc3RVc2VyU3RhdGUnOiBvblJlcXVlc3RNeVVzZXJTdGF0ZSxcclxuICAgICdwcm92aWRlVXNlclN0YXRlJzogb25Vc2VyU3RhdGVQcm92aWRlZFxyXG59XHJcblxyXG5mdW5jdGlvbiBvblVzZXJTdGF0ZVByb3ZpZGVkKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXJUb1N5bmNXaXRoID0gbWVzc2FnZS5Vc2VyO1xyXG5cclxuICAgIG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5RdWV1ZVBvc2l0aW9uO1xyXG4gICAgbVVzZXIuU3RhdGUuVGltZSA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlRpbWU7XHJcbiAgICBtVXNlci5TdGF0ZS5ZVFBsYXllclN0YXRlID0gdXNlclRvU3luY1dpdGguU3RhdGUuWVRQbGF5ZXJTdGF0ZTtcclxuXHJcbiAgICBtVUkudXBkYXRlUXVldWUobVNlc3Npb24uUXVldWUsIG1Vc2VyLklkLCBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuXHJcbiAgICB2YXIgY3VycmVudE1lZGlhID0gbVNlc3Npb24uUXVldWVbbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbl07XHJcblxyXG4gICAgdXNlclN0YXRlQ2hhbmdlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUmVxdWVzdE15VXNlclN0YXRlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXJEYXRhID0gbmV3IE15VXNlcigpO1xyXG4gICAgdXNlckRhdGEuSWQgPSBtZXNzYWdlLlVzZXIuSWQ7IC8vIFRPRE86IGJhZCBiYWQgYmFkXHJcbiAgICB1c2VyRGF0YS5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgIHVzZXJEYXRhLlN0YXRlLlRpbWUgPSBNYXRoLnJvdW5kKG1QbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSk7XHJcbiAgICB1c2VyRGF0YS5TdGF0ZS5ZVFBsYXllclN0YXRlID0gbVBsYXllci5nZXRDdXJyZW50U3RhdGUoKTtcclxuXHJcbiAgICB2YXIgb3V0Z29pbmdNc2cgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBvdXRnb2luZ01zZy5BY3Rpb24gPSAnUHJvdmlkZVN5bmNUb1VzZXInO1xyXG4gICAgb3V0Z29pbmdNc2cuVXNlciA9IHVzZXJEYXRhO1xyXG4gICAgbVNvY2tldC5lbWl0KG91dGdvaW5nTXNnKTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIG9uVXBkYXRlTWVVc2VyKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXIgPSBtZXNzYWdlLlVzZXI7XHJcbiAgICBtVXNlciA9IHVzZXI7XHRcclxufVxyXG5cclxuZnVuY3Rpb24gb25TZXNzaW9uUmVhZHkobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICBtU2Vzc2lvbiA9IG1lc3NhZ2UuU2Vzc2lvbjtcclxuICAgIG1Vc2VyID0gbWVzc2FnZS5Vc2VyO1xyXG5cclxuICAgIC8vIFRPRE86IGdldCByaWQgb2YgdGhpcyBidWxsc2hpdFxyXG4gICAgaWYgKG1TZXNzaW9uLlF1ZXVlLmxlbmd0aCA9PSAwKSB7XHJcblx0XHQkKFwiI3BfY3VycmVudF9jb250ZW50X2luZm9cIikudGV4dChcIlF1ZXVlIHVwIGEgc29uZyFcIik7XHJcblx0XHQkKFwiI3BfY3VycmVudF9yZWNvbW1lbmRlcl9pbmZvXCIpLnRleHQoXCJVc2UgdGhlIHNlYXJjaCBiYXIgYWJvdmUuXCIpO1xyXG5cdH1cclxuXHJcbiAgICBuZXh0VmlkZW9JblF1ZXVlKCk7XHJcbiAgICBtVUkudXBkYXRlUXVldWUobVNlc3Npb24uUXVldWUsIG1Vc2VyLklkLCBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuICAgIG1VSS51cGRhdGVVc2Vyc0xpc3QobVNlc3Npb24uVXNlcnMsIG1Vc2VyLklkKTtcclxuICAgIG1VSS5zZXNzaW9uUmVhZHkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25VcGRhdGVVc2Vyc0xpc3QobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlcnMgPSBtZXNzYWdlLlNlc3Npb24uVXNlcnM7XHJcbiAgICBtU2Vzc2lvbi5Vc2VycyA9IHVzZXJzO1xyXG4gICAgbVVJLnVwZGF0ZVVzZXJzTGlzdChtU2Vzc2lvbi5Vc2VycywgbVVzZXIuSWQpO1x0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uVXBkYXRlUXVldWUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICBtU2Vzc2lvbi5RdWV1ZSA9IG1lc3NhZ2UuU2Vzc2lvbi5RdWV1ZTtcclxuICAgIGlmIChtVXNlci5TdGF0ZS5XYWl0aW5nKSB7XHJcbiAgICAgICAgbmV4dFZpZGVvSW5RdWV1ZSgpO1xyXG4gICAgfVxyXG4gICAgbVVJLnVwZGF0ZVF1ZXVlKG1TZXNzaW9uLlF1ZXVlLCBtVXNlci5JZCwgbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUmVjZWl2ZWRDaGF0TWVzc2FnZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIHZhciBjaGF0TWVzc2FnZSA9IG1lc3NhZ2UuQ2hhdE1lc3NhZ2U7XHJcbiAgICB2YXIgdXNlck5hbWUgPSBtZXNzYWdlLlVzZXIuTmFtZTtcclxuICAgIG1VSS5vbkNoYXRNZXNzYWdlKHVzZXJOYW1lLCBjaGF0TWVzc2FnZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbmRDaGF0TWVzc2FnZShtc2c6IHN0cmluZykge1xyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdDaGF0TWVzc2FnZSc7XHJcbiAgICBtZXNzYWdlLkNoYXRNZXNzYWdlID0gbXNnO1xyXG4gICAgbWVzc2FnZS5Vc2VyID0gbVVzZXI7XHJcbiAgICBtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlYXJjaFZpZGVvcyhxdWVyeSwgY2FsbGJhY2spIHtcclxuXHR2YXIgcmVxdWVzdCA9IGdhcGkuY2xpZW50LnlvdXR1YmUuc2VhcmNoLmxpc3Qoe1xyXG4gICAgICAgIHBhcnQ6IFwic25pcHBldFwiLFxyXG4gICAgICAgIHR5cGU6IFwidmlkZW9cIixcclxuXHQgICAgcTogZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KS5yZXBsYWNlKC8lMjAvZywgXCIrXCIpLFxyXG5cdCAgICBtYXhSZXN1bHRzOiA1XHJcbiAgICB9KTtcclxuXHJcblx0cmVxdWVzdC5leGVjdXRlKGNhbGxiYWNrKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2F2ZVVzZXJOYW1lQ2hhbmdlKG5ld05hbWUpIHtcclxuICAgIG1Vc2VyLk5hbWUgPSBuZXdOYW1lO1xyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBtZXNzYWdlLlVzZXIgPSBtVXNlcjtcclxuICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1NhdmVVc2VyTmFtZUNoYW5nZSc7XHJcbiAgICBtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVzZXJTdGF0ZUNoYW5nZSgpIHtcclxuICAgIGlmIChtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID49IDAgJiYgbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA8IG1TZXNzaW9uLlF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgIG1QbGF5ZXIuc2V0UGxheWVyQ29udGVudChtU2Vzc2lvbi5RdWV1ZVttVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uXSwgbVVzZXIuU3RhdGUuVGltZSk7IFxyXG4gICAgICAgIG1Vc2VyLlN0YXRlLldhaXRpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPCAwIHx8IG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPT0gbVNlc3Npb24uUXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgLy8gVE9ETzogc2V0IHBsYXllciBjb250ZW50IHRvICd3YWl0aW5nIG9uIG5leHQgdmlkZW8nXHJcbiAgICAgICAgbVVzZXIuU3RhdGUuV2FpdGluZyA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID09IG1TZXNzaW9uLlF1ZXVlLmxlbmd0aCkge1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBuZXh0VmlkZW9JblF1ZXVlKCkge1xyXG4gICAgbVVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICB2YXIgcXVldWUgPSBtU2Vzc2lvbi5RdWV1ZTtcclxuXHJcblx0aWYobVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiArIDEgPCBxdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgICBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiArIDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID49IDApIHtcclxuICAgICAgICBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gcXVldWUubGVuZ3RoO1xyXG5cdH1cclxuXHJcbiAgICB1c2VyU3RhdGVDaGFuZ2UoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGF1c2VWaWRlbygpIHtcclxuICAgIG1QbGF5ZXIucGF1c2UoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGxheVZpZGVvKCkge1xyXG4gICAgbVBsYXllci5wbGF5KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHByZXZpb3VzVmlkZW9JblF1ZXVlKCkge1xyXG4gICAgbVVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICB2YXIgcXVldWUgPSBtU2Vzc2lvbi5RdWV1ZTtcclxuXHRpZihtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID4gMCkge1xyXG4gICAgICAgIG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIC0gMTtcclxuICAgICAgICB1c2VyU3RhdGVDaGFuZ2UoKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBUaGVzZSBmdW5jdGlvbnMgYXJlIGNhbGxlZCBkaXJlY3RseSBlbWJlZGRlZCBpbnRvIHRoZSBodG1sLi4uIGtpbmRhIHdlaXJkXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5mdW5jdGlvbiByZXF1ZXN0U3luY1dpdGhVc2VyKHVzZXJJZCkge1xyXG4gICAgY29uc29sZS5sb2coJ3JlcXVlc3Qgc3luYyB3aXRoIHVzZXInKTtcclxuXHJcbiAgICB2YXIgdXNlciA9IG5ldyBNeVVzZXIoKTtcclxuICAgIHVzZXIuSWQgPSB1c2VySWQ7XHJcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1JlcXVlc3RTeW5jV2l0aFVzZXInO1xyXG4gICAgbWVzc2FnZS5Vc2VyID0gdXNlcjtcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcXVldWVTZWxlY3RlZFZpZGVvKGVsbW50KSB7XHJcblxyXG5cdCQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpLmZhZGVPdXQoKTtcclxuXHQkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoXCJcIik7XHJcblx0dmFyIFZpZGVvSWQgPSBlbG1udC5nZXRBdHRyaWJ1dGUoJ2RhdGEtVmlkZW9JZCcpO1xyXG5cdHZhciBUaXRsZSA9IGVsbW50LmlubmVyVGV4dCB8fCBlbG1udC50ZXh0Q29udGVudDtcclxuXHR2YXIgVGh1bWJVUkwgPSBlbG1udC5nZXRBdHRyaWJ1dGUoJ2RhdGEtVGh1bWJVUkwnKTtcclxuXHJcbiAgICB2YXIgbWVkaWEgPSBuZXcgTWVkaWEoKTtcclxuICAgIG1lZGlhLllUVmlkZW9JRCA9IFZpZGVvSWQ7XHJcbiAgICBtZWRpYS5WaWRlb1RpdGxlID0gVGl0bGU7XHJcbiAgICBtZWRpYS5UaHVtYlVSTCA9IFRodW1iVVJMO1xyXG4gICAgbWVkaWEuVXNlcklkID0gbVVzZXIuSWQ7XHJcbiAgICBtZWRpYS5Vc2VyTmFtZSA9IG1Vc2VyLk5hbWU7XHJcblxyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdBZGRNZWRpYVRvU2Vzc2lvbic7XHJcbiAgICBtZXNzYWdlLk1lZGlhID0gbWVkaWE7XHJcblxyXG4gICAgLy9UT0RPOiBsb2NhbCBhZGQgbWVkaWFcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZGVsZXRlTWVkaWEobWVkaWFJZDogbnVtYmVyLCBwb3NpdGlvbjogbnVtYmVyKSB7XHJcblxyXG4gICAgbVNlc3Npb24uUXVldWUuc3BsaWNlKHBvc2l0aW9uLCAxKTtcclxuICAgIGlmIChtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID49IHBvc2l0aW9uKSB7XHJcbiAgICAgICAgbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiAtPSAxO1xyXG4gICAgICAgIHVzZXJTdGF0ZUNoYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgbVVJLnVwZGF0ZVF1ZXVlKG1TZXNzaW9uLlF1ZXVlLCBtVXNlci5JZCwgbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcblxyXG4gICAgdmFyIG1lZGlhVG9EZWxldGUgPSBuZXcgTWVkaWEoKTtcclxuICAgIG1lZGlhVG9EZWxldGUuSWQgPSBtZWRpYUlkO1xyXG5cclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnRGVsZXRlTWVkaWFGcm9tU2Vzc2lvbic7XHJcbiAgICBtZXNzYWdlLk1lZGlhID0gbWVkaWFUb0RlbGV0ZTtcclxuXHJcbiAgICBtU29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbn1cclxuIiwi77u/aW1wb3J0IHsgV3NNZXNzYWdlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTXlTb2NrZXQge1xyXG5cclxuICAgIHByaXZhdGUgc29ja2V0OiBXZWJTb2NrZXQ7XHJcbiAgICBwcml2YXRlIHJlc3BvbnNlX2Z1bmN0aW9uczogeyBbYWN0aW9uOiBzdHJpbmddOiAoZGF0YTogYW55KSA9PiB2b2lkIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IocmVzcG9uc2VfZnVuY3Rpb25zOiB7IFthY3Rpb246IHN0cmluZ106IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQgfSkge1xyXG4gICAgICAgIHRoaXMucmVzcG9uc2VfZnVuY3Rpb25zID0gcmVzcG9uc2VfZnVuY3Rpb25zO1xyXG4gICAgICAgIHZhciB1cmkgPSBcIndzOi8vXCIgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArIFwiL3dzXCI7XHJcbiAgICAgICAgdmFyIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQodXJpKTtcclxuICAgICAgICBzb2NrZXQub25vcGVuID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuICAgICAgICBzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uIChldmVudCkge307XHJcbiAgICAgICAgc29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XHJcbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBtZXNzYWdlLkFjdGlvbjtcclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlZnVuYyA9IHJlc3BvbnNlX2Z1bmN0aW9uc1thY3Rpb25dO1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBleGNlcHRpb24gd2hlbiBub3QgZm91bmRcclxuICAgICAgICAgICAgcmVzcG9uc2VmdW5jKG1lc3NhZ2UpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBlbWl0KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSB0aGlzLnNvY2tldC5DT05ORUNUSU5HKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xyXG4gICAgfTtcclxuXHJcbn1cclxuIiwi77u/aW1wb3J0IHsgRnJhbWVCdWlsZGVyIH0gZnJvbSBcIi4vRnJhbWVCdWlsZGVyXCI7XHJcbmltcG9ydCB7IE1lZGlhIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5kZWNsYXJlIHZhciBTcGlubmVyOiBhbnk7XHJcblxyXG5leHBvcnQgY2xhc3MgVUlDYWxsYmFja3Mge1xyXG4gICAgcHJldmlvdXNNZWRpYTogYW55O1xyXG4gICAgbmV4dE1lZGlhOiBhbnk7XHJcbiAgICBwbGF5TWVkaWE6IGFueTtcclxuICAgIHBhdXNlTWVkaWE6IGFueTtcclxuICAgIG9uU2VuZENoYXRNZXNzYWdlOiBhbnk7XHJcbiAgICBzZWFyY2g6IGFueTtcclxuICAgIG5hbWVDaGFuZ2U6IGFueTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFVJIHtcclxuXHJcbiAgICBwcml2YXRlIGNvbG9yczogYW55O1xyXG4gICAgcHJpdmF0ZSBzcGlubmVyOiBhbnk7XHJcbiAgICBwcml2YXRlIGNhbGxiYWNrczogVUlDYWxsYmFja3M7XHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGZyYW1lQnVpbGRlcjogRnJhbWVCdWlsZGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4sIGNhbGxiYWNrczogVUlDYWxsYmFja3MpIHtcclxuICAgICAgICB0aGlzLmNvbG9ycyA9IFsncmVkJywgJ29yYW5nZScsICd5ZWxsb3cnLCAnZ3JlZW4nLCAnYmx1ZScsICd2aW9sZXQnXTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgICAgIHRoaXMuZnJhbWVCdWlsZGVyID0gbmV3IEZyYW1lQnVpbGRlcihtb2JpbGVCcm93c2VyKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IGNhbGxiYWNrcztcclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR1cFNwaW5uZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbmZvUm9sbG92ZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbnB1dFVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cFBsYXllckNvbnRyb2xCdXR0b25zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNlc3Npb25SZWFkeSgpIHtcclxuICAgICAgICAkKFwiI2Rpdl9sb2FkaW5nXCIpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xyXG4gICAgICAgICQoXCIjZGl2X2V2ZXJ5dGhpbmdcIikuYW5pbWF0ZSh7b3BhY2l0eTogMX0sICdmYXN0Jyk7XHJcbiAgICB9IFxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBTcGlubmVyVUkoKSB7XHJcbiAgICAgICAgdmFyIG9wdHMgPSB7XHJcbiAgICAgICAgICAgIGxpbmVzOiAxMyAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcclxuICAgICAgICAgICAgLCBsZW5ndGg6IDI4IC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXHJcbiAgICAgICAgICAgICwgd2lkdGg6IDE0IC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xyXG4gICAgICAgICAgICAsIHJhZGl1czogNDIgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXHJcbiAgICAgICAgICAgICwgc2NhbGU6IDEgLy8gU2NhbGVzIG92ZXJhbGwgc2l6ZSBvZiB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIGNvcm5lcnM6IDEgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcclxuICAgICAgICAgICAgLCBjb2xvcjogJyMwMDAnIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcclxuICAgICAgICAgICAgLCBvcGFjaXR5OiAwLjI1IC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXHJcbiAgICAgICAgICAgICwgcm90YXRlOiAwIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcclxuICAgICAgICAgICAgLCBkaXJlY3Rpb246IDEgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxyXG4gICAgICAgICAgICAsIHNwZWVkOiAxIC8vIFJvdW5kcyBwZXIgc2Vjb25kXHJcbiAgICAgICAgICAgICwgdHJhaWw6IDYwIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICwgZnBzOiAyMCAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKSBhcyBhIGZhbGxiYWNrIGZvciBDU1NcclxuICAgICAgICAgICAgLCB6SW5kZXg6IDJlOSAvLyBUaGUgei1pbmRleCAoZGVmYXVsdHMgdG8gMjAwMDAwMDAwMClcclxuICAgICAgICAgICAgLCBjbGFzc05hbWU6ICdzcGlubmVyJyAvLyBUaGUgQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIHRvcDogJzUwJScgLy8gVG9wIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIGxlZnQ6ICc1MCUnIC8vIExlZnQgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XHJcbiAgICAgICAgICAgICwgc2hhZG93OiBmYWxzZSAvLyBXaGV0aGVyIHRvIHJlbmRlciBhIHNoYWRvd1xyXG4gICAgICAgICAgICAsIGh3YWNjZWw6IGZhbHNlIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxyXG4gICAgICAgICAgICAsIHBvc2l0aW9uOiAnYWJzb2x1dGUnIC8vIEVsZW1lbnQgcG9zaXRpb25pbmdcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZfbG9hZGluZycpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4odGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwRmFkZVVJKG92ZXJhbGwsIHJlc3VsdHMpIHtcclxuICAgICAgICBvdmVyYWxsLm1vdXNlZW50ZXIoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVJbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWxlYXZlKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBJbmZvUm9sbG92ZXJVSSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X3VzZXJzX292ZXJhbGxcIiksICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfcXVldWVfb3ZlcmFsbFwiKSwgJChcIiNkaXZfcXVldWVfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfY2hhdF9vdmVyYWxsXCIpLCAkKFwiI2Rpdl9jaGF0X3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X2NjX292ZXJhbGxcIiksICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlYXJjaFRleHRDaGFuZ2VkKHRleHQpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGlmKHRleHQubGVuZ3RoPT0wKSB7XHJcbiAgICAgICAgICAgIGRpdlJlc3VsdHMuZmFkZU91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwSW5wdXRVSSgpIHtcclxuICAgICAgICB2YXIgaW5wdXRTZWFyY2ggPSAkKFwiI2lucHV0X3NlYXJjaFwiKTtcclxuICAgICAgICBpbnB1dFNlYXJjaC5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hFbnRlclByZXNzZWQoaW5wdXRTZWFyY2gpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGlucHV0X25hbWUgPSAkKFwiI2lucHV0X25hbWVcIik7XHJcbiAgICAgICAgaW5wdXRfbmFtZS5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyTmFtZUNoYW5nZShpbnB1dF9uYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dF9jaGF0ID0gJChcIiNpbnB1dF9jaGF0XCIpO1xyXG4gICAgICAgICAgICBpbnB1dF9jaGF0LmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uU2VuZENoYXRNZXNzYWdlKGlucHV0X2NoYXQudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0X2NoYXQudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIikuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoXCJcIik7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuYmluZChcInByb3BlcnR5Y2hhbmdlIGlucHV0IHBhc3RlXCIsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaFRleHRDaGFuZ2VkKCQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbCgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwUGxheWVyQ29udHJvbEJ1dHRvbnMoKSB7XHJcbiAgICAgICAgJChcIiNidG5fcHJldmlvdXNcIikuY2xpY2sodGhpcy5jYWxsYmFja3MucHJldmlvdXNNZWRpYSk7XHJcbiAgICAgICAgJChcIiNidG5fcGF1c2VcIikuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BsYXlcIikuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5wYXVzZU1lZGlhKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChcIiNidG5fcGxheVwiKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BsYXlcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnBsYXlNZWRpYSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoXCIjYnRuX25leHRcIikuY2xpY2sodGhpcy5jYWxsYmFja3MubmV4dE1lZGlhKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlYXJjaEVudGVyUHJlc3NlZChpbnB1dF9zZWFyY2gpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuaHRtbChcIlwiKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5zZWFyY2goaW5wdXRfc2VhcmNoLnZhbCgpLCAocmVzdWx0cykgPT4ge1xyXG4gICAgICAgICAgICAkLmVhY2gocmVzdWx0cy5pdGVtcywgKGluZGV4LCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkaXZSZXN1bHRzLmh0bWwoZGl2UmVzdWx0cy5odG1sKCkgKyBcIjxkaXYgY2xhc3M9J2Rpdl9zZWFyY2hfcmVzdWx0JyBvbkNsaWNrPSdxdWV1ZVNlbGVjdGVkVmlkZW8odGhpcyknIGRhdGEtVmlkZW9JZD0nXCIgKyBpdGVtLmlkLnZpZGVvSWQgKyBcIicgZGF0YS1UaHVtYlVSTD0nXCIraXRlbS5zbmlwcGV0LnRodW1ibmFpbHMubWVkaXVtLnVybCtcIic+XCIgKyAnPHAgY2xhc3M9XCJ0ZXh0X3NlYXJjaF9yZXN1bHRcIj4nICsgIGl0ZW0uc25pcHBldC50aXRsZSsgJzwvcD48L2Rpdj4nICk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpbnB1dF9zZWFyY2guYmx1cigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmKCFkaXZSZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgIGRpdlJlc3VsdHMuZmFkZUluKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVRdWV1ZShxdWV1ZTogTWVkaWFbXSwgdXNlcklkTWU6IG51bWJlciwgcXVldWVQb3NpdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHF1ZXVlLmxlbmd0aDtcclxuICAgICAgICB2YXIgc3VtbWFyeSA9IGxlbmd0aCArIFwiIHRoaW5ncyBpbiB0aGUgcGxheWxpc3RcIjtcclxuICAgICAgICBpZiAobGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IGxlbmd0aCArIFwiIHRoaW5nIGluIHRoZSBwbGF5bGlzdFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChsZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gXCJOb3RoaW5nIGluIHRoZSBwbGF5bGlzdC4gUXVldWUgc29tZXRoaW5nIVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiI3BfcXVldWVfc3VtbWFyeVwiKS50ZXh0KHN1bW1hcnkpO1xyXG5cclxuICAgICAgICB2YXIgcXVldWVSZXN1bHRzID0gJChcIiNkaXZfcXVldWVfcmVzdWx0c1wiKTtcclxuICAgICAgICB2YXIgaHRtbCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIG1lZGlhID0gcXVldWVbaV07XHJcbiAgICAgICAgICAgIHZhciBvblRoaXMgPSBpID09PSBxdWV1ZVBvc2l0aW9uO1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudEhUTUwgPSB0aGlzLmZyYW1lQnVpbGRlci5tZWRpYShtZWRpYSwgaSwgbWVkaWEuVXNlcklkID09PSB1c2VySWRNZSwgb25UaGlzKTtcclxuICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHF1ZXVlUmVzdWx0cy5odG1sKGh0bWwuam9pbihcIlwiKSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVVc2Vyc0xpc3QodXNlcnMsIHVzZXJJZE1lOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbnVtID0gdXNlcnMubGVuZ3RoO1xyXG4gICAgICAgIHZhciBzdW1tYXJ5ID0gdXNlcnMubGVuZ3RoICsgXCIgdXNlcnMgaW4gdGhlIHJvb21cIjtcclxuICAgICAgICBpZiAobnVtID09IDEpIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IHVzZXJzLmxlbmd0aCArIFwiIHVzZXIgaW4gdGhlIHJvb21cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJChcIiNwX3VzZXJzX3N1bW1hcnlcIikudGV4dChzdW1tYXJ5KTtcclxuICAgICAgICB2YXIgdXNlclJlc3VsdHMgPSAkKFwiI2Rpdl91c2VyX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgdmFyIGh0bWwgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHVzZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB1c2VyID0gdXNlcnNbaV07XHJcbiAgICAgICAgICAgIHZhciB0aGlzSXNNZSA9ICh1c2VyLklkID09PSB1c2VySWRNZSk7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50SFRNTCA9IHRoaXMuZnJhbWVCdWlsZGVyLnVzZXIodGhpcy5jb2xvcnNbaSAlIHRoaXMuY29sb3JzLmxlbmd0aF0sIHVzZXIuSWQsIHVzZXIuTmFtZSwgdGhpc0lzTWUpO1xyXG4gICAgICAgICAgICBodG1sLnB1c2goY3VycmVudEhUTUwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB1c2VyUmVzdWx0cy5odG1sKGh0bWwuam9pbihcIlwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZXJOYW1lQ2hhbmdlKG5hbWVfaW5wdXQpIHtcclxuICAgICAgICBuYW1lX2lucHV0LmhpZGUoKTtcclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5mYWRlSW4oKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5uYW1lQ2hhbmdlKG5hbWVfaW5wdXQudmFsKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkNoYXRNZXNzYWdlKHVzZXJOYW1lOiBzdHJpbmcsIG1zZzogc3RyaW5nKSB7XHJcbiAgICAgICAgLy9UT0RPOiBjb2xvciBzdHVmZlxyXG4gICAgICAgIHZhciBodG1sID0gJzxsaSBjbGFzcz1cImNoYXRcIj48c3BhbiBzdHlsZT1cIm1hcmdpbjogMDsgY29sb3I6ICcgKyAnYmx1ZScgKyAnO1wiPicgKyB1c2VyTmFtZSArICc6IDwvc3Bhbj48c3Bhbj4nICsgbXNnICsgJzwvc3Bhbj48L2xpPic7XHJcbiAgICAgICAgJChcIiN1bF9jaGF0XCIpLmFwcGVuZChodG1sKTtcclxuICAgIH1cclxufSJdfQ==
