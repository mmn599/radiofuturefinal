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
        this.onPlayerStateChange = function (event) {
            if (event.data == 0) {
                _this.uiNextMedia();
            }
        };
        this.uiNextMedia = function () {
            var queue = _this.session.Queue;
            if (_this.user.State.QueuePosition + 1 < queue.length) {
                _this.user.State.Time = 0;
                _this.user.State.QueuePosition += 1;
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
            _this.user.State.Time = 0;
            var queue = _this.session.Queue;
            if (_this.user.State.QueuePosition > 0) {
                _this.user.State.QueuePosition = _this.user.State.QueuePosition - 1;
                _this.onUserStateChange();
            }
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
            this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9GcmFtZUJ1aWxkZXIudHMiLCJUeXBlU2NyaXB0cy9Qb2RjYXN0UGxheWVyLnRzIiwiVHlwZVNjcmlwdHMvUm9vbS50cyIsIlR5cGVTY3JpcHRzL1NvY2tldHMudHMiLCJUeXBlU2NyaXB0cy9VSS50cyIsIlR5cGVTY3JpcHRzL1l0UGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQztJQUFBO0lBU0QsQ0FBQztJQUFELFlBQUM7QUFBRCxDQVRDLEFBU0EsSUFBQTtBQVRhLHNCQUFLO0FBV25CO0lBRUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUtMLGFBQUM7QUFBRCxDQVRBLEFBU0MsSUFBQTtBQVRZLHdCQUFNO0FBV25CO0lBRUk7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUtMLGdCQUFDO0FBQUQsQ0FYQSxBQVdDLElBQUE7QUFYWSw4QkFBUztBQWF0QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDeEN0QjtJQUlJLHNCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSwyQkFBSSxHQUFYLFVBQVksS0FBYSxFQUFFLE1BQWMsRUFBRSxRQUFnQixFQUFFLFFBQWlCO1FBQzFFLElBQUksV0FBVyxHQUFHLEVB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Q0FBQyxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNqQyxVQUFVLENBQUMsY0FBUSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0lBRU0sdUJBQUksR0FBWDtRQUNJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVNLHdCQUFLLEdBQVo7UUFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFTSxpQ0FBYyxHQUFyQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sa0NBQWUsR0FBdEI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLDRCQUFTLEdBQWhCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVMLGVBQUM7QUFBRCxDQTVFQSxBQTRFQyxJQUFBO0FBNUVZLDRCQUFRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7v2V4cG9ydCBjbGFzcyBNZWRpYSB7XHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgVXNlcklkOiBudW1iZXI7XHJcbiAgICBVc2VyTmFtZTogc3RyaW5nO1xyXG4gICAgWVRWaWRlb0lEOiBudW1iZXI7XHJcbiAgICBNUDNTb3VyY2U6IHN0cmluZztcclxuICAgIE9HR1NvdXJjZTogc3RyaW5nO1xyXG4gICAgVGl0bGU6IHN0cmluZztcclxuICAgIFRodW1iVVJMOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNeVVzZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuU3RhdGUgPSBuZXcgVXNlclN0YXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIFN0YXRlOiBVc2VyU3RhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVc2VyU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuVGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5RdWV1ZVBvc2l0aW9uID0gLTE7XHJcbiAgICAgICAgdGhpcy5QbGF5ZXJTdGF0ZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgVGltZTogbnVtYmVyO1xyXG4gICAgUXVldWVQb3NpdGlvbjogbnVtYmVyO1xyXG4gICAgUGxheWVyU3RhdGU6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNlc3Npb24ge1xyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIFVzZXJzOiBNeVVzZXJbXTtcclxuICAgIFF1ZXVlOiBNZWRpYVtdO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV3NNZXNzYWdlIHtcclxuICAgIEFjdGlvbjogc3RyaW5nO1xyXG4gICAgU2Vzc2lvbjogU2Vzc2lvbjtcclxuICAgIE1lZGlhOiBNZWRpYTtcclxuICAgIFVzZXI6IE15VXNlcjtcclxuICAgIENoYXRNZXNzYWdlOiBzdHJpbmc7XHJcbn0iLCLvu79pbXBvcnQgeyBNZWRpYSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZyYW1lQnVpbGRlciB7XHJcblxyXG4gICAgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXNlcihjb2xvcjogc3RyaW5nLCB1c2VySWQ6IG51bWJlciwgdXNlck5hbWU6IHN0cmluZywgdGhpc0lzTWU6IGJvb2xlYW4pIDogc3RyaW5nIHtcclxuICAgICAgICB2YXIgY3VycmVudEhUTUwgPSBcIlwiO1xyXG4gICAgICAgIHZhciBtZUh0bWwgPSB0aGlzSXNNZSA/ICdvbmNsaWNrPVwicmVxdWVzdFN5bmNXaXRoVXNlcignICsgdXNlcklkICsgJylcIiAnIDogXCJcIjtcclxuICAgICAgICB2YXIgc3luY0hUTUwgPSB0aGlzSXNNZSA/ICd5b3UnIDogJ3N5bmMnO1xyXG4gICAgICAgIHZhciBzeW5jSFRNTE1vYmlsZSA9IHRoaXNJc01lID8gJ3lvdScgOiAnc3luYyB3aXRoICcgKyB1c2VyTmFtZTtcclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gJzxkaXYgJyArIG1lSHRtbCArICdjbGFzcz1cImRpdl91c2VyXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAnICsgY29sb3IgKyAnO1wiPiAnICsgc3luY0hUTUxNb2JpbGUgKyAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID1cclxuICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2ICcgKyBtZUh0bWwgKyAnc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgZmxvYXQ6IGxlZnQ7IGN1cnNvcjogcG9pbnRlcjsgbWFyZ2luLXJpZ2h0OiAxNnB4OyBoZWlnaHQ6IDQ4cHg7IHdpZHRoOiA0OHB4OyBiYWNrZ3JvdW5kOiAnICsgY29sb3IgKyAnO1wiPicgKyBzeW5jSFRNTCArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7IGZsb2F0OiByaWdodDtcIj4nICsgdXNlck5hbWUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbWVkaWEobWVkaWE6IE1lZGlhLCBwb3NpdGlvbjogbnVtYmVyLCByZWNvbW1lbmRlZEJ5TWU6IGJvb2xlYW4sIG9uVGhpczogYm9vbGVhbikge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgdmFyIGNhbkRlbGV0ZVRoaXMgPSByZWNvbW1lbmRlZEJ5TWU7IC8vJiYgIW9uVGhpcztcclxuICAgICAgICB2YXIgZGVsZXRlVGhpc0hUTUwgPSBjYW5EZWxldGVUaGlzID8gJ3RpdGxlPVwiQ2xpY2sgdG8gZGVsZXRlIHRoaXMgZnJvbSB0aGUgcXVldWUhXCIgb25jbGljaz1cImRlbGV0ZU1lZGlhKCcgKyBtZWRpYS5JZCArICcsICcgKyBwb3NpdGlvbiArICcpXCIgJyA6IFwiXCI7XHJcbiAgICAgICAgdmFyIGNhbkRlbGV0ZVN0eWxlID0gY2FuRGVsZXRlVGhpcyA/IFwiY3Vyc29yOiBwb2ludGVyOyBcIiA6IFwiXCI7XHJcbiAgICAgICAgdmFyIG9uVGhpc1N0eWxlID0gb25UaGlzID8gXCJib3JkZXI6IDFweCBzb2xpZCBibHVlOyBcIiA6IFwiXCI7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogYWRkIGRlbGV0ZSBVSVxyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8aW1nIHN0eWxlPVwiJyArIG9uVGhpc1N0eWxlICsgJ2Zsb2F0OiBsZWZ0OyB3aWR0aDogMzMuMzMlOyBoZWlnaHQ6IDIwdnc7XCIgc3JjPVwiJyAgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID1cclxuICAgICAgICAgICAgICAgICc8ZGl2ICcgKyBkZWxldGVUaGlzSFRNTCArICdzdHlsZT1cIicgKyBjYW5EZWxldGVTdHlsZSArIG9uVGhpc1N0eWxlICsgJ3RleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxpbWcgc3R5bGU9XCJoZWlnaHQ6IDkwcHg7IHdpZHRoOiAxNjBweDsgbWFyZ2luLXJpZ2h0OiAxNnB4O1wiIHNyYz1cIicgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4O1wiPicgKyBtZWRpYS5UaXRsZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRIVE1MO1xyXG4gICAgfVxyXG59Iiwi77u/ZGVjbGFyZSB2YXIgWVQ6IGFueTtcclxuXHJcbmltcG9ydCB7IElQbGF5ZXIgfSBmcm9tIFwiLi9JUGxheWVyXCI7XHJcbmltcG9ydCB7IE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi9VSVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBvZGNhc3RQbGF5ZXIgaW1wbGVtZW50cyBJUGxheWVyIHtcclxuXHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGF1ZGlvOiBIVE1MQXVkaW9FbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBtcDNzb3VyY2U6IGFueTtcclxuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIHByaXZhdGUgdWk6IFVJO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHVpOiBVSSwgbW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMudWkgPSB1aTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgICAgIHRoaXMuYXVkaW8gPSA8SFRNTEF1ZGlvRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaHRtbDVhdWRpbycpO1xyXG4gICAgICAgIHRoaXMubXAzc291cmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wM1NvdXJjZScpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfcG9kY2FzdCcpO1xyXG4gICAgICAgICQoXCIjZGl2X3l0X3BsYXllclwiKS5oaWRlKCk7XHJcbiAgICAgICAgJChcIiNkaXZfcG9kY2FzdF9wbGF5ZXJcIikuc2hvdygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBhdWRpb1RpbWVVcGRhdGUoKSB7XHJcbiAgICAgICAgdmFyIHBlcmNlbnRhZ2UgPSB0aGlzLmF1ZGlvLmN1cnJlbnRUaW1lIC8gdGhpcy5hdWRpby5kdXJhdGlvbjtcclxuICAgICAgICB0aGlzLnVwZGF0ZVBsYXllclVJKHBlcmNlbnRhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRQbGF5ZXIgPSAob25QbGF5ZXJTdGF0ZUNoYW5nZSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XHJcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQbGF5ZXJVSSgwKTtcclxuICAgICAgICB0aGlzLmF1ZGlvLm9uZW5kZWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIG9uUGxheWVyU3RhdGVDaGFuZ2UoeyBkYXRhOiAwIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmF1ZGlvLm9udGltZXVwZGF0ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hdWRpb1RpbWVVcGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2luZSA9IChBLCBpLCBudW0pOiBudW1iZXIgPT4ge1xyXG4gICAgICAgIHJldHVybiBBICogTWF0aC5zaW4oKGkgLyAodGhpcy5jYW52YXMud2lkdGggLyBudW0pKSAqIDIgKiBNYXRoLlBJKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVQbGF5ZXJVSSA9IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHtcclxuICAgICAgICB2YXIgY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDI7XHJcbiAgICAgICAgdmFyIEEgPSAyMDA7XHJcbiAgICAgICAgdmFyIG51bSA9IDM7XHJcbiAgICAgICAgdmFyIG1pZCA9IE1hdGguZmxvb3IocGVyY2VudGFnZSAqIHRoaXMuY2FudmFzLndpZHRoKTtcclxuXHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiYmx1ZVwiO1xyXG4gICAgICAgIGN0eC5tb3ZlVG8oMCwgdGhpcy5jYW52YXMuaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtaWQ7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBjdHgubGluZVRvKGksIC0xICogdGhpcy5zaW5lKEEsIGksIG51bSkgKyB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSBtaWQ7IGkgPCB0aGlzLmNhbnZhcy53aWR0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGN0eC5saW5lVG8oaSwgLTEgKiB0aGlzLnNpbmUoQSwgaSwgbnVtKSArIHRoaXMuY2FudmFzLmhlaWdodCAvIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJibHVlXCI7XHJcbiAgICAgICAgY3R4LmFyYyhtaWQsIC0xICogdGhpcy5zaW5lKEEsIG1pZCwgbnVtKSArIHRoaXMuY2FudmFzLmhlaWdodCAvIDIsIDEwLCAwLCBNYXRoLlBJICogMiwgdHJ1ZSk7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQbGF5ZXJDb250ZW50ID0gKG1lZGlhOiBNZWRpYSwgdGltZTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tcDNzb3VyY2Uuc2V0QXR0cmlidXRlKCdzcmMnLCBtZWRpYS5NUDNTb3VyY2UpO1xyXG4gICAgICAgIHRoaXMuYXVkaW8ubG9hZCgpO1xyXG4gICAgICAgIHRoaXMuYXVkaW8ucGxheSgpO1xyXG4gICAgICAgIHRoaXMudWkudXBkYXRlQ3VycmVudENvbnRlbnQobWVkaWEpO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXkgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hdWRpby5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcGF1c2UgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hdWRpby5wYXVzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnRUaW1lID0gKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmF1ZGlvLmN1cnJlbnRUaW1lO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnRTdGF0ZSA9ICgpID0+IHtcclxuICAgICAgICBpZiAodGhpcy5hdWRpby5wYXVzZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNTdG9wcGVkID0gKCkgOiBib29sZWFuID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hdWRpby5jdXJyZW50VGltZSA+PSB0aGlzLmF1ZGlvLmR1cmF0aW9uO1xyXG4gICAgfVxyXG5cclxufSIsIu+7v2ltcG9ydCB7IE15VXNlciwgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSwgV3NNZXNzYWdlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcbmltcG9ydCB7IFVJQ2FsbGJhY2tzLCBVSSB9IGZyb20gXCIuL1VJXCI7XHJcbmltcG9ydCB7IE15U29ja2V0LCBDbGllbnRBY3Rpb25zIH0gZnJvbSBcIi4vU29ja2V0c1wiO1xyXG5pbXBvcnQgeyBJUGxheWVyIH0gZnJvbSBcIi4vSVBsYXllclwiO1xyXG5pbXBvcnQgeyBQb2RjYXN0UGxheWVyIH0gZnJvbSBcIi4vUG9kY2FzdFBsYXllclwiO1xyXG5pbXBvcnQgeyBZdFBsYXllciB9IGZyb20gXCIuL1l0UGxheWVyXCI7XHJcblxyXG5jbGFzcyBSb29tTWFuYWdlciBpbXBsZW1lbnRzIFVJQ2FsbGJhY2tzLCBDbGllbnRBY3Rpb25zIHtcclxuXHJcbiAgICB1c2VyOiBNeVVzZXI7XHJcbiAgICBzZXNzaW9uOiBTZXNzaW9uO1xyXG4gICAgcGxheWVyOiBJUGxheWVyOyBcclxuICAgIHNvY2tldDogTXlTb2NrZXQ7XHJcbiAgICB1aTogVUk7XHJcbiAgICByb29tVHlwZTogc3RyaW5nO1xyXG4gICAgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb29tVHlwZTogc3RyaW5nLCBtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgLy8gVE9ETzogZmluZCBhIGJldHRlciB3YXkgdG8gZXhwb3NlIHRoZXNlIGZ1bmN0aW9ucyB0byBodG1sP1xyXG4gICAgICAgICg8YW55PndpbmRvdykucmVxdWVzdFN5bmNXaXRoVXNlciA9IHRoaXMucmVxdWVzdFN5bmNXaXRoVXNlcjtcclxuICAgICAgICAoPGFueT53aW5kb3cpLmRlbGV0ZU1lZGlhID0gdGhpcy5kZWxldGVNZWRpYTtcclxuICAgICAgICB0aGlzLnJvb21UeXBlID0gcm9vbVR5cGU7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdChlbmNvZGVkU2Vzc2lvbk5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMudXNlciA9IG5ldyBNeVVzZXIoKTtcclxuICAgICAgICB0aGlzLnNlc3Npb24gPSBuZXcgU2Vzc2lvbigpO1xyXG4gICAgICAgIHRoaXMudWkgPSBuZXcgVUkodGhpcy5tb2JpbGVCcm93c2VyLCB0aGlzKTtcclxuICAgICAgICBpZiAodGhpcy5yb29tVHlwZSA9PSBcInBvZGNhc3RzXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgUG9kY2FzdFBsYXllcih0aGlzLnVpLCB0aGlzLm1vYmlsZUJyb3dzZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgWXRQbGF5ZXIodGhpcy51aSwgdGhpcy5tb2JpbGVCcm93c2VyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgTXlTb2NrZXQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5zZXR1cEphbVNlc3Npb24oZW5jb2RlZFNlc3Npb25OYW1lKTtcclxuICAgICAgICB0aGlzLnBsYXllci5pbml0UGxheWVyKHRoaXMub25QbGF5ZXJTdGF0ZUNoYW5nZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0dXBKYW1TZXNzaW9uKGVuY29kZWRTZXNzaW9uTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uLk5hbWUgPSBkZWNvZGVVUkkoZW5jb2RlZFNlc3Npb25OYW1lKTtcclxuICAgICAgICB0aGlzLnVzZXIuTmFtZSA9ICdBbm9ueW1vdXMnO1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1VzZXJKb2luU2Vzc2lvbic7XHJcbiAgICAgICAgbWVzc2FnZS5Vc2VyID0gdGhpcy51c2VyO1xyXG4gICAgICAgIG1lc3NhZ2UuU2Vzc2lvbiA9IHRoaXMuc2Vzc2lvbjtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBXZWJTb2NrZXQgbWVzc2FnZSByZXNwb25zZSBmdW5jdGlvbnNcclxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgY2xpZW50UHJvdmlkZVVzZXJTdGF0ZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgdXNlclRvU3luY1dpdGggPSBtZXNzYWdlLlVzZXI7XHJcbiAgICAgICAgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5RdWV1ZVBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMudXNlci5TdGF0ZS5UaW1lID0gdXNlclRvU3luY1dpdGguU3RhdGUuVGltZTtcclxuICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUGxheWVyU3RhdGUgPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5QbGF5ZXJTdGF0ZTtcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVF1ZXVlKHRoaXMuc2Vzc2lvbi5RdWV1ZSwgdGhpcy51c2VyLklkLCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy5vblVzZXJTdGF0ZUNoYW5nZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFJlcXVlc3RVc2VyU3RhdGUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIHVzZXJEYXRhID0gbmV3IE15VXNlcigpO1xyXG4gICAgICAgIHVzZXJEYXRhLklkID0gbWVzc2FnZS5Vc2VyLklkOyAvLyBUT0RPOiBiYWQgYmFkIGJhZFxyXG4gICAgICAgIHVzZXJEYXRhLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgICAgICB1c2VyRGF0YS5TdGF0ZS5UaW1lID0gTWF0aC5yb3VuZCh0aGlzLnBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgICAgICB1c2VyRGF0YS5TdGF0ZS5QbGF5ZXJTdGF0ZSA9IHRoaXMucGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpO1xyXG5cclxuICAgICAgICB2YXIgb3V0Z29pbmdNc2cgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgb3V0Z29pbmdNc2cuQWN0aW9uID0gJ1Byb3ZpZGVTeW5jVG9Vc2VyJztcclxuICAgICAgICBvdXRnb2luZ01zZy5Vc2VyID0gdXNlckRhdGE7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChvdXRnb2luZ01zZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50U2Vzc2lvblJlYWR5KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHRoaXMuc2Vzc2lvbiA9IG1lc3NhZ2UuU2Vzc2lvbjtcclxuICAgICAgICB0aGlzLnVzZXIgPSBtZXNzYWdlLlVzZXI7XHJcbiAgICAgICAgdGhpcy51aU5leHRNZWRpYSgpO1xyXG4gICAgICAgIHRoaXMudWkudXBkYXRlUXVldWUodGhpcy5zZXNzaW9uLlF1ZXVlLCB0aGlzLnVzZXIuSWQsIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVVzZXJzTGlzdCh0aGlzLnNlc3Npb24uVXNlcnMsIHRoaXMudXNlci5JZCk7XHJcbiAgICAgICAgdGhpcy51aS5zZXNzaW9uUmVhZHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRVcGRhdGVVc2Vyc0xpc3QobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIHVzZXJzID0gbWVzc2FnZS5TZXNzaW9uLlVzZXJzO1xyXG4gICAgICAgIHRoaXMuc2Vzc2lvbi5Vc2VycyA9IHVzZXJzO1xyXG4gICAgICAgIHRoaXMudWkudXBkYXRlVXNlcnNMaXN0KHRoaXMuc2Vzc2lvbi5Vc2VycywgdGhpcy51c2VyLklkKTtcdFxyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFVwZGF0ZVF1ZXVlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciB3YXNXYWl0aW5nID0gdGhpcy5pc1VzZXJXYWl0aW5nKCk7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uLlF1ZXVlID0gbWVzc2FnZS5TZXNzaW9uLlF1ZXVlO1xyXG4gICAgICAgIGlmICh3YXNXYWl0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMudWlOZXh0TWVkaWEoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVRdWV1ZSh0aGlzLnNlc3Npb24uUXVldWUsIHRoaXMudXNlci5JZCwgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudENoYXRNZXNzYWdlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciBjaGF0TWVzc2FnZSA9IG1lc3NhZ2UuQ2hhdE1lc3NhZ2U7XHJcbiAgICAgICAgdmFyIHVzZXJOYW1lID0gbWVzc2FnZS5Vc2VyLk5hbWU7XHJcbiAgICAgICAgdGhpcy51aS5vbkNoYXRNZXNzYWdlKHVzZXJOYW1lLCBjaGF0TWVzc2FnZSwgJ2JsdWUnKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRTZWFyY2hSZXN1bHRzKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIC8vIFRPRE86IGR1bWJcclxuICAgICAgICB2YXIgcmVzdWx0cyA9IG1lc3NhZ2UuU2Vzc2lvbi5RdWV1ZTtcclxuICAgICAgICB0aGlzLnVpLm9uU2VhcmNoUmVzdWx0cyhyZXN1bHRzKTtcclxuICAgIH1cclxuXHJcbiAgICBpc1VzZXJXYWl0aW5nID0gKCk6IGJvb2xlYW4gPT4ge1xyXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5zZXNzaW9uLlF1ZXVlLmxlbmd0aDtcclxuICAgICAgICByZXR1cm4gcG9zIDwgMCB8fCAoKHBvcyA9PSAobGVuZ3RoIC0gMSkpICYmIHRoaXMucGxheWVyLmlzU3RvcHBlZCgpKTtcclxuICAgIH1cclxuXHJcbiAgICAvL1xyXG4gICAgLy8gTW9zdGx5IFVJIGNhbGxiYWNrIGZ1bmN0aW9uc1xyXG4gICAgLy9cclxuICAgIHVpU2VuZENoYXRNZXNzYWdlKG1zZzogc3RyaW5nKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5BY3Rpb24gPSAnQ2hhdE1lc3NhZ2UnO1xyXG4gICAgICAgIG1lc3NhZ2UuQ2hhdE1lc3NhZ2UgPSBtc2c7XHJcbiAgICAgICAgbWVzc2FnZS5Vc2VyID0gdGhpcy51c2VyO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25QbGF5ZXJTdGF0ZUNoYW5nZSA9IChldmVudCkgPT4ge1xyXG4gICAgICAgIGlmKGV2ZW50LmRhdGE9PTApIHtcclxuICAgICAgICAgICAgdGhpcy51aU5leHRNZWRpYSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1aVNlYXJjaChxdWVyeSkge1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1NlYXJjaCc7XHJcbiAgICAgICAgbWVzc2FnZS5DaGF0TWVzc2FnZSA9IHF1ZXJ5O1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdWlOYW1lQ2hhbmdlKG5ld05hbWUpIHtcclxuICAgICAgICB0aGlzLnVzZXIuTmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5Vc2VyID0gdGhpcy51c2VyO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1NhdmVVc2VyTmFtZUNoYW5nZSc7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBvblVzZXJTdGF0ZUNoYW5nZSgpIHtcclxuICAgICAgICBpZiAodGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPj0gMCAmJiB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA8IHRoaXMuc2Vzc2lvbi5RdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuc2V0UGxheWVyQ29udGVudCh0aGlzLnNlc3Npb24uUXVldWVbdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb25dLCB0aGlzLnVzZXIuU3RhdGUuVGltZSk7XHJcbiAgICAgICAgICAgIHRoaXMudWkudXBkYXRlUXVldWUodGhpcy5zZXNzaW9uLlF1ZXVlLCB0aGlzLnVzZXIuSWQsIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdWlOZXh0TWVkaWEgPSAoKSA9PiB7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gdGhpcy5zZXNzaW9uLlF1ZXVlO1xyXG4gICAgICAgIGlmKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMSA8IHF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICs9IDE7XHJcbiAgICAgICAgICAgIHRoaXMub25Vc2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdWlQYXVzZU1lZGlhID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucGxheWVyLnBhdXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdWlQbGF5TWVkaWEgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVpUHJldmlvdXNNZWRpYSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gdGhpcy5zZXNzaW9uLlF1ZXVlO1xyXG4gICAgICAgIGlmKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIC0gMTtcclxuICAgICAgICAgICAgdGhpcy5vblVzZXJTdGF0ZUNoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIFRoZXNlIGZ1bmN0aW9ucyBhcmUgY2FsbGVkIGRpcmVjdGx5IGVtYmVkZGVkIGludG8gdGhlIGh0bWwuLi4ga2luZGEgd2VpcmRcclxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgcmVxdWVzdFN5bmNXaXRoVXNlciA9ICh1c2VySWQpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygncmVxdWVzdCBzeW5jIHdpdGggdXNlcicpO1xyXG5cclxuICAgICAgICB2YXIgdXNlciA9IG5ldyBNeVVzZXIoKTtcclxuICAgICAgICB1c2VyLklkID0gdXNlcklkO1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1JlcXVlc3RTeW5jV2l0aFVzZXInO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHVzZXI7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICB1aVF1ZXVlTWVkaWEgPSAobWVkaWE6IE1lZGlhKSA9PiB7XHJcbiAgICAgICAgbWVkaWEuVXNlcklkID0gdGhpcy51c2VyLklkO1xyXG4gICAgICAgIG1lZGlhLlVzZXJOYW1lID0gdGhpcy51c2VyLk5hbWU7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5BY3Rpb24gPSAnQWRkTWVkaWFUb1Nlc3Npb24nO1xyXG4gICAgICAgIG1lc3NhZ2UuTWVkaWEgPSBtZWRpYTtcclxuICAgICAgICAvL1RPRE86IGxvY2FsIGFkZCBtZWRpYVxyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGVsZXRlTWVkaWEgPSAobWVkaWFJZDogbnVtYmVyLCBwb3NpdGlvbjogbnVtYmVyKSA9PiB7XHJcblxyXG4gICAgICAgIHRoaXMuc2Vzc2lvbi5RdWV1ZS5zcGxpY2UocG9zaXRpb24sIDEpO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA+PSBwb3NpdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiAtPSAxO1xyXG4gICAgICAgICAgICB0aGlzLm9uVXNlclN0YXRlQ2hhbmdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudWkudXBkYXRlUXVldWUodGhpcy5zZXNzaW9uLlF1ZXVlLCB0aGlzLnVzZXIuSWQsIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgdmFyIG1lZGlhVG9EZWxldGUgPSBuZXcgTWVkaWEoKTtcclxuICAgICAgICBtZWRpYVRvRGVsZXRlLklkID0gbWVkaWFJZDtcclxuXHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5BY3Rpb24gPSAnRGVsZXRlTWVkaWFGcm9tU2Vzc2lvbic7XHJcbiAgICAgICAgbWVzc2FnZS5NZWRpYSA9IG1lZGlhVG9EZWxldGU7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5kZWNsYXJlIHZhciBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5kZWNsYXJlIHZhciByb29tVHlwZTogc3RyaW5nO1xyXG5kZWNsYXJlIHZhciByb29tTmFtZTogc3RyaW5nO1xyXG5cclxudmFyIG1Sb29tTWFuYWdlciA9IG5ldyBSb29tTWFuYWdlcihyb29tVHlwZSwgbW9iaWxlQnJvd3Nlcik7XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgIG1Sb29tTWFuYWdlci5pbml0KHJvb21OYW1lKTtcclxufSk7XHJcblxyXG5cclxuIiwi77u/aW1wb3J0IHsgV3NNZXNzYWdlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENsaWVudEFjdGlvbnMge1xyXG5cclxuICAgIGNsaWVudFNlc3Npb25SZWFkeTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFVwZGF0ZVVzZXJzTGlzdDogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFVwZGF0ZVF1ZXVlOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50Q2hhdE1lc3NhZ2U6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRSZXF1ZXN0VXNlclN0YXRlOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50UHJvdmlkZVVzZXJTdGF0ZTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFNlYXJjaFJlc3VsdHM6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcblxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTXlTb2NrZXQge1xyXG5cclxuICAgIHByaXZhdGUgc29ja2V0OiBXZWJTb2NrZXQ7XHJcbiAgICBwcml2YXRlIGNsaWVudEFjdGlvbnM6IENsaWVudEFjdGlvbnM7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY2xpZW50QWN0aW9uczogQ2xpZW50QWN0aW9ucykge1xyXG5cclxuICAgICAgICB0aGlzLmNsaWVudEFjdGlvbnMgPSBjbGllbnRBY3Rpb25zO1xyXG5cclxuICAgICAgICB2YXIgdXJpID0gXCJ3czovL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyBcIi93c1wiO1xyXG4gICAgICAgIHZhciBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVyaSk7XHJcbiAgICAgICAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uIChldmVudCkge307XHJcbiAgICAgICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG5cclxuICAgICAgICBzb2NrZXQub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IG1lc3NhZ2UuQWN0aW9uO1xyXG4gICAgICAgICAgICBpZiAoY2xpZW50QWN0aW9uc1thY3Rpb25dKSB7XHJcbiAgICAgICAgICAgICAgICBjbGllbnRBY3Rpb25zW2FjdGlvbl0obWVzc2FnZSk7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYmFkIGNsaWVudCBhY3Rpb25cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBoYW5kbGVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZW1pdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICBpZiAodGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gdGhpcy5zb2NrZXQuQ09OTkVDVElORykge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSwgNTApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xyXG4gICAgfTtcclxuXHJcbn1cclxuIiwi77u/aW1wb3J0IHsgRnJhbWVCdWlsZGVyIH0gZnJvbSBcIi4vRnJhbWVCdWlsZGVyXCI7XHJcbmltcG9ydCB7IE1lZGlhIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5kZWNsYXJlIHZhciBTcGlubmVyOiBhbnk7XHJcblxyXG4vLyBUT0RPOiBtYWtlIHRoaXMgYW4gaW50ZXJmYWNlXHJcbmV4cG9ydCBpbnRlcmZhY2UgVUlDYWxsYmFja3Mge1xyXG4gICAgdWlQcmV2aW91c01lZGlhOiBhbnk7XHJcbiAgICB1aU5leHRNZWRpYTogYW55O1xyXG4gICAgdWlQbGF5TWVkaWE6IGFueTtcclxuICAgIHVpUGF1c2VNZWRpYTogYW55O1xyXG4gICAgdWlTZW5kQ2hhdE1lc3NhZ2U6IGFueTtcclxuICAgIHVpU2VhcmNoOiAocXVlcnk6IHN0cmluZykgPT4gdm9pZDtcclxuICAgIHVpTmFtZUNoYW5nZTogYW55O1xyXG4gICAgdWlRdWV1ZU1lZGlhOiAobWVkaWE6IE1lZGlhKSA9PiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVUkge1xyXG5cclxuICAgIHByaXZhdGUgY29sb3JzOiBhbnk7XHJcbiAgICBwcml2YXRlIHNwaW5uZXI6IGFueTtcclxuICAgIHByaXZhdGUgY2FsbGJhY2tzOiBVSUNhbGxiYWNrcztcclxuICAgIHByaXZhdGUgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgZnJhbWVCdWlsZGVyOiBGcmFtZUJ1aWxkZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbiwgY2FsbGJhY2tzOiBVSUNhbGxiYWNrcykge1xyXG4gICAgICAgIHRoaXMuY29sb3JzID0gWydyZWQnLCAnb3JhbmdlJywgJ3llbGxvdycsICdncmVlbicsICdibHVlJywgJ3Zpb2xldCddO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICAgICAgdGhpcy5mcmFtZUJ1aWxkZXIgPSBuZXcgRnJhbWVCdWlsZGVyKG1vYmlsZUJyb3dzZXIpO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0gY2FsbGJhY2tzO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICB0aGlzLnNldHVwU3Bpbm5lclVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cEluZm9Sb2xsb3ZlclVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cElucHV0VUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwUGxheWVyQ29udHJvbEJ1dHRvbnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2Vzc2lvblJlYWR5ID0gKCkgPT4ge1xyXG4gICAgICAgICQoXCIjZGl2X2xvYWRpbmdcIikuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lci5zdG9wKCk7XHJcbiAgICAgICAgJChcIiNkaXZfZXZlcnl0aGluZ1wiKS5hbmltYXRlKHtvcGFjaXR5OiAxfSwgJ2Zhc3QnKTtcclxuICAgIH0gXHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cFNwaW5uZXJVSSgpIHtcclxuICAgICAgICB2YXIgb3B0cyA9IHtcclxuICAgICAgICAgICAgbGluZXM6IDEzIC8vIFRoZSBudW1iZXIgb2YgbGluZXMgdG8gZHJhd1xyXG4gICAgICAgICAgICAsIGxlbmd0aDogMjggLy8gVGhlIGxlbmd0aCBvZiBlYWNoIGxpbmVcclxuICAgICAgICAgICAgLCB3aWR0aDogMTQgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXHJcbiAgICAgICAgICAgICwgcmFkaXVzOiA0MiAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcclxuICAgICAgICAgICAgLCBzY2FsZTogMSAvLyBTY2FsZXMgb3ZlcmFsbCBzaXplIG9mIHRoZSBzcGlubmVyXHJcbiAgICAgICAgICAgICwgY29ybmVyczogMSAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxyXG4gICAgICAgICAgICAsIGNvbG9yOiAnIzAwMCcgLy8gI3JnYiBvciAjcnJnZ2JiIG9yIGFycmF5IG9mIGNvbG9yc1xyXG4gICAgICAgICAgICAsIG9wYWNpdHk6IDAuMjUgLy8gT3BhY2l0eSBvZiB0aGUgbGluZXNcclxuICAgICAgICAgICAgLCByb3RhdGU6IDAgLy8gVGhlIHJvdGF0aW9uIG9mZnNldFxyXG4gICAgICAgICAgICAsIGRpcmVjdGlvbjogMSAvLyAxOiBjbG9ja3dpc2UsIC0xOiBjb3VudGVyY2xvY2t3aXNlXHJcbiAgICAgICAgICAgICwgc3BlZWQ6IDEgLy8gUm91bmRzIHBlciBzZWNvbmRcclxuICAgICAgICAgICAgLCB0cmFpbDogNjAgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcclxuICAgICAgICAgICAgLCBmcHM6IDIwIC8vIEZyYW1lcyBwZXIgc2Vjb25kIHdoZW4gdXNpbmcgc2V0VGltZW91dCgpIGFzIGEgZmFsbGJhY2sgZm9yIENTU1xyXG4gICAgICAgICAgICAsIHpJbmRleDogMmU5IC8vIFRoZSB6LWluZGV4IChkZWZhdWx0cyB0byAyMDAwMDAwMDAwKVxyXG4gICAgICAgICAgICAsIGNsYXNzTmFtZTogJ3NwaW5uZXInIC8vIFRoZSBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBzcGlubmVyXHJcbiAgICAgICAgICAgICwgdG9wOiAnNTAlJyAvLyBUb3AgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XHJcbiAgICAgICAgICAgICwgbGVmdDogJzUwJScgLy8gTGVmdCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcclxuICAgICAgICAgICAgLCBzaGFkb3c6IGZhbHNlIC8vIFdoZXRoZXIgdG8gcmVuZGVyIGEgc2hhZG93XHJcbiAgICAgICAgICAgICwgaHdhY2NlbDogZmFsc2UgLy8gV2hldGhlciB0byB1c2UgaGFyZHdhcmUgYWNjZWxlcmF0aW9uXHJcbiAgICAgICAgICAgICwgcG9zaXRpb246ICdhYnNvbHV0ZScgLy8gRWxlbWVudCBwb3NpdGlvbmluZ1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpdl9sb2FkaW5nJyk7XHJcbiAgICAgICAgdGhpcy5zcGlubmVyID0gbmV3IFNwaW5uZXIob3B0cykuc3Bpbih0YXJnZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBGYWRlVUkob3ZlcmFsbCwgcmVzdWx0cykge1xyXG4gICAgICAgIG92ZXJhbGwubW91c2VlbnRlcigoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdHMuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMuZmFkZUluKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBvdmVyYWxsLm1vdXNlbGVhdmUoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdHMuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cEluZm9Sb2xsb3ZlclVJKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfdXNlcnNfb3ZlcmFsbFwiKSwgJChcIiNkaXZfdXNlcl9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9xdWV1ZV9vdmVyYWxsXCIpLCAkKFwiI2Rpdl9xdWV1ZV9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9jaGF0X292ZXJhbGxcIiksICQoXCIjZGl2X2NoYXRfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfY2Nfb3ZlcmFsbFwiKSwgJChcIiNkaXZfY2NfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VhcmNoVGV4dENoYW5nZWQodGV4dCkge1xyXG4gICAgICAgIHZhciBkaXZSZXN1bHRzID0gJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgaWYodGV4dC5sZW5ndGg9PTApIHtcclxuICAgICAgICAgICAgZGl2UmVzdWx0cy5mYWRlT3V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBJbnB1dFVJKCkge1xyXG4gICAgICAgIHZhciBpbnB1dFNlYXJjaCA9ICQoXCIjaW5wdXRfc2VhcmNoXCIpO1xyXG4gICAgICAgIGlucHV0U2VhcmNoLmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaEVudGVyUHJlc3NlZChpbnB1dFNlYXJjaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgaW5wdXRfbmFtZSA9ICQoXCIjaW5wdXRfbmFtZVwiKTtcclxuICAgICAgICBpbnB1dF9uYW1lLmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJOYW1lQ2hhbmdlKGlucHV0X25hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0X2NoYXQgPSAkKFwiI2lucHV0X2NoYXRcIik7XHJcbiAgICAgICAgICAgIGlucHV0X2NoYXQua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MudWlTZW5kQ2hhdE1lc3NhZ2UoaW5wdXRfY2hhdC52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRfY2hhdC52YWwoXCJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikudmFsKFwiXCIpO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmJpbmQoXCJwcm9wZXJ0eWNoYW5nZSBpbnB1dCBwYXN0ZVwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hUZXh0Q2hhbmdlZCgkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cFBsYXllckNvbnRyb2xCdXR0b25zKCkge1xyXG4gICAgICAgICQoXCIjYnRuX3ByZXZpb3VzXCIpLmNsaWNrKHRoaXMuY2FsbGJhY2tzLnVpUHJldmlvdXNNZWRpYSk7XHJcbiAgICAgICAgJChcIiNidG5fcGF1c2VcIikuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BsYXlcIikuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVBhdXNlTWVkaWEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiI2J0bl9wbGF5XCIpLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgJChcIiNidG5fcGxheVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BhdXNlXCIpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MudWlQbGF5TWVkaWEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiI2J0bl9uZXh0XCIpLmNsaWNrKHRoaXMuY2FsbGJhY2tzLnVpTmV4dE1lZGlhKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25TZWFyY2hSZXN1bHRzKHJlc3VsdHM6IE1lZGlhW10pIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuaHRtbChcIlwiKTtcclxuICAgICAgICB2YXIgaHRtbCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgbWVkaWEgPSByZXN1bHRzW2ldO1xyXG4gICAgICAgICAgICB2YXIgZGl2U2VhcmNoUmVzdWx0ID0gJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XHJcbiAgICAgICAgICAgIGRpdlNlYXJjaFJlc3VsdC5hZGRDbGFzcygnZGl2X3NlYXJjaF9yZXN1bHQnKTtcclxuICAgICAgICAgICAgZGl2U2VhcmNoUmVzdWx0LmFwcGVuZFRvKGRpdlJlc3VsdHMpO1xyXG4gICAgICAgICAgICBkaXZTZWFyY2hSZXN1bHQuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MudWlRdWV1ZU1lZGlhKG1lZGlhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciBwUmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICAkKHBSZXN1bHQpLmFkZENsYXNzKCd0ZXh0X3NlYXJjaF9yZXN1bHQnKTtcclxuICAgICAgICAgICAgJChwUmVzdWx0KS5hcHBlbmRUbyhkaXZTZWFyY2hSZXN1bHQpO1xyXG4gICAgICAgICAgICAkKHBSZXN1bHQpLnRleHQobWVkaWEuVGl0bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5ibHVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZUN1cnJlbnRDb250ZW50KG1lZGlhOiBNZWRpYSkge1xyXG4gICAgICAgICQoXCIjcF9jY19zdW1tYXJ5XCIpLnRleHQobWVkaWEuVGl0bGUpO1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBodG1sID1cclxuICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aW1nIHN0eWxlPVwiaGVpZ2h0OiA5MHB4OyB3aWR0aDogMTYwcHg7IG1hcmdpbi1yaWdodDogMTZweDtcIiBzcmM9XCInICsgbWVkaWEuVGh1bWJVUkwgKyAnXCIvPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4O1wiPicgKyBtZWRpYS5UaXRsZSArICc8YnI+JyArICdSZWNvbW1lbmRlZCBieTogJyArIG1lZGlhLlVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl9jY19yZXN1bHRzXCIpLmh0bWwoaHRtbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VhcmNoRW50ZXJQcmVzc2VkKGlucHV0X3NlYXJjaCkge1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpU2VhcmNoKGlucHV0X3NlYXJjaC52YWwoKSk7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCI8cD5zZWFyY2hpbmc8L3A+XCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuZmFkZUluKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVF1ZXVlKHF1ZXVlOiBNZWRpYVtdLCB1c2VySWRNZTogbnVtYmVyLCBxdWV1ZVBvc2l0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcXVldWUubGVuZ3RoO1xyXG4gICAgICAgIHZhciBzdW1tYXJ5ID0gbGVuZ3RoICsgXCIgdGhpbmdzIGluIHRoZSBwbGF5bGlzdFwiO1xyXG4gICAgICAgIGlmIChsZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gbGVuZ3RoICsgXCIgdGhpbmcgaW4gdGhlIHBsYXlsaXN0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSBcIk5vdGhpbmcgaW4gdGhlIHBsYXlsaXN0LiBRdWV1ZSBzb21ldGhpbmchXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjcF9xdWV1ZV9zdW1tYXJ5XCIpLnRleHQoc3VtbWFyeSk7XHJcblxyXG4gICAgICAgIHZhciBxdWV1ZVJlc3VsdHMgPSAkKFwiI2Rpdl9xdWV1ZV9yZXN1bHRzXCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgbWVkaWEgPSBxdWV1ZVtpXTtcclxuICAgICAgICAgICAgdmFyIG9uVGhpcyA9IGkgPT09IHF1ZXVlUG9zaXRpb247XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50SFRNTCA9IHRoaXMuZnJhbWVCdWlsZGVyLm1lZGlhKG1lZGlhLCBpLCBtZWRpYS5Vc2VySWQgPT09IHVzZXJJZE1lLCBvblRoaXMpO1xyXG4gICAgICAgICAgICBodG1sLnB1c2goY3VycmVudEhUTUwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcXVldWVSZXN1bHRzLmh0bWwoaHRtbC5qb2luKFwiXCIpKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVVzZXJzTGlzdCh1c2VycywgdXNlcklkTWU6IG51bWJlcikge1xyXG4gICAgICAgIHZhciBudW0gPSB1c2Vycy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHN1bW1hcnkgPSB1c2Vycy5sZW5ndGggKyBcIiB1c2VycyBpbiB0aGUgcm9vbVwiO1xyXG4gICAgICAgIGlmIChudW0gPT0gMSkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gdXNlcnMubGVuZ3RoICsgXCIgdXNlciBpbiB0aGUgcm9vbVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiI3BfdXNlcnNfc3VtbWFyeVwiKS50ZXh0KHN1bW1hcnkpO1xyXG4gICAgICAgIHZhciB1c2VyUmVzdWx0cyA9ICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKTtcclxuICAgICAgICB2YXIgaHRtbCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXNlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHVzZXIgPSB1c2Vyc1tpXTtcclxuICAgICAgICAgICAgdmFyIHRoaXNJc01lID0gKHVzZXIuSWQgPT09IHVzZXJJZE1lKTtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gdGhpcy5mcmFtZUJ1aWxkZXIudXNlcih0aGlzLmNvbG9yc1tpICUgdGhpcy5jb2xvcnMubGVuZ3RoXSwgdXNlci5JZCwgdXNlci5OYW1lLCB0aGlzSXNNZSk7XHJcbiAgICAgICAgICAgIGh0bWwucHVzaChjdXJyZW50SFRNTCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHVzZXJSZXN1bHRzLmh0bWwoaHRtbC5qb2luKFwiXCIpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXNlck5hbWVDaGFuZ2UobmFtZV9pbnB1dCkge1xyXG4gICAgICAgIG5hbWVfaW5wdXQuaGlkZSgpO1xyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmZhZGVJbigpO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpTmFtZUNoYW5nZShuYW1lX2lucHV0LnZhbCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DaGF0TWVzc2FnZSh1c2VyTmFtZTogc3RyaW5nLCBtc2c6IHN0cmluZywgY29sb3I6IHN0cmluZykge1xyXG4gICAgICAgIC8vVE9ETzogY29sb3Igc3R1ZmZcclxuICAgICAgICB2YXIgdWxfY2hhdCA9ICQoXCIjdWxfY2hhdFwiKTtcclxuICAgICAgICB2YXIgaHRtbCA9ICc8bGkgY2xhc3M9XCJjaGF0XCI+PHNwYW4gc3R5bGU9XCJtYXJnaW46IDA7IGNvbG9yOiAnICsgY29sb3IgKyAnO1wiPicgKyB1c2VyTmFtZSArICc6IDwvc3Bhbj48c3Bhbj4nICsgbXNnICsgJzwvc3Bhbj48L2xpPic7XHJcbiAgICAgICAgdWxfY2hhdC5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgaWYgKHVsX2NoYXQubGVuZ3RoID49IDEwKSB7XHJcbiAgICAgICAgICAgIHVsX2NoYXQuY2hpbGRyZW4oKVswXS5yZW1vdmUoKTsgXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Iiwi77u/ZGVjbGFyZSB2YXIgWVQ6IGFueTtcclxuXHJcbmltcG9ydCB7IElQbGF5ZXIgfSBmcm9tIFwiLi9JUGxheWVyXCI7XHJcbmltcG9ydCB7IE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi9VSVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFl0UGxheWVyIGltcGxlbWVudHMgSVBsYXllciB7XHJcblxyXG4gICAgcHJpdmF0ZSB5dFBsYXllcjogYW55O1xyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSB1aTogVUk7XHJcbiAgICBwdWJsaWMgcGxheWVyUmVhZHk6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IodWk6IFVJLCBtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICAgICAgdGhpcy51aSA9IHVpO1xyXG4gICAgICAgICQoXCIjZGl2X3l0X3BsYXllclwiKS5zaG93KCk7XHJcbiAgICAgICAgJChcIiNkaXZfcG9kY2FzdF9wbGF5ZXJcIikuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0UGxheWVyKG9uUGxheWVyU3RhdGVDaGFuZ2UpIHtcclxuICAgICAgICBpZiAoWVQgJiYgWVQuUGxheWVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCdkaXZfeXRfcGxheWVyJywge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnYXV0bycsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgcGxheWVyVmFyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xzOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3dpbmZvOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dG9wbGF5OiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ29uUmVhZHknIDogdGhpcy5vblBsYXllclJlYWR5LFxyXG4gICAgICAgICAgICAgICAgICAgICdvblN0YXRlQ2hhbmdlJzogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLmluaXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSkgfSwgNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBkaXZfcGxheWVyID0gJChcIiNkaXZfeXRfcGxheWVyXCIpO1xyXG4gICAgICAgICAgICBkaXZfcGxheWVyLmhlaWdodChkaXZfcGxheWVyLndpZHRoKCkgKiA5LjAgLyAxNi4wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uUGxheWVyUmVhZHkgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBsYXllckNvbnRlbnQobWVkaWE6IE1lZGlhLCB0aW1lOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMucGxheWVyUmVhZHkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3BsYXllciBub3QgcmVhZHkhJyk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnNldFBsYXllckNvbnRlbnQobWVkaWEsIHRpbWUpIH0sIDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMueXRQbGF5ZXIubG9hZFZpZGVvQnlJZChtZWRpYS5ZVFZpZGVvSUQsIHRpbWUsIFwibGFyZ2VcIik7XHJcbiAgICAgICAgICAgIHRoaXMudWkudXBkYXRlQ3VycmVudENvbnRlbnQobWVkaWEpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wbGF5VmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGF1c2UoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wYXVzZVZpZGVvKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFN0YXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaXNTdG9wcGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRTdGF0ZSgpID09IDA7XHJcbiAgICB9XHJcblxyXG59Il19
