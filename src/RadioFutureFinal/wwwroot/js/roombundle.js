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
        var _loop_1 = function () {
            var media = results[i];
            divSearchResult = $(document.createElement('div'));
            divSearchResult.addClass('div_result search_stuff');
            divSearchResult.appendTo(divResults);
            imgThumb = document.createElement('img');
            $(imgThumb).addClass('img_result search_stuff');
            imgThumb.src = media.ThumbURL;
            $(imgThumb).appendTo(divSearchResult);
            innerDiv = document.createElement('div');
            $(innerDiv).addClass('div_inner_results search_stuff');
            $(innerDiv).appendTo(divSearchResult);
            spanTitle = document.createElement('p');
            $(spanTitle).addClass('result_title search_stuff');
            $(spanTitle).appendTo(innerDiv);
            $(spanTitle).text(media.Title);
            spanDescription = document.createElement('p');
            $(spanDescription).addClass('result_description search_stuff');
            $(spanDescription).appendTo(innerDiv);
            $(spanDescription).text(media.Description);
            divSearchResult.click(function () {
                _this.callbacks.uiQueueMedia(media);
            });
        };
        var divSearchResult, imgThumb, innerDiv, spanTitle, spanDescription;
        for (var i = 0; i < results.length; i++) {
            _loop_1();
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
        queueResults.html("");
        // TODO: need to make this seperate from search results probably
        for (var i = 0; i < length; i++) {
            var media = queue[i];
            var divQueueResult = $(document.createElement('div'));
            divQueueResult.addClass('div_result');
            divQueueResult.appendTo(queueResults);
            var imgThumb = document.createElement('img');
            $(imgThumb).addClass('img_result');
            imgThumb.src = media.ThumbURL;
            $(imgThumb).appendTo(divQueueResult);
            var innerDiv = document.createElement('div');
            $(innerDiv).addClass('div_inner_results');
            $(innerDiv).appendTo(divQueueResult);
            var spanTitle = document.createElement('p');
            $(spanTitle).addClass('result_title');
            $(spanTitle).appendTo(innerDiv);
            $(spanTitle).text(media.Title);
            var spanDescription = document.createElement('p');
            $(spanDescription).addClass('result_description');
            $(spanDescription).appendTo(innerDiv);
            $(spanDescription).text(media.Description);
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9GcmFtZUJ1aWxkZXIudHMiLCJUeXBlU2NyaXB0cy9Qb2RjYXN0UGxheWVyLnRzIiwiVHlwZVNjcmlwdHMvUm9vbS50cyIsIlR5cGVTY3JpcHRzL1NvY2tldHMudHMiLCJUeXBlU2NyaXB0cy9VSS50cyIsIlR5cGVTY3JpcHRzL1l0UGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQztJQUFBO0lBVUQsQ0FBQztJQUFELFlBQUM7QUFBRCxDQVZDLEFBVUEsSUFBQTtBQVZhLHNCQUFLO0FBWW5CO0lBRUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUtMLGFBQUM7QUFBRCxDQVRBLEFBU0MsSUFBQTtBQVRZLHdCQUFNO0FBV25CO0lBRUk7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUtMLGdCQUFDO0FBQUQsQ0FYQSxBQVdDLElBQUE7QUFYWSw4QkFBUztBQWF0QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDekN0QjtJQUlJLHNCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSwyQkFBSSxHQUFYLFVBQVksS0FBYSxFQUFFLE1BQWMsRUFBRSxRQUFnQixFQUFFLFFBQWlCO1FBQzFFLElBQUksV0FBVyxHQUFHLEVB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QUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sa0NBQWUsR0FBdEI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLDRCQUFTLEdBQWhCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVMLGVBQUM7QUFBRCxDQTVFQSxBQTRFQyxJQUFBO0FBNUVZLDRCQUFRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7v2V4cG9ydCBjbGFzcyBNZWRpYSB7XHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgVXNlcklkOiBudW1iZXI7XHJcbiAgICBVc2VyTmFtZTogc3RyaW5nO1xyXG4gICAgWVRWaWRlb0lEOiBudW1iZXI7XHJcbiAgICBNUDNTb3VyY2U6IHN0cmluZztcclxuICAgIE9HR1NvdXJjZTogc3RyaW5nO1xyXG4gICAgVGl0bGU6IHN0cmluZztcclxuICAgIFRodW1iVVJMOiBzdHJpbmc7XHJcbiAgICBEZXNjcmlwdGlvbjogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTXlVc2VyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLlN0YXRlID0gbmV3IFVzZXJTdGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBTdGF0ZTogVXNlclN0YXRlO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVXNlclN0YXRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLlRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMuUXVldWVQb3NpdGlvbiA9IC0xO1xyXG4gICAgICAgIHRoaXMuUGxheWVyU3RhdGUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIFRpbWU6IG51bWJlcjtcclxuICAgIFF1ZXVlUG9zaXRpb246IG51bWJlcjtcclxuICAgIFBsYXllclN0YXRlOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXNzaW9uIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBVc2VyczogTXlVc2VyW107XHJcbiAgICBRdWV1ZTogTWVkaWFbXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFdzTWVzc2FnZSB7XHJcbiAgICBBY3Rpb246IHN0cmluZztcclxuICAgIFNlc3Npb246IFNlc3Npb247XHJcbiAgICBNZWRpYTogTWVkaWE7XHJcbiAgICBVc2VyOiBNeVVzZXI7XHJcbiAgICBDaGF0TWVzc2FnZTogc3RyaW5nO1xyXG59Iiwi77u/aW1wb3J0IHsgTWVkaWEgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGcmFtZUJ1aWxkZXIge1xyXG5cclxuICAgIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZXIoY29sb3I6IHN0cmluZywgdXNlcklkOiBudW1iZXIsIHVzZXJOYW1lOiBzdHJpbmcsIHRoaXNJc01lOiBib29sZWFuKSA6IHN0cmluZyB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICB2YXIgbWVIdG1sID0gdGhpc0lzTWUgPyAnb25jbGljaz1cInJlcXVlc3RTeW5jV2l0aFVzZXIoJyArIHVzZXJJZCArICcpXCIgJyA6IFwiXCI7XHJcbiAgICAgICAgdmFyIHN5bmNIVE1MID0gdGhpc0lzTWUgPyAneW91JyA6ICdzeW5jJztcclxuICAgICAgICB2YXIgc3luY0hUTUxNb2JpbGUgPSB0aGlzSXNNZSA/ICd5b3UnIDogJ3N5bmMgd2l0aCAnICsgdXNlck5hbWU7XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8ZGl2ICcgKyBtZUh0bWwgKyAnY2xhc3M9XCJkaXZfdXNlclwiIHN0eWxlPVwiYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj4gJyArIHN5bmNIVE1MTW9iaWxlICsgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiAnICsgbWVIdG1sICsgJ3N0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZsb2F0OiBsZWZ0OyBjdXJzb3I6IHBvaW50ZXI7IG1hcmdpbi1yaWdodDogMTZweDsgaGVpZ2h0OiA0OHB4OyB3aWR0aDogNDhweDsgYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj4nICsgc3luY0hUTUwgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4OyBmbG9hdDogcmlnaHQ7XCI+JyArIHVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudEhUTUw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG1lZGlhKG1lZGlhOiBNZWRpYSwgcG9zaXRpb246IG51bWJlciwgcmVjb21tZW5kZWRCeU1lOiBib29sZWFuLCBvblRoaXM6IGJvb2xlYW4pIHtcclxuICAgICAgICB2YXIgY3VycmVudEhUTUwgPSBcIlwiO1xyXG4gICAgICAgIHZhciBjYW5EZWxldGVUaGlzID0gcmVjb21tZW5kZWRCeU1lOyAvLyYmICFvblRoaXM7XHJcbiAgICAgICAgdmFyIGRlbGV0ZVRoaXNIVE1MID0gY2FuRGVsZXRlVGhpcyA/ICd0aXRsZT1cIkNsaWNrIHRvIGRlbGV0ZSB0aGlzIGZyb20gdGhlIHF1ZXVlIVwiIG9uY2xpY2s9XCJkZWxldGVNZWRpYSgnICsgbWVkaWEuSWQgKyAnLCAnICsgcG9zaXRpb24gKyAnKVwiICcgOiBcIlwiO1xyXG4gICAgICAgIHZhciBjYW5EZWxldGVTdHlsZSA9IGNhbkRlbGV0ZVRoaXMgPyBcImN1cnNvcjogcG9pbnRlcjsgXCIgOiBcIlwiO1xyXG4gICAgICAgIHZhciBvblRoaXNTdHlsZSA9IG9uVGhpcyA/IFwiYm9yZGVyOiAxcHggc29saWQgYmx1ZTsgXCIgOiBcIlwiO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGFkZCBkZWxldGUgVUlcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPSAnPGltZyBzdHlsZT1cIicgKyBvblRoaXNTdHlsZSArICdmbG9hdDogbGVmdDsgd2lkdGg6IDMzLjMzJTsgaGVpZ2h0OiAyMHZ3O1wiIHNyYz1cIicgICsgbWVkaWEuVGh1bWJVUkwgKyAnXCIvPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9XHJcbiAgICAgICAgICAgICAgICAnPGRpdiAnICsgZGVsZXRlVGhpc0hUTUwgKyAnc3R5bGU9XCInICsgY2FuRGVsZXRlU3R5bGUgKyBvblRoaXNTdHlsZSArICd0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8aW1nIHN0eWxlPVwiaGVpZ2h0OiA5MHB4OyB3aWR0aDogMTYwcHg7IG1hcmdpbi1yaWdodDogMTZweDtcIiBzcmM9XCInICsgbWVkaWEuVGh1bWJVUkwgKyAnXCIvPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDtcIj4nICsgbWVkaWEuVGl0bGUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxufSIsIu+7v2RlY2xhcmUgdmFyIFlUOiBhbnk7XHJcblxyXG5pbXBvcnQgeyBJUGxheWVyIH0gZnJvbSBcIi4vSVBsYXllclwiO1xyXG5pbXBvcnQgeyBNZWRpYSwgU2Vzc2lvbiwgVXNlclN0YXRlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcbmltcG9ydCB7IFVJIH0gZnJvbSBcIi4vVUlcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQb2RjYXN0UGxheWVyIGltcGxlbWVudHMgSVBsYXllciB7XHJcblxyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBhdWRpbzogSFRNTEF1ZGlvRWxlbWVudDtcclxuICAgIHByaXZhdGUgbXAzc291cmNlOiBhbnk7XHJcbiAgICBwcml2YXRlIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBwcml2YXRlIHVpOiBVSTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih1aTogVUksIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLnVpID0gdWk7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgICAgICB0aGlzLmF1ZGlvID0gPEhUTUxBdWRpb0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2h0bWw1YXVkaW8nKTtcclxuICAgICAgICB0aGlzLm1wM3NvdXJjZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcDNTb3VyY2UnKTtcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzX3BvZGNhc3QnKTtcclxuICAgICAgICAkKFwiI2Rpdl95dF9wbGF5ZXJcIikuaGlkZSgpO1xyXG4gICAgICAgICQoXCIjZGl2X3BvZGNhc3RfcGxheWVyXCIpLnNob3coKTtcclxuICAgIH07XHJcblxyXG4gICAgYXVkaW9UaW1lVXBkYXRlKCkge1xyXG4gICAgICAgIHZhciBwZXJjZW50YWdlID0gdGhpcy5hdWRpby5jdXJyZW50VGltZSAvIHRoaXMuYXVkaW8uZHVyYXRpb247XHJcbiAgICAgICAgdGhpcy51cGRhdGVQbGF5ZXJVSShwZXJjZW50YWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0UGxheWVyID0gKG9uUGxheWVyU3RhdGVDaGFuZ2UpID0+IHtcclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIHRoaXMudXBkYXRlUGxheWVyVUkoMCk7XHJcbiAgICAgICAgdGhpcy5hdWRpby5vbmVuZGVkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBvblBsYXllclN0YXRlQ2hhbmdlKHsgZGF0YTogMCB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hdWRpby5vbnRpbWV1cGRhdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW9UaW1lVXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNpbmUgPSAoQSwgaSwgbnVtKTogbnVtYmVyID0+IHtcclxuICAgICAgICByZXR1cm4gQSAqIE1hdGguc2luKChpIC8gKHRoaXMuY2FudmFzLndpZHRoIC8gbnVtKSkgKiAyICogTWF0aC5QSSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUGxheWVyVUkgPSAocGVyY2VudGFnZTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgdmFyIGN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xyXG4gICAgICAgIHZhciBBID0gMjAwO1xyXG4gICAgICAgIHZhciBudW0gPSAzO1xyXG4gICAgICAgIHZhciBtaWQgPSBNYXRoLmZsb29yKHBlcmNlbnRhZ2UgKiB0aGlzLmNhbnZhcy53aWR0aCk7XHJcblxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcImJsdWVcIjtcclxuICAgICAgICBjdHgubW92ZVRvKDAsIHRoaXMuY2FudmFzLmhlaWdodCAvIDIpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWlkOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgY3R4LmxpbmVUbyhpLCAtMSAqIHRoaXMuc2luZShBLCBpLCBudW0pICsgdGhpcy5jYW52YXMuaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICBmb3IgKHZhciBpID0gbWlkOyBpIDwgdGhpcy5jYW52YXMud2lkdGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBjdHgubGluZVRvKGksIC0xICogdGhpcy5zaW5lKEEsIGksIG51bSkgKyB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmx1ZVwiO1xyXG4gICAgICAgIGN0eC5hcmMobWlkLCAtMSAqIHRoaXMuc2luZShBLCBtaWQsIG51bSkgKyB0aGlzLmNhbnZhcy5oZWlnaHQgLyAyLCAxMCwgMCwgTWF0aC5QSSAqIDIsIHRydWUpO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UGxheWVyQ29udGVudCA9IChtZWRpYTogTWVkaWEsIHRpbWU6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIHRoaXMubXAzc291cmNlLnNldEF0dHJpYnV0ZSgnc3JjJywgbWVkaWEuTVAzU291cmNlKTtcclxuICAgICAgICB0aGlzLmF1ZGlvLmxvYWQoKTtcclxuICAgICAgICB0aGlzLmF1ZGlvLnBsYXkoKTtcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZUN1cnJlbnRDb250ZW50KG1lZGlhKTtcclxuICAgIH1cclxuXHJcbiAgICBwbGF5ID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXVkaW8ucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHBhdXNlID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXVkaW8ucGF1c2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDdXJyZW50VGltZSA9ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hdWRpby5jdXJyZW50VGltZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDdXJyZW50U3RhdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuYXVkaW8ucGF1c2VkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzU3RvcHBlZCA9ICgpIDogYm9vbGVhbiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXVkaW8uY3VycmVudFRpbWUgPj0gdGhpcy5hdWRpby5kdXJhdGlvbjtcclxuICAgIH1cclxuXHJcbn0iLCLvu79pbXBvcnQgeyBNeVVzZXIsIE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUsIFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBVSUNhbGxiYWNrcywgVUkgfSBmcm9tIFwiLi9VSVwiO1xyXG5pbXBvcnQgeyBNeVNvY2tldCwgQ2xpZW50QWN0aW9ucyB9IGZyb20gXCIuL1NvY2tldHNcIjtcclxuaW1wb3J0IHsgSVBsYXllciB9IGZyb20gXCIuL0lQbGF5ZXJcIjtcclxuaW1wb3J0IHsgUG9kY2FzdFBsYXllciB9IGZyb20gXCIuL1BvZGNhc3RQbGF5ZXJcIjtcclxuaW1wb3J0IHsgWXRQbGF5ZXIgfSBmcm9tIFwiLi9ZdFBsYXllclwiO1xyXG5cclxuY2xhc3MgUm9vbU1hbmFnZXIgaW1wbGVtZW50cyBVSUNhbGxiYWNrcywgQ2xpZW50QWN0aW9ucyB7XHJcblxyXG4gICAgdXNlcjogTXlVc2VyO1xyXG4gICAgc2Vzc2lvbjogU2Vzc2lvbjtcclxuICAgIHBsYXllcjogSVBsYXllcjsgXHJcbiAgICBzb2NrZXQ6IE15U29ja2V0O1xyXG4gICAgdWk6IFVJO1xyXG4gICAgcm9vbVR5cGU6IHN0cmluZztcclxuICAgIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3Iocm9vbVR5cGU6IHN0cmluZywgbW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIC8vIFRPRE86IGZpbmQgYSBiZXR0ZXIgd2F5IHRvIGV4cG9zZSB0aGVzZSBmdW5jdGlvbnMgdG8gaHRtbD9cclxuICAgICAgICAoPGFueT53aW5kb3cpLnJlcXVlc3RTeW5jV2l0aFVzZXIgPSB0aGlzLnJlcXVlc3RTeW5jV2l0aFVzZXI7XHJcbiAgICAgICAgKDxhbnk+d2luZG93KS5kZWxldGVNZWRpYSA9IHRoaXMuZGVsZXRlTWVkaWE7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZSA9IHJvb21UeXBlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoZW5jb2RlZFNlc3Npb25OYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uID0gbmV3IFNlc3Npb24oKTtcclxuICAgICAgICB0aGlzLnVpID0gbmV3IFVJKHRoaXMubW9iaWxlQnJvd3NlciwgdGhpcyk7XHJcbiAgICAgICAgaWYgKHRoaXMucm9vbVR5cGUgPT0gXCJwb2RjYXN0c1wiKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyID0gbmV3IFBvZGNhc3RQbGF5ZXIodGhpcy51aSwgdGhpcy5tb2JpbGVCcm93c2VyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyID0gbmV3IFl0UGxheWVyKHRoaXMudWksIHRoaXMubW9iaWxlQnJvd3Nlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gbmV3IE15U29ja2V0KHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBKYW1TZXNzaW9uKGVuY29kZWRTZXNzaW9uTmFtZSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIuaW5pdFBsYXllcih0aGlzLm9uUGxheWVyU3RhdGVDaGFuZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldHVwSmFtU2Vzc2lvbihlbmNvZGVkU2Vzc2lvbk5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuc2Vzc2lvbi5OYW1lID0gZGVjb2RlVVJJKGVuY29kZWRTZXNzaW9uTmFtZSk7XHJcbiAgICAgICAgdGhpcy51c2VyLk5hbWUgPSAnQW5vbnltb3VzJztcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdVc2VySm9pblNlc3Npb24nO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHRoaXMudXNlcjtcclxuICAgICAgICBtZXNzYWdlLlNlc3Npb24gPSB0aGlzLnNlc3Npb247XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gV2ViU29ja2V0IG1lc3NhZ2UgcmVzcG9uc2UgZnVuY3Rpb25zXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIGNsaWVudFByb3ZpZGVVc2VyU3RhdGUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIHVzZXJUb1N5bmNXaXRoID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdXNlclRvU3luY1dpdGguU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLnVzZXIuU3RhdGUuVGltZSA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlRpbWU7XHJcbiAgICAgICAgdGhpcy51c2VyLlN0YXRlLlBsYXllclN0YXRlID0gdXNlclRvU3luY1dpdGguU3RhdGUuUGxheWVyU3RhdGU7XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVRdWV1ZSh0aGlzLnNlc3Npb24uUXVldWUsIHRoaXMudXNlci5JZCwgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG4gICAgICAgIHRoaXMub25Vc2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRSZXF1ZXN0VXNlclN0YXRlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciB1c2VyRGF0YSA9IG5ldyBNeVVzZXIoKTtcclxuICAgICAgICB1c2VyRGF0YS5JZCA9IG1lc3NhZ2UuVXNlci5JZDsgLy8gVE9ETzogYmFkIGJhZCBiYWRcclxuICAgICAgICB1c2VyRGF0YS5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICAgICAgdXNlckRhdGEuU3RhdGUuVGltZSA9IE1hdGgucm91bmQodGhpcy5wbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSk7XHJcbiAgICAgICAgdXNlckRhdGEuU3RhdGUuUGxheWVyU3RhdGUgPSB0aGlzLnBsYXllci5nZXRDdXJyZW50U3RhdGUoKTtcclxuXHJcbiAgICAgICAgdmFyIG91dGdvaW5nTXNnID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG91dGdvaW5nTXNnLkFjdGlvbiA9ICdQcm92aWRlU3luY1RvVXNlcic7XHJcbiAgICAgICAgb3V0Z29pbmdNc2cuVXNlciA9IHVzZXJEYXRhO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQob3V0Z29pbmdNc2cpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFNlc3Npb25SZWFkeShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB0aGlzLnNlc3Npb24gPSBtZXNzYWdlLlNlc3Npb247XHJcbiAgICAgICAgdGhpcy51c2VyID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgICAgIHRoaXMudWlOZXh0TWVkaWEoKTtcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVF1ZXVlKHRoaXMuc2Vzc2lvbi5RdWV1ZSwgdGhpcy51c2VyLklkLCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVVc2Vyc0xpc3QodGhpcy5zZXNzaW9uLlVzZXJzLCB0aGlzLnVzZXIuSWQpO1xyXG4gICAgICAgIHRoaXMudWkuc2Vzc2lvblJlYWR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50VXBkYXRlVXNlcnNMaXN0KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciB1c2VycyA9IG1lc3NhZ2UuU2Vzc2lvbi5Vc2VycztcclxuICAgICAgICB0aGlzLnNlc3Npb24uVXNlcnMgPSB1c2VycztcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVVzZXJzTGlzdCh0aGlzLnNlc3Npb24uVXNlcnMsIHRoaXMudXNlci5JZCk7XHRcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRVcGRhdGVRdWV1ZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgd2FzV2FpdGluZyA9IHRoaXMuaXNVc2VyV2FpdGluZygpO1xyXG4gICAgICAgIHRoaXMuc2Vzc2lvbi5RdWV1ZSA9IG1lc3NhZ2UuU2Vzc2lvbi5RdWV1ZTtcclxuICAgICAgICBpZiAod2FzV2FpdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLnVpTmV4dE1lZGlhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudWkudXBkYXRlUXVldWUodGhpcy5zZXNzaW9uLlF1ZXVlLCB0aGlzLnVzZXIuSWQsIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRDaGF0TWVzc2FnZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgY2hhdE1lc3NhZ2UgPSBtZXNzYWdlLkNoYXRNZXNzYWdlO1xyXG4gICAgICAgIHZhciB1c2VyTmFtZSA9IG1lc3NhZ2UuVXNlci5OYW1lO1xyXG4gICAgICAgIHRoaXMudWkub25DaGF0TWVzc2FnZSh1c2VyTmFtZSwgY2hhdE1lc3NhZ2UsICdibHVlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50U2VhcmNoUmVzdWx0cyhtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICAvLyBUT0RPOiBkdW1iXHJcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBtZXNzYWdlLlNlc3Npb24uUXVldWU7XHJcbiAgICAgICAgdGhpcy51aS5vblNlYXJjaFJlc3VsdHMocmVzdWx0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNVc2VyV2FpdGluZyA9ICgpOiBib29sZWFuID0+IHtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMuc2Vzc2lvbi5RdWV1ZS5sZW5ndGg7XHJcbiAgICAgICAgcmV0dXJuIHBvcyA8IDAgfHwgKChwb3MgPT0gKGxlbmd0aCAtIDEpKSAmJiB0aGlzLnBsYXllci5pc1N0b3BwZWQoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9cclxuICAgIC8vIE1vc3RseSBVSSBjYWxsYmFjayBmdW5jdGlvbnNcclxuICAgIC8vXHJcbiAgICB1aVNlbmRDaGF0TWVzc2FnZShtc2c6IHN0cmluZykge1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0NoYXRNZXNzYWdlJztcclxuICAgICAgICBtZXNzYWdlLkNoYXRNZXNzYWdlID0gbXNnO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHRoaXMudXNlcjtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICB9XHJcblxyXG4gICAgb25QbGF5ZXJTdGF0ZUNoYW5nZSA9IChldmVudCkgPT4ge1xyXG4gICAgICAgIGlmKGV2ZW50LmRhdGE9PTApIHtcclxuICAgICAgICAgICAgdGhpcy51aU5leHRNZWRpYSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1aVNlYXJjaChxdWVyeTogc3RyaW5nLCBwYWdlOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdTZWFyY2gnO1xyXG4gICAgICAgIC8vIFRPRE86IGR1bWJcclxuICAgICAgICBtZXNzYWdlLkNoYXRNZXNzYWdlID0gcXVlcnk7XHJcbiAgICAgICAgbWVzc2FnZS5NZWRpYSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuTWVkaWEuSWQgPSBwYWdlO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdWlOYW1lQ2hhbmdlKG5ld05hbWUpIHtcclxuICAgICAgICB0aGlzLnVzZXIuTmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5Vc2VyID0gdGhpcy51c2VyO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1NhdmVVc2VyTmFtZUNoYW5nZSc7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBvblVzZXJTdGF0ZUNoYW5nZSgpIHtcclxuICAgICAgICBpZiAodGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPj0gMCAmJiB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA8IHRoaXMuc2Vzc2lvbi5RdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuc2V0UGxheWVyQ29udGVudCh0aGlzLnNlc3Npb24uUXVldWVbdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb25dLCB0aGlzLnVzZXIuU3RhdGUuVGltZSk7XHJcbiAgICAgICAgICAgIHRoaXMudWkudXBkYXRlUXVldWUodGhpcy5zZXNzaW9uLlF1ZXVlLCB0aGlzLnVzZXIuSWQsIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdWlOZXh0TWVkaWEgPSAoKSA9PiB7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gdGhpcy5zZXNzaW9uLlF1ZXVlO1xyXG4gICAgICAgIGlmKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMSA8IHF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICs9IDE7XHJcbiAgICAgICAgICAgIHRoaXMub25Vc2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdWlQYXVzZU1lZGlhID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucGxheWVyLnBhdXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdWlQbGF5TWVkaWEgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVpUHJldmlvdXNNZWRpYSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gdGhpcy5zZXNzaW9uLlF1ZXVlO1xyXG4gICAgICAgIGlmKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIC0gMTtcclxuICAgICAgICAgICAgdGhpcy5vblVzZXJTdGF0ZUNoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIFRoZXNlIGZ1bmN0aW9ucyBhcmUgY2FsbGVkIGRpcmVjdGx5IGVtYmVkZGVkIGludG8gdGhlIGh0bWwuLi4ga2luZGEgd2VpcmRcclxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgb25GYXRhbEVycm9yID0gKCkgPT4ge1xyXG4gICAgICAgICQoXCIjZGl2X2V2ZXJ5dGhpbmdcIikuaGlkZSgpO1xyXG4gICAgICAgICQoXCIjZGl2X2Vycm9yXCIpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICByZXF1ZXN0U3luY1dpdGhVc2VyID0gKHVzZXJJZCkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdyZXF1ZXN0IHN5bmMgd2l0aCB1c2VyJyk7XHJcblxyXG4gICAgICAgIHZhciB1c2VyID0gbmV3IE15VXNlcigpO1xyXG4gICAgICAgIHVzZXIuSWQgPSB1c2VySWQ7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5BY3Rpb24gPSAnUmVxdWVzdFN5bmNXaXRoVXNlcic7XHJcbiAgICAgICAgbWVzc2FnZS5Vc2VyID0gdXNlcjtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHVpUXVldWVNZWRpYSA9IChtZWRpYTogTWVkaWEpID0+IHtcclxuICAgICAgICBtZWRpYS5Vc2VySWQgPSB0aGlzLnVzZXIuSWQ7XHJcbiAgICAgICAgbWVkaWEuVXNlck5hbWUgPSB0aGlzLnVzZXIuTmFtZTtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdBZGRNZWRpYVRvU2Vzc2lvbic7XHJcbiAgICAgICAgbWVzc2FnZS5NZWRpYSA9IG1lZGlhO1xyXG4gICAgICAgIC8vVE9ETzogbG9jYWwgYWRkIG1lZGlhXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBkZWxldGVNZWRpYSA9IChtZWRpYUlkOiBudW1iZXIsIHBvc2l0aW9uOiBudW1iZXIpID0+IHtcclxuXHJcbiAgICAgICAgdGhpcy5zZXNzaW9uLlF1ZXVlLnNwbGljZShwb3NpdGlvbiwgMSk7XHJcbiAgICAgICAgaWYgKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID49IHBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIC09IDE7XHJcbiAgICAgICAgICAgIHRoaXMub25Vc2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVRdWV1ZSh0aGlzLnNlc3Npb24uUXVldWUsIHRoaXMudXNlci5JZCwgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG5cclxuICAgICAgICB2YXIgbWVkaWFUb0RlbGV0ZSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgICAgIG1lZGlhVG9EZWxldGUuSWQgPSBtZWRpYUlkO1xyXG5cclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdEZWxldGVNZWRpYUZyb21TZXNzaW9uJztcclxuICAgICAgICBtZXNzYWdlLk1lZGlhID0gbWVkaWFUb0RlbGV0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmRlY2xhcmUgdmFyIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbmRlY2xhcmUgdmFyIHJvb21UeXBlOiBzdHJpbmc7XHJcbmRlY2xhcmUgdmFyIHJvb21OYW1lOiBzdHJpbmc7XHJcblxyXG52YXIgbVJvb21NYW5hZ2VyID0gbmV3IFJvb21NYW5hZ2VyKHJvb21UeXBlLCBtb2JpbGVCcm93c2VyKTtcclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgbVJvb21NYW5hZ2VyLmluaXQocm9vbU5hbWUpO1xyXG59KTtcclxuXHJcblxyXG4iLCLvu79pbXBvcnQgeyBXc01lc3NhZ2UgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50QWN0aW9ucyB7XHJcblxyXG4gICAgY2xpZW50U2Vzc2lvblJlYWR5OiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50VXBkYXRlVXNlcnNMaXN0OiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50VXBkYXRlUXVldWU6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRDaGF0TWVzc2FnZTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFJlcXVlc3RVc2VyU3RhdGU6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRQcm92aWRlVXNlclN0YXRlOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50U2VhcmNoUmVzdWx0czogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNeVNvY2tldCB7XHJcblxyXG4gICAgcHJpdmF0ZSBzb2NrZXQ6IFdlYlNvY2tldDtcclxuICAgIHByaXZhdGUgY2xpZW50QWN0aW9uczogQ2xpZW50QWN0aW9ucztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjbGllbnRBY3Rpb25zOiBDbGllbnRBY3Rpb25zKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xpZW50QWN0aW9ucyA9IGNsaWVudEFjdGlvbnM7XHJcblxyXG4gICAgICAgIHZhciB1cmkgPSBcIndzOi8vXCIgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArIFwiL3dzXCI7XHJcbiAgICAgICAgdmFyIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQodXJpKTtcclxuICAgICAgICBzb2NrZXQub25vcGVuID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuICAgICAgICBzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uIChldmVudCkge307XHJcblxyXG4gICAgICAgIHNvY2tldC5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xyXG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gbWVzc2FnZS5BY3Rpb247XHJcbiAgICAgICAgICAgIGlmIChjbGllbnRBY3Rpb25zW2FjdGlvbl0pIHtcclxuICAgICAgICAgICAgICAgIGNsaWVudEFjdGlvbnNbYWN0aW9uXShtZXNzYWdlKTsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJiYWQgY2xpZW50IGFjdGlvblwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGhhbmRsZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBlbWl0KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSB0aGlzLnNvY2tldC5DT05ORUNUSU5HKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9LCA1MCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XHJcbiAgICB9O1xyXG5cclxufVxyXG4iLCLvu79pbXBvcnQgeyBGcmFtZUJ1aWxkZXIgfSBmcm9tIFwiLi9GcmFtZUJ1aWxkZXJcIjtcclxuaW1wb3J0IHsgTWVkaWEgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmRlY2xhcmUgdmFyIFNwaW5uZXI6IGFueTtcclxuXHJcbi8vIFRPRE86IG1ha2UgdGhpcyBhbiBpbnRlcmZhY2VcclxuZXhwb3J0IGludGVyZmFjZSBVSUNhbGxiYWNrcyB7XHJcbiAgICB1aVByZXZpb3VzTWVkaWE6IGFueTtcclxuICAgIHVpTmV4dE1lZGlhOiBhbnk7XHJcbiAgICB1aVBsYXlNZWRpYTogYW55O1xyXG4gICAgdWlQYXVzZU1lZGlhOiBhbnk7XHJcbiAgICB1aVNlbmRDaGF0TWVzc2FnZTogYW55O1xyXG4gICAgdWlTZWFyY2g6IChxdWVyeTogc3RyaW5nLCBwYWdlOiBudW1iZXIpID0+IHZvaWQ7XHJcbiAgICB1aU5hbWVDaGFuZ2U6IGFueTtcclxuICAgIHVpUXVldWVNZWRpYTogKG1lZGlhOiBNZWRpYSkgPT4gdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFVJIHtcclxuXHJcbiAgICBwcml2YXRlIGNvbG9yczogYW55O1xyXG4gICAgcHJpdmF0ZSBzcGlubmVyOiBhbnk7XHJcbiAgICBwcml2YXRlIGNhbGxiYWNrczogVUlDYWxsYmFja3M7XHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGZyYW1lQnVpbGRlcjogRnJhbWVCdWlsZGVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50UGFnZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50UXVlcnk6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuLCBjYWxsYmFja3M6IFVJQ2FsbGJhY2tzKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvcnMgPSBbJ3JlZCcsICdvcmFuZ2UnLCAneWVsbG93JywgJ2dyZWVuJywgJ2JsdWUnLCAndmlvbGV0J107XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgICAgICB0aGlzLmZyYW1lQnVpbGRlciA9IG5ldyBGcmFtZUJ1aWxkZXIobW9iaWxlQnJvd3Nlcik7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSBjYWxsYmFja3M7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplKCkge1xyXG4gICAgICAgIHRoaXMuc2V0dXBTcGlubmVyVUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwSW5mb1JvbGxvdmVyVUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwSW5wdXRVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBQbGF5ZXJDb250cm9sQnV0dG9ucygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXNzaW9uUmVhZHkgPSAoKSA9PiB7XHJcbiAgICAgICAgJChcIiNkaXZfbG9hZGluZ1wiKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zcGlubmVyLnN0b3AoKTtcclxuICAgICAgICAkKFwiI2Rpdl9ldmVyeXRoaW5nXCIpLmFuaW1hdGUoe29wYWNpdHk6IDF9LCAnZmFzdCcpO1xyXG4gICAgfSBcclxuXHJcbiAgICBwcml2YXRlIHNldHVwU3Bpbm5lclVJKCkge1xyXG4gICAgICAgIHZhciBvcHRzID0ge1xyXG4gICAgICAgICAgICBsaW5lczogMTMgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XHJcbiAgICAgICAgICAgICwgbGVuZ3RoOiAyOCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxyXG4gICAgICAgICAgICAsIHdpZHRoOiAxNCAvLyBUaGUgbGluZSB0aGlja25lc3NcclxuICAgICAgICAgICAgLCByYWRpdXM6IDQyIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxyXG4gICAgICAgICAgICAsIHNjYWxlOiAxIC8vIFNjYWxlcyBvdmVyYWxsIHNpemUgb2YgdGhlIHNwaW5uZXJcclxuICAgICAgICAgICAgLCBjb3JuZXJzOiAxIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXHJcbiAgICAgICAgICAgICwgY29sb3I6ICcjMDAwJyAvLyAjcmdiIG9yICNycmdnYmIgb3IgYXJyYXkgb2YgY29sb3JzXHJcbiAgICAgICAgICAgICwgb3BhY2l0eTogMC4yNSAvLyBPcGFjaXR5IG9mIHRoZSBsaW5lc1xyXG4gICAgICAgICAgICAsIHJvdGF0ZTogMCAvLyBUaGUgcm90YXRpb24gb2Zmc2V0XHJcbiAgICAgICAgICAgICwgZGlyZWN0aW9uOiAxIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcclxuICAgICAgICAgICAgLCBzcGVlZDogMSAvLyBSb3VuZHMgcGVyIHNlY29uZFxyXG4gICAgICAgICAgICAsIHRyYWlsOiA2MCAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxyXG4gICAgICAgICAgICAsIGZwczogMjAgLy8gRnJhbWVzIHBlciBzZWNvbmQgd2hlbiB1c2luZyBzZXRUaW1lb3V0KCkgYXMgYSBmYWxsYmFjayBmb3IgQ1NTXHJcbiAgICAgICAgICAgICwgekluZGV4OiAyZTkgLy8gVGhlIHotaW5kZXggKGRlZmF1bHRzIHRvIDIwMDAwMDAwMDApXHJcbiAgICAgICAgICAgICwgY2xhc3NOYW1lOiAnc3Bpbm5lcicgLy8gVGhlIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIHNwaW5uZXJcclxuICAgICAgICAgICAgLCB0b3A6ICc1MCUnIC8vIFRvcCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcclxuICAgICAgICAgICAgLCBsZWZ0OiAnNTAlJyAvLyBMZWZ0IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIHNoYWRvdzogZmFsc2UgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcclxuICAgICAgICAgICAgLCBod2FjY2VsOiBmYWxzZSAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb25cclxuICAgICAgICAgICAgLCBwb3NpdGlvbjogJ2Fic29sdXRlJyAvLyBFbGVtZW50IHBvc2l0aW9uaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2X2xvYWRpbmcnKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihvcHRzKS5zcGluKHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cEZhZGVVSShvdmVyYWxsLCByZXN1bHRzKSB7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWVudGVyKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mYWRlSW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG92ZXJhbGwubW91c2VsZWF2ZSgoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwSW5mb1JvbGxvdmVyVUkoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl91c2Vyc19vdmVyYWxsXCIpLCAkKFwiI2Rpdl91c2VyX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X3F1ZXVlX292ZXJhbGxcIiksICQoXCIjZGl2X3F1ZXVlX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X2NoYXRfb3ZlcmFsbFwiKSwgJChcIiNkaXZfY2hhdF9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9jY19vdmVyYWxsXCIpLCAkKFwiI2Rpdl9jY19yZXN1bHRzXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWFyY2hUZXh0Q2hhbmdlZCh0ZXh0KSB7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBpZih0ZXh0Lmxlbmd0aD09MCkge1xyXG4gICAgICAgICAgICBkaXZSZXN1bHRzLmZhZGVPdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cElucHV0VUkoKSB7XHJcbiAgICAgICAgdmFyIGlucHV0U2VhcmNoID0gJChcIiNpbnB1dF9zZWFyY2hcIik7XHJcbiAgICAgICAgaW5wdXRTZWFyY2gua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoRW50ZXJQcmVzc2VkKGlucHV0U2VhcmNoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBpbnB1dF9uYW1lID0gJChcIiNpbnB1dF9uYW1lXCIpO1xyXG4gICAgICAgIGlucHV0X25hbWUua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlck5hbWVDaGFuZ2UoaW5wdXRfbmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB2YXIgaW5wdXRfY2hhdCA9ICQoXCIjaW5wdXRfY2hhdFwiKTtcclxuICAgICAgICAgICAgaW5wdXRfY2hhdC5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVNlbmRDaGF0TWVzc2FnZShpbnB1dF9jaGF0LnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dF9jaGF0LnZhbChcIlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGpRdWVyeShkb2N1bWVudC5ib2R5KS5vbihcImNsaWNrXCIsIFwiOm5vdCgjZGl2X3NlYXJjaF9yZXN1bHRzLCAjZGl2X3NlYXJjaF9yZXN1bHRzICopXCIsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKS5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbChcIlwiKTtcclxuICAgICAgICB9KTvigIvigIvigIvigIvigIvigIvigItcclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5iaW5kKFwicHJvcGVydHljaGFuZ2UgaW5wdXQgcGFzdGVcIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoVGV4dENoYW5nZWQoJChcIiNpbnB1dF9zZWFyY2hcIikudmFsKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBQbGF5ZXJDb250cm9sQnV0dG9ucygpIHtcclxuICAgICAgICAkKFwiI2J0bl9wcmV2aW91c1wiKS5jbGljayh0aGlzLmNhbGxiYWNrcy51aVByZXZpb3VzTWVkaWEpO1xyXG4gICAgICAgICQoXCIjYnRuX3BhdXNlXCIpLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgJChcIiNidG5fcGF1c2VcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wbGF5XCIpLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MudWlQYXVzZU1lZGlhKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChcIiNidG5fcGxheVwiKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BsYXlcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpUGxheU1lZGlhKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChcIiNidG5fbmV4dFwiKS5jbGljayh0aGlzLmNhbGxiYWNrcy51aU5leHRNZWRpYSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uU2VhcmNoUmVzdWx0cyhyZXN1bHRzOiBNZWRpYVtdKSB7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLnNob3coKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCJcIik7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBtZWRpYSA9IHJlc3VsdHNbaV07XHJcbiAgICAgICAgICAgIHZhciBkaXZTZWFyY2hSZXN1bHQgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICAgICAgZGl2U2VhcmNoUmVzdWx0LmFkZENsYXNzKCdkaXZfcmVzdWx0IHNlYXJjaF9zdHVmZicpO1xyXG4gICAgICAgICAgICBkaXZTZWFyY2hSZXN1bHQuYXBwZW5kVG8oZGl2UmVzdWx0cyk7XHJcbiAgICAgICAgICAgIHZhciBpbWdUaHVtYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgICAgICAkKGltZ1RodW1iKS5hZGRDbGFzcygnaW1nX3Jlc3VsdCBzZWFyY2hfc3R1ZmYnKTtcclxuICAgICAgICAgICAgaW1nVGh1bWIuc3JjID0gbWVkaWEuVGh1bWJVUkw7XHJcbiAgICAgICAgICAgICQoaW1nVGh1bWIpLmFwcGVuZFRvKGRpdlNlYXJjaFJlc3VsdCk7XHJcbiAgICAgICAgICAgIHZhciBpbm5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICAkKGlubmVyRGl2KS5hZGRDbGFzcygnZGl2X2lubmVyX3Jlc3VsdHMgc2VhcmNoX3N0dWZmJyk7XHJcbiAgICAgICAgICAgICQoaW5uZXJEaXYpLmFwcGVuZFRvKGRpdlNlYXJjaFJlc3VsdCk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICQoc3BhblRpdGxlKS5hZGRDbGFzcygncmVzdWx0X3RpdGxlIHNlYXJjaF9zdHVmZicpO1xyXG4gICAgICAgICAgICAkKHNwYW5UaXRsZSkuYXBwZW5kVG8oaW5uZXJEaXYpO1xyXG4gICAgICAgICAgICAkKHNwYW5UaXRsZSkudGV4dChtZWRpYS5UaXRsZSk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuRGVzY3JpcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICQoc3BhbkRlc2NyaXB0aW9uKS5hZGRDbGFzcygncmVzdWx0X2Rlc2NyaXB0aW9uIHNlYXJjaF9zdHVmZicpO1xyXG4gICAgICAgICAgICAkKHNwYW5EZXNjcmlwdGlvbikuYXBwZW5kVG8oaW5uZXJEaXYpO1xyXG4gICAgICAgICAgICAkKHNwYW5EZXNjcmlwdGlvbikudGV4dChtZWRpYS5EZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIGRpdlNlYXJjaFJlc3VsdC5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVF1ZXVlTWVkaWEobWVkaWEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVE9ETzogdGhpcyBkb2VzbnQgaGF2ZSB0byBiZSBhZGRlZCBldmVyeSB0aW1lXHJcbiAgICAgICAgdmFyIHBhZ2luZ0RpdiA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG4gICAgICAgIHBhZ2luZ0Rpdi5hcHBlbmRUbyhkaXZSZXN1bHRzKTtcclxuICAgICAgICB2YXIgcHJldmlvdXNEaXYgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICBwcmV2aW91c0Rpdi5hcHBlbmRUbyhwYWdpbmdEaXYpO1xyXG4gICAgICAgIHByZXZpb3VzRGl2LmFkZENsYXNzKCdkaXZfcGFnaW5nJyk7XHJcbiAgICAgICAgcHJldmlvdXNEaXYuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzUGFnZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHByZXZpb3VzRGl2LnRleHQoJ3ByZXZpb3VzIHBhZ2UnKTtcclxuICAgICAgICB2YXIgbmV4dERpdiA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG4gICAgICAgIG5leHREaXYuYXBwZW5kVG8ocGFnaW5nRGl2KTtcclxuICAgICAgICBuZXh0RGl2LmFkZENsYXNzKCdkaXZfcGFnaW5nJyk7XHJcbiAgICAgICAgbmV4dERpdi5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dFBhZ2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBuZXh0RGl2LnRleHQoJ25leHQgcGFnZScpO1xyXG5cclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5ibHVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJldmlvdXNQYWdlID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZGlzcGxheVNlYXJjaGluZygpO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQYWdlID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlIC09IDE7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpU2VhcmNoKHRoaXMuY3VycmVudFF1ZXJ5LCB0aGlzLmN1cnJlbnRQYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dFBhZ2UgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5U2VhcmNoaW5nKCk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZSArPSAxO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpU2VhcmNoKHRoaXMuY3VycmVudFF1ZXJ5LCB0aGlzLmN1cnJlbnRQYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlQ3VycmVudENvbnRlbnQobWVkaWE6IE1lZGlhKSB7XHJcbiAgICAgICAgJChcIiNwX2NjX3N1bW1hcnlcIikudGV4dChtZWRpYS5UaXRsZSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGh0bWwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxpbWcgc3R5bGU9XCJoZWlnaHQ6IDkwcHg7IHdpZHRoOiAxNjBweDsgbWFyZ2luLXJpZ2h0OiAxNnB4O1wiIHNyYz1cIicgKyBtZWRpYS5UaHVtYlVSTCArICdcIi8+JyArXHJcbiAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7XCI+JyArIG1lZGlhLlRpdGxlICsgJzxicj4nICsgJ1JlY29tbWVuZGVkIGJ5OiAnICsgbWVkaWEuVXNlck5hbWUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikuaHRtbChodG1sKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcGxheVNlYXJjaGluZygpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuaHRtbChcIlwiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCI8cD5zZWFyY2hpbmc8L3A+XCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuZmFkZUluKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWFyY2hFbnRlclByZXNzZWQoaW5wdXRfc2VhcmNoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IDA7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UXVlcnkgPSBpbnB1dF9zZWFyY2gudmFsKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFF1ZXJ5ICYmIHRoaXMuY3VycmVudFF1ZXJ5ICE9IFwiXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MudWlTZWFyY2godGhpcy5jdXJyZW50UXVlcnksIHRoaXMuY3VycmVudFBhZ2UpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlTZWFyY2hpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVF1ZXVlKHF1ZXVlOiBNZWRpYVtdLCB1c2VySWRNZTogbnVtYmVyLCBxdWV1ZVBvc2l0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcXVldWUubGVuZ3RoO1xyXG4gICAgICAgIHZhciBzdW1tYXJ5ID0gbGVuZ3RoICsgXCIgdGhpbmdzIGluIHRoZSBwbGF5bGlzdFwiO1xyXG4gICAgICAgIGlmIChsZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gbGVuZ3RoICsgXCIgdGhpbmcgaW4gdGhlIHBsYXlsaXN0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGxlbmd0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSBcIk5vdGhpbmcgaW4gdGhlIHBsYXlsaXN0LiBRdWV1ZSBzb21ldGhpbmchXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjcF9xdWV1ZV9zdW1tYXJ5XCIpLnRleHQoc3VtbWFyeSk7XHJcblxyXG4gICAgICAgIHZhciBxdWV1ZVJlc3VsdHMgPSAkKFwiI2Rpdl9xdWV1ZV9yZXN1bHRzXCIpO1xyXG4gICAgICAgIHF1ZXVlUmVzdWx0cy5odG1sKFwiXCIpO1xyXG4gICAgICAgIC8vIFRPRE86IG5lZWQgdG8gbWFrZSB0aGlzIHNlcGVyYXRlIGZyb20gc2VhcmNoIHJlc3VsdHMgcHJvYmFibHlcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBtZWRpYSA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgICB2YXIgZGl2UXVldWVSZXN1bHQgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICAgICAgZGl2UXVldWVSZXN1bHQuYWRkQ2xhc3MoJ2Rpdl9yZXN1bHQnKTtcclxuICAgICAgICAgICAgZGl2UXVldWVSZXN1bHQuYXBwZW5kVG8ocXVldWVSZXN1bHRzKTtcclxuICAgICAgICAgICAgdmFyIGltZ1RodW1iID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgICAgICQoaW1nVGh1bWIpLmFkZENsYXNzKCdpbWdfcmVzdWx0Jyk7XHJcbiAgICAgICAgICAgIGltZ1RodW1iLnNyYyA9IG1lZGlhLlRodW1iVVJMO1xyXG4gICAgICAgICAgICAkKGltZ1RodW1iKS5hcHBlbmRUbyhkaXZRdWV1ZVJlc3VsdCk7XHJcbiAgICAgICAgICAgIHZhciBpbm5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICAkKGlubmVyRGl2KS5hZGRDbGFzcygnZGl2X2lubmVyX3Jlc3VsdHMnKTtcclxuICAgICAgICAgICAgJChpbm5lckRpdikuYXBwZW5kVG8oZGl2UXVldWVSZXN1bHQpO1xyXG4gICAgICAgICAgICB2YXIgc3BhblRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICAkKHNwYW5UaXRsZSkuYWRkQ2xhc3MoJ3Jlc3VsdF90aXRsZScpO1xyXG4gICAgICAgICAgICAkKHNwYW5UaXRsZSkuYXBwZW5kVG8oaW5uZXJEaXYpO1xyXG4gICAgICAgICAgICAkKHNwYW5UaXRsZSkudGV4dChtZWRpYS5UaXRsZSk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuRGVzY3JpcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICQoc3BhbkRlc2NyaXB0aW9uKS5hZGRDbGFzcygncmVzdWx0X2Rlc2NyaXB0aW9uJyk7XHJcbiAgICAgICAgICAgICQoc3BhbkRlc2NyaXB0aW9uKS5hcHBlbmRUbyhpbm5lckRpdik7XHJcbiAgICAgICAgICAgICQoc3BhbkRlc2NyaXB0aW9uKS50ZXh0KG1lZGlhLkRlc2NyaXB0aW9uKTtcclxuICAgICAgICB9XHJcbiAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIHVwZGF0ZVVzZXJzTGlzdCh1c2VycywgdXNlcklkTWU6IG51bWJlcikge1xyXG4gICAgICAgIHZhciBudW0gPSB1c2Vycy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHN1bW1hcnkgPSB1c2Vycy5sZW5ndGggKyBcIiB1c2VycyBsaXN0ZW5pbmdcIjtcclxuICAgICAgICBpZiAobnVtID09IDEpIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IHVzZXJzLmxlbmd0aCArIFwiIHVzZXIgbGlzdGVuaW5nXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjcF91c2Vyc19zdW1tYXJ5XCIpLnRleHQoc3VtbWFyeSk7XHJcbiAgICAgICAgdmFyIHVzZXJSZXN1bHRzID0gJChcIiNkaXZfdXNlcl9yZXN1bHRzXCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdXNlciA9IHVzZXJzW2ldO1xyXG4gICAgICAgICAgICB2YXIgdGhpc0lzTWUgPSAodXNlci5JZCA9PT0gdXNlcklkTWUpO1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudEhUTUwgPSB0aGlzLmZyYW1lQnVpbGRlci51c2VyKHRoaXMuY29sb3JzW2kgJSB0aGlzLmNvbG9ycy5sZW5ndGhdLCB1c2VyLklkLCB1c2VyLk5hbWUsIHRoaXNJc01lKTtcclxuICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdXNlclJlc3VsdHMuaHRtbChodG1sLmpvaW4oXCJcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyTmFtZUNoYW5nZShuYW1lX2lucHV0KSB7XHJcbiAgICAgICAgbmFtZV9pbnB1dC5oaWRlKCk7XHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuZmFkZUluKCk7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MudWlOYW1lQ2hhbmdlKG5hbWVfaW5wdXQudmFsKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkNoYXRNZXNzYWdlKHVzZXJOYW1lOiBzdHJpbmcsIG1zZzogc3RyaW5nLCBjb2xvcjogc3RyaW5nKSB7XHJcbiAgICAgICAgLy9UT0RPOiBjb2xvciBzdHVmZlxyXG4gICAgICAgIHZhciB1bF9jaGF0ID0gJChcIiN1bF9jaGF0XCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gJzxsaSBjbGFzcz1cImNoYXRcIj48c3BhbiBzdHlsZT1cIm1hcmdpbjogMDsgY29sb3I6ICcgKyBjb2xvciArICc7XCI+JyArIHVzZXJOYW1lICsgJzogPC9zcGFuPjxzcGFuPicgKyBtc2cgKyAnPC9zcGFuPjwvbGk+JztcclxuICAgICAgICB1bF9jaGF0LmFwcGVuZChodG1sKTtcclxuICAgICAgICBpZiAodWxfY2hhdC5sZW5ndGggPj0gMTApIHtcclxuICAgICAgICAgICAgdWxfY2hhdC5jaGlsZHJlbigpWzBdLnJlbW92ZSgpOyBcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCLvu79kZWNsYXJlIHZhciBZVDogYW55O1xyXG5cclxuaW1wb3J0IHsgSVBsYXllciB9IGZyb20gXCIuL0lQbGF5ZXJcIjtcclxuaW1wb3J0IHsgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBVSSB9IGZyb20gXCIuL1VJXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgWXRQbGF5ZXIgaW1wbGVtZW50cyBJUGxheWVyIHtcclxuXHJcbiAgICBwcml2YXRlIHl0UGxheWVyOiBhbnk7XHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIHVpOiBVSTtcclxuICAgIHB1YmxpYyBwbGF5ZXJSZWFkeTogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih1aTogVUksIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLnBsYXllclJlYWR5ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgICAgICB0aGlzLnVpID0gdWk7XHJcbiAgICAgICAgJChcIiNkaXZfeXRfcGxheWVyXCIpLnNob3coKTtcclxuICAgICAgICAkKFwiI2Rpdl9wb2RjYXN0X3BsYXllclwiKS5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSkge1xyXG4gICAgICAgIGlmIChZVCAmJiBZVC5QbGF5ZXIpIHtcclxuICAgICAgICAgICAgdGhpcy55dFBsYXllciA9IG5ldyBZVC5QbGF5ZXIoJ2Rpdl95dF9wbGF5ZXInLCB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICdhdXRvJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJWYXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbHM6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvd2luZm86IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0b3BsYXk6IDBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBldmVudHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnb25SZWFkeScgOiB0aGlzLm9uUGxheWVyUmVhZHksXHJcbiAgICAgICAgICAgICAgICAgICAgJ29uU3RhdGVDaGFuZ2UnOiBvblBsYXllclN0YXRlQ2hhbmdlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuaW5pdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKSB9LCA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRpdl9wbGF5ZXIgPSAkKFwiI2Rpdl95dF9wbGF5ZXJcIik7XHJcbiAgICAgICAgICAgIGRpdl9wbGF5ZXIuaGVpZ2h0KGRpdl9wbGF5ZXIud2lkdGgoKSAqIDkuMCAvIDE2LjApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25QbGF5ZXJSZWFkeSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnBsYXllclJlYWR5ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0UGxheWVyQ29udGVudChtZWRpYTogTWVkaWEsIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgIGlmICghdGhpcy5wbGF5ZXJSZWFkeSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygncGxheWVyIG5vdCByZWFkeSEnKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuc2V0UGxheWVyQ29udGVudChtZWRpYSwgdGltZSkgfSwgNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy55dFBsYXllci5sb2FkVmlkZW9CeUlkKG1lZGlhLllUVmlkZW9JRCwgdGltZSwgXCJsYXJnZVwiKTtcclxuICAgICAgICAgICAgdGhpcy51aS51cGRhdGVDdXJyZW50Q29udGVudChtZWRpYSk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGxheSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBsYXlWaWRlbygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYXVzZSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBhdXNlVmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFRpbWUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDdXJyZW50U3RhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLnl0UGxheWVyLmdldFBsYXllclN0YXRlKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc1N0b3BwZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFN0YXRlKCkgPT0gMDtcclxuICAgIH1cclxuXHJcbn0iXX0=
