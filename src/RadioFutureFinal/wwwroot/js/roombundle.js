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
        this.onFatalError = function () {
            $("#div_everything").hide();
            $("#div_error").show();
        };
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
    RoomManager.prototype.uiSearch = function (query, page) {
        var message = new Contracts_1.WsMessage();
        message.Action = 'Search';
        // TODO: dumb
        message.ChatMessage = query;
        message.Media = new Contracts_1.Media();
        message.Media.Id = page;
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
        this.previousPage = function () {
            _this.displaySearching();
            if (_this.currentPage > 0) {
                _this.currentPage -= 1;
                _this.callbacks.uiSearch(_this.currentQuery, _this.currentPage);
            }
        };
        this.nextPage = function () {
            _this.displaySearching();
            _this.currentPage += 1;
            _this.callbacks.uiSearch(_this.currentQuery, _this.currentPage);
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
        jQuery(document.body).on("click", ":not(#div_search_results, #div_search_results *)", function (event) {
            $("#div_search_results").fadeOut();
            $("#input_search").val("");
        });
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
        divResults.show();
        divResults.html("");
        for (var i = 0; i < results.length; i++) {
            var media = results[i];
            var divSearchResult = $(document.createElement('div'));
            divSearchResult.addClass('div_search_result');
            divSearchResult.appendTo(divResults);
            divSearchResult.click(function () {
                _this.callbacks.uiQueueMedia(media);
            });
            var imgThumb = document.createElement('img');
            $(imgThumb).addClass('img_search_result');
            imgThumb.src = media.ThumbURL;
            $(imgThumb).appendTo(divSearchResult);
            var innerDiv = document.createElement('div');
            $(innerDiv).addClass('div_inner_results');
            $(innerDiv).appendTo(divSearchResult);
            var spanTitle = document.createElement('p');
            $(spanTitle).addClass('search_result_title');
            $(spanTitle).appendTo(innerDiv);
            $(spanTitle).text(media.Title);
            var spanDescription = document.createElement('p');
            $(spanDescription).addClass('search_result_description');
            $(spanDescription).appendTo(innerDiv);
            $(spanDescription).text(media.Description);
        }
        // TODO: this doesnt have to be added every time
        var pagingDiv = $(document.createElement('div'));
        pagingDiv.appendTo(divResults);
        var previousDiv = $(document.createElement('div'));
        previousDiv.appendTo(pagingDiv);
        previousDiv.addClass('div_paging');
        previousDiv.click(function () {
            _this.previousPage();
        });
        previousDiv.text('previous page');
        var nextDiv = $(document.createElement('div'));
        nextDiv.appendTo(pagingDiv);
        nextDiv.addClass('div_paging');
        nextDiv.click(function () {
            _this.nextPage();
        });
        nextDiv.text('next page');
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
    UI.prototype.displaySearching = function () {
        var divResults = $("#div_search_results");
        divResults.html("");
        divResults.html("<p>searching</p>");
        divResults.fadeIn();
    };
    UI.prototype.searchEnterPressed = function (input_search) {
        this.currentPage = 0;
        this.currentQuery = input_search.val();
        if (this.currentQuery && this.currentQuery != "") {
            this.callbacks.uiSearch(this.currentQuery, this.currentPage);
            this.displaySearching();
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
        var summary = users.length + " users listening";
        if (num == 1) {
            summary = users.length + " user listening";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9GcmFtZUJ1aWxkZXIudHMiLCJUeXBlU2NyaXB0cy9Qb2RjYXN0UGxheWVyLnRzIiwiVHlwZVNjcmlwdHMvUm9vbS50cyIsIlR5cGVTY3JpcHRzL1NvY2tldHMudHMiLCJUeXBlU2NyaXB0cy9VSS50cyIsIlR5cGVTY3JpcHRzL1l0UGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQztJQUFBO0lBVUQsQ0FBQztJQUFELFlBQUM7QUFBRCxDQVZDLEFBVUEsSUFBQTtBQVZhLHNCQUFLO0FBWW5CO0lBRUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUtMLGFBQUM7QUFBRCxDQVRBLEFBU0MsSUFBQTtBQVRZLHdCQUFNO0FBV25CO0lBRUk7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUtMLGdCQUFDO0FBQUQsQ0FYQSxBQVdDLElBQUE7QUFYWSw4QkFBUztBQWF0QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDekN0QjtJQUlJLHNCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSwyQkFBSSxHQUFYLFVBQVksS0FBYSxFQUFFLE1BQWMsRUFBRSxRQUFnQixFQUFFLFFBQWlCO1FBQzFFLElBQUksV0FBVyxHQUFHLEVB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VSxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVNLGlDQUFjLEdBQXJCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTSxrQ0FBZSxHQUF0QjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sNEJBQVMsR0FBaEI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUwsZUFBQztBQUFELENBNUVBLEFBNEVDLElBQUE7QUE1RVksNEJBQVEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwi77u/ZXhwb3J0IGNsYXNzIE1lZGlhIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBVc2VySWQ6IG51bWJlcjtcclxuICAgIFVzZXJOYW1lOiBzdHJpbmc7XHJcbiAgICBZVFZpZGVvSUQ6IG51bWJlcjtcclxuICAgIE1QM1NvdXJjZTogc3RyaW5nO1xyXG4gICAgT0dHU291cmNlOiBzdHJpbmc7XHJcbiAgICBUaXRsZTogc3RyaW5nO1xyXG4gICAgVGh1bWJVUkw6IHN0cmluZztcclxuICAgIERlc2NyaXB0aW9uOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNeVVzZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuU3RhdGUgPSBuZXcgVXNlclN0YXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIFN0YXRlOiBVc2VyU3RhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVc2VyU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuVGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5RdWV1ZVBvc2l0aW9uID0gLTE7XHJcbiAgICAgICAgdGhpcy5QbGF5ZXJTdGF0ZSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgVGltZTogbnVtYmVyO1xyXG4gICAgUXVldWVQb3NpdGlvbjogbnVtYmVyO1xyXG4gICAgUGxheWVyU3RhdGU6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNlc3Npb24ge1xyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIFVzZXJzOiBNeVVzZXJbXTtcclxuICAgIFF1ZXVlOiBNZWRpYVtdO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV3NNZXNzYWdlIHtcclxuICAgIEFjdGlvbjogc3RyaW5nO1xyXG4gICAgU2Vzc2lvbjogU2Vzc2lvbjtcclxuICAgIE1lZGlhOiBNZWRpYTtcclxuICAgIFVzZXI6IE15VXNlcjtcclxuICAgIENoYXRNZXNzYWdlOiBzdHJpbmc7XHJcbn0iLCLvu79pbXBvcnQgeyBNZWRpYSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZyYW1lQnVpbGRlciB7XHJcblxyXG4gICAgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXNlcihjb2xvcjogc3RyaW5nLCB1c2VySWQ6IG51bWJlciwgdXNlck5hbWU6IHN0cmluZywgdGhpc0lzTWU6IGJvb2xlYW4pIDogc3RyaW5nIHtcclxuICAgICAgICB2YXIgY3VycmVudEhUTUwgPSBcIlwiO1xyXG4gICAgICAgIHZhciBtZUh0bWwgPSB0aGlzSXNNZSA/ICdvbmNsaWNrPVwicmVxdWVzdFN5bmNXaXRoVXNlcignICsgdXNlcklkICsgJylcIiAnIDogXCJcIjtcclxuICAgICAgICB2YXIgc3luY0hUTUwgPSB0aGlzSXNNZSA/ICd5b3UnIDogJ3N5bmMnO1xyXG4gICAgICAgIHZhciBzeW5jSFRNTE1vYmlsZSA9IHRoaXNJc01lID8gJ3lvdScgOiAnc3luYyB3aXRoICcgKyB1c2VyTmFtZTtcclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gJzxkaXYgJyArIG1lSHRtbCArICdjbGFzcz1cImRpdl91c2VyXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAnICsgY29sb3IgKyAnO1wiPiAnICsgc3luY0hUTUxNb2JpbGUgKyAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID1cclxuICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2ICcgKyBtZUh0bWwgKyAnc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgZmxvYXQ6IGxlZnQ7IGN1cnNvcjogcG9pbnRlcjsgbWFyZ2luLXJpZ2h0OiAxNnB4OyBoZWlnaHQ6IDQ4cHg7IHdpZHRoOiA0OHB4OyBiYWNrZ3JvdW5kOiAnICsgY29sb3IgKyAnO1wiPicgKyBzeW5jSFRNTCArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7IGZsb2F0OiByaWdodDtcIj4nICsgdXNlck5hbWUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbWVkaWEobWVkaWE6IE1lZGlhLCBwb3NpdGlvbjogbnVtYmVyLCByZWNvbW1lbmRlZEJ5TWU6IGJvb2xlYW4sIG9uVGhpczogYm9vbGVhbikge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgdmFyIGNhbkRlbGV0ZVRoaXMgPSByZWNvbW1lbmRlZEJ5TWU7IC8vJiYgIW9uVGhpcztcclxuICAgICAgICB2YXIgZGVsZXRlVGhpc0hUTUwgPSBjYW5EZWxldGVUaGlzID8gJ3RpdGxlPVwiQ2xpY2sgdG8gZGVsZXRlIHRoaXMgZnJvbSB0aGUgcXVldWUhXCIgb25jbGljaz1cImRlbGV0ZU1lZGlhKCcgKyBtZWRpYS5JZCArICcsICcgKyBwb3NpdGlvbiArICcpXCIgJyA6IFwiXCI7XHJcbiAgICAgICAgdmFyIGNhbkRlbGV0ZVN0eWxlID0gY2FuRGVsZXRlVGhpcyA/IFwiY3Vyc29yOiBwb2ludGVyOyBcIiA6IFwiXCI7XHJcbiAgICAgICAgdmFyIG9uVGhpc1N0eWxlID0gb25UaGlzID8gXCJib3JkZXI6IDFweCBzb2xpZCBibHVlOyBcIiA6IFwiXCI7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogYWRkIGRlbGV0ZSBVSVxyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8aW1nIHN0eWxlPVwiJyArIG9uVGhpc1N0eWxlICsgJ2Zsb2F0OiBsZWZ0OyB3aWR0aDogMzMuMzMlOyBoZWlnaHQ6IDIwdnc7XCIgc3JjPVwiJyAgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID1cclxuICAgICAgICAgICAgICAgICc8ZGl2ICcgKyBkZWxldGVUaGlzSFRNTCArICdzdHlsZT1cIicgKyBjYW5EZWxldGVTdHlsZSArIG9uVGhpc1N0eWxlICsgJ3RleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxpbWcgc3R5bGU9XCJoZWlnaHQ6IDkwcHg7IHdpZHRoOiAxNjBweDsgbWFyZ2luLXJpZ2h0OiAxNnB4O1wiIHNyYz1cIicgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4O1wiPicgKyBtZWRpYS5UaXRsZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRIVE1MO1xyXG4gICAgfVxyXG59Iiwi77u/ZGVjbGFyZSB2YXIgWVQ6IGFueTtcclxuXHJcbmltcG9ydCB7IElQbGF5ZXIgfSBmcm9tIFwiLi9JUGxheWVyXCI7XHJcbmltcG9ydCB7IE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi9VSVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBvZGNhc3RQbGF5ZXIgaW1wbGVtZW50cyBJUGxheWVyIHtcclxuXHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGF1ZGlvOiBIVE1MQXVkaW9FbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBtcDNzb3VyY2U6IGFueTtcclxuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIHByaXZhdGUgdWk6IFVJO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHVpOiBVSSwgbW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMudWkgPSB1aTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgICAgIHRoaXMuYXVkaW8gPSA8SFRNTEF1ZGlvRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaHRtbDVhdWRpbycpO1xyXG4gICAgICAgIHRoaXMubXAzc291cmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wM1NvdXJjZScpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfcG9kY2FzdCcpO1xyXG4gICAgICAgICQoXCIjZGl2X3l0X3BsYXllclwiKS5oaWRlKCk7XHJcbiAgICAgICAgJChcIiNkaXZfcG9kY2FzdF9wbGF5ZXJcIikuc2hvdygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBhdWRpb1RpbWVVcGRhdGUoKSB7XHJcbiAgICAgICAgdmFyIHBlcmNlbnRhZ2UgPSB0aGlzLmF1ZGlvLmN1cnJlbnRUaW1lIC8gdGhpcy5hdWRpby5kdXJhdGlvbjtcclxuICAgICAgICB0aGlzLnVwZGF0ZVBsYXllclVJKHBlcmNlbnRhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRQbGF5ZXIgPSAob25QbGF5ZXJTdGF0ZUNoYW5nZSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XHJcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQbGF5ZXJVSSgwKTtcclxuICAgICAgICB0aGlzLmF1ZGlvLm9uZW5kZWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIG9uUGxheWVyU3RhdGVDaGFuZ2UoeyBkYXRhOiAwIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmF1ZGlvLm9udGltZXVwZGF0ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hdWRpb1RpbWVVcGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2luZSA9IChBLCBpLCBudW0pOiBudW1iZXIgPT4ge1xyXG4gICAgICAgIHJldHVybiBBICogTWF0aC5zaW4oKGkgLyAodGhpcy5jYW52YXMud2lkdGggLyBudW0pKSAqIDIgKiBNYXRoLlBJKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVQbGF5ZXJVSSA9IChwZXJjZW50YWdlOiBudW1iZXIpID0+IHtcclxuICAgICAgICB2YXIgY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDI7XHJcbiAgICAgICAgdmFyIEEgPSAyMDA7XHJcbiAgICAgICAgdmFyIG51bSA9IDM7XHJcbiAgICAgICAgdmFyIG1pZCA9IE1hdGguZmxvb3IocGVyY2VudGFnZSAqIHRoaXMuY2FudmFzLndpZHRoKTtcclxuXHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiYmx1ZVwiO1xyXG4gICAgICAgIGN0eC5tb3ZlVG8oMCwgdGhpcy5jYW52YXMuaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtaWQ7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBjdHgubGluZVRvKGksIC0xICogdGhpcy5zaW5lKEEsIGksIG51bSkgKyB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSBtaWQ7IGkgPCB0aGlzLmNhbnZhcy53aWR0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGN0eC5saW5lVG8oaSwgLTEgKiB0aGlzLnNpbmUoQSwgaSwgbnVtKSArIHRoaXMuY2FudmFzLmhlaWdodCAvIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJibHVlXCI7XHJcbiAgICAgICAgY3R4LmFyYyhtaWQsIC0xICogdGhpcy5zaW5lKEEsIG1pZCwgbnVtKSArIHRoaXMuY2FudmFzLmhlaWdodCAvIDIsIDEwLCAwLCBNYXRoLlBJICogMiwgdHJ1ZSk7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQbGF5ZXJDb250ZW50ID0gKG1lZGlhOiBNZWRpYSwgdGltZTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tcDNzb3VyY2Uuc2V0QXR0cmlidXRlKCdzcmMnLCBtZWRpYS5NUDNTb3VyY2UpO1xyXG4gICAgICAgIHRoaXMuYXVkaW8ubG9hZCgpO1xyXG4gICAgICAgIHRoaXMuYXVkaW8ucGxheSgpO1xyXG4gICAgICAgIHRoaXMudWkudXBkYXRlQ3VycmVudENvbnRlbnQobWVkaWEpO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXkgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hdWRpby5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcGF1c2UgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hdWRpby5wYXVzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnRUaW1lID0gKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmF1ZGlvLmN1cnJlbnRUaW1lO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnRTdGF0ZSA9ICgpID0+IHtcclxuICAgICAgICBpZiAodGhpcy5hdWRpby5wYXVzZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNTdG9wcGVkID0gKCkgOiBib29sZWFuID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hdWRpby5jdXJyZW50VGltZSA+PSB0aGlzLmF1ZGlvLmR1cmF0aW9uO1xyXG4gICAgfVxyXG5cclxufSIsIu+7v2ltcG9ydCB7IE15VXNlciwgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSwgV3NNZXNzYWdlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcbmltcG9ydCB7IFVJQ2FsbGJhY2tzLCBVSSB9IGZyb20gXCIuL1VJXCI7XHJcbmltcG9ydCB7IE15U29ja2V0LCBDbGllbnRBY3Rpb25zIH0gZnJvbSBcIi4vU29ja2V0c1wiO1xyXG5pbXBvcnQgeyBJUGxheWVyIH0gZnJvbSBcIi4vSVBsYXllclwiO1xyXG5pbXBvcnQgeyBQb2RjYXN0UGxheWVyIH0gZnJvbSBcIi4vUG9kY2FzdFBsYXllclwiO1xyXG5pbXBvcnQgeyBZdFBsYXllciB9IGZyb20gXCIuL1l0UGxheWVyXCI7XHJcblxyXG5jbGFzcyBSb29tTWFuYWdlciBpbXBsZW1lbnRzIFVJQ2FsbGJhY2tzLCBDbGllbnRBY3Rpb25zIHtcclxuXHJcbiAgICB1c2VyOiBNeVVzZXI7XHJcbiAgICBzZXNzaW9uOiBTZXNzaW9uO1xyXG4gICAgcGxheWVyOiBJUGxheWVyOyBcclxuICAgIHNvY2tldDogTXlTb2NrZXQ7XHJcbiAgICB1aTogVUk7XHJcbiAgICByb29tVHlwZTogc3RyaW5nO1xyXG4gICAgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb29tVHlwZTogc3RyaW5nLCBtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgLy8gVE9ETzogZmluZCBhIGJldHRlciB3YXkgdG8gZXhwb3NlIHRoZXNlIGZ1bmN0aW9ucyB0byBodG1sP1xyXG4gICAgICAgICg8YW55PndpbmRvdykucmVxdWVzdFN5bmNXaXRoVXNlciA9IHRoaXMucmVxdWVzdFN5bmNXaXRoVXNlcjtcclxuICAgICAgICAoPGFueT53aW5kb3cpLmRlbGV0ZU1lZGlhID0gdGhpcy5kZWxldGVNZWRpYTtcclxuICAgICAgICB0aGlzLnJvb21UeXBlID0gcm9vbVR5cGU7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdChlbmNvZGVkU2Vzc2lvbk5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMudXNlciA9IG5ldyBNeVVzZXIoKTtcclxuICAgICAgICB0aGlzLnNlc3Npb24gPSBuZXcgU2Vzc2lvbigpO1xyXG4gICAgICAgIHRoaXMudWkgPSBuZXcgVUkodGhpcy5tb2JpbGVCcm93c2VyLCB0aGlzKTtcclxuICAgICAgICBpZiAodGhpcy5yb29tVHlwZSA9PSBcInBvZGNhc3RzXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgUG9kY2FzdFBsYXllcih0aGlzLnVpLCB0aGlzLm1vYmlsZUJyb3dzZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgWXRQbGF5ZXIodGhpcy51aSwgdGhpcy5tb2JpbGVCcm93c2VyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgTXlTb2NrZXQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5zZXR1cEphbVNlc3Npb24oZW5jb2RlZFNlc3Npb25OYW1lKTtcclxuICAgICAgICB0aGlzLnBsYXllci5pbml0UGxheWVyKHRoaXMub25QbGF5ZXJTdGF0ZUNoYW5nZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0dXBKYW1TZXNzaW9uKGVuY29kZWRTZXNzaW9uTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uLk5hbWUgPSBkZWNvZGVVUkkoZW5jb2RlZFNlc3Npb25OYW1lKTtcclxuICAgICAgICB0aGlzLnVzZXIuTmFtZSA9ICdBbm9ueW1vdXMnO1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1VzZXJKb2luU2Vzc2lvbic7XHJcbiAgICAgICAgbWVzc2FnZS5Vc2VyID0gdGhpcy51c2VyO1xyXG4gICAgICAgIG1lc3NhZ2UuU2Vzc2lvbiA9IHRoaXMuc2Vzc2lvbjtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBXZWJTb2NrZXQgbWVzc2FnZSByZXNwb25zZSBmdW5jdGlvbnNcclxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgY2xpZW50UHJvdmlkZVVzZXJTdGF0ZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgdXNlclRvU3luY1dpdGggPSBtZXNzYWdlLlVzZXI7XHJcbiAgICAgICAgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5RdWV1ZVBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMudXNlci5TdGF0ZS5UaW1lID0gdXNlclRvU3luY1dpdGguU3RhdGUuVGltZTtcclxuICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUGxheWVyU3RhdGUgPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5QbGF5ZXJTdGF0ZTtcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVF1ZXVlKHRoaXMuc2Vzc2lvbi5RdWV1ZSwgdGhpcy51c2VyLklkLCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy5vblVzZXJTdGF0ZUNoYW5nZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFJlcXVlc3RVc2VyU3RhdGUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIHVzZXJEYXRhID0gbmV3IE15VXNlcigpO1xyXG4gICAgICAgIHVzZXJEYXRhLklkID0gbWVzc2FnZS5Vc2VyLklkOyAvLyBUT0RPOiBiYWQgYmFkIGJhZFxyXG4gICAgICAgIHVzZXJEYXRhLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgICAgICB1c2VyRGF0YS5TdGF0ZS5UaW1lID0gTWF0aC5yb3VuZCh0aGlzLnBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgICAgICB1c2VyRGF0YS5TdGF0ZS5QbGF5ZXJTdGF0ZSA9IHRoaXMucGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpO1xyXG5cclxuICAgICAgICB2YXIgb3V0Z29pbmdNc2cgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgb3V0Z29pbmdNc2cuQWN0aW9uID0gJ1Byb3ZpZGVTeW5jVG9Vc2VyJztcclxuICAgICAgICBvdXRnb2luZ01zZy5Vc2VyID0gdXNlckRhdGE7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChvdXRnb2luZ01zZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50U2Vzc2lvblJlYWR5KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHRoaXMuc2Vzc2lvbiA9IG1lc3NhZ2UuU2Vzc2lvbjtcclxuICAgICAgICB0aGlzLnVzZXIgPSBtZXNzYWdlLlVzZXI7XHJcbiAgICAgICAgdGhpcy51aU5leHRNZWRpYSgpO1xyXG4gICAgICAgIHRoaXMudWkudXBkYXRlUXVldWUodGhpcy5zZXNzaW9uLlF1ZXVlLCB0aGlzLnVzZXIuSWQsIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVVzZXJzTGlzdCh0aGlzLnNlc3Npb24uVXNlcnMsIHRoaXMudXNlci5JZCk7XHJcbiAgICAgICAgdGhpcy51aS5zZXNzaW9uUmVhZHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRVcGRhdGVVc2Vyc0xpc3QobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIHVzZXJzID0gbWVzc2FnZS5TZXNzaW9uLlVzZXJzO1xyXG4gICAgICAgIHRoaXMuc2Vzc2lvbi5Vc2VycyA9IHVzZXJzO1xyXG4gICAgICAgIHRoaXMudWkudXBkYXRlVXNlcnNMaXN0KHRoaXMuc2Vzc2lvbi5Vc2VycywgdGhpcy51c2VyLklkKTtcdFxyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFVwZGF0ZVF1ZXVlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciB3YXNXYWl0aW5nID0gdGhpcy5pc1VzZXJXYWl0aW5nKCk7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uLlF1ZXVlID0gbWVzc2FnZS5TZXNzaW9uLlF1ZXVlO1xyXG4gICAgICAgIGlmICh3YXNXYWl0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMudWlOZXh0TWVkaWEoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVRdWV1ZSh0aGlzLnNlc3Npb24uUXVldWUsIHRoaXMudXNlci5JZCwgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudENoYXRNZXNzYWdlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciBjaGF0TWVzc2FnZSA9IG1lc3NhZ2UuQ2hhdE1lc3NhZ2U7XHJcbiAgICAgICAgdmFyIHVzZXJOYW1lID0gbWVzc2FnZS5Vc2VyLk5hbWU7XHJcbiAgICAgICAgdGhpcy51aS5vbkNoYXRNZXNzYWdlKHVzZXJOYW1lLCBjaGF0TWVzc2FnZSwgJ2JsdWUnKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRTZWFyY2hSZXN1bHRzKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIC8vIFRPRE86IGR1bWJcclxuICAgICAgICB2YXIgcmVzdWx0cyA9IG1lc3NhZ2UuU2Vzc2lvbi5RdWV1ZTtcclxuICAgICAgICB0aGlzLnVpLm9uU2VhcmNoUmVzdWx0cyhyZXN1bHRzKTtcclxuICAgIH1cclxuXHJcbiAgICBpc1VzZXJXYWl0aW5nID0gKCk6IGJvb2xlYW4gPT4ge1xyXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5zZXNzaW9uLlF1ZXVlLmxlbmd0aDtcclxuICAgICAgICByZXR1cm4gcG9zIDwgMCB8fCAoKHBvcyA9PSAobGVuZ3RoIC0gMSkpICYmIHRoaXMucGxheWVyLmlzU3RvcHBlZCgpKTtcclxuICAgIH1cclxuXHJcbiAgICAvL1xyXG4gICAgLy8gTW9zdGx5IFVJIGNhbGxiYWNrIGZ1bmN0aW9uc1xyXG4gICAgLy9cclxuICAgIHVpU2VuZENoYXRNZXNzYWdlKG1zZzogc3RyaW5nKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5BY3Rpb24gPSAnQ2hhdE1lc3NhZ2UnO1xyXG4gICAgICAgIG1lc3NhZ2UuQ2hhdE1lc3NhZ2UgPSBtc2c7XHJcbiAgICAgICAgbWVzc2FnZS5Vc2VyID0gdGhpcy51c2VyO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgIH1cclxuXHJcbiAgICBvblBsYXllclN0YXRlQ2hhbmdlID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgaWYoZXZlbnQuZGF0YT09MCkge1xyXG4gICAgICAgICAgICB0aGlzLnVpTmV4dE1lZGlhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVpU2VhcmNoKHF1ZXJ5OiBzdHJpbmcsIHBhZ2U6IG51bWJlcikge1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1NlYXJjaCc7XHJcbiAgICAgICAgLy8gVE9ETzogZHVtYlxyXG4gICAgICAgIG1lc3NhZ2UuQ2hhdE1lc3NhZ2UgPSBxdWVyeTtcclxuICAgICAgICBtZXNzYWdlLk1lZGlhID0gbmV3IE1lZGlhKCk7XHJcbiAgICAgICAgbWVzc2FnZS5NZWRpYS5JZCA9IHBhZ2U7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICB1aU5hbWVDaGFuZ2UobmV3TmFtZSkge1xyXG4gICAgICAgIHRoaXMudXNlci5OYW1lID0gbmV3TmFtZTtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLlVzZXIgPSB0aGlzLnVzZXI7XHJcbiAgICAgICAgbWVzc2FnZS5BY3Rpb24gPSAnU2F2ZVVzZXJOYW1lQ2hhbmdlJztcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVXNlclN0YXRlQ2hhbmdlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA+PSAwICYmIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIDwgdGhpcy5zZXNzaW9uLlF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllci5zZXRQbGF5ZXJDb250ZW50KHRoaXMuc2Vzc2lvbi5RdWV1ZVt0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbl0sIHRoaXMudXNlci5TdGF0ZS5UaW1lKTtcclxuICAgICAgICAgICAgdGhpcy51aS51cGRhdGVRdWV1ZSh0aGlzLnNlc3Npb24uUXVldWUsIHRoaXMudXNlci5JZCwgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1aU5leHRNZWRpYSA9ICgpID0+IHtcclxuICAgICAgICB2YXIgcXVldWUgPSB0aGlzLnNlc3Npb24uUXVldWU7XHJcbiAgICAgICAgaWYodGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gKyAxIDwgcXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXNlci5TdGF0ZS5UaW1lID0gMDtcclxuICAgICAgICAgICAgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gKz0gMTtcclxuICAgICAgICAgICAgdGhpcy5vblVzZXJTdGF0ZUNoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1aVBhdXNlTWVkaWEgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIucGF1c2UoKTtcclxuICAgIH1cclxuXHJcbiAgICB1aVBsYXlNZWRpYSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnBsYXllci5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdWlQcmV2aW91c01lZGlhID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMudXNlci5TdGF0ZS5UaW1lID0gMDtcclxuICAgICAgICB2YXIgcXVldWUgPSB0aGlzLnNlc3Npb24uUXVldWU7XHJcbiAgICAgICAgaWYodGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gLSAxO1xyXG4gICAgICAgICAgICB0aGlzLm9uVXNlclN0YXRlQ2hhbmdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gVGhlc2UgZnVuY3Rpb25zIGFyZSBjYWxsZWQgZGlyZWN0bHkgZW1iZWRkZWQgaW50byB0aGUgaHRtbC4uLiBraW5kYSB3ZWlyZFxyXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBvbkZhdGFsRXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgJChcIiNkaXZfZXZlcnl0aGluZ1wiKS5oaWRlKCk7XHJcbiAgICAgICAgJChcIiNkaXZfZXJyb3JcIikuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVlc3RTeW5jV2l0aFVzZXIgPSAodXNlcklkKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3JlcXVlc3Qgc3luYyB3aXRoIHVzZXInKTtcclxuXHJcbiAgICAgICAgdmFyIHVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICAgICAgdXNlci5JZCA9IHVzZXJJZDtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdSZXF1ZXN0U3luY1dpdGhVc2VyJztcclxuICAgICAgICBtZXNzYWdlLlVzZXIgPSB1c2VyO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdWlRdWV1ZU1lZGlhID0gKG1lZGlhOiBNZWRpYSkgPT4ge1xyXG4gICAgICAgIG1lZGlhLlVzZXJJZCA9IHRoaXMudXNlci5JZDtcclxuICAgICAgICBtZWRpYS5Vc2VyTmFtZSA9IHRoaXMudXNlci5OYW1lO1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0FkZE1lZGlhVG9TZXNzaW9uJztcclxuICAgICAgICBtZXNzYWdlLk1lZGlhID0gbWVkaWE7XHJcbiAgICAgICAgLy9UT0RPOiBsb2NhbCBhZGQgbWVkaWFcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGRlbGV0ZU1lZGlhID0gKG1lZGlhSWQ6IG51bWJlciwgcG9zaXRpb246IG51bWJlcikgPT4ge1xyXG5cclxuICAgICAgICB0aGlzLnNlc3Npb24uUXVldWUuc3BsaWNlKHBvc2l0aW9uLCAxKTtcclxuICAgICAgICBpZiAodGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPj0gcG9zaXRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gLT0gMTtcclxuICAgICAgICAgICAgdGhpcy5vblVzZXJTdGF0ZUNoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVF1ZXVlKHRoaXMuc2Vzc2lvbi5RdWV1ZSwgdGhpcy51c2VyLklkLCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcblxyXG4gICAgICAgIHZhciBtZWRpYVRvRGVsZXRlID0gbmV3IE1lZGlhKCk7XHJcbiAgICAgICAgbWVkaWFUb0RlbGV0ZS5JZCA9IG1lZGlhSWQ7XHJcblxyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0RlbGV0ZU1lZGlhRnJvbVNlc3Npb24nO1xyXG4gICAgICAgIG1lc3NhZ2UuTWVkaWEgPSBtZWRpYVRvRGVsZXRlO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZGVjbGFyZSB2YXIgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuZGVjbGFyZSB2YXIgcm9vbVR5cGU6IHN0cmluZztcclxuZGVjbGFyZSB2YXIgcm9vbU5hbWU6IHN0cmluZztcclxuXHJcbnZhciBtUm9vbU1hbmFnZXIgPSBuZXcgUm9vbU1hbmFnZXIocm9vbVR5cGUsIG1vYmlsZUJyb3dzZXIpO1xyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICBtUm9vbU1hbmFnZXIuaW5pdChyb29tTmFtZSk7XHJcbn0pO1xyXG5cclxuXHJcbiIsIu+7v2ltcG9ydCB7IFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDbGllbnRBY3Rpb25zIHtcclxuXHJcbiAgICBjbGllbnRTZXNzaW9uUmVhZHk6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRVcGRhdGVVc2Vyc0xpc3Q6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRVcGRhdGVRdWV1ZTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudENoYXRNZXNzYWdlOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50UmVxdWVzdFVzZXJTdGF0ZTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFByb3ZpZGVVc2VyU3RhdGU6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRTZWFyY2hSZXN1bHRzOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE15U29ja2V0IHtcclxuXHJcbiAgICBwcml2YXRlIHNvY2tldDogV2ViU29ja2V0O1xyXG4gICAgcHJpdmF0ZSBjbGllbnRBY3Rpb25zOiBDbGllbnRBY3Rpb25zO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNsaWVudEFjdGlvbnM6IENsaWVudEFjdGlvbnMpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGllbnRBY3Rpb25zID0gY2xpZW50QWN0aW9ucztcclxuXHJcbiAgICAgICAgdmFyIHVyaSA9IFwid3M6Ly9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgXCIvd3NcIjtcclxuICAgICAgICB2YXIgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmkpO1xyXG4gICAgICAgIHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG4gICAgICAgIHNvY2tldC5vbmNsb3NlID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuXHJcbiAgICAgICAgc29ja2V0Lm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XHJcbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBtZXNzYWdlLkFjdGlvbjtcclxuICAgICAgICAgICAgaWYgKGNsaWVudEFjdGlvbnNbYWN0aW9uXSkge1xyXG4gICAgICAgICAgICAgICAgY2xpZW50QWN0aW9uc1thY3Rpb25dKG1lc3NhZ2UpOyBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImJhZCBjbGllbnQgYWN0aW9uXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogaGFuZGxlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVtaXQobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IHRoaXMuc29ja2V0LkNPTk5FQ1RJTkcpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0sIDUwKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcclxuICAgIH07XHJcblxyXG59XHJcbiIsIu+7v2ltcG9ydCB7IEZyYW1lQnVpbGRlciB9IGZyb20gXCIuL0ZyYW1lQnVpbGRlclwiO1xyXG5pbXBvcnQgeyBNZWRpYSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZGVjbGFyZSB2YXIgU3Bpbm5lcjogYW55O1xyXG5cclxuLy8gVE9ETzogbWFrZSB0aGlzIGFuIGludGVyZmFjZVxyXG5leHBvcnQgaW50ZXJmYWNlIFVJQ2FsbGJhY2tzIHtcclxuICAgIHVpUHJldmlvdXNNZWRpYTogYW55O1xyXG4gICAgdWlOZXh0TWVkaWE6IGFueTtcclxuICAgIHVpUGxheU1lZGlhOiBhbnk7XHJcbiAgICB1aVBhdXNlTWVkaWE6IGFueTtcclxuICAgIHVpU2VuZENoYXRNZXNzYWdlOiBhbnk7XHJcbiAgICB1aVNlYXJjaDogKHF1ZXJ5OiBzdHJpbmcsIHBhZ2U6IG51bWJlcikgPT4gdm9pZDtcclxuICAgIHVpTmFtZUNoYW5nZTogYW55O1xyXG4gICAgdWlRdWV1ZU1lZGlhOiAobWVkaWE6IE1lZGlhKSA9PiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVUkge1xyXG5cclxuICAgIHByaXZhdGUgY29sb3JzOiBhbnk7XHJcbiAgICBwcml2YXRlIHNwaW5uZXI6IGFueTtcclxuICAgIHByaXZhdGUgY2FsbGJhY2tzOiBVSUNhbGxiYWNrcztcclxuICAgIHByaXZhdGUgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgZnJhbWVCdWlsZGVyOiBGcmFtZUJ1aWxkZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRQYWdlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRRdWVyeTogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4sIGNhbGxiYWNrczogVUlDYWxsYmFja3MpIHtcclxuICAgICAgICB0aGlzLmNvbG9ycyA9IFsncmVkJywgJ29yYW5nZScsICd5ZWxsb3cnLCAnZ3JlZW4nLCAnYmx1ZScsICd2aW9sZXQnXTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgICAgIHRoaXMuZnJhbWVCdWlsZGVyID0gbmV3IEZyYW1lQnVpbGRlcihtb2JpbGVCcm93c2VyKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IGNhbGxiYWNrcztcclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR1cFNwaW5uZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbmZvUm9sbG92ZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbnB1dFVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cFBsYXllckNvbnRyb2xCdXR0b25zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNlc3Npb25SZWFkeSA9ICgpID0+IHtcclxuICAgICAgICAkKFwiI2Rpdl9sb2FkaW5nXCIpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xyXG4gICAgICAgICQoXCIjZGl2X2V2ZXJ5dGhpbmdcIikuYW5pbWF0ZSh7b3BhY2l0eTogMX0sICdmYXN0Jyk7XHJcbiAgICB9IFxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBTcGlubmVyVUkoKSB7XHJcbiAgICAgICAgdmFyIG9wdHMgPSB7XHJcbiAgICAgICAgICAgIGxpbmVzOiAxMyAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcclxuICAgICAgICAgICAgLCBsZW5ndGg6IDI4IC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXHJcbiAgICAgICAgICAgICwgd2lkdGg6IDE0IC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xyXG4gICAgICAgICAgICAsIHJhZGl1czogNDIgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXHJcbiAgICAgICAgICAgICwgc2NhbGU6IDEgLy8gU2NhbGVzIG92ZXJhbGwgc2l6ZSBvZiB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIGNvcm5lcnM6IDEgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcclxuICAgICAgICAgICAgLCBjb2xvcjogJyMwMDAnIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcclxuICAgICAgICAgICAgLCBvcGFjaXR5OiAwLjI1IC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXHJcbiAgICAgICAgICAgICwgcm90YXRlOiAwIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcclxuICAgICAgICAgICAgLCBkaXJlY3Rpb246IDEgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxyXG4gICAgICAgICAgICAsIHNwZWVkOiAxIC8vIFJvdW5kcyBwZXIgc2Vjb25kXHJcbiAgICAgICAgICAgICwgdHJhaWw6IDYwIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICwgZnBzOiAyMCAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKSBhcyBhIGZhbGxiYWNrIGZvciBDU1NcclxuICAgICAgICAgICAgLCB6SW5kZXg6IDJlOSAvLyBUaGUgei1pbmRleCAoZGVmYXVsdHMgdG8gMjAwMDAwMDAwMClcclxuICAgICAgICAgICAgLCBjbGFzc05hbWU6ICdzcGlubmVyJyAvLyBUaGUgQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIHRvcDogJzUwJScgLy8gVG9wIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIGxlZnQ6ICc1MCUnIC8vIExlZnQgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XHJcbiAgICAgICAgICAgICwgc2hhZG93OiBmYWxzZSAvLyBXaGV0aGVyIHRvIHJlbmRlciBhIHNoYWRvd1xyXG4gICAgICAgICAgICAsIGh3YWNjZWw6IGZhbHNlIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxyXG4gICAgICAgICAgICAsIHBvc2l0aW9uOiAnYWJzb2x1dGUnIC8vIEVsZW1lbnQgcG9zaXRpb25pbmdcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZfbG9hZGluZycpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4odGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwRmFkZVVJKG92ZXJhbGwsIHJlc3VsdHMpIHtcclxuICAgICAgICBvdmVyYWxsLm1vdXNlZW50ZXIoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVJbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWxlYXZlKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBJbmZvUm9sbG92ZXJVSSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X3VzZXJzX292ZXJhbGxcIiksICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfcXVldWVfb3ZlcmFsbFwiKSwgJChcIiNkaXZfcXVldWVfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfY2hhdF9vdmVyYWxsXCIpLCAkKFwiI2Rpdl9jaGF0X3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X2NjX292ZXJhbGxcIiksICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlYXJjaFRleHRDaGFuZ2VkKHRleHQpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGlmKHRleHQubGVuZ3RoPT0wKSB7XHJcbiAgICAgICAgICAgIGRpdlJlc3VsdHMuZmFkZU91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwSW5wdXRVSSgpIHtcclxuICAgICAgICB2YXIgaW5wdXRTZWFyY2ggPSAkKFwiI2lucHV0X3NlYXJjaFwiKTtcclxuICAgICAgICBpbnB1dFNlYXJjaC5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hFbnRlclByZXNzZWQoaW5wdXRTZWFyY2gpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGlucHV0X25hbWUgPSAkKFwiI2lucHV0X25hbWVcIik7XHJcbiAgICAgICAgaW5wdXRfbmFtZS5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyTmFtZUNoYW5nZShpbnB1dF9uYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dF9jaGF0ID0gJChcIiNpbnB1dF9jaGF0XCIpO1xyXG4gICAgICAgICAgICBpbnB1dF9jaGF0LmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpU2VuZENoYXRNZXNzYWdlKGlucHV0X2NoYXQudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0X2NoYXQudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgalF1ZXJ5KGRvY3VtZW50LmJvZHkpLm9uKFwiY2xpY2tcIiwgXCI6bm90KCNkaXZfc2VhcmNoX3Jlc3VsdHMsICNkaXZfc2VhcmNoX3Jlc3VsdHMgKilcIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikudmFsKFwiXCIpO1xyXG4gICAgICAgIH0pO+KAi+KAi+KAi+KAi+KAi+KAi+KAi1xyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmJpbmQoXCJwcm9wZXJ0eWNoYW5nZSBpbnB1dCBwYXN0ZVwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hUZXh0Q2hhbmdlZCgkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cFBsYXllckNvbnRyb2xCdXR0b25zKCkge1xyXG4gICAgICAgICQoXCIjYnRuX3ByZXZpb3VzXCIpLmNsaWNrKHRoaXMuY2FsbGJhY2tzLnVpUHJldmlvdXNNZWRpYSk7XHJcbiAgICAgICAgJChcIiNidG5fcGF1c2VcIikuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BsYXlcIikuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVBhdXNlTWVkaWEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiI2J0bl9wbGF5XCIpLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgJChcIiNidG5fcGxheVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BhdXNlXCIpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MudWlQbGF5TWVkaWEoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiI2J0bl9uZXh0XCIpLmNsaWNrKHRoaXMuY2FsbGJhY2tzLnVpTmV4dE1lZGlhKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25TZWFyY2hSZXN1bHRzKHJlc3VsdHM6IE1lZGlhW10pIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuc2hvdygpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuaHRtbChcIlwiKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIG1lZGlhID0gcmVzdWx0c1tpXTtcclxuICAgICAgICAgICAgdmFyIGRpdlNlYXJjaFJlc3VsdCA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG4gICAgICAgICAgICBkaXZTZWFyY2hSZXN1bHQuYWRkQ2xhc3MoJ2Rpdl9zZWFyY2hfcmVzdWx0Jyk7XHJcbiAgICAgICAgICAgIGRpdlNlYXJjaFJlc3VsdC5hcHBlbmRUbyhkaXZSZXN1bHRzKTtcclxuICAgICAgICAgICAgZGl2U2VhcmNoUmVzdWx0LmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpUXVldWVNZWRpYShtZWRpYSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgaW1nVGh1bWIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICAgICAgJChpbWdUaHVtYikuYWRkQ2xhc3MoJ2ltZ19zZWFyY2hfcmVzdWx0Jyk7XHJcbiAgICAgICAgICAgIGltZ1RodW1iLnNyYyA9IG1lZGlhLlRodW1iVVJMO1xyXG4gICAgICAgICAgICAkKGltZ1RodW1iKS5hcHBlbmRUbyhkaXZTZWFyY2hSZXN1bHQpO1xyXG4gICAgICAgICAgICB2YXIgaW5uZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgJChpbm5lckRpdikuYWRkQ2xhc3MoJ2Rpdl9pbm5lcl9yZXN1bHRzJyk7XHJcbiAgICAgICAgICAgICQoaW5uZXJEaXYpLmFwcGVuZFRvKGRpdlNlYXJjaFJlc3VsdCk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICQoc3BhblRpdGxlKS5hZGRDbGFzcygnc2VhcmNoX3Jlc3VsdF90aXRsZScpO1xyXG4gICAgICAgICAgICAkKHNwYW5UaXRsZSkuYXBwZW5kVG8oaW5uZXJEaXYpO1xyXG4gICAgICAgICAgICAkKHNwYW5UaXRsZSkudGV4dChtZWRpYS5UaXRsZSk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuRGVzY3JpcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICQoc3BhbkRlc2NyaXB0aW9uKS5hZGRDbGFzcygnc2VhcmNoX3Jlc3VsdF9kZXNjcmlwdGlvbicpO1xyXG4gICAgICAgICAgICAkKHNwYW5EZXNjcmlwdGlvbikuYXBwZW5kVG8oaW5uZXJEaXYpO1xyXG4gICAgICAgICAgICAkKHNwYW5EZXNjcmlwdGlvbikudGV4dChtZWRpYS5EZXNjcmlwdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFRPRE86IHRoaXMgZG9lc250IGhhdmUgdG8gYmUgYWRkZWQgZXZlcnkgdGltZVxyXG4gICAgICAgIHZhciBwYWdpbmdEaXYgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICBwYWdpbmdEaXYuYXBwZW5kVG8oZGl2UmVzdWx0cyk7XHJcbiAgICAgICAgdmFyIHByZXZpb3VzRGl2ID0gJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XHJcbiAgICAgICAgcHJldmlvdXNEaXYuYXBwZW5kVG8ocGFnaW5nRGl2KTtcclxuICAgICAgICBwcmV2aW91c0Rpdi5hZGRDbGFzcygnZGl2X3BhZ2luZycpO1xyXG4gICAgICAgIHByZXZpb3VzRGl2LmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c1BhZ2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwcmV2aW91c0Rpdi50ZXh0KCdwcmV2aW91cyBwYWdlJyk7XHJcbiAgICAgICAgdmFyIG5leHREaXYgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICBuZXh0RGl2LmFwcGVuZFRvKHBhZ2luZ0Rpdik7XHJcbiAgICAgICAgbmV4dERpdi5hZGRDbGFzcygnZGl2X3BhZ2luZycpO1xyXG4gICAgICAgIG5leHREaXYuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm5leHRQYWdlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbmV4dERpdi50ZXh0KCduZXh0IHBhZ2UnKTtcclxuXHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuYmx1cigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByZXZpb3VzUGFnZSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLmRpc3BsYXlTZWFyY2hpbmcoKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGFnZSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSAtPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVNlYXJjaCh0aGlzLmN1cnJlbnRRdWVyeSwgdGhpcy5jdXJyZW50UGFnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5leHRQYWdlID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZGlzcGxheVNlYXJjaGluZygpO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgKz0gMTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVNlYXJjaCh0aGlzLmN1cnJlbnRRdWVyeSwgdGhpcy5jdXJyZW50UGFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZUN1cnJlbnRDb250ZW50KG1lZGlhOiBNZWRpYSkge1xyXG4gICAgICAgICQoXCIjcF9jY19zdW1tYXJ5XCIpLnRleHQobWVkaWEuVGl0bGUpO1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBodG1sID1cclxuICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aW1nIHN0eWxlPVwiaGVpZ2h0OiA5MHB4OyB3aWR0aDogMTYwcHg7IG1hcmdpbi1yaWdodDogMTZweDtcIiBzcmM9XCInICsgbWVkaWEuVGh1bWJVUkwgKyAnXCIvPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4O1wiPicgKyBtZWRpYS5UaXRsZSArICc8YnI+JyArICdSZWNvbW1lbmRlZCBieTogJyArIG1lZGlhLlVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl9jY19yZXN1bHRzXCIpLmh0bWwoaHRtbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRpc3BsYXlTZWFyY2hpbmcoKSB7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCJcIik7XHJcbiAgICAgICAgZGl2UmVzdWx0cy5odG1sKFwiPHA+c2VhcmNoaW5nPC9wPlwiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmZhZGVJbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VhcmNoRW50ZXJQcmVzc2VkKGlucHV0X3NlYXJjaCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFF1ZXJ5ID0gaW5wdXRfc2VhcmNoLnZhbCgpO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRRdWVyeSAmJiB0aGlzLmN1cnJlbnRRdWVyeSAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpU2VhcmNoKHRoaXMuY3VycmVudFF1ZXJ5LCB0aGlzLmN1cnJlbnRQYWdlKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5U2VhcmNoaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVRdWV1ZShxdWV1ZTogTWVkaWFbXSwgdXNlcklkTWU6IG51bWJlciwgcXVldWVQb3NpdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHF1ZXVlLmxlbmd0aDtcclxuICAgICAgICB2YXIgc3VtbWFyeSA9IGxlbmd0aCArIFwiIHRoaW5ncyBpbiB0aGUgcGxheWxpc3RcIjtcclxuICAgICAgICBpZiAobGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IGxlbmd0aCArIFwiIHRoaW5nIGluIHRoZSBwbGF5bGlzdFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChsZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gXCJOb3RoaW5nIGluIHRoZSBwbGF5bGlzdC4gUXVldWUgc29tZXRoaW5nIVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiI3BfcXVldWVfc3VtbWFyeVwiKS50ZXh0KHN1bW1hcnkpO1xyXG5cclxuICAgICAgICB2YXIgcXVldWVSZXN1bHRzID0gJChcIiNkaXZfcXVldWVfcmVzdWx0c1wiKTtcclxuICAgICAgICB2YXIgaHRtbCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIG1lZGlhID0gcXVldWVbaV07XHJcbiAgICAgICAgICAgIHZhciBvblRoaXMgPSBpID09PSBxdWV1ZVBvc2l0aW9uO1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudEhUTUwgPSB0aGlzLmZyYW1lQnVpbGRlci5tZWRpYShtZWRpYSwgaSwgbWVkaWEuVXNlcklkID09PSB1c2VySWRNZSwgb25UaGlzKTtcclxuICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHF1ZXVlUmVzdWx0cy5odG1sKGh0bWwuam9pbihcIlwiKSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVVc2Vyc0xpc3QodXNlcnMsIHVzZXJJZE1lOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbnVtID0gdXNlcnMubGVuZ3RoO1xyXG4gICAgICAgIHZhciBzdW1tYXJ5ID0gdXNlcnMubGVuZ3RoICsgXCIgdXNlcnMgbGlzdGVuaW5nXCI7XHJcbiAgICAgICAgaWYgKG51bSA9PSAxKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSB1c2Vycy5sZW5ndGggKyBcIiB1c2VyIGxpc3RlbmluZ1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiI3BfdXNlcnNfc3VtbWFyeVwiKS50ZXh0KHN1bW1hcnkpO1xyXG4gICAgICAgIHZhciB1c2VyUmVzdWx0cyA9ICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKTtcclxuICAgICAgICB2YXIgaHRtbCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXNlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHVzZXIgPSB1c2Vyc1tpXTtcclxuICAgICAgICAgICAgdmFyIHRoaXNJc01lID0gKHVzZXIuSWQgPT09IHVzZXJJZE1lKTtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gdGhpcy5mcmFtZUJ1aWxkZXIudXNlcih0aGlzLmNvbG9yc1tpICUgdGhpcy5jb2xvcnMubGVuZ3RoXSwgdXNlci5JZCwgdXNlci5OYW1lLCB0aGlzSXNNZSk7XHJcbiAgICAgICAgICAgIGh0bWwucHVzaChjdXJyZW50SFRNTCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHVzZXJSZXN1bHRzLmh0bWwoaHRtbC5qb2luKFwiXCIpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXNlck5hbWVDaGFuZ2UobmFtZV9pbnB1dCkge1xyXG4gICAgICAgIG5hbWVfaW5wdXQuaGlkZSgpO1xyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmZhZGVJbigpO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpTmFtZUNoYW5nZShuYW1lX2lucHV0LnZhbCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DaGF0TWVzc2FnZSh1c2VyTmFtZTogc3RyaW5nLCBtc2c6IHN0cmluZywgY29sb3I6IHN0cmluZykge1xyXG4gICAgICAgIC8vVE9ETzogY29sb3Igc3R1ZmZcclxuICAgICAgICB2YXIgdWxfY2hhdCA9ICQoXCIjdWxfY2hhdFwiKTtcclxuICAgICAgICB2YXIgaHRtbCA9ICc8bGkgY2xhc3M9XCJjaGF0XCI+PHNwYW4gc3R5bGU9XCJtYXJnaW46IDA7IGNvbG9yOiAnICsgY29sb3IgKyAnO1wiPicgKyB1c2VyTmFtZSArICc6IDwvc3Bhbj48c3Bhbj4nICsgbXNnICsgJzwvc3Bhbj48L2xpPic7XHJcbiAgICAgICAgdWxfY2hhdC5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgaWYgKHVsX2NoYXQubGVuZ3RoID49IDEwKSB7XHJcbiAgICAgICAgICAgIHVsX2NoYXQuY2hpbGRyZW4oKVswXS5yZW1vdmUoKTsgXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Iiwi77u/ZGVjbGFyZSB2YXIgWVQ6IGFueTtcclxuXHJcbmltcG9ydCB7IElQbGF5ZXIgfSBmcm9tIFwiLi9JUGxheWVyXCI7XHJcbmltcG9ydCB7IE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi9VSVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFl0UGxheWVyIGltcGxlbWVudHMgSVBsYXllciB7XHJcblxyXG4gICAgcHJpdmF0ZSB5dFBsYXllcjogYW55O1xyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSB1aTogVUk7XHJcbiAgICBwdWJsaWMgcGxheWVyUmVhZHk6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IodWk6IFVJLCBtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICAgICAgdGhpcy51aSA9IHVpO1xyXG4gICAgICAgICQoXCIjZGl2X3l0X3BsYXllclwiKS5zaG93KCk7XHJcbiAgICAgICAgJChcIiNkaXZfcG9kY2FzdF9wbGF5ZXJcIikuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0UGxheWVyKG9uUGxheWVyU3RhdGVDaGFuZ2UpIHtcclxuICAgICAgICBpZiAoWVQgJiYgWVQuUGxheWVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCdkaXZfeXRfcGxheWVyJywge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnYXV0bycsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgcGxheWVyVmFyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xzOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3dpbmZvOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dG9wbGF5OiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ29uUmVhZHknIDogdGhpcy5vblBsYXllclJlYWR5LFxyXG4gICAgICAgICAgICAgICAgICAgICdvblN0YXRlQ2hhbmdlJzogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLmluaXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSkgfSwgNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBkaXZfcGxheWVyID0gJChcIiNkaXZfeXRfcGxheWVyXCIpO1xyXG4gICAgICAgICAgICBkaXZfcGxheWVyLmhlaWdodChkaXZfcGxheWVyLndpZHRoKCkgKiA5LjAgLyAxNi4wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uUGxheWVyUmVhZHkgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBsYXllckNvbnRlbnQobWVkaWE6IE1lZGlhLCB0aW1lOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMucGxheWVyUmVhZHkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3BsYXllciBub3QgcmVhZHkhJyk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnNldFBsYXllckNvbnRlbnQobWVkaWEsIHRpbWUpIH0sIDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMueXRQbGF5ZXIubG9hZFZpZGVvQnlJZChtZWRpYS5ZVFZpZGVvSUQsIHRpbWUsIFwibGFyZ2VcIik7XHJcbiAgICAgICAgICAgIHRoaXMudWkudXBkYXRlQ3VycmVudENvbnRlbnQobWVkaWEpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wbGF5VmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGF1c2UoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wYXVzZVZpZGVvKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFN0YXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaXNTdG9wcGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRTdGF0ZSgpID09IDA7XHJcbiAgICB9XHJcblxyXG59Il19
