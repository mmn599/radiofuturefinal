(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var ui_1 = require("./ui");
var Sockets_1 = require("./Sockets");
var Player_1 = require("./Player");
var mMeUser;
var mSession;
var mUI;
var mPlayer;
var mSocket;
$(document).ready(function () {
    mUI = new ui_1.UI(mobileBrowser, mCallbacks);
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
    var message;
    var mediaToDelete;
    mediaToDelete.Id = id;
    message.Action = 'DeleteMediaFromSession';
    message.Media = mediaToDelete;
    mSocket.emit('DeleteMediaFromSession', message);
}
function requestSyncWithUser(userId) {
    console.log('request sync with user');
    mSocket.emit('RequestSyncWithUser', { User: { Id: userId } });
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
    var userData;
    userData.Id = message.User.Id; // TODO: bad bad bad
    userData.State.QueuePosition = mMeUser.State.QueuePosition;
    userData.State.Time = Math.round(mPlayer.getCurrentTime());
    userData.State.YTPlayerState = mPlayer.getCurrentState();
    mSocket.emit('ProvideSyncToUser', { User: userData });
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
    var message;
    message.Action = 'UserJoinSession';
    message.User = mMeUser;
    message.Session = mSession;
    mSocket.emit(message);
}
var mCallbacks;
mCallbacks.onSendChatMessage = sendChatMessage;
mCallbacks.nameChange = saveUserNameChange;
mCallbacks.nextMedia = nextVideoInQueue;
mCallbacks.pauseMedia = pauseVideo;
mCallbacks.playMedia = playVideo;
mCallbacks.previousMedia = previousVideoInQueue;
mCallbacks.search = searchVideos;
function sendChatMessage(msg) {
    var message;
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
    var message;
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
    var media;
    media.VideoTitle = Title;
    media.VideoTitle = VideoId;
    media.ThumbURL = ThumbURL;
    media.UserId = mMeUser.Id;
    media.UserName = mMeUser.Name;
    var message;
    message.Action = 'AddMediaToSession';
    message.Media = media;
    //TODO: local add media
    mSocket.emit(media);
}
},{"./Player":2,"./Sockets":4,"./ui":6}],4:[function(require,module,exports){
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
        if (this.socket.readyState === this.socket.CONNECTING) {
            setTimeout(function () { this.emit(message); }, 100);
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
var UI = (function () {
    function UI(mobileBrowser, callbacks) {
        this.mobileBrowser = mobileBrowser;
        this.frameBuilder = new frame_1.FrameBuilder(mobileBrowser);
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
        var inputSearch = $("#input_search");
        inputSearch.keypress(function (e) {
            if (e.which == 13) {
                this.search_enter_pressed(inputSearch);
            }
        });
        var input_name = $("#input_name");
        input_name.keypress(function (e) {
            if (e.which == 13) {
                this.UserNameChange(input_name);
            }
        });
        if (this.mobileBrowser) {
            var input_chat = $("#input_chat");
            input_chat.keypress(function (e) {
                if (e.which == 13) {
                    this.callbacks.send_chat_message(input_chat.val());
                    input_chat.val("");
                }
            });
        }
        document.body.addEventListener('click', function () {
            $("#div_search_results").fadeOut();
            $("#input_search").val("");
        }, true);
        $("#input_search").bind("propertychange input paste", function (event) {
            this.search_text_changed($("#input_search").val());
        });
    };
    UI.prototype.setupPlayerControlButtons = function () {
        $("#btn_previous").click(this.callbacks.previousMedia);
        $("#btn_pause").click(function () {
            $("#btn_pause").hide();
            $("#btn_play").show();
            this.callbacks.pauseMedia();
        });
        $("#btn_play").click(function () {
            $("#btn_play").hide();
            $("#btn_uase").show();
            this.callbacks.playMedia();
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
            var currentHTML = this.frame.user(index, user.Id, user.Name, thisIsMe);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9QbGF5ZXIudHMiLCJUeXBlU2NyaXB0cy9Sb29tLnRzIiwiVHlwZVNjcmlwdHMvU29ja2V0cy50cyIsIlR5cGVTY3JpcHRzL2ZyYW1lLnRzIiwiVHlwZVNjcmlwdHMvdWkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0lBO0lBT0ksZ0JBQVksYUFBc0I7UUFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFDdkMsQ0FBQztJQUVNLG1DQUFrQixHQUF6QixVQUEwQixtQkFBbUI7UUFDekMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFO1lBQzNDLE1BQU0sRUFBRSxNQUFNO1lBQ2QsS0FBSyxFQUFFLE1BQU07WUFDYixVQUFVLEVBQUU7Z0JBQ1IsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7YUFDZDtZQUNELE1BQU0sRUFBRTtnQkFDSixTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWE7Z0JBQzdCLGVBQWUsRUFBRSxtQkFBbUI7YUFDdkM7U0FDSixDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDbEMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3ZELENBQUM7SUFDTCxDQUFDO0lBRU0saUNBQWdCLEdBQXZCLFVBQXdCLEtBQWMsRUFBRSxTQUFvQjtRQUN4RCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxJQUFJLENB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QUFDO1FBQ2QsMENBQTBDO1FBQzFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQVMsS0FBSyxFQUFFLElBQUk7WUFDOUIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBQ3RDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztRQUNILFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFTSwyQkFBYyxHQUFyQixVQUFzQixVQUFVO1FBQzVCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsQixDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVNLDBCQUFhLEdBQXBCLFVBQXFCLFFBQWdCLEVBQUUsR0FBVztRQUM5QyxtQkFBbUI7UUFDbkIsSUFBSSxJQUFJLEdBQUcsa0RBQWtELEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxRQUFRLEdBQUcsaUJBQWlCLEdBQUcsR0FBRyxHQUFHLGNBQWMsQ0FBQztRQUNySSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFDTCxTQUFDO0FBQUQsQ0FsTkEsQUFrTkMsSUFBQTtBQWxOWSxnQkFBRSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCLvu79kZWNsYXJlIHZhciBZVDogYW55O1xyXG5cclxuaW1wb3J0IHsgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBsYXllciB7XHJcblxyXG4gICAgcHJpdmF0ZSB5dFBsYXllcjogYW55O1xyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5cclxuICAgIHB1YmxpYyBwbGF5ZXJSZWFkeTogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXRpYWxpemVZdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllciA9IG5ldyBZVC5QbGF5ZXIoJ2Rpdl95dF9wbGF5ZXInLCB7XHJcbiAgICAgICAgICAgIGhlaWdodDogJ2F1dG8nLFxyXG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICBwbGF5ZXJWYXJzOiB7XHJcbiAgICAgICAgICAgICAgICBjb250cm9sczogMSxcclxuICAgICAgICAgICAgICAgIHNob3dpbmZvOiAwLFxyXG4gICAgICAgICAgICAgICAgYXV0b3BsYXk6IDBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAnb25SZWFkeSc6IHRoaXMub25QbGF5ZXJSZWFkeSxcclxuICAgICAgICAgICAgICAgICdvblN0YXRlQ2hhbmdlJzogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRpdl9wbGF5ZXIgPSAkKFwiI2Rpdl9wbGF5ZXJcIik7XHJcbiAgICAgICAgICAgIGRpdl9wbGF5ZXIuaGVpZ2h0KGRpdl9wbGF5ZXIud2lkdGgoKSAqIDkuMCAvIDE2LjApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0UGxheWVyQ29udGVudChxdWV1ZTogTWVkaWFbXSwgdXNlclN0YXRlOiBVc2VyU3RhdGUpIHtcclxuICAgICAgICBpZiAodXNlclN0YXRlLlF1ZXVlUG9zaXRpb24gIT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIG1lZGlhID0gcXVldWVbdXNlclN0YXRlLlF1ZXVlUG9zaXRpb25dO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBsYXllclVJKG1lZGlhLCB1c2VyU3RhdGUuVGltZSk7XHRcdFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGxheSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBsYXlWaWRlbygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYXVzZSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBhdXNlVmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVwZGF0ZVBsYXllclVJKG1lZGlhOiBNZWRpYSwgdGltZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5sb2FkVmlkZW9CeUlkKG1lZGlhLllUVmlkZW9JRCwgdGltZSwgXCJsYXJnZVwiKTtcdFxyXG4gICAgICAgICQoXCIjcF9jY19zdW1tYXJ5XCIpLnRleHQobWVkaWEuVmlkZW9UaXRsZSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGh0bWwgPVxyXG4gICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGltZyBzdHlsZT1cImhlaWdodDogOTBweDsgd2lkdGg6IDE2MHB4OyBtYXJnaW4tcmlnaHQ6IDE2cHg7XCIgc3JjPVwiJyArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nICtcclxuICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDtcIj4nICsgbWVkaWEuVmlkZW9UaXRsZSArICc8YnI+JyArICdSZWNvbW1lbmRlZCBieTogJyArIG1lZGlhLlVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikuaHRtbChodG1sKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFN0YXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9uUGxheWVyUmVhZHkoZXZlbnQpIHtcclxuICAgICAgICB0aGlzLnBsYXllclJlYWR5ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcbn0iLCLvu78vL1RPRE86IEFsbCB0aGlzIGNvZGUgaXMgbWlzZXJhYmx5IGF3ZnVsLiBBdCBzb21lIHBvaW50IGl0IHNob3VsZCBiZSBjb21wbGV0ZWx5IHJld29ya2VkLlxyXG5cclxudmFyIENPTE9SX0xJU1QgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImJsdWVcIiwgXCJ2aW9sZXRcIl07XHJcblxyXG5pbXBvcnQgeyBNeVVzZXIsIE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUsIFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBDYWxsYmFja3MsIFVJIH0gZnJvbSBcIi4vdWlcIjtcclxuaW1wb3J0IHsgTXlTb2NrZXQgfSBmcm9tIFwiLi9Tb2NrZXRzXCJcclxuaW1wb3J0IHsgUGxheWVyIH0gZnJvbSBcIi4vUGxheWVyXCJcclxuXHJcbmRlY2xhcmUgdmFyIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbmRlY2xhcmUgdmFyIGdhcGk6IGFueTtcclxuXHJcbnZhciBtTWVVc2VyOiBNeVVzZXI7XHJcbnZhciBtU2Vzc2lvbjogU2Vzc2lvbjtcclxudmFyIG1VSTogVUk7XHJcbnZhciBtUGxheWVyOiBQbGF5ZXI7XHJcbnZhciBtU29ja2V0O1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgbVVJID0gbmV3IFVJKG1vYmlsZUJyb3dzZXIsIG1DYWxsYmFja3MpO1xyXG4gICAgbVBsYXllciA9IG5ldyBQbGF5ZXIobW9iaWxlQnJvd3Nlcik7XHJcbiAgICBtU29ja2V0ID0gbmV3IE15U29ja2V0KG1NZXNzYWdlRnVuY3Rpb25zKTtcclxuICAgIHNldHVwSmFtU2Vzc2lvbigpO1xyXG59KTtcclxuXHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBGdW5jdGlvbnMgYXV0b21hdGljYWxseSBjYWxsZWQgd2hlbiB5b3V0dWJlIGFwaSdzIGFyZSByZWFkeVxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5mdW5jdGlvbiBvbllvdVR1YmVJZnJhbWVBUElSZWFkeSgpIHtcclxuICAgIG1QbGF5ZXIuaW5pdGlhbGl6ZVl0UGxheWVyKG9uUGxheWVyU3RhdGVDaGFuZ2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB5b3V0dWJlQVBJSW5pdCgpIHtcclxuXHRnYXBpLmNsaWVudC5zZXRBcGlLZXkoXCJBSXphU3lDNEEtZHNHay1oYV9iLWVEcGJ4YVZRdDViUjdjT1VkZGNcIik7XHJcblx0Z2FwaS5jbGllbnQubG9hZChcInlvdXR1YmVcIiwgXCJ2M1wiLCBmdW5jdGlvbigpIHt9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25QbGF5ZXJTdGF0ZUNoYW5nZShldmVudCkge1xyXG4gICAgaWYoZXZlbnQuZGF0YT09MCkge1xyXG4gICAgXHRuZXh0VmlkZW9JblF1ZXVlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEJhY2tlbmQgdmlkZW8gYW5kIHF1ZXVlIGNvbnRyb2wgZnVuY3Rpb25zXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbmZ1bmN0aW9uIGRlbGV0ZVZpZGVvSW5RdWV1ZShRdWV1ZVBvc2l0aW9uOiBudW1iZXIpIHtcclxuXHR2YXIgaWQgPSBtU2Vzc2lvbi5RdWV1ZVtRdWV1ZVBvc2l0aW9uXS5JZDtcclxuXHRtU2Vzc2lvbi5RdWV1ZS5zcGxpY2UoUXVldWVQb3NpdGlvbiwgMSk7XHJcblxyXG4gICAgbVVJLnVwZGF0ZVF1ZXVlKG1TZXNzaW9uLlF1ZXVlLCBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gKyAxKTtcclxuXHJcbiAgICB2YXIgbWVzc2FnZTogV3NNZXNzYWdlO1xyXG4gICAgdmFyIG1lZGlhVG9EZWxldGU6IE1lZGlhO1xyXG4gICAgbWVkaWFUb0RlbGV0ZS5JZCA9IGlkO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnRGVsZXRlTWVkaWFGcm9tU2Vzc2lvbic7XHJcbiAgICBtZXNzYWdlLk1lZGlhID0gbWVkaWFUb0RlbGV0ZTtcclxuICAgIG1Tb2NrZXQuZW1pdCgnRGVsZXRlTWVkaWFGcm9tU2Vzc2lvbicsIG1lc3NhZ2UpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVxdWVzdFN5bmNXaXRoVXNlcih1c2VySWQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdyZXF1ZXN0IHN5bmMgd2l0aCB1c2VyJyk7XHJcbiAgICBtU29ja2V0LmVtaXQoJ1JlcXVlc3RTeW5jV2l0aFVzZXInLCB7IFVzZXI6IHsgSWQ6IHVzZXJJZCB9IH0pO1xyXG59XHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBXZWJTb2NrZXQgbWVzc2FnZSByZXNwb25zZSBmdW5jdGlvbnNcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbnZhciBtTWVzc2FnZUZ1bmN0aW9ucyA9IHtcclxuICAgICd1cGRhdGVVc2VyJzogb25VcGRhdGVNZVVzZXIsXHJcbiAgICAnc2Vzc2lvblJlYWR5Jzogb25TZXNzaW9uUmVhZHksXHJcbiAgICAndXBkYXRlVXNlcnNMaXN0Jzogb25VcGRhdGVVc2Vyc0xpc3QsXHJcbiAgICAndXBkYXRlUXVldWUnOiBvblVwZGF0ZVF1ZXVlLFxyXG4gICAgJ2NoYXRNZXNzYWdlJzogb25SZWNlaXZlZENoYXRNZXNzYWdlLFxyXG4gICAgJ3JlcXVlc3RVc2VyU3RhdGUnOiBvblJlcXVlc3RNeVVzZXJTdGF0ZSxcclxuICAgICdwcm92aWRlVXNlclN0YXRlJzogb25Vc2VyU3RhdGVQcm92aWRlZFxyXG59XHJcblxyXG5mdW5jdGlvbiBvblVzZXJTdGF0ZVByb3ZpZGVkKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXJUb1N5bmNXaXRoID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgbU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdXNlclRvU3luY1dpdGguU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgIG1NZVVzZXIuU3RhdGUuVGltZSA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlRpbWU7XHJcbiAgICBtTWVVc2VyLlN0YXRlLllUUGxheWVyU3RhdGUgPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5ZVFBsYXllclN0YXRlO1xyXG4gICAgbVVJLnVwZGF0ZVF1ZXVlKG1TZXNzaW9uLlF1ZXVlLCBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gKyAxKTtcclxuICAgIG1QbGF5ZXIuc2V0UGxheWVyQ29udGVudChtU2Vzc2lvbi5RdWV1ZSwgbU1lVXNlci5TdGF0ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUmVxdWVzdE15VXNlclN0YXRlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXJEYXRhOiBNeVVzZXI7XHJcbiAgICB1c2VyRGF0YS5JZCA9IG1lc3NhZ2UuVXNlci5JZDsgLy8gVE9ETzogYmFkIGJhZCBiYWRcclxuICAgIHVzZXJEYXRhLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICB1c2VyRGF0YS5TdGF0ZS5UaW1lID0gTWF0aC5yb3VuZChtUGxheWVyLmdldEN1cnJlbnRUaW1lKCkpO1xyXG4gICAgdXNlckRhdGEuU3RhdGUuWVRQbGF5ZXJTdGF0ZSA9IG1QbGF5ZXIuZ2V0Q3VycmVudFN0YXRlKCk7XHJcbiAgICBtU29ja2V0LmVtaXQoJ1Byb3ZpZGVTeW5jVG9Vc2VyJywgeyBVc2VyOiB1c2VyRGF0YSB9KTsgXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBvblVwZGF0ZU1lVXNlcihtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgIHZhciB1c2VyID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgbU1lVXNlciA9IHVzZXI7XHRcclxufVxyXG5cclxuZnVuY3Rpb24gb25TZXNzaW9uUmVhZHkobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICBtU2Vzc2lvbiA9IG1lc3NhZ2UuU2Vzc2lvbjtcclxuICAgIG1NZVVzZXIgPSBtZXNzYWdlLlVzZXI7XHJcbiAgICBpZiAobVNlc3Npb24uUXVldWUubGVuZ3RoID09IDApIHtcclxuXHRcdCQoXCIjcF9jdXJyZW50X2NvbnRlbnRfaW5mb1wiKS50ZXh0KFwiUXVldWUgdXAgYSBzb25nIVwiKTtcclxuXHRcdCQoXCIjcF9jdXJyZW50X3JlY29tbWVuZGVyX2luZm9cIikudGV4dChcIlVzZSB0aGUgc2VhcmNoIGJhciBhYm92ZS5cIik7XHJcblx0fVxyXG4gICAgbmV4dFZpZGVvSW5RdWV1ZSgpO1xyXG4gICAgbVVJLnVwZGF0ZVVzZXJzTGlzdChtU2Vzc2lvbi5Vc2VycywgbU1lVXNlci5JZCk7XHJcbiAgICBtVUkuc2Vzc2lvblJlYWR5KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uVXBkYXRlVXNlcnNMaXN0KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgdmFyIHVzZXJzID0gbWVzc2FnZS5TZXNzaW9uLlVzZXJzO1xyXG4gICAgbVNlc3Npb24uVXNlcnMgPSB1c2VycztcclxuICAgIG1VSS51cGRhdGVVc2Vyc0xpc3QobVNlc3Npb24uVXNlcnMsIG1NZVVzZXIuSWQpO1x0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uVXBkYXRlUXVldWUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICB2YXIgcXVldWUgPSBtZXNzYWdlLlNlc3Npb24uUXVldWU7XHJcbiAgICBtU2Vzc2lvbi5RdWV1ZSA9IHF1ZXVlO1xyXG4gICAgbVVJLnVwZGF0ZVF1ZXVlKHF1ZXVlLCBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gKyAxKTtcclxuICAgIGlmIChtTWVVc2VyLlN0YXRlLldhaXRpbmcpIHtcclxuICAgICAgICBuZXh0VmlkZW9JblF1ZXVlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUmVjZWl2ZWRDaGF0TWVzc2FnZShkYXRhKSB7XHJcblx0dmFyIG1zZyA9IGRhdGEuQ2hhdE1lc3NhZ2U7XHJcbiAgICB2YXIgdXNlck5hbWUgPSBkYXRhLlVzZXIuTmFtZTtcclxuICAgIG1VSS5vbkNoYXRNZXNzYWdlKHVzZXJOYW1lLCBtc2cpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXR1cEphbVNlc3Npb24oKSB7XHJcblx0dmFyIHBhdGhuYW1lID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG5cdHZhciBlbmNvZGVkU2Vzc2lvbk5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKCdcXC9yb29tcy8nLCAnJyk7XHJcblxyXG4gICAgbVNlc3Npb24uTmFtZSA9IGRlY29kZVVSSShlbmNvZGVkU2Vzc2lvbk5hbWUpO1xyXG4gICAgbU1lVXNlci5OYW1lID0gJ0Fub255bW91cyc7XHJcblxyXG4gICAgdmFyIG1lc3NhZ2U6IFdzTWVzc2FnZTtcclxuICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1VzZXJKb2luU2Vzc2lvbic7XHJcbiAgICBtZXNzYWdlLlVzZXIgPSBtTWVVc2VyO1xyXG4gICAgbWVzc2FnZS5TZXNzaW9uID0gbVNlc3Npb247XHJcblxyXG5cdG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxudmFyIG1DYWxsYmFja3M6IENhbGxiYWNrcztcclxubUNhbGxiYWNrcy5vblNlbmRDaGF0TWVzc2FnZSA9IHNlbmRDaGF0TWVzc2FnZTtcclxubUNhbGxiYWNrcy5uYW1lQ2hhbmdlID0gc2F2ZVVzZXJOYW1lQ2hhbmdlO1xyXG5tQ2FsbGJhY2tzLm5leHRNZWRpYSA9IG5leHRWaWRlb0luUXVldWU7XHJcbm1DYWxsYmFja3MucGF1c2VNZWRpYSA9IHBhdXNlVmlkZW87XHJcbm1DYWxsYmFja3MucGxheU1lZGlhID0gcGxheVZpZGVvO1xyXG5tQ2FsbGJhY2tzLnByZXZpb3VzTWVkaWEgPSBwcmV2aW91c1ZpZGVvSW5RdWV1ZTtcclxubUNhbGxiYWNrcy5zZWFyY2ggPSBzZWFyY2hWaWRlb3M7XHJcblxyXG5mdW5jdGlvbiBzZW5kQ2hhdE1lc3NhZ2UobXNnOiBzdHJpbmcpIHtcclxuICAgIHZhciBtZXNzYWdlOiBXc01lc3NhZ2U7XHJcbiAgICBtZXNzYWdlLkFjdGlvbiA9ICdDaGF0TWVzc2FnZSc7XHJcbiAgICBtZXNzYWdlLkNoYXRNZXNzYWdlID0gbXNnO1xyXG4gICAgbWVzc2FnZS5Vc2VyID0gbU1lVXNlcjtcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2VhcmNoVmlkZW9zKHF1ZXJ5LCBjYWxsYmFjaykge1xyXG5cdHZhciByZXF1ZXN0ID0gZ2FwaS5jbGllbnQueW91dHViZS5zZWFyY2gubGlzdCh7XHJcbiAgICAgICAgcGFydDogXCJzbmlwcGV0XCIsXHJcbiAgICAgICAgdHlwZTogXCJ2aWRlb1wiLFxyXG5cdCAgICBxOiBlbmNvZGVVUklDb21wb25lbnQocXVlcnkpLnJlcGxhY2UoLyUyMC9nLCBcIitcIiksXHJcblx0ICAgIG1heFJlc3VsdHM6IDVcclxuICAgIH0pO1xyXG5cclxuXHRyZXF1ZXN0LmV4ZWN1dGUoY2FsbGJhY2spO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlVXNlck5hbWVDaGFuZ2UobmV3TmFtZSkge1xyXG4gICAgbU1lVXNlci5OYW1lID0gbmV3TmFtZTtcclxuICAgIHZhciBtZXNzYWdlOiBXc01lc3NhZ2U7XHJcbiAgICBtZXNzYWdlLlVzZXIgPSBtTWVVc2VyO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnU2F2ZVVzZXJOYW1lQ2hhbmdlJztcclxuICAgIG1Tb2NrZXQuZW1pdChtZXNzYWdlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbmV4dFZpZGVvSW5RdWV1ZSgpIHtcclxuICAgIG1NZVVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICB2YXIgcXVldWUgPSBtU2Vzc2lvbi5RdWV1ZTtcclxuXHRpZigobU1lVXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKzEpPHF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgIG1NZVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IG1NZVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiArIDE7XHJcbiAgICAgICAgbVBsYXllci5zZXRQbGF5ZXJDb250ZW50KG1TZXNzaW9uLlF1ZXVlLCBtTWVVc2VyLlN0YXRlKTtcclxuICAgICAgICBtTWVVc2VyLlN0YXRlLldhaXRpbmcgPSBmYWxzZTtcclxuXHR9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBtTWVVc2VyLlN0YXRlLldhaXRpbmcgPSB0cnVlO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gcGF1c2VWaWRlbygpIHtcclxuICAgIG1QbGF5ZXIucGF1c2UoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGxheVZpZGVvKCkge1xyXG4gICAgbVBsYXllci5wbGF5KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHByZXZpb3VzVmlkZW9JblF1ZXVlKCkge1xyXG4gICAgbU1lVXNlci5TdGF0ZS5UaW1lID0gMDtcclxuICAgIHZhciBxdWV1ZSA9IG1TZXNzaW9uLlF1ZXVlO1xyXG5cdGlmKG1NZVVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA+IDApIHtcclxuICAgICAgICBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSBtTWVVc2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gLSAxO1xyXG4gICAgICAgIG1QbGF5ZXIuc2V0UGxheWVyQ29udGVudChtU2Vzc2lvbi5RdWV1ZSwgbU1lVXNlci5TdGF0ZSk7XHJcblx0XHRtTWVVc2VyLlN0YXRlLldhaXRpbmcgPSBmYWxzZTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBUaGVzZSBmdW5jdGlvbnMgYXJlIGNhbGxlZCBkaXJlY3RseSBlbWJlZGRlZCBpbnRvIHRoZSBodG1sLi4uIGtpbmRhIHdlaXJkXHJcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbmZ1bmN0aW9uIHF1ZXVlU2VsZWN0ZWRWaWRlbyhlbG1udCkge1xyXG5cdCQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpLmZhZGVPdXQoKTtcclxuXHQkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoXCJcIik7XHJcblx0dmFyIFZpZGVvSWQgPSBlbG1udC5nZXRBdHRyaWJ1dGUoJ2RhdGEtVmlkZW9JZCcpO1xyXG5cdHZhciBUaXRsZSA9IGVsbW50LmlubmVyVGV4dCB8fCBlbG1udC50ZXh0Q29udGVudDtcclxuXHR2YXIgVGh1bWJVUkwgPSBlbG1udC5nZXRBdHRyaWJ1dGUoJ2RhdGEtVGh1bWJVUkwnKTtcclxuICAgIHZhciBtZWRpYTogTWVkaWE7XHJcbiAgICBtZWRpYS5WaWRlb1RpdGxlID0gVGl0bGU7XHJcbiAgICBtZWRpYS5WaWRlb1RpdGxlID0gVmlkZW9JZDtcclxuICAgIG1lZGlhLlRodW1iVVJMID0gVGh1bWJVUkw7XHJcbiAgICBtZWRpYS5Vc2VySWQgPSBtTWVVc2VyLklkO1xyXG4gICAgbWVkaWEuVXNlck5hbWUgPSBtTWVVc2VyLk5hbWU7XHJcbiAgICB2YXIgbWVzc2FnZTogV3NNZXNzYWdlO1xyXG4gICAgbWVzc2FnZS5BY3Rpb24gPSAnQWRkTWVkaWFUb1Nlc3Npb24nO1xyXG4gICAgbWVzc2FnZS5NZWRpYSA9IG1lZGlhO1xyXG4gICAgLy9UT0RPOiBsb2NhbCBhZGQgbWVkaWFcclxuICAgIG1Tb2NrZXQuZW1pdChtZWRpYSk7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbiIsIu+7v2ltcG9ydCB7IFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE15U29ja2V0IHtcclxuXHJcbiAgICBwcml2YXRlIHNvY2tldDogV2ViU29ja2V0O1xyXG4gICAgcHJpdmF0ZSByZXNwb25zZV9mdW5jdGlvbnM6IHsgW2FjdGlvbjogc3RyaW5nXTogKGRhdGE6IGFueSkgPT4gdm9pZCB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHJlc3BvbnNlX2Z1bmN0aW9uczogeyBbYWN0aW9uOiBzdHJpbmddOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkIH0pIHtcclxuICAgICAgICB0aGlzLnJlc3BvbnNlX2Z1bmN0aW9ucyA9IHJlc3BvbnNlX2Z1bmN0aW9ucztcclxuICAgICAgICB2YXIgdXJpID0gXCJ3czovL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyBcIi93c1wiO1xyXG4gICAgICAgIHZhciBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVyaSk7XHJcbiAgICAgICAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uIChldmVudCkge307XHJcbiAgICAgICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG4gICAgICAgIHNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gbWVzc2FnZS5BY3Rpb247XHJcbiAgICAgICAgICAgIHZhciByZXNwb25zZWZ1bmMgPSByZXNwb25zZV9mdW5jdGlvbnNbYWN0aW9uXTtcclxuICAgICAgICAgICAgLy8gVE9ETzogZXhjZXB0aW9uIHdoZW4gbm90IGZvdW5kXHJcbiAgICAgICAgICAgIHJlc3BvbnNlZnVuYyhtZXNzYWdlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuICAgICAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZW1pdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICBpZiAodGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gdGhpcy5zb2NrZXQuQ09OTkVDVElORykge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgdGhpcy5lbWl0KG1lc3NhZ2UpIH0sIDEwMCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XHJcbiAgICB9O1xyXG5cclxufVxyXG4iLCLvu79leHBvcnQgY2xhc3MgRnJhbWVCdWlsZGVyIHtcclxuXHJcbiAgICBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyTWUoY29sb3I6IHN0cmluZywgdXNlck5hbWU6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8ZGl2IGNsYXNzPVwiZGl2X3VzZXJcIiBzdHlsZT1cImJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+IHlvdSA8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZsb2F0OiBsZWZ0OyBjdXJzb3I6IHBvaW50ZXI7IG1hcmdpbi1yaWdodDogMTZweDsgaGVpZ2h0OiA0OHB4OyB3aWR0aDogNDhweDsgYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj55b3U8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7IGZsb2F0OiByaWdodDtcIj4nICsgdXNlck5hbWUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXNlcihjb2xvcjogc3RyaW5nLCB1c2VySWQ6IG51bWJlciwgdXNlck5hbWU6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8ZGl2IG9uY2xpY2s9XCJyZXF1ZXN0U3luY1dpdGhVc2VyKCcgKyB1c2VySWQgKyAnKVwiIGNsYXNzPVwiZGl2X3VzZXJcIiBzdHlsZT1cImJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+c3luYyB3aXRoICcgKyB1c2VyTmFtZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IG9uY2xpY2s9XCJyZXF1ZXN0U3luY1dpdGhVc2VyKCcgKyB1c2VySWQgKyAnKVwiIHN0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZsb2F0OiBsZWZ0OyBjdXJzb3I6IHBvaW50ZXI7IG1hcmdpbi1yaWdodDogMTZweDsgaGVpZ2h0OiA0OHB4OyB3aWR0aDogNDhweDsgYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj5zeW5jPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4OyBmbG9hdDogcmlnaHQ7XCI+JyArIHVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudEhUTUw7XHJcbiAgICB9XHJcbn0iLCLvu79pbXBvcnQgeyBGcmFtZUJ1aWxkZXIgfSBmcm9tIFwiLi9mcmFtZVwiO1xyXG5pbXBvcnQgeyBNZWRpYSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZGVjbGFyZSB2YXIgU3Bpbm5lcjogYW55O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDYWxsYmFja3Mge1xyXG4gICAgcHJldmlvdXNNZWRpYSgpOiB2b2lkO1xyXG4gICAgbmV4dE1lZGlhKCk6IHZvaWQ7XHJcbiAgICBwbGF5TWVkaWEoKTogdm9pZDtcclxuICAgIHBhdXNlTWVkaWEoKTogdm9pZDtcclxuICAgIG9uU2VuZENoYXRNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQ7XHJcbiAgICBzZWFyY2gocXVlcnk6IHN0cmluZywgY2FsbGJhY2s6IChyZXN1bHRzOiBhbnkpID0+IHZvaWQpOiBhbnk7XHJcbiAgICBuYW1lQ2hhbmdlKG5ld05hbWU6IHN0cmluZyk6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVSSB7XHJcblxyXG4gICAgcHJpdmF0ZSBzcGlubmVyOiBhbnk7XHJcbiAgICBwcml2YXRlIGNhbGxiYWNrczogQ2FsbGJhY2tzO1xyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBmcmFtZUJ1aWxkZXI6IEZyYW1lQnVpbGRlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuLCBjYWxsYmFja3M6IENhbGxiYWNrcykge1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICAgICAgdGhpcy5mcmFtZUJ1aWxkZXIgPSBuZXcgRnJhbWVCdWlsZGVyKG1vYmlsZUJyb3dzZXIpO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICB0aGlzLnNldHVwU3Bpbm5lclVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cEluZm9Sb2xsb3ZlclVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cElucHV0VUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwUGxheWVyQ29udHJvbEJ1dHRvbnMoKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIHNlc3Npb25SZWFkeSgpIHtcclxuICAgICAgICAkKFwiI2Rpdl9sb2FkaW5nXCIpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xyXG4gICAgICAgICQoXCIjZGl2X2V2ZXJ5dGhpbmdcIikuYW5pbWF0ZSh7b3BhY2l0eTogMX0sICdmYXN0Jyk7XHJcbiAgICB9IFxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBTcGlubmVyVUkoKSB7XHJcbiAgICAgICAgdmFyIG9wdHMgPSB7XHJcbiAgICAgICAgICAgIGxpbmVzOiAxMyAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcclxuICAgICAgICAgICAgLCBsZW5ndGg6IDI4IC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXHJcbiAgICAgICAgICAgICwgd2lkdGg6IDE0IC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xyXG4gICAgICAgICAgICAsIHJhZGl1czogNDIgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXHJcbiAgICAgICAgICAgICwgc2NhbGU6IDEgLy8gU2NhbGVzIG92ZXJhbGwgc2l6ZSBvZiB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIGNvcm5lcnM6IDEgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcclxuICAgICAgICAgICAgLCBjb2xvcjogJyMwMDAnIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcclxuICAgICAgICAgICAgLCBvcGFjaXR5OiAwLjI1IC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXHJcbiAgICAgICAgICAgICwgcm90YXRlOiAwIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcclxuICAgICAgICAgICAgLCBkaXJlY3Rpb246IDEgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxyXG4gICAgICAgICAgICAsIHNwZWVkOiAxIC8vIFJvdW5kcyBwZXIgc2Vjb25kXHJcbiAgICAgICAgICAgICwgdHJhaWw6IDYwIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICwgZnBzOiAyMCAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKSBhcyBhIGZhbGxiYWNrIGZvciBDU1NcclxuICAgICAgICAgICAgLCB6SW5kZXg6IDJlOSAvLyBUaGUgei1pbmRleCAoZGVmYXVsdHMgdG8gMjAwMDAwMDAwMClcclxuICAgICAgICAgICAgLCBjbGFzc05hbWU6ICdzcGlubmVyJyAvLyBUaGUgQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIHRvcDogJzUwJScgLy8gVG9wIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIGxlZnQ6ICc1MCUnIC8vIExlZnQgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XHJcbiAgICAgICAgICAgICwgc2hhZG93OiBmYWxzZSAvLyBXaGV0aGVyIHRvIHJlbmRlciBhIHNoYWRvd1xyXG4gICAgICAgICAgICAsIGh3YWNjZWw6IGZhbHNlIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxyXG4gICAgICAgICAgICAsIHBvc2l0aW9uOiAnYWJzb2x1dGUnIC8vIEVsZW1lbnQgcG9zaXRpb25pbmdcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZfbG9hZGluZycpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4odGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwRmFkZVVJKG92ZXJhbGwsIHJlc3VsdHMpIHtcclxuICAgICAgICBvdmVyYWxsLm1vdXNlZW50ZXIoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVJbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWxlYXZlKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBJbmZvUm9sbG92ZXJVSSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X3VzZXJzX292ZXJhbGxcIiksICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfcXVldWVfb3ZlcmFsbFwiKSwgJChcIiNkaXZfcXVldWVfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfY2hhdF9vdmVyYWxsXCIpLCAkKFwiI2Rpdl9jaGF0X3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X2NjX292ZXJhbGxcIiksICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlYXJjaFRleHRDaGFuZ2VkKHRleHQpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGlmKHRleHQubGVuZ3RoPT0wKSB7XHJcbiAgICAgICAgICAgIGRpdlJlc3VsdHMuZmFkZU91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwSW5wdXRVSSgpIHtcclxuICAgICAgICB2YXIgaW5wdXRTZWFyY2ggPSAkKFwiI2lucHV0X3NlYXJjaFwiKTtcclxuICAgICAgICBpbnB1dFNlYXJjaC5rZXlwcmVzcyhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hfZW50ZXJfcHJlc3NlZChpbnB1dFNlYXJjaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgaW5wdXRfbmFtZSA9ICQoXCIjaW5wdXRfbmFtZVwiKTtcclxuICAgICAgICBpbnB1dF9uYW1lLmtleXByZXNzKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlVzZXJOYW1lQ2hhbmdlKGlucHV0X25hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB2YXIgaW5wdXRfY2hhdCA9ICQoXCIjaW5wdXRfY2hhdFwiKTtcclxuICAgICAgICAgICAgaW5wdXRfY2hhdC5rZXlwcmVzcyhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5zZW5kX2NoYXRfbWVzc2FnZShpbnB1dF9jaGF0LnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dF9jaGF0LnZhbChcIlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikudmFsKFwiXCIpO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmJpbmQoXCJwcm9wZXJ0eWNoYW5nZSBpbnB1dCBwYXN0ZVwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hfdGV4dF9jaGFuZ2VkKCQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbCgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwUGxheWVyQ29udHJvbEJ1dHRvbnMoKSB7XHJcbiAgICAgICAgJChcIiNidG5fcHJldmlvdXNcIikuY2xpY2sodGhpcy5jYWxsYmFja3MucHJldmlvdXNNZWRpYSk7XHJcbiAgICAgICAgJChcIiNidG5fcGF1c2VcIikuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BsYXlcIikuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5wYXVzZU1lZGlhKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChcIiNidG5fcGxheVwiKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BsYXlcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2J0bl91YXNlXCIpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MucGxheU1lZGlhKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChcIiNidG5fbmV4dFwiKS5jbGljayh0aGlzLmNhbGxiYWNrcy5uZXh0TWVkaWEpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VhcmNoRW50ZXJQcmVzc2VkKGlucHV0X3NlYXJjaCkge1xyXG4gICAgICAgIHZhciBkaXZSZXN1bHRzID0gJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgZGl2UmVzdWx0cy5odG1sKFwiXCIpO1xyXG4gICAgICAgIHZhciByZXNwb25zZSA9IHRoaXMuY2FsbGJhY2tzLnNlYXJjaChpbnB1dF9zZWFyY2gudmFsKCksIGZ1bmN0aW9uIChyZXN1bHRzKSB7XHJcbiAgICAgICAgICAgICQuZWFjaChyZXNwb25zZS5pdGVtcywgZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGRpdlJlc3VsdHMuaHRtbChkaXZSZXN1bHRzLmh0bWwoKSArIFwiPGRpdiBjbGFzcz0nZGl2X3NlYXJjaF9yZXN1bHQnIG9uQ2xpY2s9J3F1ZXVlU2VsZWN0ZWRWaWRlbyh0aGlzKScgZGF0YS1WaWRlb0lkPSdcIiArIGl0ZW0uaWQudmlkZW9JZCArIFwiJyBkYXRhLVRodW1iVVJMPSdcIitpdGVtLnNuaXBwZXQudGh1bWJuYWlscy5tZWRpdW0udXJsK1wiJz5cIiArICc8cCBjbGFzcz1cInRleHRfc2VhcmNoX3Jlc3VsdFwiPicgKyAgaXRlbS5zbmlwcGV0LnRpdGxlKyAnPC9wPjwvZGl2PicgKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlucHV0X3NlYXJjaC5ibHVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYoIWRpdlJlc3VsdHMuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgZGl2UmVzdWx0cy5mYWRlSW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVF1ZXVlKHF1ZXVlLCBxdWV1ZVBvc2l0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcXVldWUubGVuZ3RoO1xyXG4gICAgICAgIHZhciBsZW5ndGhVcE5leHQgPSBxdWV1ZS5sZW5ndGggLSBxdWV1ZVBvc2l0aW9uO1xyXG4gICAgICAgIHZhciBzdW1tYXJ5ID0gbGVuZ3RoVXBOZXh0ICsgXCIgdGhpbmdzIHVwIG5leHRcIjtcclxuICAgICAgICBcclxuICAgICAgICBpZiAobGVuZ3RoVXBOZXh0ID09IDEpIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IGxlbmd0aFVwTmV4dCArIFwiIHRoaW5nIHVwIG5leHRcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobGVuZ3RoVXBOZXh0IDw9IDApIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IFwiTm90aGluZyB1cCBuZXh0LiBRdWV1ZSBzb21ldGhpbmchXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjcF9xdWV1ZV9zdW1tYXJ5XCIpLnRleHQoc3VtbWFyeSk7XHJcblxyXG4gICAgICAgIHZhciBxdWV1ZVJlc3VsdHMgPSAkKFwiI2Rpdl9xdWV1ZV9yZXN1bHRzXCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gW107XHJcbiAgICAgICAgaWYgKGxlbmd0aFVwTmV4dCA+IDApIHtcclxuICAgICAgICAgICAgLy9UT0RPOiBwdXQgc3R5bGUgaW4gY3NzIGFuZCBtYWtlIHNjcm9sbGV5XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBxdWV1ZVBvc2l0aW9uOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBtZWRpYSA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8aW1nIHN0eWxlPVwiZmxvYXQ6IGxlZnQ7IHdpZHRoOiAzMy4zMyU7IGhlaWdodDogMjB2dztcIiBzcmM9XCInICArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGltZyBzdHlsZT1cImhlaWdodDogOTBweDsgd2lkdGg6IDE2MHB4OyBtYXJnaW4tcmlnaHQ6IDE2cHg7XCIgc3JjPVwiJyArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDtcIj4nICsgbWVkaWEuVmlkZW9UaXRsZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcXVldWVSZXN1bHRzLmh0bWwoaHRtbC5qb2luKFwiXCIpKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVVzZXJzTGlzdCh1c2VycywgdXNlcklkTWU6IG51bWJlcikge1xyXG4gICAgICAgIHZhciBudW0gPSB1c2Vycy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHN1bW1hcnkgPSB1c2Vycy5sZW5ndGggKyBcIiB1c2VycyBpbiB0aGUgcm9vbVwiO1xyXG4gICAgICAgIGlmIChudW0gPT0gMSkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gdXNlcnMubGVuZ3RoICsgXCIgdXNlciBpbiB0aGUgcm9vbVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiI3BfdXNlcnNfc3VtbWFyeVwiKS50ZXh0KHN1bW1hcnkpO1xyXG4gICAgICAgIHZhciB1c2VyUmVzdWx0cyA9ICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKTtcclxuICAgICAgICB2YXIgaHRtbCA9IFtdO1xyXG4gICAgICAgIC8vVE9ETzogcHV0IHN0eWxlIGluIGNzcyBhbmQgbWFrZSBzY3JvbGxleVxyXG4gICAgICAgICQuZWFjaCh1c2VycywgZnVuY3Rpb24oaW5kZXgsIHVzZXIpIHtcclxuICAgICAgICAgICAgdmFyIHRoaXNJc01lID0gKHVzZXIuSWQgPT09IHVzZXJJZE1lKTtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gdGhpcy5mcmFtZS51c2VyKGluZGV4LCB1c2VyLklkLCB1c2VyLk5hbWUsIHRoaXNJc01lKTtcclxuICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB1c2VyUmVzdWx0cy5odG1sKGh0bWwuam9pbihcIlwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZXJOYW1lQ2hhbmdlKG5hbWVfaW5wdXQpIHtcclxuICAgICAgICBuYW1lX2lucHV0LmhpZGUoKTtcclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5mYWRlSW4oKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5uYW1lQ2hhbmdlKG5hbWVfaW5wdXQudmFsKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkNoYXRNZXNzYWdlKHVzZXJOYW1lOiBzdHJpbmcsIG1zZzogc3RyaW5nKSB7XHJcbiAgICAgICAgLy9UT0RPOiBjb2xvciBzdHVmZlxyXG4gICAgICAgIHZhciBodG1sID0gJzxsaSBjbGFzcz1cImNoYXRcIj48c3BhbiBzdHlsZT1cIm1hcmdpbjogMDsgY29sb3I6ICcgKyAnYmx1ZScgKyAnO1wiPicgKyB1c2VyTmFtZSArICc6IDwvc3Bhbj48c3Bhbj4nICsgbXNnICsgJzwvc3Bhbj48L2xpPic7XHJcbiAgICAgICAgJChcIiN1bF9jaGF0XCIpLmFwcGVuZChodG1sKTtcclxuICAgIH1cclxufSJdfQ==
