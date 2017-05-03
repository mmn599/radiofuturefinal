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
            $(_this.canvas).click(function (e) {
                var xPos = e.clientX - _this.canvas.getBoundingClientRect().left;
                if (xPos < 0) {
                    xPos = 0;
                }
                var percentage = xPos / _this.canvas.width;
                console.log(percentage);
                _this.updatePlayerTime(percentage * _this.audio.duration);
            });
            _this.setupControls();
            _this.nothingPlaying();
            _this.audio.onended = function () {
                onPlayerStateChange({ data: 0 });
            };
            _this.audio.ontimeupdate = function () {
                _this.audioTimeUpdate();
            };
        };
        this.updatePlayerTime = function (time) {
            _this.audio.currentTime = time;
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
            var percent = time / duration;
            if (!percent || percent == NaN) {
                percent = 0;
            }
            console.log(percent);
            ctx.beginPath();
            ctx.fillStyle = "#ffa79c";
            ctx.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, percent * _this.canvas.width, _this.canvas.height);
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
            divResults.html("<p id='p_searching'>no results found, or something screwed up</p>");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9GcmFtZUJ1aWxkZXIudHMiLCJUeXBlU2NyaXB0cy9Qb2RjYXN0UGxheWVyLnRzIiwiVHlwZVNjcmlwdHMvUm9vbS50cyIsIlR5cGVTY3JpcHRzL1NvY2tldHMudHMiLCJUeXBlU2NyaXB0cy9VSS50cyIsIlR5cGVTY3JpcHRzL1l0UGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQztJQUFBO0lBVUQsQ0FBQztJQUFELFlBQUM7QUFBRCxDQVZDLEFBVUEsSUFBQTtBQVZhLHNCQUFLO0FBWW5CO0lBRUk7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUtMLGFBQUM7QUFBRCxDQVRBLEFBU0MsSUFBQTtBQVRZLHdCQUFNO0FBV25CO0lBRUk7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUtMLGdCQUFDO0FBQUQsQ0FYQSxBQVdDLElBQUE7QUFYWSw4QkFBUztBQWF0QjtJQUFBO0lBS0EsQ0FBQztJQUFELGNBQUM7QUFBRCxDQUxBLEFBS0MsSUFBQTtBQUxZLDBCQUFPO0FBT3BCO0lBQUE7SUFNQSxDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQU5BLEFBTUMsSUFBQTtBQU5ZLDhCQUFTOzs7O0FDekN0QjtJQUlJLHNCQUFZLGFBQXNCO1FBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSwyQkFBSSxHQUFYLFVBQVksS0FBYSxFQUFFLE1BQWMsRUFBRSxRQUFnQixFQUFFLFFBQWlCO1FBQzFFLElBQUksV0FBVyxHQUFHLEVB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O1FBQ2hCLENBQUM7SUFDTCxDQUFDO0lBRU0sdUJBQUksR0FBWDtRQUNJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVNLHdCQUFLLEdBQVo7UUFDSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFTSxpQ0FBYyxHQUFyQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sa0NBQWUsR0FBdEI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLDRCQUFTLEdBQWhCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVMLGVBQUM7QUFBRCxDQTNFQSxBQTJFQyxJQUFBO0FBM0VZLDRCQUFRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7v2V4cG9ydCBjbGFzcyBNZWRpYSB7XHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgVXNlcklkOiBudW1iZXI7XHJcbiAgICBVc2VyTmFtZTogc3RyaW5nO1xyXG4gICAgWVRWaWRlb0lEOiBudW1iZXI7XHJcbiAgICBNUDNTb3VyY2U6IHN0cmluZztcclxuICAgIE9HR1NvdXJjZTogc3RyaW5nO1xyXG4gICAgVGl0bGU6IHN0cmluZztcclxuICAgIFRodW1iVVJMOiBzdHJpbmc7XHJcbiAgICBEZXNjcmlwdGlvbjogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTXlVc2VyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLlN0YXRlID0gbmV3IFVzZXJTdGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBTdGF0ZTogVXNlclN0YXRlO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVXNlclN0YXRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLlRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMuUXVldWVQb3NpdGlvbiA9IC0xO1xyXG4gICAgICAgIHRoaXMuUGxheWVyU3RhdGUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIFRpbWU6IG51bWJlcjtcclxuICAgIFF1ZXVlUG9zaXRpb246IG51bWJlcjtcclxuICAgIFBsYXllclN0YXRlOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXNzaW9uIHtcclxuICAgIElkOiBudW1iZXI7XHJcbiAgICBOYW1lOiBzdHJpbmc7XHJcbiAgICBVc2VyczogTXlVc2VyW107XHJcbiAgICBRdWV1ZTogTWVkaWFbXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFdzTWVzc2FnZSB7XHJcbiAgICBBY3Rpb246IHN0cmluZztcclxuICAgIFNlc3Npb246IFNlc3Npb247XHJcbiAgICBNZWRpYTogTWVkaWE7XHJcbiAgICBVc2VyOiBNeVVzZXI7XHJcbiAgICBDaGF0TWVzc2FnZTogc3RyaW5nO1xyXG59Iiwi77u/aW1wb3J0IHsgTWVkaWEgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGcmFtZUJ1aWxkZXIge1xyXG5cclxuICAgIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVzZXIoY29sb3I6IHN0cmluZywgdXNlcklkOiBudW1iZXIsIHVzZXJOYW1lOiBzdHJpbmcsIHRoaXNJc01lOiBib29sZWFuKSA6IHN0cmluZyB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICB2YXIgbWVIdG1sID0gdGhpc0lzTWUgPyAnb25jbGljaz1cInJlcXVlc3RTeW5jV2l0aFVzZXIoJyArIHVzZXJJZCArICcpXCIgJyA6IFwiXCI7XHJcbiAgICAgICAgdmFyIHN5bmNIVE1MID0gdGhpc0lzTWUgPyAneW91JyA6ICdzeW5jJztcclxuICAgICAgICB2YXIgc3luY0hUTUxNb2JpbGUgPSB0aGlzSXNNZSA/ICd5b3UnIDogJ3N5bmMgd2l0aCAnICsgdXNlck5hbWU7XHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9ICc8ZGl2ICcgKyBtZUh0bWwgKyAnY2xhc3M9XCJkaXZfdXNlclwiIHN0eWxlPVwiYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj4gJyArIHN5bmNIVE1MTW9iaWxlICsgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9XHJcbiAgICAgICAgICAgICAgICAnPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7XCI+JyArXHJcbiAgICAgICAgICAgICAgICAnPGRpdiAnICsgbWVIdG1sICsgJ3N0eWxlPVwiZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZsb2F0OiBsZWZ0OyBjdXJzb3I6IHBvaW50ZXI7IG1hcmdpbi1yaWdodDogMTZweDsgaGVpZ2h0OiA0OHB4OyB3aWR0aDogNDhweDsgYmFja2dyb3VuZDogJyArIGNvbG9yICsgJztcIj4nICsgc3luY0hUTUwgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4OyBmbG9hdDogcmlnaHQ7XCI+JyArIHVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudEhUTUw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG1lZGlhKG1lZGlhOiBNZWRpYSwgcG9zaXRpb246IG51bWJlciwgcmVjb21tZW5kZWRCeU1lOiBib29sZWFuLCBvblRoaXM6IGJvb2xlYW4pIHtcclxuICAgICAgICB2YXIgY3VycmVudEhUTUwgPSBcIlwiO1xyXG4gICAgICAgIHZhciBjYW5EZWxldGVUaGlzID0gcmVjb21tZW5kZWRCeU1lOyAvLyYmICFvblRoaXM7XHJcbiAgICAgICAgdmFyIGRlbGV0ZVRoaXNIVE1MID0gY2FuRGVsZXRlVGhpcyA/ICd0aXRsZT1cIkNsaWNrIHRvIGRlbGV0ZSB0aGlzIGZyb20gdGhlIHF1ZXVlIVwiIG9uY2xpY2s9XCJkZWxldGVNZWRpYSgnICsgbWVkaWEuSWQgKyAnLCAnICsgcG9zaXRpb24gKyAnKVwiICcgOiBcIlwiO1xyXG4gICAgICAgIHZhciBjYW5EZWxldGVTdHlsZSA9IGNhbkRlbGV0ZVRoaXMgPyBcImN1cnNvcjogcG9pbnRlcjsgXCIgOiBcIlwiO1xyXG4gICAgICAgIHZhciBvblRoaXNTdHlsZSA9IG9uVGhpcyA/IFwiYm9yZGVyOiAxcHggc29saWQgYmx1ZTsgXCIgOiBcIlwiO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGFkZCBkZWxldGUgVUlcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPSAnPGltZyBzdHlsZT1cIicgKyBvblRoaXNTdHlsZSArICdmbG9hdDogbGVmdDsgd2lkdGg6IDMzLjMzJTsgaGVpZ2h0OiAyMHZ3O1wiIHNyYz1cIicgICsgbWVkaWEuVGh1bWJVUkwgKyAnXCIvPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50SFRNTCA9XHJcbiAgICAgICAgICAgICAgICAnPGRpdiAnICsgZGVsZXRlVGhpc0hUTUwgKyAnc3R5bGU9XCInICsgY2FuRGVsZXRlU3R5bGUgKyBvblRoaXNTdHlsZSArICd0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8aW1nIHN0eWxlPVwiaGVpZ2h0OiA5MHB4OyB3aWR0aDogMTYwcHg7IG1hcmdpbi1yaWdodDogMTZweDtcIiBzcmM9XCInICsgbWVkaWEuVGh1bWJVUkwgKyAnXCIvPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDtcIj4nICsgbWVkaWEuVGl0bGUgKyAnPC9zcGFuPicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50SFRNTDtcclxuICAgIH1cclxufSIsIu+7v2RlY2xhcmUgdmFyIFlUOiBhbnk7XHJcblxyXG5pbXBvcnQgeyBJUGxheWVyIH0gZnJvbSBcIi4vSVBsYXllclwiO1xyXG5pbXBvcnQgeyBNZWRpYSwgU2Vzc2lvbiwgVXNlclN0YXRlIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcbmltcG9ydCB7IFVJIH0gZnJvbSBcIi4vVUlcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQb2RjYXN0UGxheWVyIGltcGxlbWVudHMgSVBsYXllciB7XHJcblxyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBhdWRpbzogSFRNTEF1ZGlvRWxlbWVudDtcclxuICAgIHByaXZhdGUgbXAzc291cmNlOiBhbnk7XHJcbiAgICBwcml2YXRlIHVpOiBVSTtcclxuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih1aTogVUksIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4sIG5leHRNZWRpYSwgcHJldmlvdXNNZWRpYSkge1xyXG4gICAgICAgIHRoaXMudWkgPSB1aTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgICAgIHRoaXMuYXVkaW8gPSA8SFRNTEF1ZGlvRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaHRtbDVhdWRpbycpO1xyXG4gICAgICAgIHRoaXMubXAzc291cmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wM1NvdXJjZScpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfcHJvZ3Jlc3MnKTtcclxuICAgICAgICAkKFwiI2Rpdl95dF9wbGF5ZXJcIikuaGlkZSgpO1xyXG4gICAgICAgICQoXCIjZGl2X3BvZGNhc3RfcGxheWVyXCIpLnNob3coKTtcclxuICAgICAgICAkKFwiI2J0bl9uZXh0XCIpLmNsaWNrKG5leHRNZWRpYSk7XHJcbiAgICAgICAgJChcIiNidG5fcHJldmlvdXNcIikuY2xpY2socHJldmlvdXNNZWRpYSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGluaXRQbGF5ZXIgPSAob25QbGF5ZXJTdGF0ZUNoYW5nZSkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG5cclxuICAgICAgICAkKHRoaXMuY2FudmFzKS5jbGljaygoZSkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgeFBvcyA9IGUuY2xpZW50WCAtIHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICAgICAgICAgIGlmICh4UG9zIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgeFBvcyA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHBlcmNlbnRhZ2UgPSB4UG9zIC8gdGhpcy5jYW52YXMud2lkdGg7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBlcmNlbnRhZ2UpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBsYXllclRpbWUocGVyY2VudGFnZSAqIHRoaXMuYXVkaW8uZHVyYXRpb24pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnNldHVwQ29udHJvbHMoKTtcclxuICAgICAgICB0aGlzLm5vdGhpbmdQbGF5aW5nKCk7XHJcbiAgICAgICAgdGhpcy5hdWRpby5vbmVuZGVkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBvblBsYXllclN0YXRlQ2hhbmdlKHsgZGF0YTogMCB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hdWRpby5vbnRpbWV1cGRhdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW9UaW1lVXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVQbGF5ZXJUaW1lID0gKHRpbWU6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIHRoaXMuYXVkaW8uY3VycmVudFRpbWUgPSB0aW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBub3RoaW5nUGxheWluZyA9ICgpID0+IHtcclxuICAgICAgICAkKFwiI2NjX3RpdGxlXCIpLnRleHQoJ05vdGhpbmcgY3VycmVudGx5IHBsYXlpbmcuJyk7XHJcbiAgICAgICAgJChcIiNjY19zaG93XCIpLnRleHQoJ1F1ZXVlIHNvbWV0aGluZyB1cCEnKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVByb2dyZXNzVUkoMCwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXVkaW9UaW1lVXBkYXRlKCkge1xyXG4gICAgICAgIHZhciBwZXJjZW50YWdlID0gdGhpcy5hdWRpby5jdXJyZW50VGltZSAvIHRoaXMuYXVkaW8uZHVyYXRpb247XHJcbiAgICAgICAgdGhpcy51cGRhdGVQcm9ncmVzc1VJKHRoaXMuYXVkaW8uY3VycmVudFRpbWUsIHRoaXMuYXVkaW8uZHVyYXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIHNldHVwQ29udHJvbHMgPSAoKSA9PiB7XHJcbiAgICAgICAgdmFyIGJ0blBsYXlQYXVzZSA9ICQoXCIjYnRuX3BsYXlfcGF1c2VcIik7XHJcbiAgICAgICAgYnRuUGxheVBhdXNlLmF0dHIoJ2NsYXNzJywgJ3BsYXlfYnRuJyk7XHJcbiAgICAgICAgYnRuUGxheVBhdXNlLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYXVkaW8ucGF1c2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGF1c2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZvcm1hdChzZWNvbmRzKSB7XHJcbiAgICAgICAgaWYgKCFzZWNvbmRzIHx8IHNlY29uZHMgPT0gTmFOKSB7XHJcbiAgICAgICAgICAgIHNlY29uZHMgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZWNvbmRzID0gTWF0aC5yb3VuZChzZWNvbmRzKTtcclxuICAgICAgICB2YXIgaG91cnMgPSBNYXRoLmZsb29yKHNlY29uZHMgLyAzNjAwKTtcclxuICAgICAgICB2YXIgbWludXRlcyA9IE1hdGguZmxvb3Ioc2Vjb25kcyAvIDYwKTtcclxuICAgICAgICB2YXIgc2VjcyA9IHNlY29uZHMgJSA2MDtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXQyRGlnaXQoaG91cnMpICsgXCI6XCIgKyB0aGlzLmZvcm1hdDJEaWdpdChtaW51dGVzKSArIFwiOlwiICsgdGhpcy5mb3JtYXQyRGlnaXQoc2Vjcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZm9ybWF0MkRpZ2l0KG51bTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKG51bSA8IDEwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIjBcIiArIG51bS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUHJvZ3Jlc3NVSSA9ICh0aW1lOiBudW1iZXIsIGR1cmF0aW9uOiBudW1iZXIpID0+IHtcclxuICAgICAgICB2YXIgY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAgICAgdmFyIHBlcmNlbnQgPSB0aW1lIC8gZHVyYXRpb247XHJcbiAgICAgICAgaWYgKCFwZXJjZW50IHx8IHBlcmNlbnQgPT0gTmFOKSB7IHBlcmNlbnQgPSAwO31cclxuICAgICAgICBjb25zb2xlLmxvZyhwZXJjZW50KTtcclxuXHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNmZmE3OWNcIjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3doaXRlJztcclxuICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgcGVyY2VudCAqIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgICQoXCIjY2NfdGltZVwiKS50ZXh0KHRoaXMuZm9ybWF0KHRpbWUpKTtcclxuICAgICAgICAkKFwiI2NjX2R1cmF0aW9uXCIpLnRleHQodGhpcy5mb3JtYXQoZHVyYXRpb24pKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQbGF5ZXJDb250ZW50ID0gKG1lZGlhOiBNZWRpYSwgdGltZTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tcDNzb3VyY2Uuc2V0QXR0cmlidXRlKCdzcmMnLCBtZWRpYS5NUDNTb3VyY2UpO1xyXG4gICAgICAgIHRoaXMuYXVkaW8ubG9hZCgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlSW5mb1VJKG1lZGlhKTtcclxuICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVJbmZvVUkobWVkaWE6IE1lZGlhKSB7XHJcbiAgICAgICAgJChcIiNjY19zaG93XCIpLnRleHQoJ1JhZGlvbGFiJyk7XHJcbiAgICAgICAgJChcIiNjY190aXRsZVwiKS50ZXh0KG1lZGlhLlRpdGxlKTtcclxuICAgIH1cclxuXHJcbiAgICBwbGF5ID0gKCkgPT4ge1xyXG4gICAgICAgICQoXCIjYnRuX3BsYXlfcGF1c2VcIikucmVtb3ZlQ2xhc3MoJ3BsYXlfYnRuJykuYWRkQ2xhc3MoJ3BhdXNlX2J0bicpO1xyXG4gICAgICAgIHRoaXMuYXVkaW8ucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHBhdXNlID0gKCkgPT4ge1xyXG4gICAgICAgICQoXCIjYnRuX3BsYXlfcGF1c2VcIikucmVtb3ZlQ2xhc3MoJ3BhdXNlX2J0bicpLmFkZENsYXNzKCdwbGF5X2J0bicpO1xyXG4gICAgICAgIHRoaXMuYXVkaW8ucGF1c2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDdXJyZW50VGltZSA9ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hdWRpby5jdXJyZW50VGltZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDdXJyZW50U3RhdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuYXVkaW8ucGF1c2VkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzU3RvcHBlZCA9ICgpIDogYm9vbGVhbiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXVkaW8uY3VycmVudFRpbWUgPj0gdGhpcy5hdWRpby5kdXJhdGlvbjtcclxuICAgIH1cclxuXHJcbn0iLCLvu79pbXBvcnQgeyBNeVVzZXIsIE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUsIFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBVSUNhbGxiYWNrcywgVUkgfSBmcm9tIFwiLi9VSVwiO1xyXG5pbXBvcnQgeyBNeVNvY2tldCwgQ2xpZW50QWN0aW9ucyB9IGZyb20gXCIuL1NvY2tldHNcIjtcclxuaW1wb3J0IHsgSVBsYXllciB9IGZyb20gXCIuL0lQbGF5ZXJcIjtcclxuaW1wb3J0IHsgUG9kY2FzdFBsYXllciB9IGZyb20gXCIuL1BvZGNhc3RQbGF5ZXJcIjtcclxuaW1wb3J0IHsgWXRQbGF5ZXIgfSBmcm9tIFwiLi9ZdFBsYXllclwiO1xyXG5cclxuY2xhc3MgUm9vbU1hbmFnZXIgaW1wbGVtZW50cyBVSUNhbGxiYWNrcywgQ2xpZW50QWN0aW9ucyB7XHJcblxyXG4gICAgdXNlcjogTXlVc2VyO1xyXG4gICAgc2Vzc2lvbjogU2Vzc2lvbjtcclxuICAgIHBsYXllcjogUG9kY2FzdFBsYXllcjsgXHJcbiAgICBzb2NrZXQ6IE15U29ja2V0O1xyXG4gICAgdWk6IFVJO1xyXG4gICAgcm9vbVR5cGU6IHN0cmluZztcclxuICAgIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3Iocm9vbVR5cGU6IHN0cmluZywgbW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIC8vIFRPRE86IGZpbmQgYSBiZXR0ZXIgd2F5IHRvIGV4cG9zZSB0aGVzZSBmdW5jdGlvbnMgdG8gaHRtbD9cclxuICAgICAgICAoPGFueT53aW5kb3cpLnJlcXVlc3RTeW5jV2l0aFVzZXIgPSB0aGlzLnJlcXVlc3RTeW5jV2l0aFVzZXI7XHJcbiAgICAgICAgKDxhbnk+d2luZG93KS5kZWxldGVNZWRpYSA9IHRoaXMuZGVsZXRlTWVkaWE7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZSA9IHJvb21UeXBlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoZW5jb2RlZFNlc3Npb25OYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uID0gbmV3IFNlc3Npb24oKTtcclxuICAgICAgICB0aGlzLnVpID0gbmV3IFVJKHRoaXMubW9iaWxlQnJvd3NlciwgdGhpcyk7XHJcbiAgICAgICAgLy9pZiAodGhpcy5yb29tVHlwZSA9PSBcInBvZGNhc3RzXCIpIHtcclxuICAgICAgICB0aGlzLnBsYXllciA9IG5ldyBQb2RjYXN0UGxheWVyKHRoaXMudWksIHRoaXMubW9iaWxlQnJvd3NlciwgdGhpcy51aU5leHRNZWRpYSwgdGhpcy51aVByZXZpb3VzTWVkaWEpO1xyXG4gICAgICAgIC8vfVxyXG4gICAgICAgIC8vZWxzZSB7XHJcbiAgICAgICAgLy8gICAgdGhpcy5wbGF5ZXIgPSBuZXcgWXRQbGF5ZXIodGhpcy51aSwgdGhpcy5tb2JpbGVCcm93c2VyKTtcclxuICAgICAgICAvL31cclxuICAgICAgICB0aGlzLnNvY2tldCA9IG5ldyBNeVNvY2tldCh0aGlzKTtcclxuICAgICAgICB0aGlzLnNldHVwSmFtU2Vzc2lvbihlbmNvZGVkU2Vzc2lvbk5hbWUpO1xyXG4gICAgICAgIHRoaXMucGxheWVyLmluaXRQbGF5ZXIodGhpcy5vblBsYXllclN0YXRlQ2hhbmdlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXR1cEphbVNlc3Npb24oZW5jb2RlZFNlc3Npb25OYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnNlc3Npb24uTmFtZSA9IGRlY29kZVVSSShlbmNvZGVkU2Vzc2lvbk5hbWUpO1xyXG4gICAgICAgIHRoaXMudXNlci5OYW1lID0gJ0Fub255bW91cyc7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5BY3Rpb24gPSAnVXNlckpvaW5TZXNzaW9uJztcclxuICAgICAgICBtZXNzYWdlLlVzZXIgPSB0aGlzLnVzZXI7XHJcbiAgICAgICAgbWVzc2FnZS5TZXNzaW9uID0gdGhpcy5zZXNzaW9uO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vIFdlYlNvY2tldCBtZXNzYWdlIHJlc3BvbnNlIGZ1bmN0aW9uc1xyXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBjbGllbnRQcm92aWRlVXNlclN0YXRlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciB1c2VyVG9TeW5jV2l0aCA9IG1lc3NhZ2UuVXNlcjtcclxuICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy51c2VyLlN0YXRlLlRpbWUgPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5UaW1lO1xyXG4gICAgICAgIHRoaXMudXNlci5TdGF0ZS5QbGF5ZXJTdGF0ZSA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlBsYXllclN0YXRlO1xyXG4gICAgICAgIHRoaXMudWkudXBkYXRlUXVldWUodGhpcy5zZXNzaW9uLlF1ZXVlLCB0aGlzLnVzZXIuSWQsIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uKTtcclxuICAgICAgICB0aGlzLm9uVXNlclN0YXRlQ2hhbmdlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50UmVxdWVzdFVzZXJTdGF0ZShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgdXNlckRhdGEgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICAgICAgdXNlckRhdGEuSWQgPSBtZXNzYWdlLlVzZXIuSWQ7IC8vIFRPRE86IGJhZCBiYWQgYmFkXHJcbiAgICAgICAgdXNlckRhdGEuU3RhdGUuUXVldWVQb3NpdGlvbiA9IHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uO1xyXG4gICAgICAgIHVzZXJEYXRhLlN0YXRlLlRpbWUgPSBNYXRoLnJvdW5kKHRoaXMucGxheWVyLmdldEN1cnJlbnRUaW1lKCkpO1xyXG4gICAgICAgIHVzZXJEYXRhLlN0YXRlLlBsYXllclN0YXRlID0gdGhpcy5wbGF5ZXIuZ2V0Q3VycmVudFN0YXRlKCk7XHJcblxyXG4gICAgICAgIHZhciBvdXRnb2luZ01zZyA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBvdXRnb2luZ01zZy5BY3Rpb24gPSAnUHJvdmlkZVN5bmNUb1VzZXInO1xyXG4gICAgICAgIG91dGdvaW5nTXNnLlVzZXIgPSB1c2VyRGF0YTtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG91dGdvaW5nTXNnKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRTZXNzaW9uUmVhZHkobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uID0gbWVzc2FnZS5TZXNzaW9uO1xyXG4gICAgICAgIHRoaXMudXNlciA9IG1lc3NhZ2UuVXNlcjtcclxuICAgICAgICB0aGlzLnVpTmV4dE1lZGlhKCk7XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVRdWV1ZSh0aGlzLnNlc3Npb24uUXVldWUsIHRoaXMudXNlci5JZCwgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG4gICAgICAgIHRoaXMudWkudXBkYXRlVXNlcnNMaXN0KHRoaXMuc2Vzc2lvbi5Vc2VycywgdGhpcy51c2VyLklkKTtcclxuICAgICAgICB0aGlzLnVpLnNlc3Npb25SZWFkeSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFVwZGF0ZVVzZXJzTGlzdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgdXNlcnMgPSBtZXNzYWdlLlNlc3Npb24uVXNlcnM7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uLlVzZXJzID0gdXNlcnM7XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVVc2Vyc0xpc3QodGhpcy5zZXNzaW9uLlVzZXJzLCB0aGlzLnVzZXIuSWQpO1x0XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50VXBkYXRlUXVldWUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIHdhc1dhaXRpbmcgPSB0aGlzLmlzVXNlcldhaXRpbmcoKTtcclxuICAgICAgICB0aGlzLnNlc3Npb24uUXVldWUgPSBtZXNzYWdlLlNlc3Npb24uUXVldWU7XHJcbiAgICAgICAgaWYgKHdhc1dhaXRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy51aU5leHRNZWRpYSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVF1ZXVlKHRoaXMuc2Vzc2lvbi5RdWV1ZSwgdGhpcy51c2VyLklkLCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50Q2hhdE1lc3NhZ2UobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIGNoYXRNZXNzYWdlID0gbWVzc2FnZS5DaGF0TWVzc2FnZTtcclxuICAgICAgICB2YXIgdXNlck5hbWUgPSBtZXNzYWdlLlVzZXIuTmFtZTtcclxuICAgICAgICB0aGlzLnVpLm9uQ2hhdE1lc3NhZ2UodXNlck5hbWUsIGNoYXRNZXNzYWdlLCAnYmx1ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFNlYXJjaFJlc3VsdHMobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgLy8gVE9ETzogZHVtYlxyXG4gICAgICAgIHZhciByZXN1bHRzID0gbWVzc2FnZS5TZXNzaW9uLlF1ZXVlO1xyXG4gICAgICAgIHRoaXMudWkub25TZWFyY2hSZXN1bHRzKHJlc3VsdHMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVXNlcldhaXRpbmcgPSAoKTogYm9vbGVhbiA9PiB7XHJcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uO1xyXG4gICAgICAgIHZhciBsZW5ndGggPSB0aGlzLnNlc3Npb24uUXVldWUubGVuZ3RoO1xyXG4gICAgICAgIHJldHVybiBwb3MgPCAwIHx8ICgocG9zID09IChsZW5ndGggLSAxKSkgJiYgdGhpcy5wbGF5ZXIuaXNTdG9wcGVkKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vXHJcbiAgICAvLyBNb3N0bHkgVUkgY2FsbGJhY2sgZnVuY3Rpb25zXHJcbiAgICAvL1xyXG4gICAgdWlTZW5kQ2hhdE1lc3NhZ2UobXNnOiBzdHJpbmcpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdDaGF0TWVzc2FnZSc7XHJcbiAgICAgICAgbWVzc2FnZS5DaGF0TWVzc2FnZSA9IG1zZztcclxuICAgICAgICBtZXNzYWdlLlVzZXIgPSB0aGlzLnVzZXI7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgfVxyXG5cclxuICAgIG9uUGxheWVyU3RhdGVDaGFuZ2UgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICBpZihldmVudC5kYXRhPT0wKSB7XHJcbiAgICAgICAgICAgIHRoaXMudWlOZXh0TWVkaWEoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdWlTZWFyY2gocXVlcnk6IHN0cmluZywgcGFnZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgbWVzc2FnZS5BY3Rpb24gPSAnU2VhcmNoJztcclxuICAgICAgICAvLyBUT0RPOiBkdW1iXHJcbiAgICAgICAgbWVzc2FnZS5DaGF0TWVzc2FnZSA9IHF1ZXJ5O1xyXG4gICAgICAgIG1lc3NhZ2UuTWVkaWEgPSBuZXcgTWVkaWEoKTtcclxuICAgICAgICBtZXNzYWdlLk1lZGlhLklkID0gcGFnZTtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHVpTmFtZUNoYW5nZShuZXdOYW1lKSB7XHJcbiAgICAgICAgdGhpcy51c2VyLk5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHRoaXMudXNlcjtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdTYXZlVXNlck5hbWVDaGFuZ2UnO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25Vc2VyU3RhdGVDaGFuZ2UoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID49IDAgJiYgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPCB0aGlzLnNlc3Npb24uUXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLnNldFBsYXllckNvbnRlbnQodGhpcy5zZXNzaW9uLlF1ZXVlW3RoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uXSwgdGhpcy51c2VyLlN0YXRlLlRpbWUpO1xyXG4gICAgICAgICAgICB0aGlzLnVpLnVwZGF0ZVF1ZXVlKHRoaXMuc2Vzc2lvbi5RdWV1ZSwgdGhpcy51c2VyLklkLCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVpTmV4dE1lZGlhID0gKCkgPT4ge1xyXG4gICAgICAgIHZhciBxdWV1ZSA9IHRoaXMuc2Vzc2lvbi5RdWV1ZTtcclxuICAgICAgICBpZih0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiArIDEgPCBxdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy51c2VyLlN0YXRlLlRpbWUgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiArPSAxO1xyXG4gICAgICAgICAgICB0aGlzLm9uVXNlclN0YXRlQ2hhbmdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllci5ub3RoaW5nUGxheWluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1aVBhdXNlTWVkaWEgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIucGF1c2UoKTtcclxuICAgIH1cclxuXHJcbiAgICB1aVBsYXlNZWRpYSA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnBsYXllci5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdWlQcmV2aW91c01lZGlhID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMudXNlci5TdGF0ZS5UaW1lID0gMDtcclxuICAgICAgICB2YXIgcXVldWUgPSB0aGlzLnNlc3Npb24uUXVldWU7XHJcbiAgICAgICAgaWYodGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gLSAxO1xyXG4gICAgICAgICAgICB0aGlzLm9uVXNlclN0YXRlQ2hhbmdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gVGhlc2UgZnVuY3Rpb25zIGFyZSBjYWxsZWQgZGlyZWN0bHkgZW1iZWRkZWQgaW50byB0aGUgaHRtbC4uLiBraW5kYSB3ZWlyZFxyXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBvbkZhdGFsRXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgJChcIiNkaXZfZXZlcnl0aGluZ1wiKS5oaWRlKCk7XHJcbiAgICAgICAgJChcIiNkaXZfZXJyb3JcIikuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVlc3RTeW5jV2l0aFVzZXIgPSAodXNlcklkKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3JlcXVlc3Qgc3luYyB3aXRoIHVzZXInKTtcclxuXHJcbiAgICAgICAgdmFyIHVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICAgICAgdXNlci5JZCA9IHVzZXJJZDtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdSZXF1ZXN0U3luY1dpdGhVc2VyJztcclxuICAgICAgICBtZXNzYWdlLlVzZXIgPSB1c2VyO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdWlRdWV1ZU1lZGlhID0gKG1lZGlhOiBNZWRpYSkgPT4ge1xyXG4gICAgICAgIG1lZGlhLlVzZXJJZCA9IHRoaXMudXNlci5JZDtcclxuICAgICAgICBtZWRpYS5Vc2VyTmFtZSA9IHRoaXMudXNlci5OYW1lO1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0FkZE1lZGlhVG9TZXNzaW9uJztcclxuICAgICAgICBtZXNzYWdlLk1lZGlhID0gbWVkaWE7XHJcbiAgICAgICAgLy9UT0RPOiBsb2NhbCBhZGQgbWVkaWFcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGRlbGV0ZU1lZGlhID0gKG1lZGlhSWQ6IG51bWJlciwgcG9zaXRpb246IG51bWJlcikgPT4ge1xyXG5cclxuICAgICAgICB0aGlzLnNlc3Npb24uUXVldWUuc3BsaWNlKHBvc2l0aW9uLCAxKTtcclxuICAgICAgICBpZiAodGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPj0gcG9zaXRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gLT0gMTtcclxuICAgICAgICAgICAgdGhpcy5vblVzZXJTdGF0ZUNoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVF1ZXVlKHRoaXMuc2Vzc2lvbi5RdWV1ZSwgdGhpcy51c2VyLklkLCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcblxyXG4gICAgICAgIHZhciBtZWRpYVRvRGVsZXRlID0gbmV3IE1lZGlhKCk7XHJcbiAgICAgICAgbWVkaWFUb0RlbGV0ZS5JZCA9IG1lZGlhSWQ7XHJcblxyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0RlbGV0ZU1lZGlhRnJvbVNlc3Npb24nO1xyXG4gICAgICAgIG1lc3NhZ2UuTWVkaWEgPSBtZWRpYVRvRGVsZXRlO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZGVjbGFyZSB2YXIgbW9iaWxlQnJvd3NlcjogYm9vbGVhbjtcclxuZGVjbGFyZSB2YXIgcm9vbVR5cGU6IHN0cmluZztcclxuZGVjbGFyZSB2YXIgcm9vbU5hbWU6IHN0cmluZztcclxuXHJcbnZhciBtUm9vbU1hbmFnZXIgPSBuZXcgUm9vbU1hbmFnZXIocm9vbVR5cGUsIG1vYmlsZUJyb3dzZXIpO1xyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICBtUm9vbU1hbmFnZXIuaW5pdChyb29tTmFtZSk7XHJcbn0pO1xyXG5cclxuXHJcbiIsIu+7v2ltcG9ydCB7IFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDbGllbnRBY3Rpb25zIHtcclxuXHJcbiAgICBjbGllbnRTZXNzaW9uUmVhZHk6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRVcGRhdGVVc2Vyc0xpc3Q6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRVcGRhdGVRdWV1ZTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudENoYXRNZXNzYWdlOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50UmVxdWVzdFVzZXJTdGF0ZTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFByb3ZpZGVVc2VyU3RhdGU6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRTZWFyY2hSZXN1bHRzOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE15U29ja2V0IHtcclxuXHJcbiAgICBwcml2YXRlIHNvY2tldDogV2ViU29ja2V0O1xyXG4gICAgcHJpdmF0ZSBjbGllbnRBY3Rpb25zOiBDbGllbnRBY3Rpb25zO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNsaWVudEFjdGlvbnM6IENsaWVudEFjdGlvbnMpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGllbnRBY3Rpb25zID0gY2xpZW50QWN0aW9ucztcclxuXHJcbiAgICAgICAgdmFyIHVyaSA9IFwid3M6Ly9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgXCIvd3NcIjtcclxuICAgICAgICB2YXIgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh1cmkpO1xyXG4gICAgICAgIHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG4gICAgICAgIHNvY2tldC5vbmNsb3NlID0gZnVuY3Rpb24gKGV2ZW50KSB7fTtcclxuXHJcbiAgICAgICAgc29ja2V0Lm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XHJcbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBtZXNzYWdlLkFjdGlvbjtcclxuICAgICAgICAgICAgaWYgKGNsaWVudEFjdGlvbnNbYWN0aW9uXSkge1xyXG4gICAgICAgICAgICAgICAgY2xpZW50QWN0aW9uc1thY3Rpb25dKG1lc3NhZ2UpOyBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImJhZCBjbGllbnQgYWN0aW9uXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogaGFuZGxlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGVtaXQobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IHRoaXMuc29ja2V0LkNPTk5FQ1RJTkcpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0sIDUwKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcclxuICAgIH07XHJcblxyXG59XHJcbiIsIu+7v2ltcG9ydCB7IEZyYW1lQnVpbGRlciB9IGZyb20gXCIuL0ZyYW1lQnVpbGRlclwiO1xyXG5pbXBvcnQgeyBNZWRpYSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZGVjbGFyZSB2YXIgU3Bpbm5lcjogYW55O1xyXG5cclxuLy8gT2ggZ29kIHRoaXMgY29kZSBpcyBzY2FyeVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBVSUNhbGxiYWNrcyB7XHJcbiAgICB1aVNlbmRDaGF0TWVzc2FnZTogYW55O1xyXG4gICAgdWlTZWFyY2g6IChxdWVyeTogc3RyaW5nLCBwYWdlOiBudW1iZXIpID0+IHZvaWQ7XHJcbiAgICB1aU5hbWVDaGFuZ2U6IGFueTtcclxuICAgIHVpUXVldWVNZWRpYTogKG1lZGlhOiBNZWRpYSkgPT4gdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFVJIHtcclxuXHJcbiAgICBwcml2YXRlIGNvbG9yczogYW55O1xyXG4gICAgcHJpdmF0ZSBzcGlubmVyOiBhbnk7XHJcbiAgICBwcml2YXRlIGNhbGxiYWNrczogVUlDYWxsYmFja3M7XHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGZyYW1lQnVpbGRlcjogRnJhbWVCdWlsZGVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50UGFnZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50UXVlcnk6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihtb2JpbGVCcm93c2VyOiBib29sZWFuLCBjYWxsYmFja3M6IFVJQ2FsbGJhY2tzKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvcnMgPSBbJ3JlZCcsICdvcmFuZ2UnLCAneWVsbG93JywgJ2dyZWVuJywgJ2JsdWUnLCAndmlvbGV0J107XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgICAgICB0aGlzLmZyYW1lQnVpbGRlciA9IG5ldyBGcmFtZUJ1aWxkZXIobW9iaWxlQnJvd3Nlcik7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSBjYWxsYmFja3M7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplKCkge1xyXG4gICAgICAgIHRoaXMuc2V0dXBTcGlubmVyVUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwSW5mb1JvbGxvdmVyVUkoKTtcclxuICAgICAgICB0aGlzLnNldHVwSW5wdXRVSSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXNzaW9uUmVhZHkgPSAoKSA9PiB7XHJcbiAgICAgICAgJChcIiNkaXZfbG9hZGluZ1wiKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zcGlubmVyLnN0b3AoKTtcclxuICAgICAgICAkKFwiI2Rpdl9ldmVyeXRoaW5nXCIpLmFuaW1hdGUoe29wYWNpdHk6IDF9LCAnZmFzdCcpO1xyXG4gICAgfSBcclxuXHJcbiAgICBwcml2YXRlIHNldHVwU3Bpbm5lclVJKCkge1xyXG4gICAgICAgIHZhciBvcHRzID0ge1xyXG4gICAgICAgICAgICBsaW5lczogMTMgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XHJcbiAgICAgICAgICAgICwgbGVuZ3RoOiAyOCAvLyBUaGUgbGVuZ3RoIG9mIGVhY2ggbGluZVxyXG4gICAgICAgICAgICAsIHdpZHRoOiAxNCAvLyBUaGUgbGluZSB0aGlja25lc3NcclxuICAgICAgICAgICAgLCByYWRpdXM6IDQyIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxyXG4gICAgICAgICAgICAsIHNjYWxlOiAxIC8vIFNjYWxlcyBvdmVyYWxsIHNpemUgb2YgdGhlIHNwaW5uZXJcclxuICAgICAgICAgICAgLCBjb3JuZXJzOiAxIC8vIENvcm5lciByb3VuZG5lc3MgKDAuLjEpXHJcbiAgICAgICAgICAgICwgY29sb3I6ICcjMDAwJyAvLyAjcmdiIG9yICNycmdnYmIgb3IgYXJyYXkgb2YgY29sb3JzXHJcbiAgICAgICAgICAgICwgb3BhY2l0eTogMC4yNSAvLyBPcGFjaXR5IG9mIHRoZSBsaW5lc1xyXG4gICAgICAgICAgICAsIHJvdGF0ZTogMCAvLyBUaGUgcm90YXRpb24gb2Zmc2V0XHJcbiAgICAgICAgICAgICwgZGlyZWN0aW9uOiAxIC8vIDE6IGNsb2Nrd2lzZSwgLTE6IGNvdW50ZXJjbG9ja3dpc2VcclxuICAgICAgICAgICAgLCBzcGVlZDogMSAvLyBSb3VuZHMgcGVyIHNlY29uZFxyXG4gICAgICAgICAgICAsIHRyYWlsOiA2MCAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxyXG4gICAgICAgICAgICAsIGZwczogMjAgLy8gRnJhbWVzIHBlciBzZWNvbmQgd2hlbiB1c2luZyBzZXRUaW1lb3V0KCkgYXMgYSBmYWxsYmFjayBmb3IgQ1NTXHJcbiAgICAgICAgICAgICwgekluZGV4OiAyZTkgLy8gVGhlIHotaW5kZXggKGRlZmF1bHRzIHRvIDIwMDAwMDAwMDApXHJcbiAgICAgICAgICAgICwgY2xhc3NOYW1lOiAnc3Bpbm5lcicgLy8gVGhlIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIHNwaW5uZXJcclxuICAgICAgICAgICAgLCB0b3A6ICc1MCUnIC8vIFRvcCBwb3NpdGlvbiByZWxhdGl2ZSB0byBwYXJlbnRcclxuICAgICAgICAgICAgLCBsZWZ0OiAnNTAlJyAvLyBMZWZ0IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIHNoYWRvdzogZmFsc2UgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcclxuICAgICAgICAgICAgLCBod2FjY2VsOiBmYWxzZSAvLyBXaGV0aGVyIHRvIHVzZSBoYXJkd2FyZSBhY2NlbGVyYXRpb25cclxuICAgICAgICAgICAgLCBwb3NpdGlvbjogJ2Fic29sdXRlJyAvLyBFbGVtZW50IHBvc2l0aW9uaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2X2xvYWRpbmcnKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcihvcHRzKS5zcGluKHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkcm9wcGVyU3dpdGNoKGRyb3BwZXI6IEpRdWVyeSkge1xyXG4gICAgICAgIGlmIChkcm9wcGVyLmhhc0NsYXNzKCdhcnJvdy1kb3duJykpIHtcclxuICAgICAgICAgICAgZHJvcHBlci5yZW1vdmVDbGFzcygnYXJyb3ctZG93bicpO1xyXG4gICAgICAgICAgICBkcm9wcGVyLmFkZENsYXNzKCdhcnJvdy11cCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZHJvcHBlci5yZW1vdmVDbGFzcygnYXJyb3ctdXAnKTtcclxuICAgICAgICAgICAgZHJvcHBlci5hZGRDbGFzcygnYXJyb3ctZG93bicpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwRmFkZVVJKG92ZXJhbGw6IEpRdWVyeSwgcmVzdWx0cykge1xyXG4gICAgICAgIG92ZXJhbGwubW91c2VlbnRlcigoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdHMuaXMoJzp2aXNpYmxlJykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMuZmFkZUluKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHJvcHBlciA9IG92ZXJhbGwuZmluZCgnLmRyb3BwZXInKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJvcHBlclN3aXRjaChkcm9wcGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG92ZXJhbGwubW91c2VsZWF2ZSgoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mYWRlT3V0KCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHJvcHBlciA9IG92ZXJhbGwuZmluZCgnLmRyb3BwZXInKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJvcHBlclN3aXRjaChkcm9wcGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBJbmZvUm9sbG92ZXJVSSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X3VzZXJzX292ZXJhbGxcIiksICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfcXVldWVfb3ZlcmFsbFwiKSwgJChcIiNkaXZfcXVldWVfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfY2hhdF9vdmVyYWxsXCIpLCAkKFwiI2Rpdl9jaGF0X3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X2NjX292ZXJhbGxcIiksICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlYXJjaFRleHRDaGFuZ2VkKHRleHQpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGlmKHRleHQubGVuZ3RoPT0wKSB7XHJcbiAgICAgICAgICAgIGRpdlJlc3VsdHMuZmFkZU91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwSW5wdXRVSSgpIHtcclxuICAgICAgICB2YXIgaW5wdXRTZWFyY2ggPSAkKFwiI2lucHV0X3NlYXJjaFwiKTtcclxuICAgICAgICBpbnB1dFNlYXJjaC5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hFbnRlclByZXNzZWQoaW5wdXRTZWFyY2gpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGlucHV0X25hbWUgPSAkKFwiI2lucHV0X25hbWVcIik7XHJcbiAgICAgICAgaW5wdXRfbmFtZS5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyTmFtZUNoYW5nZShpbnB1dF9uYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dF9jaGF0ID0gJChcIiNpbnB1dF9jaGF0XCIpO1xyXG4gICAgICAgICAgICBpbnB1dF9jaGF0LmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpU2VuZENoYXRNZXNzYWdlKGlucHV0X2NoYXQudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0X2NoYXQudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgalF1ZXJ5KGRvY3VtZW50LmJvZHkpLm9uKFwiY2xpY2tcIiwgXCI6bm90KCNkaXZfc2VhcmNoX3Jlc3VsdHMsICNkaXZfc2VhcmNoX3Jlc3VsdHMgKilcIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikudmFsKFwiXCIpO1xyXG4gICAgICAgIH0pO+KAi+KAi+KAi+KAi+KAi+KAi+KAi1xyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmJpbmQoXCJwcm9wZXJ0eWNoYW5nZSBpbnB1dCBwYXN0ZVwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZWFyY2hUZXh0Q2hhbmdlZCgkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uU2VhcmNoUmVzdWx0cyhyZXN1bHRzOiBNZWRpYVtdKSB7XHJcbiAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLnNob3coKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCJcIik7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBtZWRpYSA9IHJlc3VsdHNbaV07XHJcbiAgICAgICAgICAgIHZhciBkaXZTZWFyY2hSZXN1bHQgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICAgICAgZGl2U2VhcmNoUmVzdWx0LmFkZENsYXNzKCdkaXZfcmVzdWx0IHNlYXJjaF9zdHVmZicpO1xyXG4gICAgICAgICAgICBkaXZTZWFyY2hSZXN1bHQuYXBwZW5kVG8oZGl2UmVzdWx0cyk7XHJcbiAgICAgICAgICAgIHZhciBpbWdUaHVtYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgICAgICAkKGltZ1RodW1iKS5hZGRDbGFzcygnaW1nX3Jlc3VsdCBzZWFyY2hfc3R1ZmYnKTtcclxuICAgICAgICAgICAgaW1nVGh1bWIuc3JjID0gbWVkaWEuVGh1bWJVUkw7XHJcbiAgICAgICAgICAgICQoaW1nVGh1bWIpLmFwcGVuZFRvKGRpdlNlYXJjaFJlc3VsdCk7XHJcbiAgICAgICAgICAgIHZhciBpbm5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICAkKGlubmVyRGl2KS5hZGRDbGFzcygnZGl2X2lubmVyX3Jlc3VsdHMgc2VhcmNoX3N0dWZmJyk7XHJcbiAgICAgICAgICAgICQoaW5uZXJEaXYpLmFwcGVuZFRvKGRpdlNlYXJjaFJlc3VsdCk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICQoc3BhblRpdGxlKS5hZGRDbGFzcygncmVzdWx0X3RpdGxlIHNlYXJjaF9zdHVmZicpO1xyXG4gICAgICAgICAgICAkKHNwYW5UaXRsZSkuYXBwZW5kVG8oaW5uZXJEaXYpO1xyXG4gICAgICAgICAgICAkKHNwYW5UaXRsZSkudGV4dChtZWRpYS5UaXRsZSk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuRGVzY3JpcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgICAgICQoc3BhbkRlc2NyaXB0aW9uKS5hZGRDbGFzcygncmVzdWx0X2Rlc2NyaXB0aW9uIHNlYXJjaF9zdHVmZicpO1xyXG4gICAgICAgICAgICAkKHNwYW5EZXNjcmlwdGlvbikuYXBwZW5kVG8oaW5uZXJEaXYpO1xyXG4gICAgICAgICAgICAkKHNwYW5EZXNjcmlwdGlvbikuaHRtbChtZWRpYS5EZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIGRpdlNlYXJjaFJlc3VsdC5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy51aVF1ZXVlTWVkaWEobWVkaWEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgdmFyIGRpdlJlc3VsdHMgPSAkKFwiI2Rpdl9zZWFyY2hfcmVzdWx0c1wiKTtcclxuICAgICAgICAgICAgZGl2UmVzdWx0cy5odG1sKFwiXCIpO1xyXG4gICAgICAgICAgICBkaXZSZXN1bHRzLmh0bWwoXCI8cCBpZD0ncF9zZWFyY2hpbmcnPm5vIHJlc3VsdHMgZm91bmQsIG9yIHNvbWV0aGluZyBzY3Jld2VkIHVwPC9wPlwiKTtcclxuICAgICAgICAgICAgZGl2UmVzdWx0cy5mYWRlSW4oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVE9ETzogdGhpcyBkb2VzbnQgaGF2ZSB0byBiZSBhZGRlZCBldmVyeSB0aW1lXHJcbiAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09IDUpIHtcclxuICAgICAgICAgICAgdmFyIHBhZ2luZ0RpdiA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG4gICAgICAgICAgICBwYWdpbmdEaXYuYWRkQ2xhc3MoXCJkaXZfb3V0ZXJfcGFnaW5nXCIpO1xyXG4gICAgICAgICAgICBwYWdpbmdEaXYuYXBwZW5kVG8oZGl2UmVzdWx0cyk7XHJcbiAgICAgICAgICAgIHZhciBwcmV2aW91c0RpdiA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG4gICAgICAgICAgICBwcmV2aW91c0Rpdi5hcHBlbmRUbyhwYWdpbmdEaXYpO1xyXG4gICAgICAgICAgICBwcmV2aW91c0Rpdi5hZGRDbGFzcygnZGl2X3BhZ2luZycpO1xyXG4gICAgICAgICAgICBwcmV2aW91c0Rpdi5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzUGFnZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcHJldmlvdXNEaXYudGV4dCgncHJldmlvdXMgcGFnZScpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50UGFnZSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBwcmV2aW91c0Rpdi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIG5leHREaXYgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICAgICAgbmV4dERpdi5hcHBlbmRUbyhwYWdpbmdEaXYpO1xyXG4gICAgICAgICAgICBuZXh0RGl2LmFkZENsYXNzKCdkaXZfcGFnaW5nJyk7XHJcbiAgICAgICAgICAgIG5leHREaXYuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0UGFnZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbmV4dERpdi50ZXh0KCduZXh0IHBhZ2UnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmJsdXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcmV2aW91c1BhZ2UgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBhZ2UgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheVNlYXJjaGluZygpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlIC09IDE7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpU2VhcmNoKHRoaXMuY3VycmVudFF1ZXJ5LCB0aGlzLmN1cnJlbnRQYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dFBhZ2UgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5U2VhcmNoaW5nKCk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZSArPSAxO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpU2VhcmNoKHRoaXMuY3VycmVudFF1ZXJ5LCB0aGlzLmN1cnJlbnRQYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNwbGF5U2VhcmNoaW5nKCkge1xyXG4gICAgICAgIHZhciBkaXZSZXN1bHRzID0gJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgZGl2UmVzdWx0cy5odG1sKFwiXCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuaHRtbChcIjxwIGlkPSdwX3NlYXJjaGluZyc+c2VhcmNoaW5nPC9wPlwiKTtcclxuICAgICAgICBkaXZSZXN1bHRzLmZhZGVJbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VhcmNoRW50ZXJQcmVzc2VkKGlucHV0X3NlYXJjaCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFF1ZXJ5ID0gaW5wdXRfc2VhcmNoLnZhbCgpO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRRdWVyeSAmJiB0aGlzLmN1cnJlbnRRdWVyeSAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpU2VhcmNoKHRoaXMuY3VycmVudFF1ZXJ5LCB0aGlzLmN1cnJlbnRQYWdlKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5U2VhcmNoaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVRdWV1ZShxdWV1ZTogTWVkaWFbXSwgdXNlcklkTWU6IG51bWJlciwgcXVldWVQb3NpdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHF1ZXVlLmxlbmd0aDtcclxuICAgICAgICB2YXIgc3VtbWFyeSA9IGxlbmd0aCArIFwiIHRoaW5ncyBpbiB0aGUgcGxheWxpc3RcIjtcclxuICAgICAgICBpZiAobGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IGxlbmd0aCArIFwiIHRoaW5nIGluIHRoZSBwbGF5bGlzdFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChsZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICBzdW1tYXJ5ID0gXCJOb3RoaW5nIGluIHRoZSBwbGF5bGlzdC4gUXVldWUgc29tZXRoaW5nIVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiI3BfcXVldWVfc3VtbWFyeVwiKS50ZXh0KHN1bW1hcnkpO1xyXG5cclxuICAgICAgICB2YXIgcXVldWVSZXN1bHRzID0gJChcIiNkaXZfcXVldWVfcmVzdWx0c1wiKTtcclxuICAgICAgICBxdWV1ZVJlc3VsdHMuaHRtbChcIlwiKTtcclxuICAgICAgICAvLyBUT0RPOiBuZWVkIHRvIG1ha2UgdGhpcyBzZXBlcmF0ZSBmcm9tIHNlYXJjaCByZXN1bHRzIHByb2JhYmx5XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgbWVkaWEgPSBxdWV1ZVtpXTtcclxuICAgICAgICAgICAgdmFyIGRpdlF1ZXVlUmVzdWx0ID0gJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XHJcbiAgICAgICAgICAgIGRpdlF1ZXVlUmVzdWx0LmFkZENsYXNzKCdkaXZfcmVzdWx0Jyk7XHJcbiAgICAgICAgICAgIGRpdlF1ZXVlUmVzdWx0LmFwcGVuZFRvKHF1ZXVlUmVzdWx0cyk7XHJcbiAgICAgICAgICAgIHZhciBpbWdUaHVtYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgICAgICAkKGltZ1RodW1iKS5hZGRDbGFzcygnaW1nX3Jlc3VsdCcpO1xyXG4gICAgICAgICAgICBpbWdUaHVtYi5zcmMgPSBtZWRpYS5UaHVtYlVSTDtcclxuICAgICAgICAgICAgJChpbWdUaHVtYikuYXBwZW5kVG8oZGl2UXVldWVSZXN1bHQpO1xyXG4gICAgICAgICAgICB2YXIgaW5uZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgJChpbm5lckRpdikuYWRkQ2xhc3MoJ2Rpdl9pbm5lcl9yZXN1bHRzJyk7XHJcbiAgICAgICAgICAgICQoaW5uZXJEaXYpLmFwcGVuZFRvKGRpdlF1ZXVlUmVzdWx0KTtcclxuICAgICAgICAgICAgdmFyIHNwYW5UaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICAgICAgJChzcGFuVGl0bGUpLmFkZENsYXNzKCdyZXN1bHRfdGl0bGUnKTtcclxuICAgICAgICAgICAgJChzcGFuVGl0bGUpLmFwcGVuZFRvKGlubmVyRGl2KTtcclxuICAgICAgICAgICAgJChzcGFuVGl0bGUpLnRleHQobWVkaWEuVGl0bGUpO1xyXG4gICAgICAgICAgICB2YXIgc3BhbkRlc2NyaXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgICAgICAkKHNwYW5EZXNjcmlwdGlvbikuYWRkQ2xhc3MoJ3Jlc3VsdF9kZXNjcmlwdGlvbicpO1xyXG4gICAgICAgICAgICAkKHNwYW5EZXNjcmlwdGlvbikuYXBwZW5kVG8oaW5uZXJEaXYpO1xyXG4gICAgICAgICAgICAkKHNwYW5EZXNjcmlwdGlvbikuaHRtbChtZWRpYS5EZXNjcmlwdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICB9XHJcblxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVVc2Vyc0xpc3QodXNlcnMsIHVzZXJJZE1lOiBudW1iZXIpIHtcclxuICAgICAgICB2YXIgbnVtID0gdXNlcnMubGVuZ3RoO1xyXG4gICAgICAgIHZhciBzdW1tYXJ5ID0gdXNlcnMubGVuZ3RoICsgXCIgdXNlcnMgbGlzdGVuaW5nXCI7XHJcbiAgICAgICAgaWYgKG51bSA9PSAxKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSB1c2Vycy5sZW5ndGggKyBcIiB1c2VyIGxpc3RlbmluZ1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiI3BfdXNlcnNfc3VtbWFyeVwiKS50ZXh0KHN1bW1hcnkpO1xyXG4gICAgICAgIHZhciB1c2VyUmVzdWx0cyA9ICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKTtcclxuICAgICAgICB2YXIgaHRtbCA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXNlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHVzZXIgPSB1c2Vyc1tpXTtcclxuICAgICAgICAgICAgdmFyIHRoaXNJc01lID0gKHVzZXIuSWQgPT09IHVzZXJJZE1lKTtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gdGhpcy5mcmFtZUJ1aWxkZXIudXNlcih0aGlzLmNvbG9yc1tpICUgdGhpcy5jb2xvcnMubGVuZ3RoXSwgdXNlci5JZCwgdXNlci5OYW1lLCB0aGlzSXNNZSk7XHJcbiAgICAgICAgICAgIGh0bWwucHVzaChjdXJyZW50SFRNTCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHVzZXJSZXN1bHRzLmh0bWwoaHRtbC5qb2luKFwiXCIpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXNlck5hbWVDaGFuZ2UobmFtZV9pbnB1dCkge1xyXG4gICAgICAgIG5hbWVfaW5wdXQuaGlkZSgpO1xyXG4gICAgICAgICQoXCIjaW5wdXRfc2VhcmNoXCIpLmZhZGVJbigpO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnVpTmFtZUNoYW5nZShuYW1lX2lucHV0LnZhbCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DaGF0TWVzc2FnZSh1c2VyTmFtZTogc3RyaW5nLCBtc2c6IHN0cmluZywgY29sb3I6IHN0cmluZykge1xyXG4gICAgICAgIC8vVE9ETzogY29sb3Igc3R1ZmZcclxuICAgICAgICB2YXIgdWxfY2hhdCA9ICQoXCIjdWxfY2hhdFwiKTtcclxuICAgICAgICB2YXIgaHRtbCA9ICc8bGkgY2xhc3M9XCJjaGF0XCI+PHNwYW4gc3R5bGU9XCJtYXJnaW46IDA7IGNvbG9yOiAnICsgY29sb3IgKyAnO1wiPicgKyB1c2VyTmFtZSArICc6IDwvc3Bhbj48c3Bhbj4nICsgbXNnICsgJzwvc3Bhbj48L2xpPic7XHJcbiAgICAgICAgdWxfY2hhdC5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgaWYgKHVsX2NoYXQubGVuZ3RoID49IDEwKSB7XHJcbiAgICAgICAgICAgIHVsX2NoYXQuY2hpbGRyZW4oKVswXS5yZW1vdmUoKTsgXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Iiwi77u/ZGVjbGFyZSB2YXIgWVQ6IGFueTtcclxuXHJcbmltcG9ydCB7IElQbGF5ZXIgfSBmcm9tIFwiLi9JUGxheWVyXCI7XHJcbmltcG9ydCB7IE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi9VSVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFl0UGxheWVyIGltcGxlbWVudHMgSVBsYXllciB7XHJcblxyXG4gICAgcHJpdmF0ZSB5dFBsYXllcjogYW55O1xyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSB1aTogVUk7XHJcbiAgICBwdWJsaWMgcGxheWVyUmVhZHk6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IodWk6IFVJLCBtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICAgICAgdGhpcy51aSA9IHVpO1xyXG4gICAgICAgICQoXCIjZGl2X3l0X3BsYXllclwiKS5zaG93KCk7XHJcbiAgICAgICAgJChcIiNkaXZfcG9kY2FzdF9wbGF5ZXJcIikuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0UGxheWVyKG9uUGxheWVyU3RhdGVDaGFuZ2UpIHtcclxuICAgICAgICBpZiAoWVQgJiYgWVQuUGxheWVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMueXRQbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCdkaXZfeXRfcGxheWVyJywge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnYXV0bycsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgcGxheWVyVmFyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xzOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3dpbmZvOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dG9wbGF5OiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ29uUmVhZHknIDogdGhpcy5vblBsYXllclJlYWR5LFxyXG4gICAgICAgICAgICAgICAgICAgICdvblN0YXRlQ2hhbmdlJzogb25QbGF5ZXJTdGF0ZUNoYW5nZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLmluaXRQbGF5ZXIob25QbGF5ZXJTdGF0ZUNoYW5nZSkgfSwgNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBkaXZfcGxheWVyID0gJChcIiNkaXZfeXRfcGxheWVyXCIpO1xyXG4gICAgICAgICAgICBkaXZfcGxheWVyLmhlaWdodChkaXZfcGxheWVyLndpZHRoKCkgKiA5LjAgLyAxNi4wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uUGxheWVyUmVhZHkgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBsYXllckNvbnRlbnQobWVkaWE6IE1lZGlhLCB0aW1lOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMucGxheWVyUmVhZHkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3BsYXllciBub3QgcmVhZHkhJyk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnNldFBsYXllckNvbnRlbnQobWVkaWEsIHRpbWUpIH0sIDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMueXRQbGF5ZXIubG9hZFZpZGVvQnlJZChtZWRpYS5ZVFZpZGVvSUQsIHRpbWUsIFwibGFyZ2VcIik7XHJcbiAgICAgICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGxheSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBsYXlWaWRlbygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYXVzZSgpIHtcclxuICAgICAgICB0aGlzLnl0UGxheWVyLnBhdXNlVmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFRpbWUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLnl0UGxheWVyLmdldEN1cnJlbnRUaW1lKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRDdXJyZW50U3RhdGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLnl0UGxheWVyLmdldFBsYXllclN0YXRlKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc1N0b3BwZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFN0YXRlKCkgPT0gMDtcclxuICAgIH1cclxuXHJcbn0iXX0=
