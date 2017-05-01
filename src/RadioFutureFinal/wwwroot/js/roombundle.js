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
        var canDeleteThis = recommendedByMe; //&& !onThis;
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
    function Player(mobileBrowser, podcasts) {
        var _this = this;
        this.onPlayerReady = function () {
            _this.playerReady = true;
        };
        this.playerReady = false;
        this.mobileBrowser = mobileBrowser;
        this.podcasts = podcasts;
    }
    Player.prototype.initPlayer = function (onPlayerStateChange) {
        var _this = this;
        if (!this.podcasts) {
            $("#div_yt_player").show();
            $("#div_podcast_player").hide();
            if (YT && YT.Player) {
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
            }
            else {
                setTimeout(function () { _this.initPlayer(onPlayerStateChange); }, 50);
            }
        }
        else {
            $("#div_yt_player").hide();
            $("#div_podcast_player").show();
        }
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
// declare var playerType: string;
var playerType = "podcasts";
var mUser = new Contracts_1.MyUser();
var mSession = new Contracts_1.Session();
var mPlayer;
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
    var podcasts = false;
    if (playerType == "podcasts") {
        podcasts = true;
    }
    mPlayer = new Player_1.Player(mobileBrowser, podcasts);
    mUI = new UI_1.UI(mobileBrowser, podcasts, callbacks);
    mSocket = new Sockets_1.MySocket(mMessageFunctions);
    setupJamSession();
    mPlayer.initPlayer(onPlayerStateChange);
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
    // mPlayer.initPlayer(onPlayerStateChange);
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
    function UI(mobileBrowser, podcasts, callbacks) {
        var _this = this;
        this.sessionReady = function () {
            if (_this.podcasts) {
                $("#div_yt_player").hide();
                $("#div_podcast_player").show();
            }
            else {
                $("#div_yt_player").show();
                $("#div_podcast_player").hide();
            }
            $("#div_loading").hide();
            _this.spinner.stop();
            $("#div_everything").animate({ opacity: 1 }, 'fast');
        };
        this.podcasts = podcasts;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9GcmFtZUJ1aWxkZXIudHMiLCJUeXBlU2NyaXB0cy9QbGF5ZXIudHMiLCJUeXBlU2NyaXB0cy9Sb29tLnRzIiwiVHlwZVNjcmlwdHMvU29ja2V0cy50cyIsIlR5cGVTY3JpcHRzL1VJLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQztJQUFBO0lBT0QsQ0FBQztJQUFELFlBQUM7QUFBRCxDQVBDLEFBT0EsSUFBQTtBQVBhLHNCQUFLO0FBU25CO0lBRUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUtMLGFBQUM7QUFBRCxDQVRBLEFBU0MsSUFBQTtBQVRZLHdCQUFNO0FBV25CO0lBRUk7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDekIsQ0FBQztJQU1MLGdCQUFDO0FBQUQsQ0FiQSxBQWFDLElBQUE7QUFiWSw4QkFBUztBQWV0QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDeEN0QjtJQUlJLHNCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSwyQkFBSSxHQUFYLFVBQVksS0FBYSxFQUFFLE1BQWMsRUFBRSxRQUFnQixFQUFFLFFBQWlCO1FBQzFFLElBQUksV0FBVyxHQUFH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LCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwi77u/ZXhwb3J0IGNsYXNzIE1lZGlhIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBVc2VySWQ6IG51bWJlcjtcclxuICAgIFVzZXJOYW1lOiBzdHJpbmc7XHJcbiAgICBZVFZpZGVvSUQ6IG51bWJlcjtcclxuICAgIFZpZGVvVGl0bGU6IHN0cmluZztcclxuICAgIFRodW1iVVJMOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNeVVzZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuU3RhdGUgPSBuZXcgVXNlclN0YXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIFN0YXRlOiBVc2VyU3RhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVc2VyU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuVGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5RdWV1ZVBvc2l0aW9uID0gLTE7XHJcbiAgICAgICAgdGhpcy5ZVFBsYXllclN0YXRlID0gMDtcclxuICAgICAgICB0aGlzLldhaXRpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBUaW1lOiBudW1iZXI7XHJcbiAgICBRdWV1ZVBvc2l0aW9uOiBudW1iZXI7XHJcbiAgICBZVFBsYXllclN0YXRlOiBudW1iZXI7XHJcbiAgICBXYWl0aW5nOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2Vzc2lvbiB7XHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgTmFtZTogc3RyaW5nO1xyXG4gICAgVXNlcnM6IE15VXNlcltdO1xyXG4gICAgUXVldWU6IE1lZGlhW107XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXc01lc3NhZ2Uge1xyXG4gICAgQWN0aW9uOiBzdHJpbmc7XHJcbiAgICBTZXNzaW9uOiBTZXNzaW9uO1xyXG4gICAgTWVkaWE6IE1lZGlhO1xyXG4gICAgVXNlcjogTXlVc2VyO1xyXG4gICAgQ2hhdE1lc3NhZ2U6IHN0cmluZztcclxufSIsIu+7v2ltcG9ydCB7IE1lZGlhIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRnJhbWVCdWlsZGVyIHtcclxuXHJcbiAgICBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyKGNvbG9yOiBzdHJpbmcsIHVzZXJJZDogbnVtYmVyLCB1c2VyTmFtZTogc3RyaW5nLCB0aGlzSXNNZTogYm9vbGVhbikgOiBzdHJpbmcge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgdmFyIG1lSHRtbCA9IHRoaXNJc01lID8gJ29uY2xpY2s9XCJyZXF1ZXN0U3luY1dpdGhVc2VyKCcgKyB1c2VySWQgKyAnKVwiICcgOiBcIlwiO1xyXG4gICAgICAgIHZhciBzeW5jSFRNTCA9IHRoaXNJc01lID8gJ3lvdScgOiAnc3luYyc7XHJcbiAgICAgICAgdmFyIHN5bmNIVE1MTW9iaWxlID0gdGhpc0lzTWUgPyAneW91JyA6ICdzeW5jIHdpdGggJyArIHVzZXJOYW1lO1xyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPSAnPGRpdiAnICsgbWVIdG1sICsgJ2NsYXNzPVwiZGl2X3VzZXJcIiBzdHlsZT1cImJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+ICcgKyBzeW5jSFRNTE1vYmlsZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgJyArIG1lSHRtbCArICdzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBmbG9hdDogbGVmdDsgY3Vyc29yOiBwb2ludGVyOyBtYXJnaW4tcmlnaHQ6IDE2cHg7IGhlaWdodDogNDhweDsgd2lkdGg6IDQ4cHg7IGJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+JyArIHN5bmNIVE1MICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDsgZmxvYXQ6IHJpZ2h0O1wiPicgKyB1c2VyTmFtZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRIVE1MO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtZWRpYShtZWRpYTogTWVkaWEsIHBvc2l0aW9uOiBudW1iZXIsIHJlY29tbWVuZGVkQnlNZTogYm9vbGVhbiwgb25UaGlzOiBib29sZWFuKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICB2YXIgY2FuRGVsZXRlVGhpcyA9IHJlY29tbWVuZGVkQnlNZTsgLy8mJiAhb25UaGlzO1xyXG4gICAgICAgIHZhciBkZWxldGVUaGlzSFRNTCA9IGNhbkRlbGV0ZVRoaXMgPyAndGl0bGU9XCJDbGljayB0byBkZWxldGUgdGhpcyBmcm9tIHRoZSBxdWV1ZSFcIiBvbmNsaWNrPVwiZGVsZXRlTWVkaWEoJyArIG1lZGlhLklkICsgJywgJyArIHBvc2l0aW9uICsgJylcIiAnIDogXCJcIjtcclxuICAgICAgICB2YXIgY2FuRGVsZXRlU3R5bGUgPSBjYW5EZWxldGVUaGlzID8gXCJjdXJzb3I6IHBvaW50ZXI7IFwiIDogXCJcIjtcclxuICAgICAgICB2YXIgb25UaGlzU3R5bGUgPSBvblRoaXMgPyBcImJvcmRlcjogMXB4IHNvbGlkIGJsdWU7IFwiIDogXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBhZGQgZGVsZXRlIFVJXHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gJzxpbWcgc3R5bGU9XCInICsgb25UaGlzU3R5bGUgKyAnZmxvYXQ6IGxlZnQ7IHdpZHRoOiAzMy4zMyU7IGhlaWdodDogMjB2dztcIiBzcmM9XCInICArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgJyArIGRlbGV0ZVRoaXNIVE1MICsgJ3N0eWxlPVwiJyArIGNhbkRlbGV0ZVN0eWxlICsgb25UaGlzU3R5bGUgKyAndGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGltZyBzdHlsZT1cImhlaWdodDogOTBweDsgd2lkdGg6IDE2MHB4OyBtYXJnaW4tcmlnaHQ6IDE2cHg7XCIgc3JjPVwiJyArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7XCI+JyArIG1lZGlhLlZpZGVvVGl0bGUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxufSIsIu+7v2RlY2xhcmUgdmFyIFlUOiBhbnk7XHJcblxyXG5pbXBvcnQgeyBNZWRpYSwgU2Vzc2lvbiwgVXNlclN0YXRlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcclxuXHJcbiAgICBwcml2YXRlIHl0UGxheWVyOiBhbnk7XHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIHBvZGNhc3RzOiBib29sZWFuO1xyXG4gICAgcHVibGljIHBsYXllclJlYWR5OiBib29sZWFuO1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuLCBwb2RjYXN0czogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMucGxheWVyUmVhZHkgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgICAgIHRoaXMucG9kY2FzdHMgPSBwb2RjYXN0cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKSB7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5wb2RjYXN0cykge1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl95dF9wbGF5ZXJcIikuc2hvdygpO1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl9wb2RjYXN0X3BsYXllclwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIGlmIChZVCAmJiBZVC5QbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCdkaXZfeXRfcGxheWVyJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJ2F1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyVmFyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sczogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd2luZm86IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9wbGF5OiAwXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBldmVudHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ29uUmVhZHknIDogdGhpcy5vblBsYXllclJlYWR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnb25TdGF0ZUNoYW5nZSc6IG9uUGxheWVyU3RhdGVDaGFuZ2VcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLmluaXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSkgfSwgNTApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl95dF9wbGF5ZXJcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl9wb2RjYXN0X3BsYXllclwiKS5zaG93KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBkaXZfcGxheWVyID0gJChcIiNkaXZfeXRfcGxheWVyXCIpO1xyXG4gICAgICAgICAgICBkaXZfcGxheWVyLmhlaWdodChkaXZfcGxheWVyLndpZHRoKCkgKiA5LjAgLyAxNi4wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uUGxheWVyUmVhZHkgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBsYXllckNvbnRlbnQobWVkaWE6IE1lZGlhLCB0aW1lOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMucGxheWVyUmVhZHkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3BsYXllciBub3QgcmVhZHkhJyk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnNldFBsYXllckNvbnRlbnQobWVkaWEsIHRpbWUpIH0sIDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUGxheWVyVUkobWVkaWEsIHRpbWUpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wbGF5VmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGF1c2UoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wYXVzZVZpZGVvKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFN0YXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVQbGF5ZXJVSShtZWRpYTogTWVkaWEsIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueXRQbGF5ZXIubG9hZFZpZGVvQnlJZChtZWRpYS5ZVFZpZGVvSUQsIHRpbWUsIFwibGFyZ2VcIik7XHRcclxuICAgICAgICAkKFwiI3BfY2Nfc3VtbWFyeVwiKS50ZXh0KG1lZGlhLlZpZGVvVGl0bGUpO1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBodG1sID1cclxuICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpbWcgc3R5bGU9XCJoZWlnaHQ6IDkwcHg7IHdpZHRoOiAxNjBweDsgbWFyZ2luLXJpZ2h0OiAxNnB4O1wiIHNyYz1cIicgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7XCI+JyArIG1lZGlhLlZpZGVvVGl0bGUgKyAnPGJyPicgKyAnUmVjb21tZW5kZWQgYnk6ICcgKyBtZWRpYS5Vc2VyTmFtZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl9jY19yZXN1bHRzXCIpLmh0bWwoaHRtbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSIsIu+7vy8vIFRoaXMgaXMgYWxsIHByZXR0eSBiYWQgY29kZS4gU2hvdWxkIGJlIHRob3JvdWdobHkgcmVvcmdhbml6ZWQuXHJcblxyXG4vLyBUT0RPOiBmaW5kIGEgYmV0dGVyIHdheSB0byBleHBvc2UgdGhlc2UgZnVuY3Rpb25zIHRvIGh0bWw/XHJcbig8YW55PndpbmRvdykub25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkgPSBvbllvdVR1YmVJZnJhbWVBUElSZWFkeTtcclxuKDxhbnk+d2luZG93KS55dEFwaVJlYWR5ID0geXRBcGlSZWFkeTtcclxuKDxhbnk+d2luZG93KS5xdWV1ZVNlbGVjdGVkVmlkZW8gPSBxdWV1ZVNlbGVjdGVkVmlkZW87XHJcbig8YW55PndpbmRvdykucmVxdWVzdFN5bmNXaXRoVXNlciA9IHJlcXVlc3RTeW5jV2l0aFVzZXI7XHJcbig8YW55PndpbmRvdykuZGVsZXRlTWVkaWEgPSBkZWxldGVNZWRpYTtcclxuXHJcbmltcG9ydCB7IE15VXNlciwgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSwgV3NNZXNzYWdlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcbmltcG9ydCB7IFVJQ2FsbGJhY2tzLCBVSSB9IGZyb20gXCIuL1VJXCI7XHJcbmltcG9ydCB7IE15U29ja2V0IH0gZnJvbSBcIi4vU29ja2V0c1wiXHJcbmltcG9ydCB7IFBsYXllciB9IGZyb20gXCIuL1BsYXllclwiXHJcblxyXG5kZWNsYXJlIHZhciBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG4vLyBkZWNsYXJlIHZhciBwbGF5ZXJUeXBlOiBzdHJpbmc7XHJcbnZhciBwbGF5ZXJUeXBlID0gXCJwb2RjYXN0c1wiO1xyXG5kZWNsYXJlIHZhciBnYXBpOiBhbnk7XHJcblxyXG52YXIgbVVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbnZhciBtU2Vzc2lvbiA9IG5ldyBTZXNzaW9uKCk7XHJcbnZhciBtUGxheWVyOiBQbGF5ZXI7IFxyXG52YXIgbVNvY2tldDogTXlTb2NrZXQ7XHJcbnZhciBtVUk6IFVJO1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIHZhciBjYWxsYmFja3MgPSBuZXcgVUlDYWxsYmFja3MoKTtcclxuICAgIGNhbGxiYWNrcy5vblNlbmRDaGF0TWVzc2FnZSA9IHNlbmRDaGF0TWVzc2FnZTtcclxuICAgIGNhbGxiYWNrcy5uYW1lQ2hhbmdlID0gc2F2ZVVzZXJOYW1lQ2hhbmdlO1xyXG4gICAgY2FsbGJhY2tzLm5leHRNZWRpYSA9IG5leHRWaWRlb0luUXVldWU7XHJcbiAgICBjYWxsYmFja3MucGF1c2VNZWRpYSA9IHBhdXNlVmlkZW87XHJcbiAgICBjYWxsYmFja3MucGxheU1lZGlhID0gcGxheVZpZGVvO1xyXG4gICAgY2FsbGJhY2tzLnByZXZpb3VzTWVkaWEgPSBwcmV2aW91c1ZpZGVvSW5RdWV1ZTtcclxuICAgIGNhbGxiYWNrcy5zZWFyY2ggPSBzZWFyY2hWaWRlb3M7XHJcblxyXG4gICAgdmFyIHBvZGNhc3RzID0gZmFsc2U7XHJcbiAgICBpZiAocGxheWVyVHlwZSA9PSBcInBvZGNhc3RzXCIpIHtcclxuICAgICAgICBwb2RjYXN0cyA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgbVBsYXllciA9IG5ldyBQbGF5ZXIobW9iaWxlQnJvd3NlciwgcG9kY2FzdHMpO1xyXG4gICAgbVVJID0gbmV3IFVJKG1vYmlsZUJyb3dzZXIsIHBvZGNhc3RzLCBjYWxsYmFja3MpO1xyXG4gICAgbVNvY2tldCA9IG5ldyBNeVNvY2tldChtTWVzc2FnZUZ1bmN0aW9ucyk7XHJcblxyXG4gICAgc2V0dXBKYW1TZXNzaW9uKCk7XHJcbiAgICBtUGxheWVyLmluaXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSk7XHJcbn0pO1xyXG5cclxuXHJcbmZ1bmN0aW9uIHNldHVwSmFtU2Vzc2lvbigpIHtcclxuXHR2YXIgcGF0aG5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcblx0dmFyIGVuY29kZWRTZXNzaW9uTmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoJ1xcL3Jvb21zLycsICcnKTtcclxuXHJcbiAgICBtU2Vzc2lvbi5OYW1lID0gZGVjb2RlVVJJKGVuY29kZWRTZXNzaW9uTmFtZSk7XHJcbiAgICBtVXNlci5OYW1lID0gJ0Fub255bW91cyc7XHJcblxyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdVc2VySm9pblNlc3Npb24nO1xyXG4gICAgbWVzc2FnZS5Vc2VyID0gbVVzZXI7XHJcbiAgICBtZXNzYWdlLlNlc3Npb24gPSBtU2Vzc2lvbjtcclxuXHJcblx0bVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGdW5jdGlvbnMgYXV0b21hdGljYWxseSBjYWxsZWQgd2hlbiB5b3V0dWJlIGFwaSdzIGFyZSByZWFkeVxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5mdW5jdGlvbiBvbllvdVR1YmVJZnJhbWVBUElSZWFkeSgpIHtcclxuICAgIC8vIG1QbGF5ZXIuaW5pdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24geXRBcGlSZWFkeSgpIHtcclxuXHRnYXBpLmNsaWVudC5zZXRBcGlLZXkoXCJBSXphU3lDNEEtZHNHay1oYV9iLWVEcGJ4YVZRdDViUjdjT1VkZGNcIik7XHJcblx0Z2FwaS5jbGllbnQubG9hZChcInlvdXR1YmVcIiwgXCJ2M1wiLCBmdW5jdGlvbigpIHt9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25QbGF5ZXJTdGF0ZUNoYW5nZShldmVudCkge1xyXG4gICAgaWYoZXZlbnQuZGF0YT09MCkge1xyXG4gICAgXHRuZXh0VmlkZW9JblF1ZXVlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFdlYlNvY2tldCBtZXNzYWdlIHJlc3BvbnNlIGZ1bmN0aW9uc1xyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxudmFyIG1NZXNzYWdlRnVuY3Rpb25zID0ge1xyXG4gICAgJ3VwZGF0ZVVzZXInOiBvblVwZGF0ZU1lVXNlcixcclxuICAgICdzZXNzaW9uUmVhZHknOiBvblNlc3Npb25SZWFkeSxcclxuICAgICd1cGRhdGVVc2Vyc0xpc3QnOiBvblVwZGF0ZVVzZXJzTGlzdCxcclxuICAgICd1cGRhdGVRdWV1ZSc6IG9uVXBkYXRlUXVldWUsXHJcbiAgICAnQ2hhdE1lc3NhZ2UnOiBvblJlY2VpdmVkQ2hhdE1lc3NhZ2UsXHJcbiAgICAncmVxdWVzdFVzZXJTdGF0ZSc6IG9uUmVxdWVzdE15VXNlclN0YXRlLFxyXG4gICAgJ3Byb3ZpZGVVc2VyU3RhdGUnOiBvblVzZXJTdGF0ZVByb3ZpZGVkXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uVXNlclN0YXRlUHJvdmlkZWQobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlclRvU3luY1dpdGggPSBtZXNzYWdlLlVzZXI7XHJcblxyXG4gICAgbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICBtVXNlci5TdGF0ZS5UaW1lID0gdXNlclRvU3luY1dpdGguU3RhdGUuVGltZTtcclxuICAgIG1Vc2VyLlN0YXRlLllUUGxheWVyU3RhdGUgPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5ZVFBsYXllclN0YXRlO1xyXG5cclxuICAgIG1VSS51cGRhdGVRdWV1ZShtU2Vzc2lvbi5RdWV1ZSwgbVVzZXIuSWQsIG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG5cclxuICAgIHZhciBjdXJyZW50TWVkaWEgPSBtU2Vzc2lvbi5RdWV1ZVttVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uXTtcclxuXHJcbiAgICB1c2VyU3RhdGVDaGFuZ2UoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25SZXF1ZXN0TXlVc2VyU3RhdGUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlckRhdGEgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICB1c2VyRGF0YS5JZCA9IG1lc3NhZ2UuVXNlci5JZDsgLy8gVE9ETzogYmFkIGJhZCBiYWRcclxuICAgIHVzZXJEYXRhLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uO1xyXG4gICAgdXNlckRhdGEuU3RhdGUuVGltZSA9IE1hdGgucm91bmQobVBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIHVzZXJEYXRhLlN0YXRlLllUUGxheWVyU3RhdGUgPSBtUGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpO1xyXG5cclxuICAgIHZhciBvdXRnb2luZ01zZyA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG91dGdvaW5nTXNnLkFjdGlvbiA9ICdQcm92aWRlU3luY1RvVXNlcic7XHJcbiAgICBvdXRnb2luZ01zZy5Vc2VyID0gdXNlckRhdGE7XHJcbiAgICBtU29ja2V0LmVtaXQob3V0Z29pbmdNc2cpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gb25VcGRhdGVNZVVzZXIobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgdXNlciA9IG1lc3NhZ2UuVXNlcjtcclxuICAgIG1Vc2VyID0gdXNlcjtcdFxyXG59XHJcblxyXG5mdW5jdGlvbiBvblNlc3Npb25SZWFkeShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIG1TZXNzaW9uID0gbWVzc2FnZS5TZXNzaW9uO1xyXG4gICAgbVVzZXIgPSBtZXNzYWdlLlVzZXI7XHJcblxyXG4gICAgLy8gVE9ETzogZ2V0IHJpZCBvZiB0aGlzIGJ1bGxzaGl0XHJcbiAgICBpZiAobVNlc3Npb24uUXVldWUubGVuZ3RoID09IDApIHtcclxuXHRcdCQoXCIjcF9jdXJyZW50X2NvbnRlbnRfaW5mb1wiKS50ZXh0KFwiUXVldWUgdXAgYSBzb25nIVwiKTtcclxuXHRcdCQoXCIjcF9jdXJyZW50X3JlY29tbWVuZGVyX2luZm9cIikudGV4dChcIlVzZSB0aGUgc2VhcmNoIGJhciBhYm92ZS5cIik7XHJcblx0fVxyXG5cclxuICAgIG5leHRWaWRlb0luUXVldWUoKTtcclxuICAgIG1VSS51cGRhdGVRdWV1ZShtU2Vzc2lvbi5RdWV1ZSwgbVVzZXIuSWQsIG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG4gICAgbVVJLnVwZGF0ZVVzZXJzTGlzdChtU2Vzc2lvbi5Vc2VycywgbVVzZXIuSWQpO1xyXG4gICAgbVVJLnNlc3Npb25SZWFkeSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvblVwZGF0ZVVzZXJzTGlzdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIHZhciB1c2VycyA9IG1lc3NhZ2UuU2Vzc2lvbi5Vc2VycztcclxuICAgIG1TZXNzaW9uLlVzZXJzID0gdXNlcnM7XHJcbiAgICBtVUkudXBkYXRlVXNlcnNMaXN0KG1TZXNzaW9uLlVzZXJzLCBtVXNlci5JZCk7XHRcclxufVxyXG5cclxuZnVuY3Rpb24gb25VcGRhdGVRdWV1ZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIG1TZXNzaW9uLlF1ZXVlID0gbWVzc2FnZS5TZXNzaW9uLlF1ZXVlO1xyXG4gICAgaWYgKG1Vc2VyLlN0YXRlLldhaXRpbmcpIHtcclxuICAgICAgICBuZXh0VmlkZW9JblF1ZXVlKCk7XHJcbiAgICB9XHJcbiAgICBtVUkudXBkYXRlUXVldWUobVNlc3Npb24uUXVldWUsIG1Vc2VyLklkLCBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25SZWNlaXZlZENoYXRNZXNzYWdlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIGNoYXRNZXNzYWdlID0gbWVzc2FnZS5DaGF0TWVzc2FnZTtcclxuICAgIHZhciB1c2VyTmFtZSA9IG1lc3NhZ2UuVXNlci5OYW1lO1xyXG4gICAgbVVJLm9uQ2hhdE1lc3NhZ2UodXNlck5hbWUsIGNoYXRNZXNzYWdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VuZENoYXRNZXNzYWdlKG1zZzogc3RyaW5nKSB7XHJcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0NoYXRNZXNzYWdlJztcclxuICAgIG1lc3NhZ2UuQ2hhdE1lc3NhZ2UgPSBtc2c7XHJcbiAgICBtZXNzYWdlLlVzZXIgPSBtVXNlcjtcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VhcmNoVmlkZW9zKHF1ZXJ5LCBjYWxsYmFjaykge1xyXG5cdHZhciByZXF1ZXN0ID0gZ2FwaS5jbGllbnQueW91dHViZS5zZWFyY2gubGlzdCh7XHJcbiAgICAgICAgcGFydDogXCJzbmlwcGV0XCIsXHJcbiAgICAgICAgdHlwZTogXCJ2aWRlb1wiLFxyXG5cdCAgICBxOiBlbmNvZGVVUklDb21wb25lbnQocXVlcnkpLnJlcGxhY2UoLyUyMC9nLCBcIitcIiksXHJcblx0ICAgIG1heFJlc3VsdHM6IDVcclxuICAgIH0pO1xyXG5cclxuXHRyZXF1ZXN0LmV4ZWN1dGUoY2FsbGJhY2spO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlVXNlck5hbWVDaGFuZ2UobmV3TmFtZSkge1xyXG4gICAgbVVzZXIuTmFtZSA9IG5ld05hbWU7XHJcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG1lc3NhZ2UuVXNlciA9IG1Vc2VyO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnU2F2ZVVzZXJOYW1lQ2hhbmdlJztcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXNlclN0YXRlQ2hhbmdlKCkge1xyXG4gICAgaWYgKG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPj0gMCAmJiBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIDwgbVNlc3Npb24uUXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgbVBsYXllci5zZXRQbGF5ZXJDb250ZW50KG1TZXNzaW9uLlF1ZXVlW21Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb25dLCBtVXNlci5TdGF0ZS5UaW1lKTsgXHJcbiAgICAgICAgbVVzZXIuU3RhdGUuV2FpdGluZyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAobVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA8IDAgfHwgbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9PSBtU2Vzc2lvbi5RdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgICAvLyBUT0RPOiBzZXQgcGxheWVyIGNvbnRlbnQgdG8gJ3dhaXRpbmcgb24gbmV4dCB2aWRlbydcclxuICAgICAgICBtVXNlci5TdGF0ZS5XYWl0aW5nID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPT0gbVNlc3Npb24uUXVldWUubGVuZ3RoKSB7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5leHRWaWRlb0luUXVldWUoKSB7XHJcbiAgICBtVXNlci5TdGF0ZS5UaW1lID0gMDtcclxuICAgIHZhciBxdWV1ZSA9IG1TZXNzaW9uLlF1ZXVlO1xyXG5cclxuXHRpZihtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMSA8IHF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgIG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPj0gMCkge1xyXG4gICAgICAgIG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSBxdWV1ZS5sZW5ndGg7XHJcblx0fVxyXG5cclxuICAgIHVzZXJTdGF0ZUNoYW5nZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXVzZVZpZGVvKCkge1xyXG4gICAgbVBsYXllci5wYXVzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwbGF5VmlkZW8oKSB7XHJcbiAgICBtUGxheWVyLnBsYXkoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcHJldmlvdXNWaWRlb0luUXVldWUoKSB7XHJcbiAgICBtVXNlci5TdGF0ZS5UaW1lID0gMDtcclxuICAgIHZhciBxdWV1ZSA9IG1TZXNzaW9uLlF1ZXVlO1xyXG5cdGlmKG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPiAwKSB7XHJcbiAgICAgICAgbVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gLSAxO1xyXG4gICAgICAgIHVzZXJTdGF0ZUNoYW5nZSgpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFRoZXNlIGZ1bmN0aW9ucyBhcmUgY2FsbGVkIGRpcmVjdGx5IGVtYmVkZGVkIGludG8gdGhlIGh0bWwuLi4ga2luZGEgd2VpcmRcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmZ1bmN0aW9uIHJlcXVlc3RTeW5jV2l0aFVzZXIodXNlcklkKSB7XHJcbiAgICBjb25zb2xlLmxvZygncmVxdWVzdCBzeW5jIHdpdGggdXNlcicpO1xyXG5cclxuICAgIHZhciB1c2VyID0gbmV3IE15VXNlcigpO1xyXG4gICAgdXNlci5JZCA9IHVzZXJJZDtcclxuICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnUmVxdWVzdFN5bmNXaXRoVXNlcic7XHJcbiAgICBtZXNzYWdlLlVzZXIgPSB1c2VyO1xyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBxdWV1ZVNlbGVjdGVkVmlkZW8oZWxtbnQpIHtcclxuXHJcblx0JChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIikuZmFkZU91dCgpO1xyXG5cdCQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbChcIlwiKTtcclxuXHR2YXIgVmlkZW9JZCA9IGVsbW50LmdldEF0dHJpYnV0ZSgnZGF0YS1WaWRlb0lkJyk7XHJcblx0dmFyIFRpdGxlID0gZWxtbnQuaW5uZXJUZXh0IHx8IGVsbW50LnRleHRDb250ZW50O1xyXG5cdHZhciBUaHVtYlVSTCA9IGVsbW50LmdldEF0dHJpYnV0ZSgnZGF0YS1UaHVtYlVSTCcpO1xyXG5cclxuICAgIHZhciBtZWRpYSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgbWVkaWEuWVRWaWRlb0lEID0gVmlkZW9JZDtcclxuICAgIG1lZGlhLlZpZGVvVGl0bGUgPSBUaXRsZTtcclxuICAgIG1lZGlhLlRodW1iVVJMID0gVGh1bWJVUkw7XHJcbiAgICBtZWRpYS5Vc2VySWQgPSBtVXNlci5JZDtcclxuICAgIG1lZGlhLlVzZXJOYW1lID0gbVVzZXIuTmFtZTtcclxuXHJcbiAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0FkZE1lZGlhVG9TZXNzaW9uJztcclxuICAgIG1lc3NhZ2UuTWVkaWEgPSBtZWRpYTtcclxuXHJcbiAgICAvL1RPRE86IGxvY2FsIGFkZCBtZWRpYVxyXG4gICAgbVNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkZWxldGVNZWRpYShtZWRpYUlkOiBudW1iZXIsIHBvc2l0aW9uOiBudW1iZXIpIHtcclxuXHJcbiAgICBtU2Vzc2lvbi5RdWV1ZS5zcGxpY2UocG9zaXRpb24sIDEpO1xyXG4gICAgaWYgKG1Vc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPj0gcG9zaXRpb24pIHtcclxuICAgICAgICBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIC09IDE7XHJcbiAgICAgICAgdXNlclN0YXRlQ2hhbmdlKCk7XHJcbiAgICB9XHJcbiAgICBtVUkudXBkYXRlUXVldWUobVNlc3Npb24uUXVldWUsIG1Vc2VyLklkLCBtVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuXHJcbiAgICB2YXIgbWVkaWFUb0RlbGV0ZSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgbWVkaWFUb0RlbGV0ZS5JZCA9IG1lZGlhSWQ7XHJcblxyXG4gICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdEZWxldGVNZWRpYUZyb21TZXNzaW9uJztcclxuICAgIG1lc3NhZ2UuTWVkaWEgPSBtZWRpYVRvRGVsZXRlO1xyXG5cclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG4iLCLvu79pbXBvcnQgeyBXc01lc3NhZ2UgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBNeVNvY2tldCB7XHJcblxyXG4gICAgcHJpdmF0ZSBzb2NrZXQ6IFdlYlNvY2tldDtcclxuICAgIHByaXZhdGUgcmVzcG9uc2VfZnVuY3Rpb25zOiB7IFthY3Rpb246IHN0cmluZ106IChkYXRhOiBhbnkpID0+IHZvaWQgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZXNwb25zZV9mdW5jdGlvbnM6IHsgW2FjdGlvbjogc3RyaW5nXTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZCB9KSB7XHJcbiAgICAgICAgdGhpcy5yZXNwb25zZV9mdW5jdGlvbnMgPSByZXNwb25zZV9mdW5jdGlvbnM7XHJcbiAgICAgICAgdmFyIHVyaSA9IFwid3M6Ly9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgXCIvd3NcIjtcclxuICAgICAgICB2YXIgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmkpO1xyXG4gICAgICAgIHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG4gICAgICAgIHNvY2tldC5vbmNsb3NlID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuICAgICAgICBzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IG1lc3NhZ2UuQWN0aW9uO1xyXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2VmdW5jID0gcmVzcG9uc2VfZnVuY3Rpb25zW2FjdGlvbl07XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGV4Y2VwdGlvbiB3aGVuIG5vdCBmb3VuZFxyXG4gICAgICAgICAgICByZXNwb25zZWZ1bmMobWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge307XHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVtaXQobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IHRoaXMuc29ja2V0LkNPTk5FQ1RJTkcpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XHJcbiAgICB9O1xyXG5cclxufVxyXG4iLCLvu79pbXBvcnQgeyBGcmFtZUJ1aWxkZXIgfSBmcm9tIFwiLi9GcmFtZUJ1aWxkZXJcIjtcclxuaW1wb3J0IHsgTWVkaWEgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmRlY2xhcmUgdmFyIFNwaW5uZXI6IGFueTtcclxuXHJcbmV4cG9ydCBjbGFzcyBVSUNhbGxiYWNrcyB7XHJcbiAgICBwcmV2aW91c01lZGlhOiBhbnk7XHJcbiAgICBuZXh0TWVkaWE6IGFueTtcclxuICAgIHBsYXlNZWRpYTogYW55O1xyXG4gICAgcGF1c2VNZWRpYTogYW55O1xyXG4gICAgb25TZW5kQ2hhdE1lc3NhZ2U6IGFueTtcclxuICAgIHNlYXJjaDogYW55O1xyXG4gICAgbmFtZUNoYW5nZTogYW55O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVUkge1xyXG5cclxuICAgIHByaXZhdGUgY29sb3JzOiBhbnk7XHJcbiAgICBwcml2YXRlIHNwaW5uZXI6IGFueTtcclxuICAgIHByaXZhdGUgY2FsbGJhY2tzOiBVSUNhbGxiYWNrcztcclxuICAgIHByaXZhdGUgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgcG9kY2FzdHM6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGZyYW1lQnVpbGRlcjogRnJhbWVCdWlsZGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4sIHBvZGNhc3RzOiBib29sZWFuLCBjYWxsYmFja3M6IFVJQ2FsbGJhY2tzKSB7XHJcbiAgICAgICAgdGhpcy5wb2RjYXN0cyA9IHBvZGNhc3RzO1xyXG4gICAgICAgIHRoaXMuY29sb3JzID0gWydyZWQnLCAnb3JhbmdlJywgJ3llbGxvdycsICdncmVlbicsICdibHVlJywgJ3Zpb2xldCddO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICAgICAgdGhpcy5mcmFtZUJ1aWxkZXIgPSBuZXcgRnJhbWVCdWlsZGVyKG1vYmlsZUJyb3dzZXIpO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0gY2FsbGJhY2tzO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICB0aGlzLnNldHVwU3Bpbm5lclVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cEluZm9Sb2xsb3ZlclVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cElucHV0VUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwUGxheWVyQ29udHJvbEJ1dHRvbnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2Vzc2lvblJlYWR5ID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnBvZGNhc3RzKSB7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X3l0X3BsYXllclwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X3BvZGNhc3RfcGxheWVyXCIpLnNob3coKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X3l0X3BsYXllclwiKS5zaG93KCk7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X3BvZGNhc3RfcGxheWVyXCIpLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJChcIiNkaXZfbG9hZGluZ1wiKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zcGlubmVyLnN0b3AoKTtcclxuICAgICAgICAkKFwiI2Rpdl9ldmVyeXRoaW5nXCIpLmFuaW1hdGUoe29wYWNpdHk6IDF9LCAnZmFzdCcpO1xyXG4gICAgfSBcclxuXHJcbiAgICBwcml2YXRlIHNldHVwU3Bpbm5lclVJKCkge1xyXG4gICAgICAgIHZhciBvcHRzID0ge1xyXG4gICAgICAgICAgICBsaW5lczogMTMgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XHJcbiAgICAgICAgICAgICwgbGVuZ3RoOiAyOCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxyXG4gICAgICAgICAgICAsIHdpZHRoOiAxNCAvLyBUaGUgbGluZSB0aGlja25lc3NcclxuICAgICAgICAgICAgLCByYWRpdXM6IDQyIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxyXG4gICAgICAgICAgICAsIHNjYWxlOiAxIC8vIFNjYWxlcyBvdmVyYWxsIHNpemUgb2YgdGhlIHNwaW5uZXJcclxuICAgICAgICAgICAgLCBjb3JuZXJzOiAxIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXHJcbiAgICAgICAgICAgICwgY29sb3I6ICcjMDAwJyAvLyAjcmdiIG9yICNycmdnYmIgb3IgYXJyYXkgb2YgY29sb3JzXHJcbiAgICAgICAgICAgICwgb3BhY2l0eTogMC4yNSAvLyBPcGFjaXR5IG9mIHRoZSBsaW5lc1xyXG4gICAgICAgICAgICAsIHJvdGF0ZTogMCAvLyBUaGUgcm90YXRpb24gb2Zmc2V0XHJcbiAgICAgICAgICAgICwgZGlyZWN0aW9uOiAxIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcclxuICAgICAgICAgICAgLCBzcGVlZDogMSAvLyBSb3VuZHMgcGVyIHNlY29uZFxyXG4gICAgICAgICAgICAsIHRyYWlsOiA2MCAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxyXG4gICAgICAgICAgICAsIGZwczogMjAgLy8gRnJhbWVzIHBlciBzZWNvbmQgd2hlbiB1c2luZyBzZXRUaW1lb3V0KCkgYXMgYSBmYWxsYmFjayBmb3IgQ1NTXHJcbiAgICAgICAgICAgICwgekluZGV4OiAyZTkgLy8gVGhlIHotaW5kZXggKGRlZmF1bHRzIHRvIDIwMDAwMDAwMDApXHJcbiAgICAgICAgICAgICwgY2xhc3NOYW1lOiAnc3Bpbm5lcicgLy8gVGhlIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIHNwaW5uZXJcclxuICAgICAgICAgICAgLCB0b3A6ICc1MCUnIC8vIFRvcCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcclxuICAgICAgICAgICAgLCBsZWZ0OiAnNTAlJyAvLyBMZWZ0IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIHNoYWRvdzogZmFsc2UgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcclxuICAgICAgICAgICAgLCBod2FjY2VsOiBmYWxzZSAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb25cclxuICAgICAgICAgICAgLCBwb3NpdGlvbjogJ2Fic29sdXRlJyAvLyBFbGVtZW50IHBvc2l0aW9uaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2X2xvYWRpbmcnKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihvcHRzKS5zcGluKHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cEZhZGVVSShvdmVyYWxsLCByZXN1bHRzKSB7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWVudGVyKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mYWRlSW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG92ZXJhbGwubW91c2VsZWF2ZSgoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwSW5mb1JvbGxvdmVyVUkoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl91c2Vyc19vdmVyYWxsXCIpLCAkKFwiI2Rpdl91c2VyX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X3F1ZXVlX292ZXJhbGxcIiksICQoXCIjZGl2X3F1ZXVlX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X2NoYXRfb3ZlcmFsbFwiKSwgJChcIiNkaXZfY2hhdF9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9jY19vdmVyYWxsXCIpLCAkKFwiI2Rpdl9jY19yZXN1bHRzXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWFyY2hUZXh0Q2hhbmdlZCh0ZXh0KSB7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBpZih0ZXh0Lmxlbmd0aD09MCkge1xyXG4gICAgICAgICAgICBkaXZSZXN1bHRzLmZhZGVPdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cElucHV0VUkoKSB7XHJcbiAgICAgICAgdmFyIGlucHV0U2VhcmNoID0gJChcIiNpbnB1dF9zZWFyY2hcIik7XHJcbiAgICAgICAgaW5wdXRTZWFyY2gua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoRW50ZXJQcmVzc2VkKGlucHV0U2VhcmNoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBpbnB1dF9uYW1lID0gJChcIiNpbnB1dF9uYW1lXCIpO1xyXG4gICAgICAgIGlucHV0X25hbWUua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlck5hbWVDaGFuZ2UoaW5wdXRfbmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB2YXIgaW5wdXRfY2hhdCA9ICQoXCIjaW5wdXRfY2hhdFwiKTtcclxuICAgICAgICAgICAgaW5wdXRfY2hhdC5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5vblNlbmRDaGF0TWVzc2FnZShpbnB1dF9jaGF0LnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dF9jaGF0LnZhbChcIlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikudmFsKFwiXCIpO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmJpbmQoXCJwcm9wZXJ0eWNoYW5nZSBpbnB1dCBwYXN0ZVwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hUZXh0Q2hhbmdlZCgkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cFBsYXllckNvbnRyb2xCdXR0b25zKCkge1xyXG4gICAgICAgICQoXCIjYnRuX3ByZXZpb3VzXCIpLmNsaWNrKHRoaXMuY2FsbGJhY2tzLnByZXZpb3VzTWVkaWEpO1xyXG4gICAgICAgICQoXCIjYnRuX3BhdXNlXCIpLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgJChcIiNidG5fcGF1c2VcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wbGF5XCIpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MucGF1c2VNZWRpYSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoXCIjYnRuX3BsYXlcIikuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wbGF5XCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgJChcIiNidG5fcGF1c2VcIikuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5wbGF5TWVkaWEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiI2J0bl9uZXh0XCIpLmNsaWNrKHRoaXMuY2FsbGJhY2tzLm5leHRNZWRpYSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWFyY2hFbnRlclByZXNzZWQoaW5wdXRfc2VhcmNoKSB7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCJcIik7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3Muc2VhcmNoKGlucHV0X3NlYXJjaC52YWwoKSwgKHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgJC5lYWNoKHJlc3VsdHMuaXRlbXMsIChpbmRleCwgaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZGl2UmVzdWx0cy5odG1sKGRpdlJlc3VsdHMuaHRtbCgpICsgXCI8ZGl2IGNsYXNzPSdkaXZfc2VhcmNoX3Jlc3VsdCcgb25DbGljaz0ncXVldWVTZWxlY3RlZFZpZGVvKHRoaXMpJyBkYXRhLVZpZGVvSWQ9J1wiICsgaXRlbS5pZC52aWRlb0lkICsgXCInIGRhdGEtVGh1bWJVUkw9J1wiK2l0ZW0uc25pcHBldC50aHVtYm5haWxzLm1lZGl1bS51cmwrXCInPlwiICsgJzxwIGNsYXNzPVwidGV4dF9zZWFyY2hfcmVzdWx0XCI+JyArICBpdGVtLnNuaXBwZXQudGl0bGUrICc8L3A+PC9kaXY+JyApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaW5wdXRfc2VhcmNoLmJsdXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZighZGl2UmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICBkaXZSZXN1bHRzLmZhZGVJbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlUXVldWUocXVldWU6IE1lZGlhW10sIHVzZXJJZE1lOiBudW1iZXIsIHF1ZXVlUG9zaXRpb246IG51bWJlcikge1xyXG4gICAgICAgIHZhciBsZW5ndGggPSBxdWV1ZS5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHN1bW1hcnkgPSBsZW5ndGggKyBcIiB0aGluZ3MgaW4gdGhlIHBsYXlsaXN0XCI7XHJcbiAgICAgICAgaWYgKGxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSBsZW5ndGggKyBcIiB0aGluZyBpbiB0aGUgcGxheWxpc3RcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IFwiTm90aGluZyBpbiB0aGUgcGxheWxpc3QuIFF1ZXVlIHNvbWV0aGluZyFcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJChcIiNwX3F1ZXVlX3N1bW1hcnlcIikudGV4dChzdW1tYXJ5KTtcclxuXHJcbiAgICAgICAgdmFyIHF1ZXVlUmVzdWx0cyA9ICQoXCIjZGl2X3F1ZXVlX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgdmFyIGh0bWwgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBtZWRpYSA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgICB2YXIgb25UaGlzID0gaSA9PT0gcXVldWVQb3NpdGlvbjtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gdGhpcy5mcmFtZUJ1aWxkZXIubWVkaWEobWVkaWEsIGksIG1lZGlhLlVzZXJJZCA9PT0gdXNlcklkTWUsIG9uVGhpcyk7XHJcbiAgICAgICAgICAgIGh0bWwucHVzaChjdXJyZW50SFRNTCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBxdWV1ZVJlc3VsdHMuaHRtbChodG1sLmpvaW4oXCJcIikpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlVXNlcnNMaXN0KHVzZXJzLCB1c2VySWRNZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG51bSA9IHVzZXJzLmxlbmd0aDtcclxuICAgICAgICB2YXIgc3VtbWFyeSA9IHVzZXJzLmxlbmd0aCArIFwiIHVzZXJzIGluIHRoZSByb29tXCI7XHJcbiAgICAgICAgaWYgKG51bSA9PSAxKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSB1c2Vycy5sZW5ndGggKyBcIiB1c2VyIGluIHRoZSByb29tXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjcF91c2Vyc19zdW1tYXJ5XCIpLnRleHQoc3VtbWFyeSk7XHJcbiAgICAgICAgdmFyIHVzZXJSZXN1bHRzID0gJChcIiNkaXZfdXNlcl9yZXN1bHRzXCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdXNlciA9IHVzZXJzW2ldO1xyXG4gICAgICAgICAgICB2YXIgdGhpc0lzTWUgPSAodXNlci5JZCA9PT0gdXNlcklkTWUpO1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudEhUTUwgPSB0aGlzLmZyYW1lQnVpbGRlci51c2VyKHRoaXMuY29sb3JzW2kgJSB0aGlzLmNvbG9ycy5sZW5ndGhdLCB1c2VyLklkLCB1c2VyLk5hbWUsIHRoaXNJc01lKTtcclxuICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdXNlclJlc3VsdHMuaHRtbChodG1sLmpvaW4oXCJcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyTmFtZUNoYW5nZShuYW1lX2lucHV0KSB7XHJcbiAgICAgICAgbmFtZV9pbnB1dC5oaWRlKCk7XHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuZmFkZUluKCk7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MubmFtZUNoYW5nZShuYW1lX2lucHV0LnZhbCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DaGF0TWVzc2FnZSh1c2VyTmFtZTogc3RyaW5nLCBtc2c6IHN0cmluZykge1xyXG4gICAgICAgIC8vVE9ETzogY29sb3Igc3R1ZmZcclxuICAgICAgICB2YXIgaHRtbCA9ICc8bGkgY2xhc3M9XCJjaGF0XCI+PHNwYW4gc3R5bGU9XCJtYXJnaW46IDA7IGNvbG9yOiAnICsgJ2JsdWUnICsgJztcIj4nICsgdXNlck5hbWUgKyAnOiA8L3NwYW4+PHNwYW4+JyArIG1zZyArICc8L3NwYW4+PC9saT4nO1xyXG4gICAgICAgICQoXCIjdWxfY2hhdFwiKS5hcHBlbmQoaHRtbCk7XHJcbiAgICB9XHJcbn0iXX0=
