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
    function PodcastPlayer(ui, mobileBrowser, nextMedia, previousMedia) {
        var _this = this;
        this.initPlayer = function (onPlayerStateChange) {
            _this.canvas.width = _this.canvas.offsetWidth;
            _this.canvas.height = _this.canvas.offsetHeight;
            _this.setupControls();
            _this.nothingPlaying();
            _this.audio.onended = function () {
                onPlayerStateChange({ data: 0 });
            };
            _this.audio.ontimeupdate = function () {
                _this.audioTimeUpdate();
            };
        };
        this.nothingPlaying = function () {
            $("#cc_title").text('Nothing currently playing.');
            $("#cc_show").text('Queue something up!');
            _this.updateProgressUI(0, 1);
        };
        this.setupControls = function () {
            var btnPlayPause = $("#btn_play_pause");
            btnPlayPause.attr('class', 'play_btn');
            btnPlayPause.click(function () {
                if (_this.audio.paused) {
                    _this.play();
                }
                else {
                    _this.pause();
                }
            });
        };
        this.updateProgressUI = function (time, duration) {
            var ctx = _this.canvas.getContext('2d');
            ctx.moveTo(0, 0);
            ctx.fillStyle = 'white';
            if (duration == 0) {
                duration = 1;
            }
            ctx.rect(0, 0, time / duration * _this.canvas.width, _this.canvas.height);
            ctx.fill();
            $("#cc_time").text(_this.format(time));
            $("#cc_duration").text(_this.format(duration));
        };
        this.setPlayerContent = function (media, time) {
            _this.mp3source.setAttribute('src', media.MP3Source);
            _this.audio.load();
            _this.updateInfoUI(media);
            _this.play();
        };
        this.play = function () {
            $("#btn_play_pause").removeClass('play_btn').addClass('pause_btn');
            _this.audio.play();
        };
        this.pause = function () {
            $("#btn_play_pause").removeClass('pause_btn').addClass('play_btn');
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
        this.canvas = document.getElementById('canvas_progress');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
        $("#btn_next").click(nextMedia);
        $("#btn_previous").click(previousMedia);
    }
    ;
    PodcastPlayer.prototype.audioTimeUpdate = function () {
        var percentage = this.audio.currentTime / this.audio.duration;
        this.updateProgressUI(this.audio.currentTime, this.audio.duration);
    };
    PodcastPlayer.prototype.format = function (seconds) {
        if (!seconds || seconds == NaN) {
            seconds = 0;
        }
        seconds = Math.round(seconds);
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return this.format2Digit(hours) + ":" + this.format2Digit(minutes) + ":" + this.format2Digit(secs);
    };
    PodcastPlayer.prototype.format2Digit = function (num) {
        if (num < 10) {
            return "0" + num.toString();
        }
        return num.toString();
    };
    PodcastPlayer.prototype.updateInfoUI = function (media) {
        $("#cc_show").text('Radiolab');
        $("#cc_title").text(media.Title);
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
            else {
                _this.player.nothingPlaying();
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
        //if (this.roomType == "podcasts") {
        this.player = new PodcastPlayer_1.PodcastPlayer(this.ui, this.mobileBrowser, this.uiNextMedia, this.uiPreviousMedia);
        //}
        //else {
        //    this.player = new YtPlayer(this.ui, this.mobileBrowser);
        //}
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
},{"./Contracts":1,"./PodcastPlayer":4,"./Sockets":6,"./UI":7}],6:[function(require,module,exports){
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
            if (_this.currentPage > 0) {
                _this.displaySearching();
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
    UI.prototype.dropperSwitch = function (dropper) {
        if (dropper.hasClass('arrow-down')) {
            dropper.removeClass('arrow-down');
            dropper.addClass('arrow-up');
        }
        else {
            dropper.removeClass('arrow-up');
            dropper.addClass('arrow-down');
        }
    };
    UI.prototype.setupFadeUI = function (overall, results) {
        var _this = this;
        overall.mouseenter(function (e) {
            if (!results.is(':visible')) {
                results.fadeIn();
                var dropper = overall.find('.dropper');
                _this.dropperSwitch(dropper);
            }
        });
        overall.mouseleave(function (e) {
            if (results.is(':visible')) {
                results.fadeOut();
                var dropper = overall.find('.dropper');
                _this.dropperSwitch(dropper);
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
            $(spanDescription).html(media.Description);
            divSearchResult.click(function () {
                _this.callbacks.uiQueueMedia(media);
            });
        };
        var divSearchResult, imgThumb, innerDiv, spanTitle, spanDescription;
        for (var i = 0; i < results.length; i++) {
            _loop_1();
        }
        if (results.length == 0) {
            var divResults = $("#div_search_results");
            divResults.html("");
            divResults.html("<p id='p_searching'>no results found</p>");
            divResults.fadeIn();
        }
        // TODO: this doesnt have to be added every time
        if (results.length == 5) {
            var pagingDiv = $(document.createElement('div'));
            pagingDiv.addClass("div_outer_paging");
            pagingDiv.appendTo(divResults);
            var previousDiv = $(document.createElement('div'));
            previousDiv.appendTo(pagingDiv);
            previousDiv.addClass('div_paging');
            previousDiv.click(function () {
                _this.previousPage();
            });
            previousDiv.text('previous page');
            if (this.currentPage == 0) {
                previousDiv.hide();
            }
            var nextDiv = $(document.createElement('div'));
            nextDiv.appendTo(pagingDiv);
            nextDiv.addClass('div_paging');
            nextDiv.click(function () {
                _this.nextPage();
            });
            nextDiv.text('next page');
        }
        $("#input_search").blur();
    };
    UI.prototype.displaySearching = function () {
        var divResults = $("#div_search_results");
        divResults.html("");
        divResults.html("<p id='p_searching'>searching</p>");
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
            $(spanDescription).html(media.Description);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9GcmFtZUJ1aWxkZXIudHMiLCJUeXBlU2NyaXB0cy9Qb2RjYXN0UGxheWVyLnRzIiwiVHlwZVNjcmlwdHMvUm9vbS50cyIsIlR5cGVTY3JpcHRzL1NvY2tldHMudHMiLCJUeXBlU2NyaXB0cy9VSS50cyIsIlR5cGVTY3JpcHRzL1l0UGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQztJQUFBO0lBVUQsQ0FBQztJQUFELFlBQUM7QUFBRCxDQVZDLEFBVUEsSUFBQTtBQVZhLHNCQUFLO0FBWW5CO0lBRUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUtMLGFBQUM7QUFBRCxDQVRBLEFBU0MsSUFBQTtBQVRZLHdCQUFNO0FBV25CO0lBRUk7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUtMLGdCQUFDO0FBQUQsQ0FYQSxBQVdDLElBQUE7QUFYWSw4QkFBUztBQWF0QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDekN0QjtJQUlJLHNCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSwyQkFBSSxHQUFYLFVBQVksS0FBYSxFQUFFLE1BQWMsRUFBRSxRQUFnQixFQUFFLFFBQWlCO1FBQzFFLElBQUksV0FBVyxHQUFHLEVB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QUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztJQUVNLHVCQUFJLEdBQVg7UUFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFTSx3QkFBSyxHQUFaO1FBQ0ksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU0saUNBQWMsR0FBckI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLGtDQUFlLEdBQXRCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTSw0QkFBUyxHQUFoQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTCxlQUFDO0FBQUQsQ0EzRUEsQUEyRUMsSUFBQTtBQTNFWSw0QkFBUSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCLvu79leHBvcnQgY2xhc3MgTWVkaWEge1xyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIFVzZXJJZDogbnVtYmVyO1xyXG4gICAgVXNlck5hbWU6IHN0cmluZztcclxuICAgIFlUVmlkZW9JRDogbnVtYmVyO1xyXG4gICAgTVAzU291cmNlOiBzdHJpbmc7XHJcbiAgICBPR0dTb3VyY2U6IHN0cmluZztcclxuICAgIFRpdGxlOiBzdHJpbmc7XHJcbiAgICBUaHVtYlVSTDogc3RyaW5nO1xyXG4gICAgRGVzY3JpcHRpb246IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE15VXNlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5TdGF0ZSA9IG5ldyBVc2VyU3RhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgTmFtZTogc3RyaW5nO1xyXG4gICAgU3RhdGU6IFVzZXJTdGF0ZTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFVzZXJTdGF0ZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5UaW1lID0gMDtcclxuICAgICAgICB0aGlzLlF1ZXVlUG9zaXRpb24gPSAtMTtcclxuICAgICAgICB0aGlzLlBsYXllclN0YXRlID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBUaW1lOiBudW1iZXI7XHJcbiAgICBRdWV1ZVBvc2l0aW9uOiBudW1iZXI7XHJcbiAgICBQbGF5ZXJTdGF0ZTogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2Vzc2lvbiB7XHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgTmFtZTogc3RyaW5nO1xyXG4gICAgVXNlcnM6IE15VXNlcltdO1xyXG4gICAgUXVldWU6IE1lZGlhW107XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXc01lc3NhZ2Uge1xyXG4gICAgQWN0aW9uOiBzdHJpbmc7XHJcbiAgICBTZXNzaW9uOiBTZXNzaW9uO1xyXG4gICAgTWVkaWE6IE1lZGlhO1xyXG4gICAgVXNlcjogTXlVc2VyO1xyXG4gICAgQ2hhdE1lc3NhZ2U6IHN0cmluZztcclxufSIsIu+7v2ltcG9ydCB7IE1lZGlhIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRnJhbWVCdWlsZGVyIHtcclxuXHJcbiAgICBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyKGNvbG9yOiBzdHJpbmcsIHVzZXJJZDogbnVtYmVyLCB1c2VyTmFtZTogc3RyaW5nLCB0aGlzSXNNZTogYm9vbGVhbikgOiBzdHJpbmcge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgdmFyIG1lSHRtbCA9IHRoaXNJc01lID8gJ29uY2xpY2s9XCJyZXF1ZXN0U3luY1dpdGhVc2VyKCcgKyB1c2VySWQgKyAnKVwiICcgOiBcIlwiO1xyXG4gICAgICAgIHZhciBzeW5jSFRNTCA9IHRoaXNJc01lID8gJ3lvdScgOiAnc3luYyc7XHJcbiAgICAgICAgdmFyIHN5bmNIVE1MTW9iaWxlID0gdGhpc0lzTWUgPyAneW91JyA6ICdzeW5jIHdpdGggJyArIHVzZXJOYW1lO1xyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPSAnPGRpdiAnICsgbWVIdG1sICsgJ2NsYXNzPVwiZGl2X3VzZXJcIiBzdHlsZT1cImJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+ICcgKyBzeW5jSFRNTE1vYmlsZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgJyArIG1lSHRtbCArICdzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBmbG9hdDogbGVmdDsgY3Vyc29yOiBwb2ludGVyOyBtYXJnaW4tcmlnaHQ6IDE2cHg7IGhlaWdodDogNDhweDsgd2lkdGg6IDQ4cHg7IGJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+JyArIHN5bmNIVE1MICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDsgZmxvYXQ6IHJpZ2h0O1wiPicgKyB1c2VyTmFtZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRIVE1MO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtZWRpYShtZWRpYTogTWVkaWEsIHBvc2l0aW9uOiBudW1iZXIsIHJlY29tbWVuZGVkQnlNZTogYm9vbGVhbiwgb25UaGlzOiBib29sZWFuKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICB2YXIgY2FuRGVsZXRlVGhpcyA9IHJlY29tbWVuZGVkQnlNZTsgLy8mJiAhb25UaGlzO1xyXG4gICAgICAgIHZhciBkZWxldGVUaGlzSFRNTCA9IGNhbkRlbGV0ZVRoaXMgPyAndGl0bGU9XCJDbGljayB0byBkZWxldGUgdGhpcyBmcm9tIHRoZSBxdWV1ZSFcIiBvbmNsaWNrPVwiZGVsZXRlTWVkaWEoJyArIG1lZGlhLklkICsgJywgJyArIHBvc2l0aW9uICsgJylcIiAnIDogXCJcIjtcclxuICAgICAgICB2YXIgY2FuRGVsZXRlU3R5bGUgPSBjYW5EZWxldGVUaGlzID8gXCJjdXJzb3I6IHBvaW50ZXI7IFwiIDogXCJcIjtcclxuICAgICAgICB2YXIgb25UaGlzU3R5bGUgPSBvblRoaXMgPyBcImJvcmRlcjogMXB4IHNvbGlkIGJsdWU7IFwiIDogXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBhZGQgZGVsZXRlIFVJXHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gJzxpbWcgc3R5bGU9XCInICsgb25UaGlzU3R5bGUgKyAnZmxvYXQ6IGxlZnQ7IHdpZHRoOiAzMy4zMyU7IGhlaWdodDogMjB2dztcIiBzcmM9XCInICArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgJyArIGRlbGV0ZVRoaXNIVE1MICsgJ3N0eWxlPVwiJyArIGNhbkRlbGV0ZVN0eWxlICsgb25UaGlzU3R5bGUgKyAndGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGltZyBzdHlsZT1cImhlaWdodDogOTBweDsgd2lkdGg6IDE2MHB4OyBtYXJnaW4tcmlnaHQ6IDE2cHg7XCIgc3JjPVwiJyArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7XCI+JyArIG1lZGlhLlRpdGxlICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudEhUTUw7XHJcbiAgICB9XHJcbn0iLCLvu79kZWNsYXJlIHZhciBZVDogYW55O1xyXG5cclxuaW1wb3J0IHsgSVBsYXllciB9IGZyb20gXCIuL0lQbGF5ZXJcIjtcclxuaW1wb3J0IHsgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBVSSB9IGZyb20gXCIuL1VJXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgUG9kY2FzdFBsYXllciBpbXBsZW1lbnRzIElQbGF5ZXIge1xyXG5cclxuICAgIHByaXZhdGUgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgYXVkaW86IEhUTUxBdWRpb0VsZW1lbnQ7XHJcbiAgICBwcml2YXRlIG1wM3NvdXJjZTogYW55O1xyXG4gICAgcHJpdmF0ZSB1aTogVUk7XHJcbiAgICBwcml2YXRlIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IodWk6IFVJLCBtb2JpbGVCcm93c2VyOiBib29sZWFuLCBuZXh0TWVkaWEsIHByZXZpb3VzTWVkaWEpIHtcclxuICAgICAgICB0aGlzLnVpID0gdWk7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgICAgICB0aGlzLmF1ZGlvID0gPEhUTUxBdWRpb0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2h0bWw1YXVkaW8nKTtcclxuICAgICAgICB0aGlzLm1wM3NvdXJjZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcDNTb3VyY2UnKTtcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzX3Byb2dyZXNzJyk7XHJcbiAgICAgICAgJChcIiNkaXZfeXRfcGxheWVyXCIpLmhpZGUoKTtcclxuICAgICAgICAkKFwiI2Rpdl9wb2RjYXN0X3BsYXllclwiKS5zaG93KCk7XHJcbiAgICAgICAgJChcIiNidG5fbmV4dFwiKS5jbGljayhuZXh0TWVkaWEpO1xyXG4gICAgICAgICQoXCIjYnRuX3ByZXZpb3VzXCIpLmNsaWNrKHByZXZpb3VzTWVkaWEpO1xyXG4gICAgfTtcclxuXHJcbiAgICBpbml0UGxheWVyID0gKG9uUGxheWVyU3RhdGVDaGFuZ2UpID0+IHtcclxuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgICAgICB0aGlzLnNldHVwQ29udHJvbHMoKTtcclxuICAgICAgICB0aGlzLm5vdGhpbmdQbGF5aW5nKCk7XHJcbiAgICAgICAgdGhpcy5hdWRpby5vbmVuZGVkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBvblBsYXllclN0YXRlQ2hhbmdlKHsgZGF0YTogMCB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hdWRpby5vbnRpbWV1cGRhdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW9UaW1lVXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBub3RoaW5nUGxheWluZyA9ICgpID0+IHtcclxuICAgICAgICAkKFwiI2NjX3RpdGxlXCIpLnRleHQoJ05vdGhpbmcgY3VycmVudGx5IHBsYXlpbmcuJyk7XHJcbiAgICAgICAgJChcIiNjY19zaG93XCIpLnRleHQoJ1F1ZXVlIHNvbWV0aGluZyB1cCEnKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVByb2dyZXNzVUkoMCwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXVkaW9UaW1lVXBkYXRlKCkge1xyXG4gICAgICAgIHZhciBwZXJjZW50YWdlID0gdGhpcy5hdWRpby5jdXJyZW50VGltZSAvIHRoaXMuYXVkaW8uZHVyYXRpb247XHJcbiAgICAgICAgdGhpcy51cGRhdGVQcm9ncmVzc1VJKHRoaXMuYXVkaW8uY3VycmVudFRpbWUsIHRoaXMuYXVkaW8uZHVyYXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIHNldHVwQ29udHJvbHMgPSAoKSA9PiB7XHJcbiAgICAgICAgdmFyIGJ0blBsYXlQYXVzZSA9ICQoXCIjYnRuX3BsYXlfcGF1c2VcIik7XHJcbiAgICAgICAgYnRuUGxheVBhdXNlLmF0dHIoJ2NsYXNzJywgJ3BsYXlfYnRuJyk7XHJcbiAgICAgICAgYnRuUGxheVBhdXNlLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYXVkaW8ucGF1c2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGF1c2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZvcm1hdChzZWNvbmRzKSB7XHJcbiAgICAgICAgaWYgKCFzZWNvbmRzIHx8IHNlY29uZHMgPT0gTmFOKSB7XHJcbiAgICAgICAgICAgIHNlY29uZHMgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZWNvbmRzID0gTWF0aC5yb3VuZChzZWNvbmRzKTtcclxuICAgICAgICB2YXIgaG91cnMgPSBNYXRoLmZsb29yKHNlY29uZHMgLyAzNjAwKTtcclxuICAgICAgICB2YXIgbWludXRlcyA9IE1hdGguZmxvb3Ioc2Vjb25kcyAvIDYwKTtcclxuICAgICAgICB2YXIgc2VjcyA9IHNlY29uZHMgJSA2MDtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXQyRGlnaXQoaG91cnMpICsgXCI6XCIgKyB0aGlzLmZvcm1hdDJEaWdpdChtaW51dGVzKSArIFwiOlwiICsgdGhpcy5mb3JtYXQyRGlnaXQoc2Vjcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9ybWF0MkRpZ2l0KG51bTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKG51bSA8IDEwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIjBcIiArIG51bS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUHJvZ3Jlc3NVSSA9ICh0aW1lOiBudW1iZXIsIGR1cmF0aW9uOiBudW1iZXIpID0+IHtcclxuICAgICAgICB2YXIgY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICBjdHgubW92ZVRvKDAsIDApO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xyXG4gICAgICAgIGlmIChkdXJhdGlvbiA9PSAwKSB7IGR1cmF0aW9uID0gMTsgfVxyXG4gICAgICAgIGN0eC5yZWN0KDAsIDAsIHRpbWUgLyBkdXJhdGlvbiAqIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgJChcIiNjY190aW1lXCIpLnRleHQodGhpcy5mb3JtYXQodGltZSkpO1xyXG4gICAgICAgICQoXCIjY2NfZHVyYXRpb25cIikudGV4dCh0aGlzLmZvcm1hdChkdXJhdGlvbikpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFBsYXllckNvbnRlbnQgPSAobWVkaWE6IE1lZGlhLCB0aW1lOiBudW1iZXIpID0+IHtcclxuICAgICAgICB0aGlzLm1wM3NvdXJjZS5zZXRBdHRyaWJ1dGUoJ3NyYycsIG1lZGlhLk1QM1NvdXJjZSk7XHJcbiAgICAgICAgdGhpcy5hdWRpby5sb2FkKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVJbmZvVUkobWVkaWEpO1xyXG4gICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUluZm9VSShtZWRpYTogTWVkaWEpIHtcclxuICAgICAgICAkKFwiI2NjX3Nob3dcIikudGV4dCgnUmFkaW9sYWInKTtcclxuICAgICAgICAkKFwiI2NjX3RpdGxlXCIpLnRleHQobWVkaWEuVGl0bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXkgPSAoKSA9PiB7XHJcbiAgICAgICAgJChcIiNidG5fcGxheV9wYXVzZVwiKS5yZW1vdmVDbGFzcygncGxheV9idG4nKS5hZGRDbGFzcygncGF1c2VfYnRuJyk7XHJcbiAgICAgICAgdGhpcy5hdWRpby5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcGF1c2UgPSAoKSA9PiB7XHJcbiAgICAgICAgJChcIiNidG5fcGxheV9wYXVzZVwiKS5yZW1vdmVDbGFzcygncGF1c2VfYnRuJykuYWRkQ2xhc3MoJ3BsYXlfYnRuJyk7XHJcbiAgICAgICAgdGhpcy5hdWRpby5wYXVzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnRUaW1lID0gKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmF1ZGlvLmN1cnJlbnRUaW1lO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnRTdGF0ZSA9ICgpID0+IHtcclxuICAgICAgICBpZiAodGhpcy5hdWRpby5wYXVzZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNTdG9wcGVkID0gKCkgOiBib29sZWFuID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hdWRpby5jdXJyZW50VGltZSA+PSB0aGlzLmF1ZGlvLmR1cmF0aW9uO1xyXG4gICAgfVxyXG5cclxufSIsIu+7v2ltcG9ydCB7IE15VXNlciwgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSwgV3NNZXNzYWdlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcbmltcG9ydCB7IFVJQ2FsbGJhY2tzLCBVSSB9IGZyb20gXCIuL1VJXCI7XHJcbmltcG9ydCB7IE15U29ja2V0LCBDbGllbnRBY3Rpb25zIH0gZnJvbSBcIi4vU29ja2V0c1wiO1xyXG5pbXBvcnQgeyBJUGxheWVyIH0gZnJvbSBcIi4vSVBsYXllclwiO1xyXG5pbXBvcnQgeyBQb2RjYXN0UGxheWVyIH0gZnJvbSBcIi4vUG9kY2FzdFBsYXllclwiO1xyXG5pbXBvcnQgeyBZdFBsYXllciB9IGZyb20gXCIuL1l0UGxheWVyXCI7XHJcblxyXG5jbGFzcyBSb29tTWFuYWdlciBpbXBsZW1lbnRzIFVJQ2FsbGJhY2tzLCBDbGllbnRBY3Rpb25zIHtcclxuXHJcbiAgICB1c2VyOiBNeVVzZXI7XHJcbiAgICBzZXNzaW9uOiBTZXNzaW9uO1xyXG4gICAgcGxheWVyOiBQb2RjYXN0UGxheWVyOyBcclxuICAgIHNvY2tldDogTXlTb2NrZXQ7XHJcbiAgICB1aTogVUk7XHJcbiAgICByb29tVHlwZTogc3RyaW5nO1xyXG4gICAgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb29tVHlwZTogc3RyaW5nLCBtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgLy8gVE9ETzogZmluZCBhIGJldHRlciB3YXkgdG8gZXhwb3NlIHRoZXNlIGZ1bmN0aW9ucyB0byBodG1sP1xyXG4gICAgICAgICg8YW55PndpbmRvdykucmVxdWVzdFN5bmNXaXRoVXNlciA9IHRoaXMucmVxdWVzdFN5bmNXaXRoVXNlcjtcclxuICAgICAgICAoPGFueT53aW5kb3cpLmRlbGV0ZU1lZGlhID0gdGhpcy5kZWxldGVNZWRpYTtcclxuICAgICAgICB0aGlzLnJvb21UeXBlID0gcm9vbVR5cGU7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdChlbmNvZGVkU2Vzc2lvbk5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMudXNlciA9IG5ldyBNeVVzZXIoKTtcclxuICAgICAgICB0aGlzLnNlc3Npb24gPSBuZXcgU2Vzc2lvbigpO1xyXG4gICAgICAgIHRoaXMudWkgPSBuZXcgVUkodGhpcy5tb2JpbGVCcm93c2VyLCB0aGlzKTtcclxuICAgICAgICAvL2lmICh0aGlzLnJvb21UeXBlID09IFwicG9kY2FzdHNcIikge1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IFBvZGNhc3RQbGF5ZXIodGhpcy51aSwgdGhpcy5tb2JpbGVCcm93c2VyLCB0aGlzLnVpTmV4dE1lZGlhLCB0aGlzLnVpUHJldmlvdXNNZWRpYSk7XHJcbiAgICAgICAgLy99XHJcbiAgICAgICAgLy9lbHNlIHtcclxuICAgICAgICAvLyAgICB0aGlzLnBsYXllciA9IG5ldyBZdFBsYXllcih0aGlzLnVpLCB0aGlzLm1vYmlsZUJyb3dzZXIpO1xyXG4gICAgICAgIC8vfVxyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gbmV3IE15U29ja2V0KHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBKYW1TZXNzaW9uKGVuY29kZWRTZXNzaW9uTmFtZSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIuaW5pdFBsYXllcih0aGlzLm9uUGxheWVyU3RhdGVDaGFuZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldHVwSmFtU2Vzc2lvbihlbmNvZGVkU2Vzc2lvbk5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuc2Vzc2lvbi5OYW1lID0gZGVjb2RlVVJJKGVuY29kZWRTZXNzaW9uTmFtZSk7XHJcbiAgICAgICAgdGhpcy51c2VyLk5hbWUgPSAnQW5vbnltb3VzJztcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdVc2VySm9pblNlc3Npb24nO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHRoaXMudXNlcjtcclxuICAgICAgICBtZXNzYWdlLlNlc3Npb24gPSB0aGlzLnNlc3Npb247XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gV2ViU29ja2V0IG1lc3NhZ2UgcmVzcG9uc2UgZnVuY3Rpb25zXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIGNsaWVudFByb3ZpZGVVc2VyU3RhdGUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIHVzZXJUb1N5bmNXaXRoID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdXNlclRvU3luY1dpdGguU3RhdGUuUXVldWVQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLnVzZXIuU3RhdGUuVGltZSA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlRpbWU7XHJcbiAgICAgICAgdGhpcy51c2VyLlN0YXRlLlBsYXllclN0YXRlID0gdXNlclRvU3luY1dpdGguU3RhdGUuUGxheWVyU3RhdGU7XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVRdWV1ZSh0aGlzLnNlc3Npb24uUXVldWUsIHRoaXMudXNlci5JZCwgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG4gICAgICAgIHRoaXMub25Vc2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRSZXF1ZXN0VXNlclN0YXRlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciB1c2VyRGF0YSA9IG5ldyBNeVVzZXIoKTtcclxuICAgICAgICB1c2VyRGF0YS5JZCA9IG1lc3NhZ2UuVXNlci5JZDsgLy8gVE9ETzogYmFkIGJhZCBiYWRcclxuICAgICAgICB1c2VyRGF0YS5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICAgICAgdXNlckRhdGEuU3RhdGUuVGltZSA9IE1hdGgucm91bmQodGhpcy5wbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSk7XHJcbiAgICAgICAgdXNlckRhdGEuU3RhdGUuUGxheWVyU3RhdGUgPSB0aGlzLnBsYXllci5nZXRDdXJyZW50U3RhdGUoKTtcclxuXHJcbiAgICAgICAgdmFyIG91dGdvaW5nTXNnID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG91dGdvaW5nTXNnLkFjdGlvbiA9ICdQcm92aWRlU3luY1RvVXNlcic7XHJcbiAgICAgICAgb3V0Z29pbmdNc2cuVXNlciA9IHVzZXJEYXRhO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQob3V0Z29pbmdNc2cpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFNlc3Npb25SZWFkeShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB0aGlzLnNlc3Npb24gPSBtZXNzYWdlLlNlc3Npb247XHJcbiAgICAgICAgdGhpcy51c2VyID0gbWVzc2FnZS5Vc2VyO1xyXG4gICAgICAgIHRoaXMudWlOZXh0TWVkaWEoKTtcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVF1ZXVlKHRoaXMuc2Vzc2lvbi5RdWV1ZSwgdGhpcy51c2VyLklkLCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVVc2Vyc0xpc3QodGhpcy5zZXNzaW9uLlVzZXJzLCB0aGlzLnVzZXIuSWQpO1xyXG4gICAgICAgIHRoaXMudWkuc2Vzc2lvblJlYWR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50VXBkYXRlVXNlcnNMaXN0KG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciB1c2VycyA9IG1lc3NhZ2UuU2Vzc2lvbi5Vc2VycztcclxuICAgICAgICB0aGlzLnNlc3Npb24uVXNlcnMgPSB1c2VycztcclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVVzZXJzTGlzdCh0aGlzLnNlc3Npb24uVXNlcnMsIHRoaXMudXNlci5JZCk7XHRcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRVcGRhdGVRdWV1ZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgd2FzV2FpdGluZyA9IHRoaXMuaXNVc2VyV2FpdGluZygpO1xyXG4gICAgICAgIHRoaXMuc2Vzc2lvbi5RdWV1ZSA9IG1lc3NhZ2UuU2Vzc2lvbi5RdWV1ZTtcclxuICAgICAgICBpZiAod2FzV2FpdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLnVpTmV4dE1lZGlhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudWkudXBkYXRlUXVldWUodGhpcy5zZXNzaW9uLlF1ZXVlLCB0aGlzLnVzZXIuSWQsIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRDaGF0TWVzc2FnZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgY2hhdE1lc3NhZ2UgPSBtZXNzYWdlLkNoYXRNZXNzYWdlO1xyXG4gICAgICAgIHZhciB1c2VyTmFtZSA9IG1lc3NhZ2UuVXNlci5OYW1lO1xyXG4gICAgICAgIHRoaXMudWkub25DaGF0TWVzc2FnZSh1c2VyTmFtZSwgY2hhdE1lc3NhZ2UsICdibHVlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50U2VhcmNoUmVzdWx0cyhtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICAvLyBUT0RPOiBkdW1iXHJcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBtZXNzYWdlLlNlc3Npb24uUXVldWU7XHJcbiAgICAgICAgdGhpcy51aS5vblNlYXJjaFJlc3VsdHMocmVzdWx0cyk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNVc2VyV2FpdGluZyA9ICgpOiBib29sZWFuID0+IHtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMuc2Vzc2lvbi5RdWV1ZS5sZW5ndGg7XHJcbiAgICAgICAgcmV0dXJuIHBvcyA8IDAgfHwgKChwb3MgPT0gKGxlbmd0aCAtIDEpKSAmJiB0aGlzLnBsYXllci5pc1N0b3BwZWQoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9cclxuICAgIC8vIE1vc3RseSBVSSBjYWxsYmFjayBmdW5jdGlvbnNcclxuICAgIC8vXHJcbiAgICB1aVNlbmRDaGF0TWVzc2FnZShtc2c6IHN0cmluZykge1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0NoYXRNZXNzYWdlJztcclxuICAgICAgICBtZXNzYWdlLkNoYXRNZXNzYWdlID0gbXNnO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHRoaXMudXNlcjtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICB9XHJcblxyXG4gICAgb25QbGF5ZXJTdGF0ZUNoYW5nZSA9IChldmVudCkgPT4ge1xyXG4gICAgICAgIGlmKGV2ZW50LmRhdGE9PTApIHtcclxuICAgICAgICAgICAgdGhpcy51aU5leHRNZWRpYSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1aVNlYXJjaChxdWVyeTogc3RyaW5nLCBwYWdlOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdTZWFyY2gnO1xyXG4gICAgICAgIC8vIFRPRE86IGR1bWJcclxuICAgICAgICBtZXNzYWdlLkNoYXRNZXNzYWdlID0gcXVlcnk7XHJcbiAgICAgICAgbWVzc2FnZS5NZWRpYSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuTWVkaWEuSWQgPSBwYWdlO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdWlOYW1lQ2hhbmdlKG5ld05hbWUpIHtcclxuICAgICAgICB0aGlzLnVzZXIuTmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5Vc2VyID0gdGhpcy51c2VyO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1NhdmVVc2VyTmFtZUNoYW5nZSc7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBvblVzZXJTdGF0ZUNoYW5nZSgpIHtcclxuICAgICAgICBpZiAodGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPj0gMCAmJiB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA8IHRoaXMuc2Vzc2lvbi5RdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuc2V0UGxheWVyQ29udGVudCh0aGlzLnNlc3Npb24uUXVldWVbdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb25dLCB0aGlzLnVzZXIuU3RhdGUuVGltZSk7XHJcbiAgICAgICAgICAgIHRoaXMudWkudXBkYXRlUXVldWUodGhpcy5zZXNzaW9uLlF1ZXVlLCB0aGlzLnVzZXIuSWQsIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdWlOZXh0TWVkaWEgPSAoKSA9PiB7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gdGhpcy5zZXNzaW9uLlF1ZXVlO1xyXG4gICAgICAgIGlmKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMSA8IHF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICs9IDE7XHJcbiAgICAgICAgICAgIHRoaXMub25Vc2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLm5vdGhpbmdQbGF5aW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVpUGF1c2VNZWRpYSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnBsYXllci5wYXVzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVpUGxheU1lZGlhID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucGxheWVyLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICB1aVByZXZpb3VzTWVkaWEgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy51c2VyLlN0YXRlLlRpbWUgPSAwO1xyXG4gICAgICAgIHZhciBxdWV1ZSA9IHRoaXMuc2Vzc2lvbi5RdWV1ZTtcclxuICAgICAgICBpZih0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPSB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiAtIDE7XHJcbiAgICAgICAgICAgIHRoaXMub25Vc2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBUaGVzZSBmdW5jdGlvbnMgYXJlIGNhbGxlZCBkaXJlY3RseSBlbWJlZGRlZCBpbnRvIHRoZSBodG1sLi4uIGtpbmRhIHdlaXJkXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIG9uRmF0YWxFcnJvciA9ICgpID0+IHtcclxuICAgICAgICAkKFwiI2Rpdl9ldmVyeXRoaW5nXCIpLmhpZGUoKTtcclxuICAgICAgICAkKFwiI2Rpdl9lcnJvclwiKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWVzdFN5bmNXaXRoVXNlciA9ICh1c2VySWQpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygncmVxdWVzdCBzeW5jIHdpdGggdXNlcicpO1xyXG5cclxuICAgICAgICB2YXIgdXNlciA9IG5ldyBNeVVzZXIoKTtcclxuICAgICAgICB1c2VyLklkID0gdXNlcklkO1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1JlcXVlc3RTeW5jV2l0aFVzZXInO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHVzZXI7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICB1aVF1ZXVlTWVkaWEgPSAobWVkaWE6IE1lZGlhKSA9PiB7XHJcbiAgICAgICAgbWVkaWEuVXNlcklkID0gdGhpcy51c2VyLklkO1xyXG4gICAgICAgIG1lZGlhLlVzZXJOYW1lID0gdGhpcy51c2VyLk5hbWU7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5BY3Rpb24gPSAnQWRkTWVkaWFUb1Nlc3Npb24nO1xyXG4gICAgICAgIG1lc3NhZ2UuTWVkaWEgPSBtZWRpYTtcclxuICAgICAgICAvL1RPRE86IGxvY2FsIGFkZCBtZWRpYVxyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGVsZXRlTWVkaWEgPSAobWVkaWFJZDogbnVtYmVyLCBwb3NpdGlvbjogbnVtYmVyKSA9PiB7XHJcblxyXG4gICAgICAgIHRoaXMuc2Vzc2lvbi5RdWV1ZS5zcGxpY2UocG9zaXRpb24sIDEpO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA+PSBwb3NpdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiAtPSAxO1xyXG4gICAgICAgICAgICB0aGlzLm9uVXNlclN0YXRlQ2hhbmdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudWkudXBkYXRlUXVldWUodGhpcy5zZXNzaW9uLlF1ZXVlLCB0aGlzLnVzZXIuSWQsIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgdmFyIG1lZGlhVG9EZWxldGUgPSBuZXcgTWVkaWEoKTtcclxuICAgICAgICBtZWRpYVRvRGVsZXRlLklkID0gbWVkaWFJZDtcclxuXHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5BY3Rpb24gPSAnRGVsZXRlTWVkaWFGcm9tU2Vzc2lvbic7XHJcbiAgICAgICAgbWVzc2FnZS5NZWRpYSA9IG1lZGlhVG9EZWxldGU7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5kZWNsYXJlIHZhciBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5kZWNsYXJlIHZhciByb29tVHlwZTogc3RyaW5nO1xyXG5kZWNsYXJlIHZhciByb29tTmFtZTogc3RyaW5nO1xyXG5cclxudmFyIG1Sb29tTWFuYWdlciA9IG5ldyBSb29tTWFuYWdlcihyb29tVHlwZSwgbW9iaWxlQnJvd3Nlcik7XHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgIG1Sb29tTWFuYWdlci5pbml0KHJvb21OYW1lKTtcclxufSk7XHJcblxyXG5cclxuIiwi77u/aW1wb3J0IHsgV3NNZXNzYWdlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENsaWVudEFjdGlvbnMge1xyXG5cclxuICAgIGNsaWVudFNlc3Npb25SZWFkeTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFVwZGF0ZVVzZXJzTGlzdDogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFVwZGF0ZVF1ZXVlOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50Q2hhdE1lc3NhZ2U6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRSZXF1ZXN0VXNlclN0YXRlOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50UHJvdmlkZVVzZXJTdGF0ZTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFNlYXJjaFJlc3VsdHM6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcblxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTXlTb2NrZXQge1xyXG5cclxuICAgIHByaXZhdGUgc29ja2V0OiBXZWJTb2NrZXQ7XHJcbiAgICBwcml2YXRlIGNsaWVudEFjdGlvbnM6IENsaWVudEFjdGlvbnM7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY2xpZW50QWN0aW9uczogQ2xpZW50QWN0aW9ucykge1xyXG5cclxuICAgICAgICB0aGlzLmNsaWVudEFjdGlvbnMgPSBjbGllbnRBY3Rpb25zO1xyXG5cclxuICAgICAgICB2YXIgdXJpID0gXCJ3czovL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyBcIi93c1wiO1xyXG4gICAgICAgIHZhciBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVyaSk7XHJcbiAgICAgICAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uIChldmVudCkge307XHJcbiAgICAgICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG5cclxuICAgICAgICBzb2NrZXQub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IG1lc3NhZ2UuQWN0aW9uO1xyXG4gICAgICAgICAgICBpZiAoY2xpZW50QWN0aW9uc1thY3Rpb25dKSB7XHJcbiAgICAgICAgICAgICAgICBjbGllbnRBY3Rpb25zW2FjdGlvbl0obWVzc2FnZSk7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYmFkIGNsaWVudCBhY3Rpb25cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBoYW5kbGVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZW1pdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICBpZiAodGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gdGhpcy5zb2NrZXQuQ09OTkVDVElORykge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSwgNTApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xyXG4gICAgfTtcclxuXHJcbn1cclxuIiwi77u/aW1wb3J0IHsgRnJhbWVCdWlsZGVyIH0gZnJvbSBcIi4vRnJhbWVCdWlsZGVyXCI7XHJcbmltcG9ydCB7IE1lZGlhIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5kZWNsYXJlIHZhciBTcGlubmVyOiBhbnk7XHJcblxyXG4vLyBPaCBnb2QgdGhpcyBjb2RlIGlzIHNjYXJ5XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVJQ2FsbGJhY2tzIHtcclxuICAgIHVpU2VuZENoYXRNZXNzYWdlOiBhbnk7XHJcbiAgICB1aVNlYXJjaDogKHF1ZXJ5OiBzdHJpbmcsIHBhZ2U6IG51bWJlcikgPT4gdm9pZDtcclxuICAgIHVpTmFtZUNoYW5nZTogYW55O1xyXG4gICAgdWlRdWV1ZU1lZGlhOiAobWVkaWE6IE1lZGlhKSA9PiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVUkge1xyXG5cclxuICAgIHByaXZhdGUgY29sb3JzOiBhbnk7XHJcbiAgICBwcml2YXRlIHNwaW5uZXI6IGFueTtcclxuICAgIHByaXZhdGUgY2FsbGJhY2tzOiBVSUNhbGxiYWNrcztcclxuICAgIHByaXZhdGUgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgZnJhbWVCdWlsZGVyOiBGcmFtZUJ1aWxkZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRQYWdlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRRdWVyeTogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4sIGNhbGxiYWNrczogVUlDYWxsYmFja3MpIHtcclxuICAgICAgICB0aGlzLmNvbG9ycyA9IFsncmVkJywgJ29yYW5nZScsICd5ZWxsb3cnLCAnZ3JlZW4nLCAnYmx1ZScsICd2aW9sZXQnXTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgICAgIHRoaXMuZnJhbWVCdWlsZGVyID0gbmV3IEZyYW1lQnVpbGRlcihtb2JpbGVCcm93c2VyKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IGNhbGxiYWNrcztcclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR1cFNwaW5uZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbmZvUm9sbG92ZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbnB1dFVJKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNlc3Npb25SZWFkeSA9ICgpID0+IHtcclxuICAgICAgICAkKFwiI2Rpdl9sb2FkaW5nXCIpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xyXG4gICAgICAgICQoXCIjZGl2X2V2ZXJ5dGhpbmdcIikuYW5pbWF0ZSh7b3BhY2l0eTogMX0sICdmYXN0Jyk7XHJcbiAgICB9IFxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBTcGlubmVyVUkoKSB7XHJcbiAgICAgICAgdmFyIG9wdHMgPSB7XHJcbiAgICAgICAgICAgIGxpbmVzOiAxMyAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcclxuICAgICAgICAgICAgLCBsZW5ndGg6IDI4IC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXHJcbiAgICAgICAgICAgICwgd2lkdGg6IDE0IC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xyXG4gICAgICAgICAgICAsIHJhZGl1czogNDIgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXHJcbiAgICAgICAgICAgICwgc2NhbGU6IDEgLy8gU2NhbGVzIG92ZXJhbGwgc2l6ZSBvZiB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIGNvcm5lcnM6IDEgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcclxuICAgICAgICAgICAgLCBjb2xvcjogJyMwMDAnIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcclxuICAgICAgICAgICAgLCBvcGFjaXR5OiAwLjI1IC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXHJcbiAgICAgICAgICAgICwgcm90YXRlOiAwIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcclxuICAgICAgICAgICAgLCBkaXJlY3Rpb246IDEgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxyXG4gICAgICAgICAgICAsIHNwZWVkOiAxIC8vIFJvdW5kcyBwZXIgc2Vjb25kXHJcbiAgICAgICAgICAgICwgdHJhaWw6IDYwIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICwgZnBzOiAyMCAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKSBhcyBhIGZhbGxiYWNrIGZvciBDU1NcclxuICAgICAgICAgICAgLCB6SW5kZXg6IDJlOSAvLyBUaGUgei1pbmRleCAoZGVmYXVsdHMgdG8gMjAwMDAwMDAwMClcclxuICAgICAgICAgICAgLCBjbGFzc05hbWU6ICdzcGlubmVyJyAvLyBUaGUgQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIHRvcDogJzUwJScgLy8gVG9wIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIGxlZnQ6ICc1MCUnIC8vIExlZnQgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XHJcbiAgICAgICAgICAgICwgc2hhZG93OiBmYWxzZSAvLyBXaGV0aGVyIHRvIHJlbmRlciBhIHNoYWRvd1xyXG4gICAgICAgICAgICAsIGh3YWNjZWw6IGZhbHNlIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxyXG4gICAgICAgICAgICAsIHBvc2l0aW9uOiAnYWJzb2x1dGUnIC8vIEVsZW1lbnQgcG9zaXRpb25pbmdcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZfbG9hZGluZycpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4odGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRyb3BwZXJTd2l0Y2goZHJvcHBlcjogSlF1ZXJ5KSB7XHJcbiAgICAgICAgaWYgKGRyb3BwZXIuaGFzQ2xhc3MoJ2Fycm93LWRvd24nKSkge1xyXG4gICAgICAgICAgICBkcm9wcGVyLnJlbW92ZUNsYXNzKCdhcnJvdy1kb3duJyk7XHJcbiAgICAgICAgICAgIGRyb3BwZXIuYWRkQ2xhc3MoJ2Fycm93LXVwJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkcm9wcGVyLnJlbW92ZUNsYXNzKCdhcnJvdy11cCcpO1xyXG4gICAgICAgICAgICBkcm9wcGVyLmFkZENsYXNzKCdhcnJvdy1kb3duJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBGYWRlVUkob3ZlcmFsbDogSlF1ZXJ5LCByZXN1bHRzKSB7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWVudGVyKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mYWRlSW4oKTtcclxuICAgICAgICAgICAgICAgIGxldCBkcm9wcGVyID0gb3ZlcmFsbC5maW5kKCcuZHJvcHBlcicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcm9wcGVyU3dpdGNoKGRyb3BwZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWxlYXZlKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgICAgIGxldCBkcm9wcGVyID0gb3ZlcmFsbC5maW5kKCcuZHJvcHBlcicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcm9wcGVyU3dpdGNoKGRyb3BwZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXR1cEluZm9Sb2xsb3ZlclVJKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfdXNlcnNfb3ZlcmFsbFwiKSwgJChcIiNkaXZfdXNlcl9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9xdWV1ZV9vdmVyYWxsXCIpLCAkKFwiI2Rpdl9xdWV1ZV9yZXN1bHRzXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR1cEZhZGVVSSgkKFwiI2Rpdl9jaGF0X292ZXJhbGxcIiksICQoXCIjZGl2X2NoYXRfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfY2Nfb3ZlcmFsbFwiKSwgJChcIiNkaXZfY2NfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VhcmNoVGV4dENoYW5nZWQodGV4dCkge1xyXG4gICAgICAgIHZhciBkaXZSZXN1bHRzID0gJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgaWYodGV4dC5sZW5ndGg9PTApIHtcclxuICAgICAgICAgICAgZGl2UmVzdWx0cy5mYWRlT3V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBJbnB1dFVJKCkge1xyXG4gICAgICAgIHZhciBpbnB1dFNlYXJjaCA9ICQoXCIjaW5wdXRfc2VhcmNoXCIpO1xyXG4gICAgICAgIGlucHV0U2VhcmNoLmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaEVudGVyUHJlc3NlZChpbnB1dFNlYXJjaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgaW5wdXRfbmFtZSA9ICQoXCIjaW5wdXRfbmFtZVwiKTtcclxuICAgICAgICBpbnB1dF9uYW1lLmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXJOYW1lQ2hhbmdlKGlucHV0X25hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0X2NoYXQgPSAkKFwiI2lucHV0X2NoYXRcIik7XHJcbiAgICAgICAgICAgIGlucHV0X2NoYXQua2V5cHJlc3MoKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja3MudWlTZW5kQ2hhdE1lc3NhZ2UoaW5wdXRfY2hhdC52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRfY2hhdC52YWwoXCJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBqUXVlcnkoZG9jdW1lbnQuYm9keSkub24oXCJjbGlja1wiLCBcIjpub3QoI2Rpdl9zZWFyY2hfcmVzdWx0cywgI2Rpdl9zZWFyY2hfcmVzdWx0cyAqKVwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIikuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoXCJcIik7XHJcbiAgICAgICAgfSk74oCL4oCL4oCL4oCL4oCL4oCL4oCLXHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuYmluZChcInByb3BlcnR5Y2hhbmdlIGlucHV0IHBhc3RlXCIsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaFRleHRDaGFuZ2VkKCQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbCgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25TZWFyY2hSZXN1bHRzKHJlc3VsdHM6IE1lZGlhW10pIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuc2hvdygpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuaHRtbChcIlwiKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IG1lZGlhID0gcmVzdWx0c1tpXTtcclxuICAgICAgICAgICAgdmFyIGRpdlNlYXJjaFJlc3VsdCA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG4gICAgICAgICAgICBkaXZTZWFyY2hSZXN1bHQuYWRkQ2xhc3MoJ2Rpdl9yZXN1bHQgc2VhcmNoX3N0dWZmJyk7XHJcbiAgICAgICAgICAgIGRpdlNlYXJjaFJlc3VsdC5hcHBlbmRUbyhkaXZSZXN1bHRzKTtcclxuICAgICAgICAgICAgdmFyIGltZ1RodW1iID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgICAgICQoaW1nVGh1bWIpLmFkZENsYXNzKCdpbWdfcmVzdWx0IHNlYXJjaF9zdHVmZicpO1xyXG4gICAgICAgICAgICBpbWdUaHVtYi5zcmMgPSBtZWRpYS5UaHVtYlVSTDtcclxuICAgICAgICAgICAgJChpbWdUaHVtYikuYXBwZW5kVG8oZGl2U2VhcmNoUmVzdWx0KTtcclxuICAgICAgICAgICAgdmFyIGlubmVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICQoaW5uZXJEaXYpLmFkZENsYXNzKCdkaXZfaW5uZXJfcmVzdWx0cyBzZWFyY2hfc3R1ZmYnKTtcclxuICAgICAgICAgICAgJChpbm5lckRpdikuYXBwZW5kVG8oZGl2U2VhcmNoUmVzdWx0KTtcclxuICAgICAgICAgICAgdmFyIHNwYW5UaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgJChzcGFuVGl0bGUpLmFkZENsYXNzKCdyZXN1bHRfdGl0bGUgc2VhcmNoX3N0dWZmJyk7XHJcbiAgICAgICAgICAgICQoc3BhblRpdGxlKS5hcHBlbmRUbyhpbm5lckRpdik7XHJcbiAgICAgICAgICAgICQoc3BhblRpdGxlKS50ZXh0KG1lZGlhLlRpdGxlKTtcclxuICAgICAgICAgICAgdmFyIHNwYW5EZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgJChzcGFuRGVzY3JpcHRpb24pLmFkZENsYXNzKCdyZXN1bHRfZGVzY3JpcHRpb24gc2VhcmNoX3N0dWZmJyk7XHJcbiAgICAgICAgICAgICQoc3BhbkRlc2NyaXB0aW9uKS5hcHBlbmRUbyhpbm5lckRpdik7XHJcbiAgICAgICAgICAgICQoc3BhbkRlc2NyaXB0aW9uKS5odG1sKG1lZGlhLkRlc2NyaXB0aW9uKTtcclxuICAgICAgICAgICAgZGl2U2VhcmNoUmVzdWx0LmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpUXVldWVNZWRpYShtZWRpYSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCJcIik7XHJcbiAgICAgICAgICAgIGRpdlJlc3VsdHMuaHRtbChcIjxwIGlkPSdwX3NlYXJjaGluZyc+bm8gcmVzdWx0cyBmb3VuZDwvcD5cIik7XHJcbiAgICAgICAgICAgIGRpdlJlc3VsdHMuZmFkZUluKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFRPRE86IHRoaXMgZG9lc250IGhhdmUgdG8gYmUgYWRkZWQgZXZlcnkgdGltZVxyXG4gICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PSA1KSB7XHJcbiAgICAgICAgICAgIHZhciBwYWdpbmdEaXYgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICAgICAgcGFnaW5nRGl2LmFkZENsYXNzKFwiZGl2X291dGVyX3BhZ2luZ1wiKTtcclxuICAgICAgICAgICAgcGFnaW5nRGl2LmFwcGVuZFRvKGRpdlJlc3VsdHMpO1xyXG4gICAgICAgICAgICB2YXIgcHJldmlvdXNEaXYgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICAgICAgcHJldmlvdXNEaXYuYXBwZW5kVG8ocGFnaW5nRGl2KTtcclxuICAgICAgICAgICAgcHJldmlvdXNEaXYuYWRkQ2xhc3MoJ2Rpdl9wYWdpbmcnKTtcclxuICAgICAgICAgICAgcHJldmlvdXNEaXYuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c1BhZ2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHByZXZpb3VzRGl2LnRleHQoJ3ByZXZpb3VzIHBhZ2UnKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFBhZ2UgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcHJldmlvdXNEaXYuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBuZXh0RGl2ID0gJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XHJcbiAgICAgICAgICAgIG5leHREaXYuYXBwZW5kVG8ocGFnaW5nRGl2KTtcclxuICAgICAgICAgICAgbmV4dERpdi5hZGRDbGFzcygnZGl2X3BhZ2luZycpO1xyXG4gICAgICAgICAgICBuZXh0RGl2LmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV4dFBhZ2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG5leHREaXYudGV4dCgnbmV4dCBwYWdlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5ibHVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJldmlvdXNQYWdlID0gKCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQYWdlID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlTZWFyY2hpbmcoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSAtPSAxO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVNlYXJjaCh0aGlzLmN1cnJlbnRRdWVyeSwgdGhpcy5jdXJyZW50UGFnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5leHRQYWdlID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZGlzcGxheVNlYXJjaGluZygpO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgKz0gMTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVNlYXJjaCh0aGlzLmN1cnJlbnRRdWVyeSwgdGhpcy5jdXJyZW50UGFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcGxheVNlYXJjaGluZygpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuaHRtbChcIlwiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCI8cCBpZD0ncF9zZWFyY2hpbmcnPnNlYXJjaGluZzwvcD5cIik7XHJcbiAgICAgICAgZGl2UmVzdWx0cy5mYWRlSW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlYXJjaEVudGVyUHJlc3NlZChpbnB1dF9zZWFyY2gpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRRdWVyeSA9IGlucHV0X3NlYXJjaC52YWwoKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50UXVlcnkgJiYgdGhpcy5jdXJyZW50UXVlcnkgIT0gXCJcIikge1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVNlYXJjaCh0aGlzLmN1cnJlbnRRdWVyeSwgdGhpcy5jdXJyZW50UGFnZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheVNlYXJjaGluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlUXVldWUocXVldWU6IE1lZGlhW10sIHVzZXJJZE1lOiBudW1iZXIsIHF1ZXVlUG9zaXRpb246IG51bWJlcikge1xyXG4gICAgICAgIHZhciBsZW5ndGggPSBxdWV1ZS5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHN1bW1hcnkgPSBsZW5ndGggKyBcIiB0aGluZ3MgaW4gdGhlIHBsYXlsaXN0XCI7XHJcbiAgICAgICAgaWYgKGxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSBsZW5ndGggKyBcIiB0aGluZyBpbiB0aGUgcGxheWxpc3RcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IFwiTm90aGluZyBpbiB0aGUgcGxheWxpc3QuIFF1ZXVlIHNvbWV0aGluZyFcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJChcIiNwX3F1ZXVlX3N1bW1hcnlcIikudGV4dChzdW1tYXJ5KTtcclxuXHJcbiAgICAgICAgdmFyIHF1ZXVlUmVzdWx0cyA9ICQoXCIjZGl2X3F1ZXVlX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgcXVldWVSZXN1bHRzLmh0bWwoXCJcIik7XHJcbiAgICAgICAgLy8gVE9ETzogbmVlZCB0byBtYWtlIHRoaXMgc2VwZXJhdGUgZnJvbSBzZWFyY2ggcmVzdWx0cyBwcm9iYWJseVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIG1lZGlhID0gcXVldWVbaV07XHJcbiAgICAgICAgICAgIHZhciBkaXZRdWV1ZVJlc3VsdCA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG4gICAgICAgICAgICBkaXZRdWV1ZVJlc3VsdC5hZGRDbGFzcygnZGl2X3Jlc3VsdCcpO1xyXG4gICAgICAgICAgICBkaXZRdWV1ZVJlc3VsdC5hcHBlbmRUbyhxdWV1ZVJlc3VsdHMpO1xyXG4gICAgICAgICAgICB2YXIgaW1nVGh1bWIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICAgICAgJChpbWdUaHVtYikuYWRkQ2xhc3MoJ2ltZ19yZXN1bHQnKTtcclxuICAgICAgICAgICAgaW1nVGh1bWIuc3JjID0gbWVkaWEuVGh1bWJVUkw7XHJcbiAgICAgICAgICAgICQoaW1nVGh1bWIpLmFwcGVuZFRvKGRpdlF1ZXVlUmVzdWx0KTtcclxuICAgICAgICAgICAgdmFyIGlubmVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICQoaW5uZXJEaXYpLmFkZENsYXNzKCdkaXZfaW5uZXJfcmVzdWx0cycpO1xyXG4gICAgICAgICAgICAkKGlubmVyRGl2KS5hcHBlbmRUbyhkaXZRdWV1ZVJlc3VsdCk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICQoc3BhblRpdGxlKS5hZGRDbGFzcygncmVzdWx0X3RpdGxlJyk7XHJcbiAgICAgICAgICAgICQoc3BhblRpdGxlKS5hcHBlbmRUbyhpbm5lckRpdik7XHJcbiAgICAgICAgICAgICQoc3BhblRpdGxlKS50ZXh0KG1lZGlhLlRpdGxlKTtcclxuICAgICAgICAgICAgdmFyIHNwYW5EZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgJChzcGFuRGVzY3JpcHRpb24pLmFkZENsYXNzKCdyZXN1bHRfZGVzY3JpcHRpb24nKTtcclxuICAgICAgICAgICAgJChzcGFuRGVzY3JpcHRpb24pLmFwcGVuZFRvKGlubmVyRGl2KTtcclxuICAgICAgICAgICAgJChzcGFuRGVzY3JpcHRpb24pLmh0bWwobWVkaWEuRGVzY3JpcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlVXNlcnNMaXN0KHVzZXJzLCB1c2VySWRNZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG51bSA9IHVzZXJzLmxlbmd0aDtcclxuICAgICAgICB2YXIgc3VtbWFyeSA9IHVzZXJzLmxlbmd0aCArIFwiIHVzZXJzIGxpc3RlbmluZ1wiO1xyXG4gICAgICAgIGlmIChudW0gPT0gMSkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gdXNlcnMubGVuZ3RoICsgXCIgdXNlciBsaXN0ZW5pbmdcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJChcIiNwX3VzZXJzX3N1bW1hcnlcIikudGV4dChzdW1tYXJ5KTtcclxuICAgICAgICB2YXIgdXNlclJlc3VsdHMgPSAkKFwiI2Rpdl91c2VyX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgdmFyIGh0bWwgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHVzZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB1c2VyID0gdXNlcnNbaV07XHJcbiAgICAgICAgICAgIHZhciB0aGlzSXNNZSA9ICh1c2VyLklkID09PSB1c2VySWRNZSk7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50SFRNTCA9IHRoaXMuZnJhbWVCdWlsZGVyLnVzZXIodGhpcy5jb2xvcnNbaSAlIHRoaXMuY29sb3JzLmxlbmd0aF0sIHVzZXIuSWQsIHVzZXIuTmFtZSwgdGhpc0lzTWUpO1xyXG4gICAgICAgICAgICBodG1sLnB1c2goY3VycmVudEhUTUwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB1c2VyUmVzdWx0cy5odG1sKGh0bWwuam9pbihcIlwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZXJOYW1lQ2hhbmdlKG5hbWVfaW5wdXQpIHtcclxuICAgICAgICBuYW1lX2lucHV0LmhpZGUoKTtcclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS5mYWRlSW4oKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcy51aU5hbWVDaGFuZ2UobmFtZV9pbnB1dC52YWwoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQ2hhdE1lc3NhZ2UodXNlck5hbWU6IHN0cmluZywgbXNnOiBzdHJpbmcsIGNvbG9yOiBzdHJpbmcpIHtcclxuICAgICAgICAvL1RPRE86IGNvbG9yIHN0dWZmXHJcbiAgICAgICAgdmFyIHVsX2NoYXQgPSAkKFwiI3VsX2NoYXRcIik7XHJcbiAgICAgICAgdmFyIGh0bWwgPSAnPGxpIGNsYXNzPVwiY2hhdFwiPjxzcGFuIHN0eWxlPVwibWFyZ2luOiAwOyBjb2xvcjogJyArIGNvbG9yICsgJztcIj4nICsgdXNlck5hbWUgKyAnOiA8L3NwYW4+PHNwYW4+JyArIG1zZyArICc8L3NwYW4+PC9saT4nO1xyXG4gICAgICAgIHVsX2NoYXQuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgIGlmICh1bF9jaGF0Lmxlbmd0aCA+PSAxMCkge1xyXG4gICAgICAgICAgICB1bF9jaGF0LmNoaWxkcmVuKClbMF0ucmVtb3ZlKCk7IFxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIu+7v2RlY2xhcmUgdmFyIFlUOiBhbnk7XHJcblxyXG5pbXBvcnQgeyBJUGxheWVyIH0gZnJvbSBcIi4vSVBsYXllclwiO1xyXG5pbXBvcnQgeyBNZWRpYSwgU2Vzc2lvbiwgVXNlclN0YXRlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcbmltcG9ydCB7IFVJIH0gZnJvbSBcIi4vVUlcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBZdFBsYXllciBpbXBsZW1lbnRzIElQbGF5ZXIge1xyXG5cclxuICAgIHByaXZhdGUgeXRQbGF5ZXI6IGFueTtcclxuICAgIHByaXZhdGUgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgdWk6IFVJO1xyXG4gICAgcHVibGljIHBsYXllclJlYWR5OiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHVpOiBVSSwgbW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMucGxheWVyUmVhZHkgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgICAgIHRoaXMudWkgPSB1aTtcclxuICAgICAgICAkKFwiI2Rpdl95dF9wbGF5ZXJcIikuc2hvdygpO1xyXG4gICAgICAgICQoXCIjZGl2X3BvZGNhc3RfcGxheWVyXCIpLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKSB7XHJcbiAgICAgICAgaWYgKFlUICYmIFlULlBsYXllcikge1xyXG4gICAgICAgICAgICB0aGlzLnl0UGxheWVyID0gbmV3IFlULlBsYXllcignZGl2X3l0X3BsYXllcicsIHtcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJ2F1dG8nLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIHBsYXllclZhcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sczogMSxcclxuICAgICAgICAgICAgICAgICAgICBzaG93aW5mbzogMCxcclxuICAgICAgICAgICAgICAgICAgICBhdXRvcGxheTogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgICAgICdvblJlYWR5JyA6IHRoaXMub25QbGF5ZXJSZWFkeSxcclxuICAgICAgICAgICAgICAgICAgICAnb25TdGF0ZUNoYW5nZSc6IG9uUGxheWVyU3RhdGVDaGFuZ2VcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy5pbml0UGxheWVyKG9uUGxheWVyU3RhdGVDaGFuZ2UpIH0sIDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB2YXIgZGl2X3BsYXllciA9ICQoXCIjZGl2X3l0X3BsYXllclwiKTtcclxuICAgICAgICAgICAgZGl2X3BsYXllci5oZWlnaHQoZGl2X3BsYXllci53aWR0aCgpICogOS4wIC8gMTYuMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvblBsYXllclJlYWR5ID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucGxheWVyUmVhZHkgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRQbGF5ZXJDb250ZW50KG1lZGlhOiBNZWRpYSwgdGltZTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBsYXllclJlYWR5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwbGF5ZXIgbm90IHJlYWR5IScpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy5zZXRQbGF5ZXJDb250ZW50KG1lZGlhLCB0aW1lKSB9LCA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnl0UGxheWVyLmxvYWRWaWRlb0J5SWQobWVkaWEuWVRWaWRlb0lELCB0aW1lLCBcImxhcmdlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wbGF5VmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGF1c2UoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wYXVzZVZpZGVvKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFN0YXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaXNTdG9wcGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRTdGF0ZSgpID09IDA7XHJcbiAgICB9XHJcblxyXG59Il19
