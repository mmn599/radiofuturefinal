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
        this.PlayerState = 0;
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
                    '<span style="margin-right: 16px;">' + media.Title + '</span>' +
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
},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PodcastPlayer = (function () {
    function PodcastPlayer(ui, mobileBrowser) {
        var _this = this;
        this.initPlayer = function (onPlayerStateChange) {
            _this.canvas.style.width = "100%";
            _this.canvas.style.height = "100%";
            _this.canvas.width = _this.canvas.offsetWidth;
            _this.canvas.height = _this.canvas.offsetHeight;
            _this.updatePlayerUI(0);
            _this.audio.onended = function () {
                onPlayerStateChange({ data: 0 });
            };
            _this.audio.ontimeupdate = function () {
                _this.audioTimeUpdate();
            };
        };
        this.sine = function (A, i, num) {
            return A * Math.sin((i / (_this.canvas.width / num)) * 2 * Math.PI);
        };
        this.updatePlayerUI = function (percentage) {
            var ctx = _this.canvas.getContext("2d");
            ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            ctx.lineWidth = 2;
            var A = 200;
            var num = 3;
            var mid = Math.floor(percentage * _this.canvas.width);
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.moveTo(0, _this.canvas.height / 2);
            for (var i = 0; i < mid; i += 1) {
                ctx.lineTo(i, -1 * _this.sine(A, i, num) + _this.canvas.height / 2);
            }
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = "black";
            for (var i = mid; i < _this.canvas.width; i += 1) {
                ctx.lineTo(i, -1 * _this.sine(A, i, num) + _this.canvas.height / 2);
            }
            ctx.stroke();
            ctx.beginPath();
            ctx.fillStyle = "blue";
            ctx.arc(mid, -1 * _this.sine(A, mid, num) + _this.canvas.height / 2, 10, 0, Math.PI * 2, true);
            ctx.fill();
        };
        this.setPlayerContent = function (media, time) {
            _this.mp3source.setAttribute('src', media.MP3Source);
            _this.audio.load();
            _this.audio.play();
            _this.ui.updateCurrentContent(media);
        };
        this.play = function () {
            _this.audio.play();
        };
        this.pause = function () {
            _this.audio.pause();
        };
        this.getCurrentTime = function () {
            return _this.audio.currentTime;
        };
        this.getCurrentState = function () {
            if (_this.audio.paused) {
                return 0;
            }
            else {
                return 1;
            }
        };
        this.isStopped = function () {
            return _this.audio.currentTime >= _this.audio.duration;
        };
        this.ui = ui;
        this.mobileBrowser = mobileBrowser;
        this.audio = document.getElementById('html5audio');
        this.mp3source = document.getElementById('mp3Source');
        this.canvas = document.getElementById('canvas_podcast');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
    }
    ;
    PodcastPlayer.prototype.audioTimeUpdate = function () {
        var percentage = this.audio.currentTime / this.audio.duration;
        this.updatePlayerUI(percentage);
    };
    return PodcastPlayer;
}());
exports.PodcastPlayer = PodcastPlayer;
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Contracts_1 = require("./Contracts");
var UI_1 = require("./UI");
var Sockets_1 = require("./Sockets");
var PodcastPlayer_1 = require("./PodcastPlayer");
var YtPlayer_1 = require("./YtPlayer");
var RoomManager = (function () {
    function RoomManager(roomType, mobileBrowser) {
        var _this = this;
        this.isUserWaiting = function () {
            var pos = _this.user.State.QueuePosition;
            var length = _this.session.Queue.length;
            return pos < 0 || ((pos == (length - 1)) && _this.player.isStopped());
        };
        //==================================================================
        // These functions are called directly embedded into the html... kinda weird
        //==================================================================
        this.requestSyncWithUser = function (userId) {
            console.log('request sync with user');
            var user = new Contracts_1.MyUser();
            user.Id = userId;
            var message = new Contracts_1.WsMessage();
            message.Action = 'RequestSyncWithUser';
            message.User = user;
            _this.socket.emit(message);
        };
        this.uiQueueMedia = function (media) {
            media.UserId = _this.user.Id;
            media.UserName = _this.user.Name;
            var message = new Contracts_1.WsMessage();
            message.Action = 'AddMediaToSession';
            message.Media = media;
            //TODO: local add media
            _this.socket.emit(message);
        };
        this.deleteMedia = function (mediaId, position) {
            _this.session.Queue.splice(position, 1);
            if (_this.user.State.QueuePosition >= position) {
                _this.user.State.QueuePosition -= 1;
                _this.onUserStateChange();
            }
            _this.ui.updateQueue(_this.session.Queue, _this.user.Id, _this.user.State.QueuePosition);
            var mediaToDelete = new Contracts_1.Media();
            mediaToDelete.Id = mediaId;
            var message = new Contracts_1.WsMessage();
            message.Action = 'DeleteMediaFromSession';
            message.Media = mediaToDelete;
            _this.socket.emit(message);
        };
        // TODO: find a better way to expose these functions to html?
        window.requestSyncWithUser = this.requestSyncWithUser;
        window.deleteMedia = this.deleteMedia;
        this.roomType = roomType;
        this.mobileBrowser = mobileBrowser;
    }
    RoomManager.prototype.init = function (encodedSessionName) {
        this.user = new Contracts_1.MyUser();
        this.session = new Contracts_1.Session();
        this.ui = new UI_1.UI(this.mobileBrowser, this);
        if (this.roomType == "podcasts") {
            this.player = new PodcastPlayer_1.PodcastPlayer(this.ui, this.mobileBrowser);
        }
        else {
            this.player = new YtPlayer_1.YtPlayer(this.ui, this.mobileBrowser);
        }
        this.socket = new Sockets_1.MySocket(this);
        this.setupJamSession(encodedSessionName);
        this.player.initPlayer(this.onPlayerStateChange);
    };
    RoomManager.prototype.setupJamSession = function (encodedSessionName) {
        this.session.Name = decodeURI(encodedSessionName);
        this.user.Name = 'Anonymous';
        var message = new Contracts_1.WsMessage();
        message.Action = 'UserJoinSession';
        message.User = this.user;
        message.Session = this.session;
        this.socket.emit(message);
    };
    //==================================================================
    // WebSocket message response functions
    //==================================================================
    RoomManager.prototype.clientProvideUserState = function (message) {
        var userToSyncWith = message.User;
        this.user.State.QueuePosition = userToSyncWith.State.QueuePosition;
        this.user.State.Time = userToSyncWith.State.Time;
        this.user.State.PlayerState = userToSyncWith.State.PlayerState;
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        this.onUserStateChange();
    };
    RoomManager.prototype.clientRequestUserState = function (message) {
        var userData = new Contracts_1.MyUser();
        userData.Id = message.User.Id; // TODO: bad bad bad
        userData.State.QueuePosition = this.user.State.QueuePosition;
        userData.State.Time = Math.round(this.player.getCurrentTime());
        userData.State.PlayerState = this.player.getCurrentState();
        var outgoingMsg = new Contracts_1.WsMessage();
        outgoingMsg.Action = 'ProvideSyncToUser';
        outgoingMsg.User = userData;
        this.socket.emit(outgoingMsg);
    };
    RoomManager.prototype.clientSessionReady = function (message) {
        this.session = message.Session;
        this.user = message.User;
        this.uiNextMedia();
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        this.ui.updateUsersList(this.session.Users, this.user.Id);
        this.ui.sessionReady();
    };
    RoomManager.prototype.clientUpdateUsersList = function (message) {
        var users = message.Session.Users;
        this.session.Users = users;
        this.ui.updateUsersList(this.session.Users, this.user.Id);
    };
    RoomManager.prototype.clientUpdateQueue = function (message) {
        var wasWaiting = this.isUserWaiting();
        this.session.Queue = message.Session.Queue;
        if (wasWaiting) {
            this.uiNextMedia();
        }
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
    };
    RoomManager.prototype.clientChatMessage = function (message) {
        var chatMessage = message.ChatMessage;
        var userName = message.User.Name;
        this.ui.onChatMessage(userName, chatMessage, 'blue');
    };
    RoomManager.prototype.clientSearchResults = function (message) {
        // TODO: dumb
        var results = message.Session.Queue;
        this.ui.onSearchResults(results);
    };
    //
    // Mostly UI callback functions
    //
    RoomManager.prototype.uiSendChatMessage = function (msg) {
        var message = new Contracts_1.WsMessage();
        message.Action = 'ChatMessage';
        message.ChatMessage = msg;
        message.User = this.user;
        this.socket.emit(message);
    };
    RoomManager.prototype.onPlayerStateChange = function (event) {
        if (event.data == 0) {
            this.uiNextMedia();
        }
    };
    RoomManager.prototype.uiSearch = function (query) {
        var message = new Contracts_1.WsMessage();
        message.Action = 'Search';
        message.ChatMessage = query;
        this.socket.emit(message);
    };
    RoomManager.prototype.uiNameChange = function (newName) {
        this.user.Name = newName;
        var message = new Contracts_1.WsMessage();
        message.User = this.user;
        message.Action = 'SaveUserNameChange';
        this.socket.emit(message);
    };
    RoomManager.prototype.onUserStateChange = function () {
        if (this.user.State.QueuePosition >= 0 && this.user.State.QueuePosition < this.session.Queue.length) {
            this.player.setPlayerContent(this.session.Queue[this.user.State.QueuePosition], this.user.State.Time);
        }
    };
    RoomManager.prototype.uiNextMedia = function () {
        var queue = this.session.Queue;
        if (this.user.State.QueuePosition + 1 < queue.length) {
            this.user.State.Time = 0;
            this.user.State.QueuePosition += 1;
        }
        this.onUserStateChange();
    };
    RoomManager.prototype.uiPauseMedia = function () {
        this.player.pause();
    };
    RoomManager.prototype.uiPlayMedia = function () {
        this.player.play();
    };
    RoomManager.prototype.uiPreviousMedia = function () {
        this.user.State.Time = 0;
        var queue = this.session.Queue;
        if (this.user.State.QueuePosition > 0) {
            this.user.State.QueuePosition = this.user.State.QueuePosition - 1;
            this.onUserStateChange();
        }
    };
    return RoomManager;
}());
var mRoomManager = new RoomManager(roomType, mobileBrowser);
$(document).ready(function () {
    mRoomManager.init(roomName);
});
},{"./Contracts":1,"./PodcastPlayer":4,"./Sockets":6,"./UI":7,"./YtPlayer":8}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MySocket = (function () {
    function MySocket(clientActions) {
        this.clientActions = clientActions;
        var uri = "ws://" + window.location.host + "/ws";
        var socket = new WebSocket(uri);
        socket.onopen = function (event) { };
        socket.onclose = function (event) { };
        socket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            var action = message.Action;
            if (clientActions[action]) {
                clientActions[action](message);
            }
            else {
                throw new Error("bad client action");
            }
        };
        socket.onerror = function (event) {
            // TODO: handle
        };
        this.socket = socket;
    }
    MySocket.prototype.emit = function (message) {
        var _this = this;
        if (this.socket.readyState === this.socket.CONNECTING) {
            setTimeout(function () {
                _this.emit(message);
            }, 50);
            return;
        }
        this.socket.send(JSON.stringify(message));
    };
    ;
    return MySocket;
}());
exports.MySocket = MySocket;
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FrameBuilder_1 = require("./FrameBuilder");
var UI = (function () {
    function UI(mobileBrowser, callbacks) {
        var _this = this;
        this.sessionReady = function () {
            $("#div_loading").hide();
            _this.spinner.stop();
            $("#div_everything").animate({ opacity: 1 }, 'fast');
        };
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
                    _this.callbacks.uiSendChatMessage(input_chat.val());
                    input_chat.val("");
                }
            });
        }
        document.body.addEventListener('click', function (event) {
            console.log(event.target);
            $("#div_search_results").fadeOut();
            $("#input_search").val("");
        }, true);
        $("#input_search").bind("propertychange input paste", function (event) {
            _this.searchTextChanged($("#input_search").val());
        });
    };
    UI.prototype.setupPlayerControlButtons = function () {
        var _this = this;
        $("#btn_previous").click(this.callbacks.uiPreviousMedia);
        $("#btn_pause").click(function () {
            $("#btn_pause").hide();
            $("#btn_play").show();
            _this.callbacks.uiPauseMedia();
        });
        $("#btn_play").click(function () {
            $("#btn_play").hide();
            $("#btn_pause").show();
            _this.callbacks.uiPlayMedia();
        });
        $("#btn_next").click(this.callbacks.uiNextMedia);
    };
    UI.prototype.onSearchResults = function (results) {
        var _this = this;
        var divResults = $("#div_search_results");
        divResults.html("");
        var html = [];
        for (var i = 0; i < results.length; i++) {
            var media = results[i];
            var divSearchResult = $(document.createElement('div'));
            divSearchResult.addClass('div_search_result');
            divSearchResult.appendTo(divResults);
            divSearchResult.click(function () {
                _this.callbacks.uiQueueMedia(media);
            });
            var pResult = document.createElement('p');
            $(pResult).addClass('text_search_result');
            $(pResult).appendTo(divSearchResult);
            $(pResult).text(media.Title);
        }
        $("#input_search").blur();
    };
    UI.prototype.updateCurrentContent = function (media) {
        $("#p_cc_summary").text(media.Title);
        if (!this.mobileBrowser) {
            var html = '<div style="text-align: left; display: flex; align-items: center;">' +
                '<img style="height: 90px; width: 160px; margin-right: 16px;" src="' + media.ThumbURL + '"/>' +
                '<span style="margin-right: 16px;">' + media.Title + '<br>' + 'Recommended by: ' + media.UserName + '</span>' +
                '</div>';
            $("#div_cc_results").html(html);
        }
    };
    UI.prototype.searchEnterPressed = function (input_search) {
        this.callbacks.uiSearch(input_search.val());
        var divResults = $("#div_search_results");
        divResults.html("<p>searching</p>");
        divResults.fadeIn();
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
        this.callbacks.uiNameChange(name_input.val());
    };
    UI.prototype.onChatMessage = function (userName, msg, color) {
        //TODO: color stuff
        var ul_chat = $("#ul_chat");
        var html = '<li class="chat"><span style="margin: 0; color: ' + color + ';">' + userName + ': </span><span>' + msg + '</span></li>';
        ul_chat.append(html);
        if (ul_chat.length >= 10) {
            ul_chat.children()[0].remove();
        }
    };
    return UI;
}());
exports.UI = UI;
},{"./FrameBuilder":2}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var YtPlayer = (function () {
    function YtPlayer(ui, mobileBrowser) {
        var _this = this;
        this.onPlayerReady = function () {
            _this.playerReady = true;
        };
        this.playerReady = false;
        this.mobileBrowser = mobileBrowser;
        this.ui = ui;
        $("#div_yt_player").show();
        $("#div_podcast_player").hide();
    }
    YtPlayer.prototype.initPlayer = function (onPlayerStateChange) {
        var _this = this;
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
        if (this.mobileBrowser) {
            var div_player = $("#div_yt_player");
            div_player.height(div_player.width() * 9.0 / 16.0);
        }
    };
    YtPlayer.prototype.setPlayerContent = function (media, time) {
        var _this = this;
        if (!this.playerReady) {
            console.log('player not ready!');
            setTimeout(function () { _this.setPlayerContent(media, time); }, 50);
        }
        else {
            this.ytPlayer.loadVideoById(media.YTVideoID, time, "large");
            this.ui.updateCurrentContent(media);
            this.play();
        }
    };
    YtPlayer.prototype.play = function () {
        this.ytPlayer.playVideo();
    };
    YtPlayer.prototype.pause = function () {
        this.ytPlayer.pauseVideo();
    };
    YtPlayer.prototype.getCurrentTime = function () {
        return Math.round(this.ytPlayer.getCurrentTime());
    };
    YtPlayer.prototype.getCurrentState = function () {
        return Math.round(this.ytPlayer.getPlayerState());
    };
    YtPlayer.prototype.isStopped = function () {
        return this.getCurrentState() == 0;
    };
    return YtPlayer;
}());
exports.YtPlayer = YtPlayer;
},{}]},{},[1,6,2,7,5,3,4,8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9GcmFtZUJ1aWxkZXIudHMiLCJUeXBlU2NyaXB0cy9Qb2RjYXN0UGxheWVyLnRzIiwiVHlwZVNjcmlwdHMvUm9vbS50cyIsIlR5cGVTY3JpcHRzL1NvY2tldHMudHMiLCJUeXBlU2NyaXB0cy9VSS50cyIsIlR5cGVTY3JpcHRzL1l0UGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQztJQUFBO0lBU0QsQ0FBQztJQUFELFlBQUM7QUFBRCxDQVRDLEFBU0EsSUFBQTtBQVRhLHNCQUFLO0FBV25CO0lBRUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUtMLGFBQUM7QUFBRCxDQVRBLEFBU0MsSUFBQTtBQVRZLHdCQUFNO0FBV25CO0lBRUk7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUtMLGdCQUFDO0FBQUQsQ0FYQSxBQVdDLElBQUE7QUFYWSw4QkFBUztBQWF0QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDeEN0QjtJQUlJLHNCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSwyQkFBSSxHQUFYLFVBQVksS0FBYSxFQUFFLE1BQWMsRUFBRSxRQUFnQixFQUFFLFFBQWlCO1FBQzFFLElBQUksV0FBVyxHQUFHLEVB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SSxDQUFDLENBQUM7WUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztJQUVNLHVCQUFJLEdBQVg7UUFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFTSx3QkFBSyxHQUFaO1FBQ0ksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU0saUNBQWMsR0FBckI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLGtDQUFlLEdBQXRCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTSw0QkFBUyxHQUFoQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTCxlQUFDO0FBQUQsQ0E1RUEsQUE0RUMsSUFBQTtBQTVFWSw0QkFBUSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCLvu79leHBvcnQgY2xhc3MgTWVkaWEge1xyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIFVzZXJJZDogbnVtYmVyO1xyXG4gICAgVXNlck5hbWU6IHN0cmluZztcclxuICAgIFlUVmlkZW9JRDogbnVtYmVyO1xyXG4gICAgTVAzU291cmNlOiBzdHJpbmc7XHJcbiAgICBPR0dTb3VyY2U6IHN0cmluZztcclxuICAgIFRpdGxlOiBzdHJpbmc7XHJcbiAgICBUaHVtYlVSTDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTXlVc2VyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLlN0YXRlID0gbmV3IFVzZXJTdGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBTdGF0ZTogVXNlclN0YXRlO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVXNlclN0YXRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLlRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMuUXVldWVQb3NpdGlvbiA9IC0xO1xyXG4gICAgICAgIHRoaXMuUGxheWVyU3RhdGUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIFRpbWU6IG51bWJlcjtcclxuICAgIFF1ZXVlUG9zaXRpb246IG51bWJlcjtcclxuICAgIFBsYXllclN0YXRlOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXNzaW9uIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBVc2VyczogTXlVc2VyW107XHJcbiAgICBRdWV1ZTogTWVkaWFbXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFdzTWVzc2FnZSB7XHJcbiAgICBBY3Rpb246IHN0cmluZztcclxuICAgIFNlc3Npb246IFNlc3Npb247XHJcbiAgICBNZWRpYTogTWVkaWE7XHJcbiAgICBVc2VyOiBNeVVzZXI7XHJcbiAgICBDaGF0TWVzc2FnZTogc3RyaW5nO1xyXG59Iiwi77u/aW1wb3J0IHsgTWVkaWEgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGcmFtZUJ1aWxkZXIge1xyXG5cclxuICAgIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZXIoY29sb3I6IHN0cmluZywgdXNlcklkOiBudW1iZXIsIHVzZXJOYW1lOiBzdHJpbmcsIHRoaXNJc01lOiBib29sZWFuKSA6IHN0cmluZyB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICB2YXIgbWVIdG1sID0gdGhpc0lzTWUgPyAnb25jbGljaz1cInJlcXVlc3RTeW5jV2l0aFVzZXIoJyArIHVzZXJJZCArICcpXCIgJyA6IFwiXCI7XHJcbiAgICAgICAgdmFyIHN5bmNIVE1MID0gdGhpc0lzTWUgPyAneW91JyA6ICdzeW5jJztcclxuICAgICAgICB2YXIgc3luY0hUTUxNb2JpbGUgPSB0aGlzSXNNZSA/ICd5b3UnIDogJ3N5bmMgd2l0aCAnICsgdXNlck5hbWU7XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8ZGl2ICcgKyBtZUh0bWwgKyAnY2xhc3M9XCJkaXZfdXNlclwiIHN0eWxlPVwiYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj4gJyArIHN5bmNIVE1MTW9iaWxlICsgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiAnICsgbWVIdG1sICsgJ3N0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZsb2F0OiBsZWZ0OyBjdXJzb3I6IHBvaW50ZXI7IG1hcmdpbi1yaWdodDogMTZweDsgaGVpZ2h0OiA0OHB4OyB3aWR0aDogNDhweDsgYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj4nICsgc3luY0hUTUwgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4OyBmbG9hdDogcmlnaHQ7XCI+JyArIHVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudEhUTUw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG1lZGlhKG1lZGlhOiBNZWRpYSwgcG9zaXRpb246IG51bWJlciwgcmVjb21tZW5kZWRCeU1lOiBib29sZWFuLCBvblRoaXM6IGJvb2xlYW4pIHtcclxuICAgICAgICB2YXIgY3VycmVudEhUTUwgPSBcIlwiO1xyXG4gICAgICAgIHZhciBjYW5EZWxldGVUaGlzID0gcmVjb21tZW5kZWRCeU1lOyAvLyYmICFvblRoaXM7XHJcbiAgICAgICAgdmFyIGRlbGV0ZVRoaXNIVE1MID0gY2FuRGVsZXRlVGhpcyA/ICd0aXRsZT1cIkNsaWNrIHRvIGRlbGV0ZSB0aGlzIGZyb20gdGhlIHF1ZXVlIVwiIG9uY2xpY2s9XCJkZWxldGVNZWRpYSgnICsgbWVkaWEuSWQgKyAnLCAnICsgcG9zaXRpb24gKyAnKVwiICcgOiBcIlwiO1xyXG4gICAgICAgIHZhciBjYW5EZWxldGVTdHlsZSA9IGNhbkRlbGV0ZVRoaXMgPyBcImN1cnNvcjogcG9pbnRlcjsgXCIgOiBcIlwiO1xyXG4gICAgICAgIHZhciBvblRoaXNTdHlsZSA9IG9uVGhpcyA/IFwiYm9yZGVyOiAxcHggc29saWQgYmx1ZTsgXCIgOiBcIlwiO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGFkZCBkZWxldGUgVUlcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPSAnPGltZyBzdHlsZT1cIicgKyBvblRoaXNTdHlsZSArICdmbG9hdDogbGVmdDsgd2lkdGg6IDMzLjMzJTsgaGVpZ2h0OiAyMHZ3O1wiIHNyYz1cIicgICsgbWVkaWEuVGh1bWJVUkwgKyAnXCIvPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9XHJcbiAgICAgICAgICAgICAgICAnPGRpdiAnICsgZGVsZXRlVGhpc0hUTUwgKyAnc3R5bGU9XCInICsgY2FuRGVsZXRlU3R5bGUgKyBvblRoaXNTdHlsZSArICd0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8aW1nIHN0eWxlPVwiaGVpZ2h0OiA5MHB4OyB3aWR0aDogMTYwcHg7IG1hcmdpbi1yaWdodDogMTZweDtcIiBzcmM9XCInICsgbWVkaWEuVGh1bWJVUkwgKyAnXCIvPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDtcIj4nICsgbWVkaWEuVGl0bGUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxufSIsIu+7v2RlY2xhcmUgdmFyIFlUOiBhbnk7XHJcblxyXG5pbXBvcnQgeyBJUGxheWVyIH0gZnJvbSBcIi4vSVBsYXllclwiO1xyXG5pbXBvcnQgeyBNZWRpYSwgU2Vzc2lvbiwgVXNlclN0YXRlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcbmltcG9ydCB7IFVJIH0gZnJvbSBcIi4vVUlcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQb2RjYXN0UGxheWVyIGltcGxlbWVudHMgSVBsYXllciB7XHJcblxyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBhdWRpbzogSFRNTEF1ZGlvRWxlbWVudDtcclxuICAgIHByaXZhdGUgbXAzc291cmNlOiBhbnk7XHJcbiAgICBwcml2YXRlIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBwcml2YXRlIHVpOiBVSTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih1aTogVUksIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLnVpID0gdWk7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgICAgICB0aGlzLmF1ZGlvID0gPEhUTUxBdWRpb0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2h0bWw1YXVkaW8nKTtcclxuICAgICAgICB0aGlzLm1wM3NvdXJjZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcDNTb3VyY2UnKTtcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzX3BvZGNhc3QnKTtcclxuICAgICAgICAkKFwiI2Rpdl95dF9wbGF5ZXJcIikuaGlkZSgpO1xyXG4gICAgICAgICQoXCIjZGl2X3BvZGNhc3RfcGxheWVyXCIpLnNob3coKTtcclxuICAgIH07XHJcblxyXG4gICAgYXVkaW9UaW1lVXBkYXRlKCkge1xyXG4gICAgICAgIHZhciBwZXJjZW50YWdlID0gdGhpcy5hdWRpby5jdXJyZW50VGltZSAvIHRoaXMuYXVkaW8uZHVyYXRpb247XHJcbiAgICAgICAgdGhpcy51cGRhdGVQbGF5ZXJVSShwZXJjZW50YWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0UGxheWVyID0gKG9uUGxheWVyU3RhdGVDaGFuZ2UpID0+IHtcclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMudXBkYXRlUGxheWVyVUkoMCk7XHJcbiAgICAgICAgdGhpcy5hdWRpby5vbmVuZGVkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBvblBsYXllclN0YXRlQ2hhbmdlKHsgZGF0YTogMCB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hdWRpby5vbnRpbWV1cGRhdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW9UaW1lVXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNpbmUgPSAoQSwgaSwgbnVtKTogbnVtYmVyID0+IHtcclxuICAgICAgICByZXR1cm4gQSAqIE1hdGguc2luKChpIC8gKHRoaXMuY2FudmFzLndpZHRoIC8gbnVtKSkgKiAyICogTWF0aC5QSSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUGxheWVyVUkgPSAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgdmFyIGN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xyXG4gICAgICAgIHZhciBBID0gMjAwO1xyXG4gICAgICAgIHZhciBudW0gPSAzO1xyXG4gICAgICAgIHZhciBtaWQgPSBNYXRoLmZsb29yKHBlcmNlbnRhZ2UgKiB0aGlzLmNhbnZhcy53aWR0aCk7XHJcblxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcImJsdWVcIjtcclxuICAgICAgICBjdHgubW92ZVRvKDAsIHRoaXMuY2FudmFzLmhlaWdodCAvIDIpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWlkOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgY3R4LmxpbmVUbyhpLCAtMSAqIHRoaXMuc2luZShBLCBpLCBudW0pICsgdGhpcy5jYW52YXMuaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICBmb3IgKHZhciBpID0gbWlkOyBpIDwgdGhpcy5jYW52YXMud2lkdGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBjdHgubGluZVRvKGksIC0xICogdGhpcy5zaW5lKEEsIGksIG51bSkgKyB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmx1ZVwiO1xyXG4gICAgICAgIGN0eC5hcmMobWlkLCAtMSAqIHRoaXMuc2luZShBLCBtaWQsIG51bSkgKyB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyLCAxMCwgMCwgTWF0aC5QSSAqIDIsIHRydWUpO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UGxheWVyQ29udGVudCA9IChtZWRpYTogTWVkaWEsIHRpbWU6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIHRoaXMubXAzc291cmNlLnNldEF0dHJpYnV0ZSgnc3JjJywgbWVkaWEuTVAzU291cmNlKTtcclxuICAgICAgICB0aGlzLmF1ZGlvLmxvYWQoKTtcclxuICAgICAgICB0aGlzLmF1ZGlvLnBsYXkoKTtcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZUN1cnJlbnRDb250ZW50KG1lZGlhKTtcclxuICAgIH1cclxuXHJcbiAgICBwbGF5ID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXVkaW8ucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHBhdXNlID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXVkaW8ucGF1c2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDdXJyZW50VGltZSA9ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hdWRpby5jdXJyZW50VGltZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDdXJyZW50U3RhdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuYXVkaW8ucGF1c2VkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzU3RvcHBlZCA9ICgpIDogYm9vbGVhbiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXVkaW8uY3VycmVudFRpbWUgPj0gdGhpcy5hdWRpby5kdXJhdGlvbjtcclxuICAgIH1cclxuXHJcbn0iLCLvu79pbXBvcnQgeyBNeVVzZXIsIE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUsIFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBVSUNhbGxiYWNrcywgVUkgfSBmcm9tIFwiLi9VSVwiO1xyXG5pbXBvcnQgeyBNeVNvY2tldCwgQ2xpZW50QWN0aW9ucyB9IGZyb20gXCIuL1NvY2tldHNcIjtcclxuaW1wb3J0IHsgSVBsYXllciB9IGZyb20gXCIuL0lQbGF5ZXJcIjtcclxuaW1wb3J0IHsgUG9kY2FzdFBsYXllciB9IGZyb20gXCIuL1BvZGNhc3RQbGF5ZXJcIjtcclxuaW1wb3J0IHsgWXRQbGF5ZXIgfSBmcm9tIFwiLi9ZdFBsYXllclwiO1xyXG5cclxuY2xhc3MgUm9vbU1hbmFnZXIgaW1wbGVtZW50cyBVSUNhbGxiYWNrcywgQ2xpZW50QWN0aW9ucyB7XHJcblxyXG4gICAgdXNlcjogTXlVc2VyO1xyXG4gICAgc2Vzc2lvbjogU2Vzc2lvbjtcclxuICAgIHBsYXllcjogSVBsYXllcjsgXHJcbiAgICBzb2NrZXQ6IE15U29ja2V0O1xyXG4gICAgdWk6IFVJO1xyXG4gICAgcm9vbVR5cGU6IHN0cmluZztcclxuICAgIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3Iocm9vbVR5cGU6IHN0cmluZywgbW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIC8vIFRPRE86IGZpbmQgYSBiZXR0ZXIgd2F5IHRvIGV4cG9zZSB0aGVzZSBmdW5jdGlvbnMgdG8gaHRtbD9cclxuICAgICAgICAoPGFueT53aW5kb3cpLnJlcXVlc3RTeW5jV2l0aFVzZXIgPSB0aGlzLnJlcXVlc3RTeW5jV2l0aFVzZXI7XHJcbiAgICAgICAgKDxhbnk+d2luZG93KS5kZWxldGVNZWRpYSA9IHRoaXMuZGVsZXRlTWVkaWE7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZSA9IHJvb21UeXBlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoZW5jb2RlZFNlc3Npb25OYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uID0gbmV3IFNlc3Npb24oKTtcclxuICAgICAgICB0aGlzLnVpID0gbmV3IFVJKHRoaXMubW9iaWxlQnJvd3NlciwgdGhpcyk7XHJcbiAgICAgICAgaWYgKHRoaXMucm9vbVR5cGUgPT0gXCJwb2RjYXN0c1wiKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyID0gbmV3IFBvZGNhc3RQbGF5ZXIodGhpcy51aSwgdGhpcy5tb2JpbGVCcm93c2VyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyID0gbmV3IFl0UGxheWVyKHRoaXMudWksIHRoaXMubW9iaWxlQnJvd3Nlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gbmV3IE15U29ja2V0KHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBKYW1TZXNzaW9uKGVuY29kZWRTZXNzaW9uTmFtZSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIuaW5pdFBsYXllcih0aGlzLm9uUGxheWVyU3RhdGVDaGFuZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldHVwSmFtU2Vzc2lvbihlbmNvZGVkU2Vzc2lvbk5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuc2Vzc2lvbi5OYW1lID0gZGVjb2RlVVJJKGVuY29kZWRTZXNzaW9uTmFtZSk7XHJcbiAgICAgICAgdGhpcy51c2VyLk5hbWUgPSAnQW5vbnltb3VzJztcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdVc2VySm9pblNlc3Npb24nO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHRoaXMudXNlcjtcclxuICAgICAgICBtZXNzYWdlLlNlc3Npb24gPSB0aGlzLnNlc3Npb247XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gV2ViU29ja2V0IG1lc3NhZ2UgcmVzcG9uc2UgZnVuY3Rpb25zXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIGNsaWVudFByb3ZpZGVVc2VyU3RhdGUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIHVzZXJUb1N5bmNXaXRoID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdXNlclRvU3luY1dpdGguU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLnVzZXIuU3RhdGUuVGltZSA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlRpbWU7XHJcbiAgICAgICAgdGhpcy51c2VyLlN0YXRlLlBsYXllclN0YXRlID0gdXNlclRvU3luY1dpdGguU3RhdGUuUGxheWVyU3RhdGU7XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVRdWV1ZSh0aGlzLnNlc3Npb24uUXVldWUsIHRoaXMudXNlci5JZCwgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG4gICAgICAgIHRoaXMub25Vc2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRSZXF1ZXN0VXNlclN0YXRlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciB1c2VyRGF0YSA9IG5ldyBNeVVzZXIoKTtcclxuICAgICAgICB1c2VyRGF0YS5JZCA9IG1lc3NhZ2UuVXNlci5JZDsgLy8gVE9ETzogYmFkIGJhZCBiYWRcclxuICAgICAgICB1c2VyRGF0YS5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICAgICAgdXNlckRhdGEuU3RhdGUuVGltZSA9IE1hdGgucm91bmQodGhpcy5wbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSk7XHJcbiAgICAgICAgdXNlckRhdGEuU3RhdGUuUGxheWVyU3RhdGUgPSB0aGlzLnBsYXllci5nZXRDdXJyZW50U3RhdGUoKTtcclxuXHJcbiAgICAgICAgdmFyIG91dGdvaW5nTXNnID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG91dGdvaW5nTXNnLkFjdGlvbiA9ICdQcm92aWRlU3luY1RvVXNlcic7XHJcbiAgICAgICAgb3V0Z29pbmdNc2cuVXNlciA9IHVzZXJEYXRhO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQob3V0Z29pbmdNc2cpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFNlc3Npb25SZWFkeShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB0aGlzLnNlc3Npb24gPSBtZXNzYWdlLlNlc3Npb247XHJcbiAgICAgICAgdGhpcy51c2VyID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgICAgIHRoaXMudWlOZXh0TWVkaWEoKTtcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVF1ZXVlKHRoaXMuc2Vzc2lvbi5RdWV1ZSwgdGhpcy51c2VyLklkLCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVVc2Vyc0xpc3QodGhpcy5zZXNzaW9uLlVzZXJzLCB0aGlzLnVzZXIuSWQpO1xyXG4gICAgICAgIHRoaXMudWkuc2Vzc2lvblJlYWR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50VXBkYXRlVXNlcnNMaXN0KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciB1c2VycyA9IG1lc3NhZ2UuU2Vzc2lvbi5Vc2VycztcclxuICAgICAgICB0aGlzLnNlc3Npb24uVXNlcnMgPSB1c2VycztcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVVzZXJzTGlzdCh0aGlzLnNlc3Npb24uVXNlcnMsIHRoaXMudXNlci5JZCk7XHRcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRVcGRhdGVRdWV1ZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgd2FzV2FpdGluZyA9IHRoaXMuaXNVc2VyV2FpdGluZygpO1xyXG4gICAgICAgIHRoaXMuc2Vzc2lvbi5RdWV1ZSA9IG1lc3NhZ2UuU2Vzc2lvbi5RdWV1ZTtcclxuICAgICAgICBpZiAod2FzV2FpdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLnVpTmV4dE1lZGlhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudWkudXBkYXRlUXVldWUodGhpcy5zZXNzaW9uLlF1ZXVlLCB0aGlzLnVzZXIuSWQsIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRDaGF0TWVzc2FnZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgY2hhdE1lc3NhZ2UgPSBtZXNzYWdlLkNoYXRNZXNzYWdlO1xyXG4gICAgICAgIHZhciB1c2VyTmFtZSA9IG1lc3NhZ2UuVXNlci5OYW1lO1xyXG4gICAgICAgIHRoaXMudWkub25DaGF0TWVzc2FnZSh1c2VyTmFtZSwgY2hhdE1lc3NhZ2UsICdibHVlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50U2VhcmNoUmVzdWx0cyhtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICAvLyBUT0RPOiBkdW1iXHJcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBtZXNzYWdlLlNlc3Npb24uUXVldWU7XHJcbiAgICAgICAgdGhpcy51aS5vblNlYXJjaFJlc3VsdHMocmVzdWx0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNVc2VyV2FpdGluZyA9ICgpOiBib29sZWFuID0+IHtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMuc2Vzc2lvbi5RdWV1ZS5sZW5ndGg7XHJcbiAgICAgICAgcmV0dXJuIHBvcyA8IDAgfHwgKChwb3MgPT0gKGxlbmd0aCAtIDEpKSAmJiB0aGlzLnBsYXllci5pc1N0b3BwZWQoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9cclxuICAgIC8vIE1vc3RseSBVSSBjYWxsYmFjayBmdW5jdGlvbnNcclxuICAgIC8vXHJcbiAgICB1aVNlbmRDaGF0TWVzc2FnZShtc2c6IHN0cmluZykge1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0NoYXRNZXNzYWdlJztcclxuICAgICAgICBtZXNzYWdlLkNoYXRNZXNzYWdlID0gbXNnO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHRoaXMudXNlcjtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uUGxheWVyU3RhdGVDaGFuZ2UoZXZlbnQpIHtcclxuICAgICAgICBpZihldmVudC5kYXRhPT0wKSB7XHJcbiAgICAgICAgICAgIHRoaXMudWlOZXh0TWVkaWEoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdWlTZWFyY2gocXVlcnkpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdTZWFyY2gnO1xyXG4gICAgICAgIG1lc3NhZ2UuQ2hhdE1lc3NhZ2UgPSBxdWVyeTtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHVpTmFtZUNoYW5nZShuZXdOYW1lKSB7XHJcbiAgICAgICAgdGhpcy51c2VyLk5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHRoaXMudXNlcjtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdTYXZlVXNlck5hbWVDaGFuZ2UnO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25Vc2VyU3RhdGVDaGFuZ2UoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID49IDAgJiYgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPCB0aGlzLnNlc3Npb24uUXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLnNldFBsYXllckNvbnRlbnQodGhpcy5zZXNzaW9uLlF1ZXVlW3RoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uXSwgdGhpcy51c2VyLlN0YXRlLlRpbWUpOyBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdWlOZXh0TWVkaWEoKSB7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gdGhpcy5zZXNzaW9uLlF1ZXVlO1xyXG4gICAgICAgIGlmKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMSA8IHF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICs9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub25Vc2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgIH1cclxuXHJcbiAgICB1aVBhdXNlTWVkaWEoKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIucGF1c2UoKTtcclxuICAgIH1cclxuXHJcbiAgICB1aVBsYXlNZWRpYSgpIHtcclxuICAgICAgICB0aGlzLnBsYXllci5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdWlQcmV2aW91c01lZGlhKCkge1xyXG4gICAgICAgIHRoaXMudXNlci5TdGF0ZS5UaW1lID0gMDtcclxuICAgICAgICB2YXIgcXVldWUgPSB0aGlzLnNlc3Npb24uUXVldWU7XHJcbiAgICAgICAgaWYodGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gLSAxO1xyXG4gICAgICAgICAgICB0aGlzLm9uVXNlclN0YXRlQ2hhbmdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gVGhlc2UgZnVuY3Rpb25zIGFyZSBjYWxsZWQgZGlyZWN0bHkgZW1iZWRkZWQgaW50byB0aGUgaHRtbC4uLiBraW5kYSB3ZWlyZFxyXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICByZXF1ZXN0U3luY1dpdGhVc2VyID0gKHVzZXJJZCkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdyZXF1ZXN0IHN5bmMgd2l0aCB1c2VyJyk7XHJcblxyXG4gICAgICAgIHZhciB1c2VyID0gbmV3IE15VXNlcigpO1xyXG4gICAgICAgIHVzZXIuSWQgPSB1c2VySWQ7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5BY3Rpb24gPSAnUmVxdWVzdFN5bmNXaXRoVXNlcic7XHJcbiAgICAgICAgbWVzc2FnZS5Vc2VyID0gdXNlcjtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHVpUXVldWVNZWRpYSA9IChtZWRpYTogTWVkaWEpID0+IHtcclxuICAgICAgICBtZWRpYS5Vc2VySWQgPSB0aGlzLnVzZXIuSWQ7XHJcbiAgICAgICAgbWVkaWEuVXNlck5hbWUgPSB0aGlzLnVzZXIuTmFtZTtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdBZGRNZWRpYVRvU2Vzc2lvbic7XHJcbiAgICAgICAgbWVzc2FnZS5NZWRpYSA9IG1lZGlhO1xyXG4gICAgICAgIC8vVE9ETzogbG9jYWwgYWRkIG1lZGlhXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBkZWxldGVNZWRpYSA9IChtZWRpYUlkOiBudW1iZXIsIHBvc2l0aW9uOiBudW1iZXIpID0+IHtcclxuXHJcbiAgICAgICAgdGhpcy5zZXNzaW9uLlF1ZXVlLnNwbGljZShwb3NpdGlvbiwgMSk7XHJcbiAgICAgICAgaWYgKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID49IHBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIC09IDE7XHJcbiAgICAgICAgICAgIHRoaXMub25Vc2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVRdWV1ZSh0aGlzLnNlc3Npb24uUXVldWUsIHRoaXMudXNlci5JZCwgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG5cclxuICAgICAgICB2YXIgbWVkaWFUb0RlbGV0ZSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgICAgIG1lZGlhVG9EZWxldGUuSWQgPSBtZWRpYUlkO1xyXG5cclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdEZWxldGVNZWRpYUZyb21TZXNzaW9uJztcclxuICAgICAgICBtZXNzYWdlLk1lZGlhID0gbWVkaWFUb0RlbGV0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmRlY2xhcmUgdmFyIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbmRlY2xhcmUgdmFyIHJvb21UeXBlOiBzdHJpbmc7XHJcbmRlY2xhcmUgdmFyIHJvb21OYW1lOiBzdHJpbmc7XHJcblxyXG52YXIgbVJvb21NYW5hZ2VyID0gbmV3IFJvb21NYW5hZ2VyKHJvb21UeXBlLCBtb2JpbGVCcm93c2VyKTtcclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgbVJvb21NYW5hZ2VyLmluaXQocm9vbU5hbWUpO1xyXG59KTtcclxuXHJcblxyXG4iLCLvu79pbXBvcnQgeyBXc01lc3NhZ2UgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50QWN0aW9ucyB7XHJcblxyXG4gICAgY2xpZW50U2Vzc2lvblJlYWR5OiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50VXBkYXRlVXNlcnNMaXN0OiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50VXBkYXRlUXVldWU6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRDaGF0TWVzc2FnZTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFJlcXVlc3RVc2VyU3RhdGU6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRQcm92aWRlVXNlclN0YXRlOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50U2VhcmNoUmVzdWx0czogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNeVNvY2tldCB7XHJcblxyXG4gICAgcHJpdmF0ZSBzb2NrZXQ6IFdlYlNvY2tldDtcclxuICAgIHByaXZhdGUgY2xpZW50QWN0aW9uczogQ2xpZW50QWN0aW9ucztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjbGllbnRBY3Rpb25zOiBDbGllbnRBY3Rpb25zKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xpZW50QWN0aW9ucyA9IGNsaWVudEFjdGlvbnM7XHJcblxyXG4gICAgICAgIHZhciB1cmkgPSBcIndzOi8vXCIgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArIFwiL3dzXCI7XHJcbiAgICAgICAgdmFyIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQodXJpKTtcclxuICAgICAgICBzb2NrZXQub25vcGVuID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuICAgICAgICBzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uIChldmVudCkge307XHJcblxyXG4gICAgICAgIHNvY2tldC5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gbWVzc2FnZS5BY3Rpb247XHJcbiAgICAgICAgICAgIGlmIChjbGllbnRBY3Rpb25zW2FjdGlvbl0pIHtcclxuICAgICAgICAgICAgICAgIGNsaWVudEFjdGlvbnNbYWN0aW9uXShtZXNzYWdlKTsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJiYWQgY2xpZW50IGFjdGlvblwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGhhbmRsZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBlbWl0KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSB0aGlzLnNvY2tldC5DT05ORUNUSU5HKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9LCA1MCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XHJcbiAgICB9O1xyXG5cclxufVxyXG4iLCLvu79pbXBvcnQgeyBGcmFtZUJ1aWxkZXIgfSBmcm9tIFwiLi9GcmFtZUJ1aWxkZXJcIjtcclxuaW1wb3J0IHsgTWVkaWEgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmRlY2xhcmUgdmFyIFNwaW5uZXI6IGFueTtcclxuXHJcbi8vIFRPRE86IG1ha2UgdGhpcyBhbiBpbnRlcmZhY2VcclxuZXhwb3J0IGludGVyZmFjZSBVSUNhbGxiYWNrcyB7XHJcbiAgICB1aVByZXZpb3VzTWVkaWE6IGFueTtcclxuICAgIHVpTmV4dE1lZGlhOiBhbnk7XHJcbiAgICB1aVBsYXlNZWRpYTogYW55O1xyXG4gICAgdWlQYXVzZU1lZGlhOiBhbnk7XHJcbiAgICB1aVNlbmRDaGF0TWVzc2FnZTogYW55O1xyXG4gICAgdWlTZWFyY2g6IChxdWVyeTogc3RyaW5nKSA9PiB2b2lkO1xyXG4gICAgdWlOYW1lQ2hhbmdlOiBhbnk7XHJcbiAgICB1aVF1ZXVlTWVkaWE6IChtZWRpYTogTWVkaWEpID0+IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVSSB7XHJcblxyXG4gICAgcHJpdmF0ZSBjb2xvcnM6IGFueTtcclxuICAgIHByaXZhdGUgc3Bpbm5lcjogYW55O1xyXG4gICAgcHJpdmF0ZSBjYWxsYmFja3M6IFVJQ2FsbGJhY2tzO1xyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBmcmFtZUJ1aWxkZXI6IEZyYW1lQnVpbGRlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuLCBjYWxsYmFja3M6IFVJQ2FsbGJhY2tzKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvcnMgPSBbJ3JlZCcsICdvcmFuZ2UnLCAneWVsbG93JywgJ2dyZWVuJywgJ2JsdWUnLCAndmlvbGV0J107XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgICAgICB0aGlzLmZyYW1lQnVpbGRlciA9IG5ldyBGcmFtZUJ1aWxkZXIobW9iaWxlQnJvd3Nlcik7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSBjYWxsYmFja3M7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplKCkge1xyXG4gICAgICAgIHRoaXMuc2V0dXBTcGlubmVyVUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwSW5mb1JvbGxvdmVyVUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwSW5wdXRVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBQbGF5ZXJDb250cm9sQnV0dG9ucygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXNzaW9uUmVhZHkgPSAoKSA9PiB7XHJcbiAgICAgICAgJChcIiNkaXZfbG9hZGluZ1wiKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zcGlubmVyLnN0b3AoKTtcclxuICAgICAgICAkKFwiI2Rpdl9ldmVyeXRoaW5nXCIpLmFuaW1hdGUoe29wYWNpdHk6IDF9LCAnZmFzdCcpO1xyXG4gICAgfSBcclxuXHJcbiAgICBwcml2YXRlIHNldHVwU3Bpbm5lclVJKCkge1xyXG4gICAgICAgIHZhciBvcHRzID0ge1xyXG4gICAgICAgICAgICBsaW5lczogMTMgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XHJcbiAgICAgICAgICAgICwgbGVuZ3RoOiAyOCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxyXG4gICAgICAgICAgICAsIHdpZHRoOiAxNCAvLyBUaGUgbGluZSB0aGlja25lc3NcclxuICAgICAgICAgICAgLCByYWRpdXM6IDQyIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxyXG4gICAgICAgICAgICAsIHNjYWxlOiAxIC8vIFNjYWxlcyBvdmVyYWxsIHNpemUgb2YgdGhlIHNwaW5uZXJcclxuICAgICAgICAgICAgLCBjb3JuZXJzOiAxIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXHJcbiAgICAgICAgICAgICwgY29sb3I6ICcjMDAwJyAvLyAjcmdiIG9yICNycmdnYmIgb3IgYXJyYXkgb2YgY29sb3JzXHJcbiAgICAgICAgICAgICwgb3BhY2l0eTogMC4yNSAvLyBPcGFjaXR5IG9mIHRoZSBsaW5lc1xyXG4gICAgICAgICAgICAsIHJvdGF0ZTogMCAvLyBUaGUgcm90YXRpb24gb2Zmc2V0XHJcbiAgICAgICAgICAgICwgZGlyZWN0aW9uOiAxIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcclxuICAgICAgICAgICAgLCBzcGVlZDogMSAvLyBSb3VuZHMgcGVyIHNlY29uZFxyXG4gICAgICAgICAgICAsIHRyYWlsOiA2MCAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxyXG4gICAgICAgICAgICAsIGZwczogMjAgLy8gRnJhbWVzIHBlciBzZWNvbmQgd2hlbiB1c2luZyBzZXRUaW1lb3V0KCkgYXMgYSBmYWxsYmFjayBmb3IgQ1NTXHJcbiAgICAgICAgICAgICwgekluZGV4OiAyZTkgLy8gVGhlIHotaW5kZXggKGRlZmF1bHRzIHRvIDIwMDAwMDAwMDApXHJcbiAgICAgICAgICAgICwgY2xhc3NOYW1lOiAnc3Bpbm5lcicgLy8gVGhlIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIHNwaW5uZXJcclxuICAgICAgICAgICAgLCB0b3A6ICc1MCUnIC8vIFRvcCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcclxuICAgICAgICAgICAgLCBsZWZ0OiAnNTAlJyAvLyBMZWZ0IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIHNoYWRvdzogZmFsc2UgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcclxuICAgICAgICAgICAgLCBod2FjY2VsOiBmYWxzZSAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb25cclxuICAgICAgICAgICAgLCBwb3NpdGlvbjogJ2Fic29sdXRlJyAvLyBFbGVtZW50IHBvc2l0aW9uaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2X2xvYWRpbmcnKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihvcHRzKS5zcGluKHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cEZhZGVVSShvdmVyYWxsLCByZXN1bHRzKSB7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWVudGVyKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mYWRlSW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG92ZXJhbGwubW91c2VsZWF2ZSgoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwSW5mb1JvbGxvdmVyVUkoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl91c2Vyc19vdmVyYWxsXCIpLCAkKFwiI2Rpdl91c2VyX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X3F1ZXVlX292ZXJhbGxcIiksICQoXCIjZGl2X3F1ZXVlX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X2NoYXRfb3ZlcmFsbFwiKSwgJChcIiNkaXZfY2hhdF9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9jY19vdmVyYWxsXCIpLCAkKFwiI2Rpdl9jY19yZXN1bHRzXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWFyY2hUZXh0Q2hhbmdlZCh0ZXh0KSB7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBpZih0ZXh0Lmxlbmd0aD09MCkge1xyXG4gICAgICAgICAgICBkaXZSZXN1bHRzLmZhZGVPdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cElucHV0VUkoKSB7XHJcbiAgICAgICAgdmFyIGlucHV0U2VhcmNoID0gJChcIiNpbnB1dF9zZWFyY2hcIik7XHJcbiAgICAgICAgaW5wdXRTZWFyY2gua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoRW50ZXJQcmVzc2VkKGlucHV0U2VhcmNoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBpbnB1dF9uYW1lID0gJChcIiNpbnB1dF9uYW1lXCIpO1xyXG4gICAgICAgIGlucHV0X25hbWUua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlck5hbWVDaGFuZ2UoaW5wdXRfbmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB2YXIgaW5wdXRfY2hhdCA9ICQoXCIjaW5wdXRfY2hhdFwiKTtcclxuICAgICAgICAgICAgaW5wdXRfY2hhdC5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVNlbmRDaGF0TWVzc2FnZShpbnB1dF9jaGF0LnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dF9jaGF0LnZhbChcIlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcclxuICAgICAgICAgICAgJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIikuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoXCJcIik7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuYmluZChcInByb3BlcnR5Y2hhbmdlIGlucHV0IHBhc3RlXCIsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaFRleHRDaGFuZ2VkKCQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbCgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwUGxheWVyQ29udHJvbEJ1dHRvbnMoKSB7XHJcbiAgICAgICAgJChcIiNidG5fcHJldmlvdXNcIikuY2xpY2sodGhpcy5jYWxsYmFja3MudWlQcmV2aW91c01lZGlhKTtcclxuICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BhdXNlXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgJChcIiNidG5fcGxheVwiKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpUGF1c2VNZWRpYSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoXCIjYnRuX3BsYXlcIikuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wbGF5XCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgJChcIiNidG5fcGF1c2VcIikuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVBsYXlNZWRpYSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoXCIjYnRuX25leHRcIikuY2xpY2sodGhpcy5jYWxsYmFja3MudWlOZXh0TWVkaWEpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvblNlYXJjaFJlc3VsdHMocmVzdWx0czogTWVkaWFbXSkge1xyXG4gICAgICAgIHZhciBkaXZSZXN1bHRzID0gJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgZGl2UmVzdWx0cy5odG1sKFwiXCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBtZWRpYSA9IHJlc3VsdHNbaV07XHJcbiAgICAgICAgICAgIHZhciBkaXZTZWFyY2hSZXN1bHQgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICAgICAgZGl2U2VhcmNoUmVzdWx0LmFkZENsYXNzKCdkaXZfc2VhcmNoX3Jlc3VsdCcpO1xyXG4gICAgICAgICAgICBkaXZTZWFyY2hSZXN1bHQuYXBwZW5kVG8oZGl2UmVzdWx0cyk7XHJcbiAgICAgICAgICAgIGRpdlNlYXJjaFJlc3VsdC5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVF1ZXVlTWVkaWEobWVkaWEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyIHBSZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICQocFJlc3VsdCkuYWRkQ2xhc3MoJ3RleHRfc2VhcmNoX3Jlc3VsdCcpO1xyXG4gICAgICAgICAgICAkKHBSZXN1bHQpLmFwcGVuZFRvKGRpdlNlYXJjaFJlc3VsdCk7XHJcbiAgICAgICAgICAgICQocFJlc3VsdCkudGV4dChtZWRpYS5UaXRsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmJsdXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlQ3VycmVudENvbnRlbnQobWVkaWE6IE1lZGlhKSB7XHJcbiAgICAgICAgJChcIiNwX2NjX3N1bW1hcnlcIikudGV4dChtZWRpYS5UaXRsZSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGh0bWwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpbWcgc3R5bGU9XCJoZWlnaHQ6IDkwcHg7IHdpZHRoOiAxNjBweDsgbWFyZ2luLXJpZ2h0OiAxNnB4O1wiIHNyYz1cIicgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7XCI+JyArIG1lZGlhLlRpdGxlICsgJzxicj4nICsgJ1JlY29tbWVuZGVkIGJ5OiAnICsgbWVkaWEuVXNlck5hbWUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikuaHRtbChodG1sKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWFyY2hFbnRlclByZXNzZWQoaW5wdXRfc2VhcmNoKSB7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MudWlTZWFyY2goaW5wdXRfc2VhcmNoLnZhbCgpKTtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuaHRtbChcIjxwPnNlYXJjaGluZzwvcD5cIik7XHJcbiAgICAgICAgZGl2UmVzdWx0cy5mYWRlSW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlUXVldWUocXVldWU6IE1lZGlhW10sIHVzZXJJZE1lOiBudW1iZXIsIHF1ZXVlUG9zaXRpb246IG51bWJlcikge1xyXG4gICAgICAgIHZhciBsZW5ndGggPSBxdWV1ZS5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHN1bW1hcnkgPSBsZW5ndGggKyBcIiB0aGluZ3MgaW4gdGhlIHBsYXlsaXN0XCI7XHJcbiAgICAgICAgaWYgKGxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSBsZW5ndGggKyBcIiB0aGluZyBpbiB0aGUgcGxheWxpc3RcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IFwiTm90aGluZyBpbiB0aGUgcGxheWxpc3QuIFF1ZXVlIHNvbWV0aGluZyFcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJChcIiNwX3F1ZXVlX3N1bW1hcnlcIikudGV4dChzdW1tYXJ5KTtcclxuXHJcbiAgICAgICAgdmFyIHF1ZXVlUmVzdWx0cyA9ICQoXCIjZGl2X3F1ZXVlX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgdmFyIGh0bWwgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBtZWRpYSA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgICB2YXIgb25UaGlzID0gaSA9PT0gcXVldWVQb3NpdGlvbjtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gdGhpcy5mcmFtZUJ1aWxkZXIubWVkaWEobWVkaWEsIGksIG1lZGlhLlVzZXJJZCA9PT0gdXNlcklkTWUsIG9uVGhpcyk7XHJcbiAgICAgICAgICAgIGh0bWwucHVzaChjdXJyZW50SFRNTCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBxdWV1ZVJlc3VsdHMuaHRtbChodG1sLmpvaW4oXCJcIikpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlVXNlcnNMaXN0KHVzZXJzLCB1c2VySWRNZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG51bSA9IHVzZXJzLmxlbmd0aDtcclxuICAgICAgICB2YXIgc3VtbWFyeSA9IHVzZXJzLmxlbmd0aCArIFwiIHVzZXJzIGluIHRoZSByb29tXCI7XHJcbiAgICAgICAgaWYgKG51bSA9PSAxKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSB1c2Vycy5sZW5ndGggKyBcIiB1c2VyIGluIHRoZSByb29tXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjcF91c2Vyc19zdW1tYXJ5XCIpLnRleHQoc3VtbWFyeSk7XHJcbiAgICAgICAgdmFyIHVzZXJSZXN1bHRzID0gJChcIiNkaXZfdXNlcl9yZXN1bHRzXCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdXNlciA9IHVzZXJzW2ldO1xyXG4gICAgICAgICAgICB2YXIgdGhpc0lzTWUgPSAodXNlci5JZCA9PT0gdXNlcklkTWUpO1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudEhUTUwgPSB0aGlzLmZyYW1lQnVpbGRlci51c2VyKHRoaXMuY29sb3JzW2kgJSB0aGlzLmNvbG9ycy5sZW5ndGhdLCB1c2VyLklkLCB1c2VyLk5hbWUsIHRoaXNJc01lKTtcclxuICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdXNlclJlc3VsdHMuaHRtbChodG1sLmpvaW4oXCJcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyTmFtZUNoYW5nZShuYW1lX2lucHV0KSB7XHJcbiAgICAgICAgbmFtZV9pbnB1dC5oaWRlKCk7XHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuZmFkZUluKCk7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MudWlOYW1lQ2hhbmdlKG5hbWVfaW5wdXQudmFsKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkNoYXRNZXNzYWdlKHVzZXJOYW1lOiBzdHJpbmcsIG1zZzogc3RyaW5nLCBjb2xvcjogc3RyaW5nKSB7XHJcbiAgICAgICAgLy9UT0RPOiBjb2xvciBzdHVmZlxyXG4gICAgICAgIHZhciB1bF9jaGF0ID0gJChcIiN1bF9jaGF0XCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gJzxsaSBjbGFzcz1cImNoYXRcIj48c3BhbiBzdHlsZT1cIm1hcmdpbjogMDsgY29sb3I6ICcgKyBjb2xvciArICc7XCI+JyArIHVzZXJOYW1lICsgJzogPC9zcGFuPjxzcGFuPicgKyBtc2cgKyAnPC9zcGFuPjwvbGk+JztcclxuICAgICAgICB1bF9jaGF0LmFwcGVuZChodG1sKTtcclxuICAgICAgICBpZiAodWxfY2hhdC5sZW5ndGggPj0gMTApIHtcclxuICAgICAgICAgICAgdWxfY2hhdC5jaGlsZHJlbigpWzBdLnJlbW92ZSgpOyBcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCLvu79kZWNsYXJlIHZhciBZVDogYW55O1xyXG5cclxuaW1wb3J0IHsgSVBsYXllciB9IGZyb20gXCIuL0lQbGF5ZXJcIjtcclxuaW1wb3J0IHsgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBVSSB9IGZyb20gXCIuL1VJXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgWXRQbGF5ZXIgaW1wbGVtZW50cyBJUGxheWVyIHtcclxuXHJcbiAgICBwcml2YXRlIHl0UGxheWVyOiBhbnk7XHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIHVpOiBVSTtcclxuICAgIHB1YmxpYyBwbGF5ZXJSZWFkeTogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih1aTogVUksIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLnBsYXllclJlYWR5ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgICAgICB0aGlzLnVpID0gdWk7XHJcbiAgICAgICAgJChcIiNkaXZfeXRfcGxheWVyXCIpLnNob3coKTtcclxuICAgICAgICAkKFwiI2Rpdl9wb2RjYXN0X3BsYXllclwiKS5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSkge1xyXG4gICAgICAgIGlmIChZVCAmJiBZVC5QbGF5ZXIpIHtcclxuICAgICAgICAgICAgdGhpcy55dFBsYXllciA9IG5ldyBZVC5QbGF5ZXIoJ2Rpdl95dF9wbGF5ZXInLCB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICdhdXRvJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJWYXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbHM6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvd2luZm86IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0b3BsYXk6IDBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBldmVudHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnb25SZWFkeScgOiB0aGlzLm9uUGxheWVyUmVhZHksXHJcbiAgICAgICAgICAgICAgICAgICAgJ29uU3RhdGVDaGFuZ2UnOiBvblBsYXllclN0YXRlQ2hhbmdlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuaW5pdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKSB9LCA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRpdl9wbGF5ZXIgPSAkKFwiI2Rpdl95dF9wbGF5ZXJcIik7XHJcbiAgICAgICAgICAgIGRpdl9wbGF5ZXIuaGVpZ2h0KGRpdl9wbGF5ZXIud2lkdGgoKSAqIDkuMCAvIDE2LjApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25QbGF5ZXJSZWFkeSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnBsYXllclJlYWR5ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0UGxheWVyQ29udGVudChtZWRpYTogTWVkaWEsIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgIGlmICghdGhpcy5wbGF5ZXJSZWFkeSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygncGxheWVyIG5vdCByZWFkeSEnKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuc2V0UGxheWVyQ29udGVudChtZWRpYSwgdGltZSkgfSwgNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy55dFBsYXllci5sb2FkVmlkZW9CeUlkKG1lZGlhLllUVmlkZW9JRCwgdGltZSwgXCJsYXJnZVwiKTtcclxuICAgICAgICAgICAgdGhpcy51aS51cGRhdGVDdXJyZW50Q29udGVudChtZWRpYSk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGxheSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBsYXlWaWRlbygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYXVzZSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBhdXNlVmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFRpbWUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDdXJyZW50U3RhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLnl0UGxheWVyLmdldFBsYXllclN0YXRlKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc1N0b3BwZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFN0YXRlKCkgPT0gMDtcclxuICAgIH1cclxuXHJcbn0iXX0=
