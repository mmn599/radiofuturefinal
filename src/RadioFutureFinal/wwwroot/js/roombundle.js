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
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PodcastPlayer = (function () {
    function PodcastPlayer(mobileBrowser) {
        var _this = this;
        this.getCurrentTime = function () {
            return _this.html5audio.currentTime;
        };
        this.getCurrentState = function () {
            // TODO: implement
            // return this.html5audio.sta
            return 0;
        };
        this.mobileBrowser = mobileBrowser;
        this.html5audio = document.getElementById('html5audio');
        $("#div_yt_player").hide();
        $("#div_podcast_player").show();
    }
    PodcastPlayer.prototype.initPlayer = function (onPlayerStateChange) {
        // TODO: add this
    };
    PodcastPlayer.prototype.setPlayerContent = function (media, time) {
        this.html5audio.src = media.MP3Source;
        this.html5audio.currentTime = time;
    };
    PodcastPlayer.prototype.play = function () {
        this.html5audio.play();
    };
    PodcastPlayer.prototype.pause = function () {
        this.html5audio.pause();
    };
    return PodcastPlayer;
}());
exports.PodcastPlayer = PodcastPlayer;
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Contracts_1 = require("./Contracts");
var PodcastSearcher = (function () {
    function PodcastSearcher() {
    }
    PodcastSearcher.prototype.init = function (secret, appId) {
        if (appId === void 0) { appId = null; }
        console.log(secret);
    };
    PodcastSearcher.prototype.search = function (query, callback) {
        var medias = [];
        for (var i = 0; i < 3; i++) {
            var media = new Contracts_1.Media();
            media.MP3Source = "https://rss.art19.com/episodes/a05b129d-52e8-4baa-8446-e97db62a2bbb.mp3";
            media.Title = "Pod Save America";
            media.ThumbURL = "https://dfkfj8j276wwv.cloudfront.net/images/0d/28/33/81/0d283381-724c-4caa-abad-b470e950d72d/9fe8d62a052c05af026cccbc86ce1073e04f363fcc7c5fda6ce7b40c5ac23fad0bc8595632402b605e0683e40a6726f8cd25a9ee88ca38a3b1ac33b108a7c5c2.jpeg";
        }
    };
    return PodcastSearcher;
}());
exports.PodcastSearcher = PodcastSearcher;
},{"./Contracts":1}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Contracts_1 = require("./Contracts");
var UI_1 = require("./UI");
var Sockets_1 = require("./Sockets");
var PodcastPlayer_1 = require("./PodcastPlayer");
var YtPlayer_1 = require("./YtPlayer");
var YtSearcher_1 = require("./YtSearcher");
var PodcastSearcher_1 = require("./PodcastSearcher");
var RoomManager = (function () {
    function RoomManager(playerType, mobileBrowser) {
        var _this = this;
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
        this.queueSelectedVideo = function (elmnt) {
            $("#div_search_results").fadeOut();
            $("#input_search").val("");
            var videoId = elmnt.getAttribute('data-VideoId');
            var title = elmnt.innerText || elmnt.textContent;
            var thumbURL = elmnt.getAttribute('data-ThumbURL');
            var mp3Source = elmnt.getAttribute('data-MP3Source');
            var oggSource = elmnt.getAttribute('data-OGGSource');
            var media = new Contracts_1.Media();
            media.YTVideoID = videoId;
            media.Title = title;
            media.ThumbURL = thumbURL;
            media.MP3Source = mp3Source;
            media.OGGSource = oggSource;
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
                _this.userStateChange();
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
        window.queueSelectedVideo = this.queueSelectedVideo;
        window.requestSyncWithUser = this.requestSyncWithUser;
        window.deleteMedia = this.deleteMedia;
        this.playerType = playerType;
        this.mobileBrowser = mobileBrowser;
    }
    RoomManager.prototype.init = function () {
        this.user = new Contracts_1.MyUser();
        this.session = new Contracts_1.Session();
        if (this.playerType == "podcasts") {
            this.player = new PodcastPlayer_1.PodcastPlayer(this.mobileBrowser);
            this.searcher = new PodcastSearcher_1.PodcastSearcher();
        }
        else {
            // TODO: get rid of this key
            this.searcher = new YtSearcher_1.YtSearcher('AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc');
            this.player = new YtPlayer_1.YtPlayer(this.mobileBrowser);
        }
        this.ui = new UI_1.UI(this.mobileBrowser, this);
        this.socket = new Sockets_1.MySocket(this);
        this.setupJamSession();
        this.player.initPlayer(this.onPlayerStateChange);
    };
    RoomManager.prototype.setupJamSession = function () {
        var pathname = window.location.pathname;
        var encodedSessionName = pathname.replace('\/rooms/', '');
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
        this.user.State.YTPlayerState = userToSyncWith.State.YTPlayerState;
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        var currentMedia = this.session.Queue[this.user.State.QueuePosition];
        this.userStateChange();
    };
    RoomManager.prototype.clientRequestUserState = function (message) {
        var userData = new Contracts_1.MyUser();
        userData.Id = message.User.Id; // TODO: bad bad bad
        userData.State.QueuePosition = this.user.State.QueuePosition;
        userData.State.Time = Math.round(this.player.getCurrentTime());
        userData.State.YTPlayerState = this.player.getCurrentState();
        var outgoingMsg = new Contracts_1.WsMessage();
        outgoingMsg.Action = 'ProvideSyncToUser';
        outgoingMsg.User = userData;
        this.socket.emit(outgoingMsg);
    };
    RoomManager.prototype.clientUpdateUser = function (message) {
        var user = message.User;
        this.user = user;
    };
    RoomManager.prototype.clientSessionReady = function (message) {
        this.session = message.Session;
        this.user = message.User;
        // TODO: get rid of this bullshit
        if (this.session.Queue.length == 0) {
            $("#p_current_content_info").text("Queue up a song!");
            $("#p_current_recommender_info").text("Use the search bar above.");
        }
        this.nextMedia();
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
        this.session.Queue = message.Session.Queue;
        if (this.user.State.Waiting) {
            this.nextMedia();
        }
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
    };
    RoomManager.prototype.clientChatMessage = function (message) {
        var chatMessage = message.ChatMessage;
        var userName = message.User.Name;
        this.ui.onChatMessage(userName, chatMessage);
    };
    RoomManager.prototype.clientSetupAudioAPI = function (message) {
        // TODO: better mechanism for different players
        if (this.playerType == "podcasts") {
            // TODO: better message structure
            // TODO: ensure this isn't awfully insecure
            var id = message.User.Name;
            var secret = message.Media.Title;
            this.searcher.init(secret, id);
        }
    };
    RoomManager.prototype.clientSetupYTAPI = function (message) {
        if (this.playerType != "podcasts") {
            var secret = message.Media.Title;
            this.searcher.init(secret);
        }
    };
    //
    // Mostly UI callback functions
    //
    RoomManager.prototype.onSendChatMessage = function (msg) {
        var message = new Contracts_1.WsMessage();
        message.Action = 'ChatMessage';
        message.ChatMessage = msg;
        message.User = this.user;
        this.socket.emit(message);
    };
    RoomManager.prototype.onPlayerStateChange = function (event) {
        if (event.data == 0) {
            this.nextMedia();
        }
    };
    RoomManager.prototype.search = function (query, callback) {
        this.searcher.search(query, callback);
    };
    RoomManager.prototype.nameChange = function (newName) {
        this.user.Name = newName;
        var message = new Contracts_1.WsMessage();
        message.User = this.user;
        message.Action = 'SaveUserNameChange';
        this.socket.emit(message);
    };
    RoomManager.prototype.userStateChange = function () {
        if (this.user.State.QueuePosition >= 0 && this.user.State.QueuePosition < this.session.Queue.length) {
            this.player.setPlayerContent(this.session.Queue[this.user.State.QueuePosition], this.user.State.Time);
            this.user.State.Waiting = false;
        }
        else if (this.user.State.QueuePosition < 0 || this.user.State.QueuePosition == this.session.Queue.length) {
            // TODO: set player content to 'waiting on next video'
            this.user.State.Waiting = true;
        }
        else if (this.user.State.QueuePosition == this.session.Queue.length) {
        }
    };
    RoomManager.prototype.nextMedia = function () {
        this.user.State.Time = 0;
        var queue = this.session.Queue;
        if (this.user.State.QueuePosition + 1 < queue.length) {
            this.user.State.QueuePosition = this.user.State.QueuePosition + 1;
        }
        else if (this.user.State.QueuePosition >= 0) {
            this.user.State.QueuePosition = queue.length;
        }
        this.userStateChange();
    };
    RoomManager.prototype.pauseMedia = function () {
        this.player.pause();
    };
    RoomManager.prototype.playMedia = function () {
        this.player.play();
    };
    RoomManager.prototype.previousMedia = function () {
        this.user.State.Time = 0;
        var queue = this.session.Queue;
        if (this.user.State.QueuePosition > 0) {
            this.user.State.QueuePosition = this.user.State.QueuePosition - 1;
            this.userStateChange();
        }
    };
    return RoomManager;
}());
var mRoomManager = new RoomManager(playerType, mobileBrowser);
$(document).ready(function () {
    mRoomManager.init();
});
},{"./Contracts":1,"./PodcastPlayer":5,"./PodcastSearcher":6,"./Sockets":8,"./UI":9,"./YtPlayer":10,"./YtSearcher":11}],8:[function(require,module,exports){
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
                // TODO: exception
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
},{}],9:[function(require,module,exports){
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
            for (var i = 0; i < results.length; i++) {
                var media = results[i];
                divResults.html(divResults.html() + "<div class='div_search_result' onClick='queueSelectedVideo(this)' data-VideoId='" + media.YTVideoID + "' data-ThumbURL='" + media.ThumbURL + "'>" + '<p class="text_search_result">' + media.Title + '</p></div>');
            }
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
},{"./FrameBuilder":2}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var YtPlayer = (function () {
    function YtPlayer(mobileBrowser) {
        var _this = this;
        this.onPlayerReady = function () {
            _this.playerReady = true;
        };
        this.playerReady = false;
        this.mobileBrowser = mobileBrowser;
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
            this.updatePlayerUI(media, time);
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
    YtPlayer.prototype.updatePlayerUI = function (media, time) {
        this.ytPlayer.loadVideoById(media.YTVideoID, time, "large");
        $("#p_cc_summary").text(media.Title);
        if (!this.mobileBrowser) {
            var html = '<div style="text-align: left; display: flex; align-items: center;">' +
                '<img style="height: 90px; width: 160px; margin-right: 16px;" src="' + media.ThumbURL + '"/>' +
                '<span style="margin-right: 16px;">' + media.Title + '<br>' + 'Recommended by: ' + media.UserName + '</span>' +
                '</div>';
            $("#div_cc_results").html(html);
        }
    };
    return YtPlayer;
}());
exports.YtPlayer = YtPlayer;
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Contracts_1 = require("./Contracts");
var YtSearcher = (function () {
    function YtSearcher(key) {
        this.ready = false;
        this.init(key);
    }
    YtSearcher.prototype.init = function (secret, appId) {
        var _this = this;
        if (appId === void 0) { appId = null; }
        if (gapi && gapi.client && gapi.client.setApiKey && gapi.client.load) {
            gapi.client.setApiKey(secret);
            gapi.client.load("youtube", "v3", function () { });
            this.ready = true;
        }
        else {
            setTimeout(function () { _this.init(secret); }, 50);
        }
    };
    // better way to check for ready
    YtSearcher.prototype.search = function (query, callback) {
        var _this = this;
        if (this.ready) {
            var request = gapi.client.youtube.search.list({
                part: "snippet",
                type: "video",
                q: encodeURIComponent(query).replace(/%20/g, "+"),
                maxResults: 5
            });
            request.execute(function (results) {
                var items = results.items;
                var medias = [];
                for (var i = 0; i < items.length; i++) {
                    var result = items[i];
                    var media = new Contracts_1.Media();
                    media.YTVideoID = result.id.videoId;
                    media.ThumbURL = result.snippet.thumbnails.medium.url;
                    media.Title = result.snippet.title;
                    medias.push(media);
                }
                callback(medias);
            });
        }
        else {
            setTimeout(function () { _this.search(query, callback); }, 50);
        }
    };
    return YtSearcher;
}());
exports.YtSearcher = YtSearcher;
},{"./Contracts":1}]},{},[1,8,2,9,7,3,5,10,4,6,11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Db250cmFjdHMudHMiLCJUeXBlU2NyaXB0cy9GcmFtZUJ1aWxkZXIudHMiLCJUeXBlU2NyaXB0cy9Qb2RjYXN0UGxheWVyLnRzIiwiVHlwZVNjcmlwdHMvUG9kY2FzdFNlYXJjaGVyLnRzIiwiVHlwZVNjcmlwdHMvUm9vbS50cyIsIlR5cGVTY3JpcHRzL1NvY2tldHMudHMiLCJUeXBlU2NyaXB0cy9VSS50cyIsIlR5cGVTY3JpcHRzL1l0UGxheWVyLnRzIiwiVHlwZVNjcmlwdHMvWXRTZWFyY2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUM7SUFBQTtJQVNELENBQUM7SUFBRCxZQUFDO0FBQUQsQ0FUQyxBQVNBLElBQUE7QUFUYSxzQkFBSztBQVduQjtJQUVJO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFLTCxhQUFDO0FBQUQsQ0FUQSxBQVNDLElBQUE7QUFUWSx3QkFBTTtBQVduQjtJQUVJO1FBQ0ksSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLENBQUM7SUFNTCxnQkFBQztBQUFELENBYkEsQUFhQyxJQUFBO0FBYlksOEJBQVM7QUFldEI7SUFBQTtJQUtBLENBQUM7SUFBRCxjQUFDO0FBQUQsQ0FMQSxBQUtDLElBQUE7QUFMWSwwQkFBTztBQU9wQjtJQUFBO0lBTUEsQ0FBQztJQUFELGdCQUFDO0FBQUQsQ0FOQSxBQU1DLElBQUE7QUFOWSw4QkFBUzs7OztBQzFDdEI7SUFJSSxzQkFBWSxhQUFzQjtRQUM5QixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEs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TyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO29CQUN0RCxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO29CQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN2QixDQUFDO2dCQUNELFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNGLFVBQVUsQ0FBQyxjQUFRLEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFBLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUM7SUFFTCxDQUFDO0lBQ0wsaUJBQUM7QUFBRCxDQWhEQSxBQWdEQyxJQUFBO0FBaERZLGdDQUFVIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7v2V4cG9ydCBjbGFzcyBNZWRpYSB7XHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgVXNlcklkOiBudW1iZXI7XHJcbiAgICBVc2VyTmFtZTogc3RyaW5nO1xyXG4gICAgWVRWaWRlb0lEOiBudW1iZXI7XHJcbiAgICBNUDNTb3VyY2U6IHN0cmluZztcclxuICAgIE9HR1NvdXJjZTogc3RyaW5nO1xyXG4gICAgVGl0bGU6IHN0cmluZztcclxuICAgIFRodW1iVVJMOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNeVVzZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuU3RhdGUgPSBuZXcgVXNlclN0YXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgSWQ6IG51bWJlcjtcclxuICAgIE5hbWU6IHN0cmluZztcclxuICAgIFN0YXRlOiBVc2VyU3RhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVc2VyU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuVGltZSA9IDA7XHJcbiAgICAgICAgdGhpcy5RdWV1ZVBvc2l0aW9uID0gLTE7XHJcbiAgICAgICAgdGhpcy5ZVFBsYXllclN0YXRlID0gMDtcclxuICAgICAgICB0aGlzLldhaXRpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBUaW1lOiBudW1iZXI7XHJcbiAgICBRdWV1ZVBvc2l0aW9uOiBudW1iZXI7XHJcbiAgICBZVFBsYXllclN0YXRlOiBudW1iZXI7XHJcbiAgICBXYWl0aW5nOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2Vzc2lvbiB7XHJcbiAgICBJZDogbnVtYmVyO1xyXG4gICAgTmFtZTogc3RyaW5nO1xyXG4gICAgVXNlcnM6IE15VXNlcltdO1xyXG4gICAgUXVldWU6IE1lZGlhW107XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXc01lc3NhZ2Uge1xyXG4gICAgQWN0aW9uOiBzdHJpbmc7XHJcbiAgICBTZXNzaW9uOiBTZXNzaW9uO1xyXG4gICAgTWVkaWE6IE1lZGlhO1xyXG4gICAgVXNlcjogTXlVc2VyO1xyXG4gICAgQ2hhdE1lc3NhZ2U6IHN0cmluZztcclxufSIsIu+7v2ltcG9ydCB7IE1lZGlhIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRnJhbWVCdWlsZGVyIHtcclxuXHJcbiAgICBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyKGNvbG9yOiBzdHJpbmcsIHVzZXJJZDogbnVtYmVyLCB1c2VyTmFtZTogc3RyaW5nLCB0aGlzSXNNZTogYm9vbGVhbikgOiBzdHJpbmcge1xyXG4gICAgICAgIHZhciBjdXJyZW50SFRNTCA9IFwiXCI7XHJcbiAgICAgICAgdmFyIG1lSHRtbCA9IHRoaXNJc01lID8gJ29uY2xpY2s9XCJyZXF1ZXN0U3luY1dpdGhVc2VyKCcgKyB1c2VySWQgKyAnKVwiICcgOiBcIlwiO1xyXG4gICAgICAgIHZhciBzeW5jSFRNTCA9IHRoaXNJc01lID8gJ3lvdScgOiAnc3luYyc7XHJcbiAgICAgICAgdmFyIHN5bmNIVE1MTW9iaWxlID0gdGhpc0lzTWUgPyAneW91JyA6ICdzeW5jIHdpdGggJyArIHVzZXJOYW1lO1xyXG4gICAgICAgIGlmICh0aGlzLm1vYmlsZUJyb3dzZXIpIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPSAnPGRpdiAnICsgbWVIdG1sICsgJ2NsYXNzPVwiZGl2X3VzZXJcIiBzdHlsZT1cImJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+ICcgKyBzeW5jSFRNTE1vYmlsZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0OyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyO1wiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgJyArIG1lSHRtbCArICdzdHlsZT1cImRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyBmbG9hdDogbGVmdDsgY3Vyc29yOiBwb2ludGVyOyBtYXJnaW4tcmlnaHQ6IDE2cHg7IGhlaWdodDogNDhweDsgd2lkdGg6IDQ4cHg7IGJhY2tncm91bmQ6ICcgKyBjb2xvciArICc7XCI+JyArIHN5bmNIVE1MICsgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cIm1hcmdpbi1yaWdodDogMTZweDsgZmxvYXQ6IHJpZ2h0O1wiPicgKyB1c2VyTmFtZSArICc8L3NwYW4+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRIVE1MO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtZWRpYShtZWRpYTogTWVkaWEsIHBvc2l0aW9uOiBudW1iZXIsIHJlY29tbWVuZGVkQnlNZTogYm9vbGVhbiwgb25UaGlzOiBib29sZWFuKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gXCJcIjtcclxuICAgICAgICB2YXIgY2FuRGVsZXRlVGhpcyA9IHJlY29tbWVuZGVkQnlNZTsgLy8mJiAhb25UaGlzO1xyXG4gICAgICAgIHZhciBkZWxldGVUaGlzSFRNTCA9IGNhbkRlbGV0ZVRoaXMgPyAndGl0bGU9XCJDbGljayB0byBkZWxldGUgdGhpcyBmcm9tIHRoZSBxdWV1ZSFcIiBvbmNsaWNrPVwiZGVsZXRlTWVkaWEoJyArIG1lZGlhLklkICsgJywgJyArIHBvc2l0aW9uICsgJylcIiAnIDogXCJcIjtcclxuICAgICAgICB2YXIgY2FuRGVsZXRlU3R5bGUgPSBjYW5EZWxldGVUaGlzID8gXCJjdXJzb3I6IHBvaW50ZXI7IFwiIDogXCJcIjtcclxuICAgICAgICB2YXIgb25UaGlzU3R5bGUgPSBvblRoaXMgPyBcImJvcmRlcjogMXB4IHNvbGlkIGJsdWU7IFwiIDogXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBhZGQgZGVsZXRlIFVJXHJcbiAgICAgICAgICAgIGN1cnJlbnRIVE1MID0gJzxpbWcgc3R5bGU9XCInICsgb25UaGlzU3R5bGUgKyAnZmxvYXQ6IGxlZnQ7IHdpZHRoOiAzMy4zMyU7IGhlaWdodDogMjB2dztcIiBzcmM9XCInICArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY3VycmVudEhUTUwgPVxyXG4gICAgICAgICAgICAgICAgJzxkaXYgJyArIGRlbGV0ZVRoaXNIVE1MICsgJ3N0eWxlPVwiJyArIGNhbkRlbGV0ZVN0eWxlICsgb25UaGlzU3R5bGUgKyAndGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPGltZyBzdHlsZT1cImhlaWdodDogOTBweDsgd2lkdGg6IDE2MHB4OyBtYXJnaW4tcmlnaHQ6IDE2cHg7XCIgc3JjPVwiJyArIG1lZGlhLlRodW1iVVJMICsgJ1wiLz4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDE2cHg7XCI+JyArIG1lZGlhLlRpdGxlICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3VycmVudEhUTUw7XHJcbiAgICB9XHJcbn0iLCLvu79kZWNsYXJlIHZhciBZVDogYW55O1xyXG5cclxuaW1wb3J0IHsgSVBsYXllciB9IGZyb20gXCIuL0lQbGF5ZXJcIjtcclxuaW1wb3J0IHsgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBvZGNhc3RQbGF5ZXIgaW1wbGVtZW50cyBJUGxheWVyIHtcclxuXHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGh0bWw1YXVkaW86IEhUTUxBdWRpb0VsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9iaWxlQnJvd3NlcjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMubW9iaWxlQnJvd3NlciA9IG1vYmlsZUJyb3dzZXI7XHJcbiAgICAgICAgdGhpcy5odG1sNWF1ZGlvID0gPEhUTUxBdWRpb0VsZW1lbnQ+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdodG1sNWF1ZGlvJyk7XHJcbiAgICAgICAgJChcIiNkaXZfeXRfcGxheWVyXCIpLmhpZGUoKTtcclxuICAgICAgICAkKFwiI2Rpdl9wb2RjYXN0X3BsYXllclwiKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKSB7XHJcbiAgICAgICAgLy8gVE9ETzogYWRkIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBzZXRQbGF5ZXJDb250ZW50KG1lZGlhOiBNZWRpYSwgdGltZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5odG1sNWF1ZGlvLnNyYyA9IG1lZGlhLk1QM1NvdXJjZTtcclxuICAgICAgICB0aGlzLmh0bWw1YXVkaW8uY3VycmVudFRpbWUgPSB0aW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy5odG1sNWF1ZGlvLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwYXVzZSgpIHtcclxuICAgICAgICB0aGlzLmh0bWw1YXVkaW8ucGF1c2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDdXJyZW50VGltZSA9ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5odG1sNWF1ZGlvLmN1cnJlbnRUaW1lO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEN1cnJlbnRTdGF0ZSA9ICgpID0+IHtcclxuICAgICAgICAvLyBUT0RPOiBpbXBsZW1lbnRcclxuICAgICAgICAvLyByZXR1cm4gdGhpcy5odG1sNWF1ZGlvLnN0YVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuXHJcbn0iLCLvu79pbXBvcnQgeyBNZWRpYSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBJU2VhcmNoZXIgfSBmcm9tIFwiLi9JU2VhcmNoZXJcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQb2RjYXN0U2VhcmNoZXIgaW1wbGVtZW50cyBJU2VhcmNoZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoc2VjcmV0OiBzdHJpbmcsIGFwcElkID0gbnVsbCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHNlY3JldCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2VhcmNoKHF1ZXJ5OiBzdHJpbmcsIGNhbGxiYWNrOiAobWVkaWE6IE1lZGlhW10pID0+IHZvaWQpIHtcclxuICAgICAgICB2YXIgbWVkaWFzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIG1lZGlhID0gbmV3IE1lZGlhKCk7XHJcbiAgICAgICAgICAgIG1lZGlhLk1QM1NvdXJjZSA9IFwiaHR0cHM6Ly9yc3MuYXJ0MTkuY29tL2VwaXNvZGVzL2EwNWIxMjlkLTUyZTgtNGJhYS04NDQ2LWU5N2RiNjJhMmJiYi5tcDNcIjtcclxuICAgICAgICAgICAgbWVkaWEuVGl0bGUgPSBcIlBvZCBTYXZlIEFtZXJpY2FcIjtcclxuICAgICAgICAgICAgbWVkaWEuVGh1bWJVUkwgPSBcImh0dHBzOi8vZGZrZmo4ajI3Nnd3di5jbG91ZGZyb250Lm5ldC9pbWFnZXMvMGQvMjgvMzMvODEvMGQyODMzODEtNzI0Yy00Y2FhLWFiYWQtYjQ3MGU5NTBkNzJkLzlmZThkNjJhMDUyYzA1YWYwMjZjY2NiYzg2Y2UxMDczZTA0ZjM2M2ZjYzdjNWZkYTZjZTdiNDBjNWFjMjNmYWQwYmM4NTk1NjMyNDAyYjYwNWUwNjgzZTQwYTY3MjZmOGNkMjVhOWVlODhjYTM4YTNiMWFjMzNiMTA4YTdjNWMyLmpwZWdcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCLvu79pbXBvcnQgeyBNeVVzZXIsIE1lZGlhLCBTZXNzaW9uLCBVc2VyU3RhdGUsIFdzTWVzc2FnZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5pbXBvcnQgeyBVSUNhbGxiYWNrcywgVUkgfSBmcm9tIFwiLi9VSVwiO1xyXG5pbXBvcnQgeyBNeVNvY2tldCwgQ2xpZW50QWN0aW9ucyB9IGZyb20gXCIuL1NvY2tldHNcIjtcclxuaW1wb3J0IHsgSVBsYXllciB9IGZyb20gXCIuL0lQbGF5ZXJcIjtcclxuaW1wb3J0IHsgUG9kY2FzdFBsYXllciB9IGZyb20gXCIuL1BvZGNhc3RQbGF5ZXJcIjtcclxuaW1wb3J0IHsgWXRQbGF5ZXIgfSBmcm9tIFwiLi9ZdFBsYXllclwiO1xyXG5pbXBvcnQgeyBJU2VhcmNoZXIgfSBmcm9tIFwiLi9JU2VhcmNoZXJcIjtcclxuaW1wb3J0IHsgWXRTZWFyY2hlciB9IGZyb20gXCIuL1l0U2VhcmNoZXJcIjtcclxuaW1wb3J0IHsgUG9kY2FzdFNlYXJjaGVyIH0gZnJvbSBcIi4vUG9kY2FzdFNlYXJjaGVyXCI7XHJcblxyXG5jbGFzcyBSb29tTWFuYWdlciBpbXBsZW1lbnRzIFVJQ2FsbGJhY2tzLCBDbGllbnRBY3Rpb25zIHtcclxuXHJcbiAgICB1c2VyOiBNeVVzZXI7XHJcbiAgICBzZXNzaW9uOiBTZXNzaW9uO1xyXG4gICAgc2VhcmNoZXI6IElTZWFyY2hlcjtcclxuICAgIHBsYXllcjogSVBsYXllcjsgXHJcbiAgICBzb2NrZXQ6IE15U29ja2V0O1xyXG4gICAgdWk6IFVJO1xyXG5cclxuICAgIHBsYXllclR5cGU6IHN0cmluZztcclxuICAgIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyVHlwZTogc3RyaW5nLCBtb2JpbGVCcm93c2VyOiBib29sZWFuKSB7XHJcbiAgICAgICAgLy8gVE9ETzogZmluZCBhIGJldHRlciB3YXkgdG8gZXhwb3NlIHRoZXNlIGZ1bmN0aW9ucyB0byBodG1sP1xyXG4gICAgICAgICg8YW55PndpbmRvdykucXVldWVTZWxlY3RlZFZpZGVvID0gdGhpcy5xdWV1ZVNlbGVjdGVkVmlkZW87XHJcbiAgICAgICAgKDxhbnk+d2luZG93KS5yZXF1ZXN0U3luY1dpdGhVc2VyID0gdGhpcy5yZXF1ZXN0U3luY1dpdGhVc2VyO1xyXG4gICAgICAgICg8YW55PndpbmRvdykuZGVsZXRlTWVkaWEgPSB0aGlzLmRlbGV0ZU1lZGlhO1xyXG4gICAgICAgIHRoaXMucGxheWVyVHlwZSA9IHBsYXllclR5cGU7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLnVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uID0gbmV3IFNlc3Npb24oKTtcclxuICAgICAgICBpZiAodGhpcy5wbGF5ZXJUeXBlID09IFwicG9kY2FzdHNcIikge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllciA9IG5ldyBQb2RjYXN0UGxheWVyKHRoaXMubW9iaWxlQnJvd3Nlcik7XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoZXIgPSBuZXcgUG9kY2FzdFNlYXJjaGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBnZXQgcmlkIG9mIHRoaXMga2V5XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoZXIgPSBuZXcgWXRTZWFyY2hlcignQUl6YVN5QzRBLWRzR2staGFfYi1lRHBieGFWUXQ1YlI3Y09VZGRjJyk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyID0gbmV3IFl0UGxheWVyKHRoaXMubW9iaWxlQnJvd3Nlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudWkgPSBuZXcgVUkodGhpcy5tb2JpbGVCcm93c2VyLCB0aGlzKTtcclxuICAgICAgICB0aGlzLnNvY2tldCA9IG5ldyBNeVNvY2tldCh0aGlzKTtcclxuICAgICAgICB0aGlzLnNldHVwSmFtU2Vzc2lvbigpO1xyXG4gICAgICAgIHRoaXMucGxheWVyLmluaXRQbGF5ZXIodGhpcy5vblBsYXllclN0YXRlQ2hhbmdlKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc2V0dXBKYW1TZXNzaW9uKCkge1xyXG4gICAgICAgIHZhciBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgICB2YXIgZW5jb2RlZFNlc3Npb25OYW1lID0gcGF0aG5hbWUucmVwbGFjZSgnXFwvcm9vbXMvJywgJycpO1xyXG5cclxuICAgICAgICB0aGlzLnNlc3Npb24uTmFtZSA9IGRlY29kZVVSSShlbmNvZGVkU2Vzc2lvbk5hbWUpO1xyXG4gICAgICAgIHRoaXMudXNlci5OYW1lID0gJ0Fub255bW91cyc7XHJcblxyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ1VzZXJKb2luU2Vzc2lvbic7XHJcbiAgICAgICAgbWVzc2FnZS5Vc2VyID0gdGhpcy51c2VyO1xyXG4gICAgICAgIG1lc3NhZ2UuU2Vzc2lvbiA9IHRoaXMuc2Vzc2lvbjtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gV2ViU29ja2V0IG1lc3NhZ2UgcmVzcG9uc2UgZnVuY3Rpb25zXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIGNsaWVudFByb3ZpZGVVc2VyU3RhdGUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIHVzZXJUb1N5bmNXaXRoID0gbWVzc2FnZS5Vc2VyO1xyXG5cclxuICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IHVzZXJUb1N5bmNXaXRoLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy51c2VyLlN0YXRlLlRpbWUgPSB1c2VyVG9TeW5jV2l0aC5TdGF0ZS5UaW1lO1xyXG4gICAgICAgIHRoaXMudXNlci5TdGF0ZS5ZVFBsYXllclN0YXRlID0gdXNlclRvU3luY1dpdGguU3RhdGUuWVRQbGF5ZXJTdGF0ZTtcclxuXHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVRdWV1ZSh0aGlzLnNlc3Npb24uUXVldWUsIHRoaXMudXNlci5JZCwgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG5cclxuICAgICAgICB2YXIgY3VycmVudE1lZGlhID0gdGhpcy5zZXNzaW9uLlF1ZXVlW3RoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uXTtcclxuXHJcbiAgICAgICAgdGhpcy51c2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRSZXF1ZXN0VXNlclN0YXRlKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIHZhciB1c2VyRGF0YSA9IG5ldyBNeVVzZXIoKTtcclxuICAgICAgICB1c2VyRGF0YS5JZCA9IG1lc3NhZ2UuVXNlci5JZDsgLy8gVE9ETzogYmFkIGJhZCBiYWRcclxuICAgICAgICB1c2VyRGF0YS5TdGF0ZS5RdWV1ZVBvc2l0aW9uID0gdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb247XHJcbiAgICAgICAgdXNlckRhdGEuU3RhdGUuVGltZSA9IE1hdGgucm91bmQodGhpcy5wbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSk7XHJcbiAgICAgICAgdXNlckRhdGEuU3RhdGUuWVRQbGF5ZXJTdGF0ZSA9IHRoaXMucGxheWVyLmdldEN1cnJlbnRTdGF0ZSgpO1xyXG5cclxuICAgICAgICB2YXIgb3V0Z29pbmdNc2cgPSBuZXcgV3NNZXNzYWdlKCk7XHJcbiAgICAgICAgb3V0Z29pbmdNc2cuQWN0aW9uID0gJ1Byb3ZpZGVTeW5jVG9Vc2VyJztcclxuICAgICAgICBvdXRnb2luZ01zZy5Vc2VyID0gdXNlckRhdGE7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChvdXRnb2luZ01zZyk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGNsaWVudFVwZGF0ZVVzZXIobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIHVzZXIgPSBtZXNzYWdlLlVzZXI7XHJcbiAgICAgICAgdGhpcy51c2VyID0gdXNlcjtcdFxyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFNlc3Npb25SZWFkeShtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB0aGlzLnNlc3Npb24gPSBtZXNzYWdlLlNlc3Npb247XHJcbiAgICAgICAgdGhpcy51c2VyID0gbWVzc2FnZS5Vc2VyO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBnZXQgcmlkIG9mIHRoaXMgYnVsbHNoaXRcclxuICAgICAgICBpZiAodGhpcy5zZXNzaW9uLlF1ZXVlLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICQoXCIjcF9jdXJyZW50X2NvbnRlbnRfaW5mb1wiKS50ZXh0KFwiUXVldWUgdXAgYSBzb25nIVwiKTtcclxuICAgICAgICAgICAgJChcIiNwX2N1cnJlbnRfcmVjb21tZW5kZXJfaW5mb1wiKS50ZXh0KFwiVXNlIHRoZSBzZWFyY2ggYmFyIGFib3ZlLlwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubmV4dE1lZGlhKCk7XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVRdWV1ZSh0aGlzLnNlc3Npb24uUXVldWUsIHRoaXMudXNlci5JZCwgdGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24pO1xyXG4gICAgICAgIHRoaXMudWkudXBkYXRlVXNlcnNMaXN0KHRoaXMuc2Vzc2lvbi5Vc2VycywgdGhpcy51c2VyLklkKTtcclxuICAgICAgICB0aGlzLnVpLnNlc3Npb25SZWFkeSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFVwZGF0ZVVzZXJzTGlzdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgdXNlcnMgPSBtZXNzYWdlLlNlc3Npb24uVXNlcnM7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uLlVzZXJzID0gdXNlcnM7XHJcbiAgICAgICAgdGhpcy51aS51cGRhdGVVc2Vyc0xpc3QodGhpcy5zZXNzaW9uLlVzZXJzLCB0aGlzLnVzZXIuSWQpO1x0XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50VXBkYXRlUXVldWUobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdGhpcy5zZXNzaW9uLlF1ZXVlID0gbWVzc2FnZS5TZXNzaW9uLlF1ZXVlO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZXIuU3RhdGUuV2FpdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLm5leHRNZWRpYSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVF1ZXVlKHRoaXMuc2Vzc2lvbi5RdWV1ZSwgdGhpcy51c2VyLklkLCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpZW50Q2hhdE1lc3NhZ2UobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIGNoYXRNZXNzYWdlID0gbWVzc2FnZS5DaGF0TWVzc2FnZTtcclxuICAgICAgICB2YXIgdXNlck5hbWUgPSBtZXNzYWdlLlVzZXIuTmFtZTtcclxuICAgICAgICB0aGlzLnVpLm9uQ2hhdE1lc3NhZ2UodXNlck5hbWUsIGNoYXRNZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGllbnRTZXR1cEF1ZGlvQVBJKG1lc3NhZ2U6IFdzTWVzc2FnZSkge1xyXG4gICAgICAgIC8vIFRPRE86IGJldHRlciBtZWNoYW5pc20gZm9yIGRpZmZlcmVudCBwbGF5ZXJzXHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSA9PSBcInBvZGNhc3RzXCIpIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogYmV0dGVyIG1lc3NhZ2Ugc3RydWN0dXJlXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGVuc3VyZSB0aGlzIGlzbid0IGF3ZnVsbHkgaW5zZWN1cmVcclxuICAgICAgICAgICAgdmFyIGlkID0gbWVzc2FnZS5Vc2VyLk5hbWU7XHJcbiAgICAgICAgICAgIHZhciBzZWNyZXQgPSBtZXNzYWdlLk1lZGlhLlRpdGxlO1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaGVyLmluaXQoc2VjcmV0LCBpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsaWVudFNldHVwWVRBUEkobWVzc2FnZTogV3NNZXNzYWdlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVyVHlwZSAhPSBcInBvZGNhc3RzXCIpIHtcclxuICAgICAgICAgICAgdmFyIHNlY3JldCA9IG1lc3NhZ2UuTWVkaWEuVGl0bGU7XHJcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoZXIuaW5pdChzZWNyZXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL1xyXG4gICAgLy8gTW9zdGx5IFVJIGNhbGxiYWNrIGZ1bmN0aW9uc1xyXG4gICAgLy9cclxuXHJcbiAgICBvblNlbmRDaGF0TWVzc2FnZShtc2c6IHN0cmluZykge1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0NoYXRNZXNzYWdlJztcclxuICAgICAgICBtZXNzYWdlLkNoYXRNZXNzYWdlID0gbXNnO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHRoaXMudXNlcjtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uUGxheWVyU3RhdGVDaGFuZ2UoZXZlbnQpIHtcclxuICAgICAgICBpZihldmVudC5kYXRhPT0wKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dE1lZGlhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNlYXJjaChxdWVyeSwgY2FsbGJhY2s6IChtZWRpYTogTWVkaWFbXSkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMuc2VhcmNoZXIuc2VhcmNoKHF1ZXJ5LCBjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgbmFtZUNoYW5nZShuZXdOYW1lKSB7XHJcbiAgICAgICAgdGhpcy51c2VyLk5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuVXNlciA9IHRoaXMudXNlcjtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdTYXZlVXNlck5hbWVDaGFuZ2UnO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXNlclN0YXRlQ2hhbmdlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA+PSAwICYmIHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIDwgdGhpcy5zZXNzaW9uLlF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllci5zZXRQbGF5ZXJDb250ZW50KHRoaXMuc2Vzc2lvbi5RdWV1ZVt0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbl0sIHRoaXMudXNlci5TdGF0ZS5UaW1lKTsgXHJcbiAgICAgICAgICAgIHRoaXMudXNlci5TdGF0ZS5XYWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIDwgMCB8fCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9PSB0aGlzLnNlc3Npb24uUXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHNldCBwbGF5ZXIgY29udGVudCB0byAnd2FpdGluZyBvbiBuZXh0IHZpZGVvJ1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuV2FpdGluZyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID09IHRoaXMuc2Vzc2lvbi5RdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dE1lZGlhKCkge1xyXG4gICAgICAgIHRoaXMudXNlci5TdGF0ZS5UaW1lID0gMDtcclxuICAgICAgICB2YXIgcXVldWUgPSB0aGlzLnNlc3Npb24uUXVldWU7XHJcblxyXG4gICAgICAgIGlmKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMSA8IHF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy51c2VyLlN0YXRlLlF1ZXVlUG9zaXRpb24gPj0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IHF1ZXVlLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXNlclN0YXRlQ2hhbmdlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcGF1c2VNZWRpYSgpIHtcclxuICAgICAgICB0aGlzLnBsYXllci5wYXVzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXlNZWRpYSgpIHtcclxuICAgICAgICB0aGlzLnBsYXllci5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJldmlvdXNNZWRpYSgpIHtcclxuICAgICAgICB0aGlzLnVzZXIuU3RhdGUuVGltZSA9IDA7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gdGhpcy5zZXNzaW9uLlF1ZXVlO1xyXG4gICAgICAgIGlmKHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA9IHRoaXMudXNlci5TdGF0ZS5RdWV1ZVBvc2l0aW9uIC0gMTtcclxuICAgICAgICAgICAgdGhpcy51c2VyU3RhdGVDaGFuZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBUaGVzZSBmdW5jdGlvbnMgYXJlIGNhbGxlZCBkaXJlY3RseSBlbWJlZGRlZCBpbnRvIHRoZSBodG1sLi4uIGtpbmRhIHdlaXJkXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIHJlcXVlc3RTeW5jV2l0aFVzZXIgPSAodXNlcklkKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3JlcXVlc3Qgc3luYyB3aXRoIHVzZXInKTtcclxuXHJcbiAgICAgICAgdmFyIHVzZXIgPSBuZXcgTXlVc2VyKCk7XHJcbiAgICAgICAgdXNlci5JZCA9IHVzZXJJZDtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IG5ldyBXc01lc3NhZ2UoKTtcclxuICAgICAgICBtZXNzYWdlLkFjdGlvbiA9ICdSZXF1ZXN0U3luY1dpdGhVc2VyJztcclxuICAgICAgICBtZXNzYWdlLlVzZXIgPSB1c2VyO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcXVldWVTZWxlY3RlZFZpZGVvID0gKGVsbW50KSA9PiB7XHJcblxyXG4gICAgICAgICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpLmZhZGVPdXQoKTtcclxuICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoXCJcIik7XHJcbiAgICAgICAgdmFyIHZpZGVvSWQgPSBlbG1udC5nZXRBdHRyaWJ1dGUoJ2RhdGEtVmlkZW9JZCcpO1xyXG4gICAgICAgIHZhciB0aXRsZSA9IGVsbW50LmlubmVyVGV4dCB8fCBlbG1udC50ZXh0Q29udGVudDtcclxuICAgICAgICB2YXIgdGh1bWJVUkwgPSBlbG1udC5nZXRBdHRyaWJ1dGUoJ2RhdGEtVGh1bWJVUkwnKTtcclxuICAgICAgICB2YXIgbXAzU291cmNlID0gZWxtbnQuZ2V0QXR0cmlidXRlKCdkYXRhLU1QM1NvdXJjZScpO1xyXG4gICAgICAgIHZhciBvZ2dTb3VyY2UgPSBlbG1udC5nZXRBdHRyaWJ1dGUoJ2RhdGEtT0dHU291cmNlJyk7XHJcblxyXG4gICAgICAgIHZhciBtZWRpYSA9IG5ldyBNZWRpYSgpO1xyXG4gICAgICAgIG1lZGlhLllUVmlkZW9JRCA9IHZpZGVvSWQ7XHJcbiAgICAgICAgbWVkaWEuVGl0bGUgPSB0aXRsZTtcclxuICAgICAgICBtZWRpYS5UaHVtYlVSTCA9IHRodW1iVVJMO1xyXG4gICAgICAgIG1lZGlhLk1QM1NvdXJjZSA9IG1wM1NvdXJjZTtcclxuICAgICAgICBtZWRpYS5PR0dTb3VyY2UgPSBvZ2dTb3VyY2U7XHJcbiAgICAgICAgbWVkaWEuVXNlcklkID0gdGhpcy51c2VyLklkO1xyXG4gICAgICAgIG1lZGlhLlVzZXJOYW1lID0gdGhpcy51c2VyLk5hbWU7XHJcblxyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0FkZE1lZGlhVG9TZXNzaW9uJztcclxuICAgICAgICBtZXNzYWdlLk1lZGlhID0gbWVkaWE7XHJcblxyXG4gICAgICAgIC8vVE9ETzogbG9jYWwgYWRkIG1lZGlhXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdChtZXNzYWdlKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZGVsZXRlTWVkaWEgPSAobWVkaWFJZDogbnVtYmVyLCBwb3NpdGlvbjogbnVtYmVyKSA9PiB7XHJcblxyXG4gICAgICAgIHRoaXMuc2Vzc2lvbi5RdWV1ZS5zcGxpY2UocG9zaXRpb24sIDEpO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiA+PSBwb3NpdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbiAtPSAxO1xyXG4gICAgICAgICAgICB0aGlzLnVzZXJTdGF0ZUNoYW5nZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVpLnVwZGF0ZVF1ZXVlKHRoaXMuc2Vzc2lvbi5RdWV1ZSwgdGhpcy51c2VyLklkLCB0aGlzLnVzZXIuU3RhdGUuUXVldWVQb3NpdGlvbik7XHJcblxyXG4gICAgICAgIHZhciBtZWRpYVRvRGVsZXRlID0gbmV3IE1lZGlhKCk7XHJcbiAgICAgICAgbWVkaWFUb0RlbGV0ZS5JZCA9IG1lZGlhSWQ7XHJcblxyXG4gICAgICAgIHZhciBtZXNzYWdlID0gbmV3IFdzTWVzc2FnZSgpO1xyXG4gICAgICAgIG1lc3NhZ2UuQWN0aW9uID0gJ0RlbGV0ZU1lZGlhRnJvbVNlc3Npb24nO1xyXG4gICAgICAgIG1lc3NhZ2UuTWVkaWEgPSBtZWRpYVRvRGVsZXRlO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuXHJcbn1cclxuXHJcbmRlY2xhcmUgdmFyIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbmRlY2xhcmUgdmFyIHBsYXllclR5cGU6IHN0cmluZztcclxuXHJcbnZhciBtUm9vbU1hbmFnZXIgPSBuZXcgUm9vbU1hbmFnZXIocGxheWVyVHlwZSwgbW9iaWxlQnJvd3Nlcik7XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICBtUm9vbU1hbmFnZXIuaW5pdCgpO1xyXG59KTtcclxuXHJcblxyXG4iLCLvu79pbXBvcnQgeyBXc01lc3NhZ2UgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50QWN0aW9ucyB7XHJcblxyXG4gICAgY2xpZW50VXBkYXRlVXNlcjogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFNlc3Npb25SZWFkeTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFVwZGF0ZVVzZXJzTGlzdDogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFVwZGF0ZVF1ZXVlOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50Q2hhdE1lc3NhZ2U6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRSZXF1ZXN0VXNlclN0YXRlOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG4gICAgY2xpZW50UHJvdmlkZVVzZXJTdGF0ZTogKG1lc3NhZ2U6IFdzTWVzc2FnZSkgPT4gdm9pZDtcclxuICAgIGNsaWVudFNldHVwWVRBUEk6IChtZXNzYWdlOiBXc01lc3NhZ2UpID0+IHZvaWQ7XHJcbiAgICBjbGllbnRTZXR1cEF1ZGlvQVBJOiAobWVzc2FnZTogV3NNZXNzYWdlKSA9PiB2b2lkO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTXlTb2NrZXQge1xyXG5cclxuICAgIHByaXZhdGUgc29ja2V0OiBXZWJTb2NrZXQ7XHJcbiAgICBwcml2YXRlIGNsaWVudEFjdGlvbnM6IENsaWVudEFjdGlvbnM7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY2xpZW50QWN0aW9uczogQ2xpZW50QWN0aW9ucykge1xyXG5cclxuICAgICAgICB0aGlzLmNsaWVudEFjdGlvbnMgPSBjbGllbnRBY3Rpb25zO1xyXG5cclxuICAgICAgICB2YXIgdXJpID0gXCJ3czovL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyBcIi93c1wiO1xyXG4gICAgICAgIHZhciBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVyaSk7XHJcbiAgICAgICAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uIChldmVudCkge307XHJcbiAgICAgICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoZXZlbnQpIHt9O1xyXG5cclxuICAgICAgICBzb2NrZXQub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcclxuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IG1lc3NhZ2UuQWN0aW9uO1xyXG4gICAgICAgICAgICBpZiAoY2xpZW50QWN0aW9uc1thY3Rpb25dKSB7XHJcbiAgICAgICAgICAgICAgICBjbGllbnRBY3Rpb25zW2FjdGlvbl0obWVzc2FnZSk7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZXhjZXB0aW9uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBoYW5kbGVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZW1pdChtZXNzYWdlOiBXc01lc3NhZ2UpIHtcclxuICAgICAgICBpZiAodGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gdGhpcy5zb2NrZXQuQ09OTkVDVElORykge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSwgNTApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xyXG4gICAgfTtcclxuXHJcbn1cclxuIiwi77u/aW1wb3J0IHsgRnJhbWVCdWlsZGVyIH0gZnJvbSBcIi4vRnJhbWVCdWlsZGVyXCI7XHJcbmltcG9ydCB7IE1lZGlhIH0gZnJvbSBcIi4vQ29udHJhY3RzXCI7XHJcblxyXG5kZWNsYXJlIHZhciBTcGlubmVyOiBhbnk7XHJcblxyXG4vLyBUT0RPOiBtYWtlIHRoaXMgYW4gaW50ZXJmYWNlXHJcbmV4cG9ydCBpbnRlcmZhY2UgVUlDYWxsYmFja3Mge1xyXG4gICAgcHJldmlvdXNNZWRpYTogYW55O1xyXG4gICAgbmV4dE1lZGlhOiBhbnk7XHJcbiAgICBwbGF5TWVkaWE6IGFueTtcclxuICAgIHBhdXNlTWVkaWE6IGFueTtcclxuICAgIG9uU2VuZENoYXRNZXNzYWdlOiBhbnk7XHJcbiAgICBzZWFyY2g6IGFueTtcclxuICAgIG5hbWVDaGFuZ2U6IGFueTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFVJIHtcclxuXHJcbiAgICBwcml2YXRlIGNvbG9yczogYW55O1xyXG4gICAgcHJpdmF0ZSBzcGlubmVyOiBhbnk7XHJcbiAgICBwcml2YXRlIGNhbGxiYWNrczogVUlDYWxsYmFja3M7XHJcbiAgICBwcml2YXRlIG1vYmlsZUJyb3dzZXI6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGZyYW1lQnVpbGRlcjogRnJhbWVCdWlsZGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4sIGNhbGxiYWNrczogVUlDYWxsYmFja3MpIHtcclxuICAgICAgICB0aGlzLmNvbG9ycyA9IFsncmVkJywgJ29yYW5nZScsICd5ZWxsb3cnLCAnZ3JlZW4nLCAnYmx1ZScsICd2aW9sZXQnXTtcclxuICAgICAgICB0aGlzLm1vYmlsZUJyb3dzZXIgPSBtb2JpbGVCcm93c2VyO1xyXG4gICAgICAgIHRoaXMuZnJhbWVCdWlsZGVyID0gbmV3IEZyYW1lQnVpbGRlcihtb2JpbGVCcm93c2VyKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IGNhbGxiYWNrcztcclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGluaXRpYWxpemUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR1cFNwaW5uZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbmZvUm9sbG92ZXJVSSgpO1xyXG4gICAgICAgIHRoaXMuc2V0dXBJbnB1dFVJKCk7XHJcbiAgICAgICAgdGhpcy5zZXR1cFBsYXllckNvbnRyb2xCdXR0b25zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNlc3Npb25SZWFkeSA9ICgpID0+IHtcclxuICAgICAgICAkKFwiI2Rpdl9sb2FkaW5nXCIpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xyXG4gICAgICAgICQoXCIjZGl2X2V2ZXJ5dGhpbmdcIikuYW5pbWF0ZSh7b3BhY2l0eTogMX0sICdmYXN0Jyk7XHJcbiAgICB9IFxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBTcGlubmVyVUkoKSB7XHJcbiAgICAgICAgdmFyIG9wdHMgPSB7XHJcbiAgICAgICAgICAgIGxpbmVzOiAxMyAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcclxuICAgICAgICAgICAgLCBsZW5ndGg6IDI4IC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXHJcbiAgICAgICAgICAgICwgd2lkdGg6IDE0IC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xyXG4gICAgICAgICAgICAsIHJhZGl1czogNDIgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXHJcbiAgICAgICAgICAgICwgc2NhbGU6IDEgLy8gU2NhbGVzIG92ZXJhbGwgc2l6ZSBvZiB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIGNvcm5lcnM6IDEgLy8gQ29ybmVyIHJvdW5kbmVzcyAoMC4uMSlcclxuICAgICAgICAgICAgLCBjb2xvcjogJyMwMDAnIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcclxuICAgICAgICAgICAgLCBvcGFjaXR5OiAwLjI1IC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXHJcbiAgICAgICAgICAgICwgcm90YXRlOiAwIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcclxuICAgICAgICAgICAgLCBkaXJlY3Rpb246IDEgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxyXG4gICAgICAgICAgICAsIHNwZWVkOiAxIC8vIFJvdW5kcyBwZXIgc2Vjb25kXHJcbiAgICAgICAgICAgICwgdHJhaWw6IDYwIC8vIEFmdGVyZ2xvdyBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICwgZnBzOiAyMCAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKSBhcyBhIGZhbGxiYWNrIGZvciBDU1NcclxuICAgICAgICAgICAgLCB6SW5kZXg6IDJlOSAvLyBUaGUgei1pbmRleCAoZGVmYXVsdHMgdG8gMjAwMDAwMDAwMClcclxuICAgICAgICAgICAgLCBjbGFzc05hbWU6ICdzcGlubmVyJyAvLyBUaGUgQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgc3Bpbm5lclxyXG4gICAgICAgICAgICAsIHRvcDogJzUwJScgLy8gVG9wIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxyXG4gICAgICAgICAgICAsIGxlZnQ6ICc1MCUnIC8vIExlZnQgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XHJcbiAgICAgICAgICAgICwgc2hhZG93OiBmYWxzZSAvLyBXaGV0aGVyIHRvIHJlbmRlciBhIHNoYWRvd1xyXG4gICAgICAgICAgICAsIGh3YWNjZWw6IGZhbHNlIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxyXG4gICAgICAgICAgICAsIHBvc2l0aW9uOiAnYWJzb2x1dGUnIC8vIEVsZW1lbnQgcG9zaXRpb25pbmdcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZfbG9hZGluZycpO1xyXG4gICAgICAgIHRoaXMuc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4odGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwRmFkZVVJKG92ZXJhbGwsIHJlc3VsdHMpIHtcclxuICAgICAgICBvdmVyYWxsLm1vdXNlZW50ZXIoKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVJbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb3ZlcmFsbC5tb3VzZWxlYXZlKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmlzKCc6dmlzaWJsZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZhZGVPdXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0dXBJbmZvUm9sbG92ZXJVSSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X3VzZXJzX292ZXJhbGxcIiksICQoXCIjZGl2X3VzZXJfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfcXVldWVfb3ZlcmFsbFwiKSwgJChcIiNkaXZfcXVldWVfcmVzdWx0c1wiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dXBGYWRlVUkoJChcIiNkaXZfY2hhdF9vdmVyYWxsXCIpLCAkKFwiI2Rpdl9jaGF0X3Jlc3VsdHNcIikpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHVwRmFkZVVJKCQoXCIjZGl2X2NjX292ZXJhbGxcIiksICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlYXJjaFRleHRDaGFuZ2VkKHRleHQpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGlmKHRleHQubGVuZ3RoPT0wKSB7XHJcbiAgICAgICAgICAgIGRpdlJlc3VsdHMuZmFkZU91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwSW5wdXRVSSgpIHtcclxuICAgICAgICB2YXIgaW5wdXRTZWFyY2ggPSAkKFwiI2lucHV0X3NlYXJjaFwiKTtcclxuICAgICAgICBpbnB1dFNlYXJjaC5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hFbnRlclByZXNzZWQoaW5wdXRTZWFyY2gpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGlucHV0X25hbWUgPSAkKFwiI2lucHV0X25hbWVcIik7XHJcbiAgICAgICAgaW5wdXRfbmFtZS5rZXlwcmVzcygoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyTmFtZUNoYW5nZShpbnB1dF9uYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghdGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnB1dF9jaGF0ID0gJChcIiNpbnB1dF9jaGF0XCIpO1xyXG4gICAgICAgICAgICBpbnB1dF9jaGF0LmtleXByZXNzKChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLm9uU2VuZENoYXRNZXNzYWdlKGlucHV0X2NoYXQudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0X2NoYXQudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgJChcIiNkaXZfc2VhcmNoX3Jlc3VsdHNcIikuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAkKFwiI2lucHV0X3NlYXJjaFwiKS52YWwoXCJcIik7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuYmluZChcInByb3BlcnR5Y2hhbmdlIGlucHV0IHBhc3RlXCIsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaFRleHRDaGFuZ2VkKCQoXCIjaW5wdXRfc2VhcmNoXCIpLnZhbCgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldHVwUGxheWVyQ29udHJvbEJ1dHRvbnMoKSB7XHJcbiAgICAgICAgJChcIiNidG5fcHJldmlvdXNcIikuY2xpY2sodGhpcy5jYWxsYmFja3MucHJldmlvdXNNZWRpYSk7XHJcbiAgICAgICAgJChcIiNidG5fcGF1c2VcIikuY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BsYXlcIikuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5wYXVzZU1lZGlhKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChcIiNidG5fcGxheVwiKS5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICQoXCIjYnRuX3BsYXlcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiI2J0bl9wYXVzZVwiKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnBsYXlNZWRpYSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoXCIjYnRuX25leHRcIikuY2xpY2sodGhpcy5jYWxsYmFja3MubmV4dE1lZGlhKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlYXJjaEVudGVyUHJlc3NlZChpbnB1dF9zZWFyY2gpIHtcclxuICAgICAgICB2YXIgZGl2UmVzdWx0cyA9ICQoXCIjZGl2X3NlYXJjaF9yZXN1bHRzXCIpO1xyXG4gICAgICAgIGRpdlJlc3VsdHMuaHRtbChcIlwiKTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5zZWFyY2goaW5wdXRfc2VhcmNoLnZhbCgpLCAocmVzdWx0czogTWVkaWFbXSkgPT4ge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBtZWRpYSA9IHJlc3VsdHNbaV07XHJcbiAgICAgICAgICAgICAgICBkaXZSZXN1bHRzLmh0bWwoZGl2UmVzdWx0cy5odG1sKCkgKyBcIjxkaXYgY2xhc3M9J2Rpdl9zZWFyY2hfcmVzdWx0JyBvbkNsaWNrPSdxdWV1ZVNlbGVjdGVkVmlkZW8odGhpcyknIGRhdGEtVmlkZW9JZD0nXCIgKyBtZWRpYS5ZVFZpZGVvSUQgKyBcIicgZGF0YS1UaHVtYlVSTD0nXCIgKyBtZWRpYS5UaHVtYlVSTCArIFwiJz5cIiArICc8cCBjbGFzcz1cInRleHRfc2VhcmNoX3Jlc3VsdFwiPicgKyBtZWRpYS5UaXRsZSArICc8L3A+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5wdXRfc2VhcmNoLmJsdXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZighZGl2UmVzdWx0cy5pcygnOnZpc2libGUnKSkge1xyXG4gICAgICAgICAgICBkaXZSZXN1bHRzLmZhZGVJbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlUXVldWUocXVldWU6IE1lZGlhW10sIHVzZXJJZE1lOiBudW1iZXIsIHF1ZXVlUG9zaXRpb246IG51bWJlcikge1xyXG4gICAgICAgIHZhciBsZW5ndGggPSBxdWV1ZS5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHN1bW1hcnkgPSBsZW5ndGggKyBcIiB0aGluZ3MgaW4gdGhlIHBsYXlsaXN0XCI7XHJcbiAgICAgICAgaWYgKGxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSBsZW5ndGggKyBcIiB0aGluZyBpbiB0aGUgcGxheWxpc3RcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobGVuZ3RoIDw9IDApIHtcclxuICAgICAgICAgICAgc3VtbWFyeSA9IFwiTm90aGluZyBpbiB0aGUgcGxheWxpc3QuIFF1ZXVlIHNvbWV0aGluZyFcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJChcIiNwX3F1ZXVlX3N1bW1hcnlcIikudGV4dChzdW1tYXJ5KTtcclxuXHJcbiAgICAgICAgdmFyIHF1ZXVlUmVzdWx0cyA9ICQoXCIjZGl2X3F1ZXVlX3Jlc3VsdHNcIik7XHJcbiAgICAgICAgdmFyIGh0bWwgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBtZWRpYSA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgICB2YXIgb25UaGlzID0gaSA9PT0gcXVldWVQb3NpdGlvbjtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnRIVE1MID0gdGhpcy5mcmFtZUJ1aWxkZXIubWVkaWEobWVkaWEsIGksIG1lZGlhLlVzZXJJZCA9PT0gdXNlcklkTWUsIG9uVGhpcyk7XHJcbiAgICAgICAgICAgIGh0bWwucHVzaChjdXJyZW50SFRNTCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBxdWV1ZVJlc3VsdHMuaHRtbChodG1sLmpvaW4oXCJcIikpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlVXNlcnNMaXN0KHVzZXJzLCB1c2VySWRNZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdmFyIG51bSA9IHVzZXJzLmxlbmd0aDtcclxuICAgICAgICB2YXIgc3VtbWFyeSA9IHVzZXJzLmxlbmd0aCArIFwiIHVzZXJzIGluIHRoZSByb29tXCI7XHJcbiAgICAgICAgaWYgKG51bSA9PSAxKSB7XHJcbiAgICAgICAgICAgIHN1bW1hcnkgPSB1c2Vycy5sZW5ndGggKyBcIiB1c2VyIGluIHRoZSByb29tXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoXCIjcF91c2Vyc19zdW1tYXJ5XCIpLnRleHQoc3VtbWFyeSk7XHJcbiAgICAgICAgdmFyIHVzZXJSZXN1bHRzID0gJChcIiNkaXZfdXNlcl9yZXN1bHRzXCIpO1xyXG4gICAgICAgIHZhciBodG1sID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdXNlciA9IHVzZXJzW2ldO1xyXG4gICAgICAgICAgICB2YXIgdGhpc0lzTWUgPSAodXNlci5JZCA9PT0gdXNlcklkTWUpO1xyXG4gICAgICAgICAgICB2YXIgY3VycmVudEhUTUwgPSB0aGlzLmZyYW1lQnVpbGRlci51c2VyKHRoaXMuY29sb3JzW2kgJSB0aGlzLmNvbG9ycy5sZW5ndGhdLCB1c2VyLklkLCB1c2VyLk5hbWUsIHRoaXNJc01lKTtcclxuICAgICAgICAgICAgaHRtbC5wdXNoKGN1cnJlbnRIVE1MKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdXNlclJlc3VsdHMuaHRtbChodG1sLmpvaW4oXCJcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1c2VyTmFtZUNoYW5nZShuYW1lX2lucHV0KSB7XHJcbiAgICAgICAgbmFtZV9pbnB1dC5oaWRlKCk7XHJcbiAgICAgICAgJChcIiNpbnB1dF9zZWFyY2hcIikuZmFkZUluKCk7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFja3MubmFtZUNoYW5nZShuYW1lX2lucHV0LnZhbCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DaGF0TWVzc2FnZSh1c2VyTmFtZTogc3RyaW5nLCBtc2c6IHN0cmluZykge1xyXG4gICAgICAgIC8vVE9ETzogY29sb3Igc3R1ZmZcclxuICAgICAgICB2YXIgaHRtbCA9ICc8bGkgY2xhc3M9XCJjaGF0XCI+PHNwYW4gc3R5bGU9XCJtYXJnaW46IDA7IGNvbG9yOiAnICsgJ2JsdWUnICsgJztcIj4nICsgdXNlck5hbWUgKyAnOiA8L3NwYW4+PHNwYW4+JyArIG1zZyArICc8L3NwYW4+PC9saT4nO1xyXG4gICAgICAgICQoXCIjdWxfY2hhdFwiKS5hcHBlbmQoaHRtbCk7XHJcbiAgICB9XHJcbn0iLCLvu79kZWNsYXJlIHZhciBZVDogYW55O1xyXG5cclxuaW1wb3J0IHsgSVBsYXllciB9IGZyb20gXCIuL0lQbGF5ZXJcIjtcclxuaW1wb3J0IHsgTWVkaWEsIFNlc3Npb24sIFVzZXJTdGF0ZSB9IGZyb20gXCIuL0NvbnRyYWN0c1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFl0UGxheWVyIGltcGxlbWVudHMgSVBsYXllciB7XHJcblxyXG4gICAgcHJpdmF0ZSB5dFBsYXllcjogYW55O1xyXG4gICAgcHJpdmF0ZSBtb2JpbGVCcm93c2VyOiBib29sZWFuO1xyXG4gICAgcHVibGljIHBsYXllclJlYWR5OiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vYmlsZUJyb3dzZXI6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLnBsYXllclJlYWR5ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tb2JpbGVCcm93c2VyID0gbW9iaWxlQnJvd3NlcjtcclxuICAgICAgICAkKFwiI2Rpdl95dF9wbGF5ZXJcIikuc2hvdygpO1xyXG4gICAgICAgICQoXCIjZGl2X3BvZGNhc3RfcGxheWVyXCIpLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKSB7XHJcblxyXG4gICAgICAgIGlmIChZVCAmJiBZVC5QbGF5ZXIpIHtcclxuICAgICAgICAgICAgdGhpcy55dFBsYXllciA9IG5ldyBZVC5QbGF5ZXIoJ2Rpdl95dF9wbGF5ZXInLCB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICdhdXRvJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJWYXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbHM6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvd2luZm86IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0b3BsYXk6IDBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBldmVudHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnb25SZWFkeScgOiB0aGlzLm9uUGxheWVyUmVhZHksXHJcbiAgICAgICAgICAgICAgICAgICAgJ29uU3RhdGVDaGFuZ2UnOiBvblBsYXllclN0YXRlQ2hhbmdlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuaW5pdFBsYXllcihvblBsYXllclN0YXRlQ2hhbmdlKSB9LCA1MCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5tb2JpbGVCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBkaXZfcGxheWVyID0gJChcIiNkaXZfeXRfcGxheWVyXCIpO1xyXG4gICAgICAgICAgICBkaXZfcGxheWVyLmhlaWdodChkaXZfcGxheWVyLndpZHRoKCkgKiA5LjAgLyAxNi4wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uUGxheWVyUmVhZHkgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJSZWFkeSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFBsYXllckNvbnRlbnQobWVkaWE6IE1lZGlhLCB0aW1lOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMucGxheWVyUmVhZHkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3BsYXllciBub3QgcmVhZHkhJyk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnNldFBsYXllckNvbnRlbnQobWVkaWEsIHRpbWUpIH0sIDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUGxheWVyVUkobWVkaWEsIHRpbWUpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wbGF5VmlkZW8oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGF1c2UoKSB7XHJcbiAgICAgICAgdGhpcy55dFBsYXllci5wYXVzZVZpZGVvKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEN1cnJlbnRUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudFN0YXRlKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy55dFBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVQbGF5ZXJVSShtZWRpYTogTWVkaWEsIHRpbWU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueXRQbGF5ZXIubG9hZFZpZGVvQnlJZChtZWRpYS5ZVFZpZGVvSUQsIHRpbWUsIFwibGFyZ2VcIik7XHRcclxuICAgICAgICAkKFwiI3BfY2Nfc3VtbWFyeVwiKS50ZXh0KG1lZGlhLlRpdGxlKTtcclxuICAgICAgICBpZiAoIXRoaXMubW9iaWxlQnJvd3Nlcikge1xyXG4gICAgICAgICAgICB2YXIgaHRtbCA9XHJcbiAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdDsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjtcIj4nICtcclxuICAgICAgICAgICAgICAgICc8aW1nIHN0eWxlPVwiaGVpZ2h0OiA5MHB4OyB3aWR0aDogMTYwcHg7IG1hcmdpbi1yaWdodDogMTZweDtcIiBzcmM9XCInICsgbWVkaWEuVGh1bWJVUkwgKyAnXCIvPicgK1xyXG4gICAgICAgICAgICAgICAgJzxzcGFuIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiAxNnB4O1wiPicgKyBtZWRpYS5UaXRsZSArICc8YnI+JyArICdSZWNvbW1lbmRlZCBieTogJyArIG1lZGlhLlVzZXJOYW1lICsgJzwvc3Bhbj4nICtcclxuICAgICAgICAgICAgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgICQoXCIjZGl2X2NjX3Jlc3VsdHNcIikuaHRtbChodG1sKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59Iiwi77u/aW1wb3J0IHsgTWVkaWEgfSBmcm9tIFwiLi9Db250cmFjdHNcIjtcclxuaW1wb3J0IHsgSVNlYXJjaGVyIH0gZnJvbSBcIi4vSVNlYXJjaGVyXCI7XHJcblxyXG5kZWNsYXJlIHZhciBnYXBpOiBhbnk7XHJcblxyXG5leHBvcnQgY2xhc3MgWXRTZWFyY2hlciBpbXBsZW1lbnRzIElTZWFyY2hlciB7XHJcblxyXG4gICAgcmVhZHk6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnJlYWR5ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pbml0KGtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdChzZWNyZXQ6IHN0cmluZywgYXBwSWQgPSBudWxsKSB7XHJcbiAgICAgICAgaWYgKGdhcGkgJiYgZ2FwaS5jbGllbnQgJiYgZ2FwaS5jbGllbnQuc2V0QXBpS2V5ICYmIGdhcGkuY2xpZW50LmxvYWQpIHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuc2V0QXBpS2V5KHNlY3JldCk7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmxvYWQoXCJ5b3V0dWJlXCIsIFwidjNcIiwgZnVuY3Rpb24gKCkgeyB9KTtcclxuICAgICAgICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XHJcbiAgICAgICAgfSBcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuaW5pdChzZWNyZXQpIH0sIDUwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYmV0dGVyIHdheSB0byBjaGVjayBmb3IgcmVhZHlcclxuICAgIHNlYXJjaChxdWVyeTogc3RyaW5nLCBjYWxsYmFjazogKG1lZGlhOiBNZWRpYVtdKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVhZHkpIHtcclxuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBnYXBpLmNsaWVudC55b3V0dWJlLnNlYXJjaC5saXN0KHtcclxuICAgICAgICAgICAgICAgIHBhcnQ6IFwic25pcHBldFwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJ2aWRlb1wiLFxyXG4gICAgICAgICAgICAgICAgcTogZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KS5yZXBsYWNlKC8lMjAvZywgXCIrXCIpLFxyXG4gICAgICAgICAgICAgICAgbWF4UmVzdWx0czogNVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmVxdWVzdC5leGVjdXRlKChyZXN1bHRzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSByZXN1bHRzLml0ZW1zO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lZGlhcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBpdGVtc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWVkaWEgPSBuZXcgTWVkaWEoKTtcclxuICAgICAgICAgICAgICAgICAgICBtZWRpYS5ZVFZpZGVvSUQgPSByZXN1bHQuaWQudmlkZW9JZDtcclxuICAgICAgICAgICAgICAgICAgICBtZWRpYS5UaHVtYlVSTCA9IHJlc3VsdC5zbmlwcGV0LnRodW1ibmFpbHMubWVkaXVtLnVybDtcclxuICAgICAgICAgICAgICAgICAgICBtZWRpYS5UaXRsZSA9IHJlc3VsdC5zbmlwcGV0LnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgICAgIG1lZGlhcy5wdXNoKG1lZGlhKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG1lZGlhcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuc2VhcmNoKHF1ZXJ5LCBjYWxsYmFjaykgfSwgNTApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH1cclxufSJdfQ==
