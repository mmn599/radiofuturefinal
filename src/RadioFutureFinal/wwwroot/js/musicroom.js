System.register("Contracts", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("Sockets", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var MySocket;
    return {
        setters: [],
        execute: function () {
            MySocket = (function () {
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
            exports_2("MySocket", MySocket);
        }
    };
});
System.register("frame", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var FrameBuilder;
    return {
        setters: [],
        execute: function () {
            FrameBuilder = (function () {
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
            exports_3("FrameBuilder", FrameBuilder);
        }
    };
});
System.register("ui", ["frame"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var frame_1, UI;
    return {
        setters: [
            function (frame_1_1) {
                frame_1 = frame_1_1;
            }
        ],
        execute: function () {
            UI = (function () {
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
            exports_4("UI", UI);
        }
    };
});
System.register("Player", [], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var Player;
    return {
        setters: [],
        execute: function () {
            Player = (function () {
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
            exports_5("Player", Player);
        }
    };
});
//TODO: All this code is miserably awful. At some point it should be completely reworked.
System.register("Room", ["ui", "Sockets", "Player"], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
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
    var COLOR_LIST, ui_1, Sockets_1, Player_1, mMeUser, mSession, mUI, mPlayer, mSocket, mMessageFunctions, mCallbacks;
    return {
        setters: [
            function (ui_1_1) {
                ui_1 = ui_1_1;
            },
            function (Sockets_1_1) {
                Sockets_1 = Sockets_1_1;
            },
            function (Player_1_1) {
                Player_1 = Player_1_1;
            }
        ],
        execute: function () {//TODO: All this code is miserably awful. At some point it should be completely reworked.
            COLOR_LIST = ["red", "orange", "yellow", "green", "blue", "violet"];
            $(document).ready(function () {
                mUI = new ui_1.UI(mobileBrowser, mCallbacks);
                mPlayer = new Player_1.Player(mobileBrowser);
                mSocket = new Sockets_1.MySocket(mMessageFunctions);
                setupJamSession();
            });
            //==================================================================
            // WebSocket message response functions
            //==================================================================
            mMessageFunctions = {
                'updateUser': onUpdateMeUser,
                'sessionReady': onSessionReady,
                'updateUsersList': onUpdateUsersList,
                'updateQueue': onUpdateQueue,
                'chatMessage': onReceivedChatMessage,
                'requestUserState': onRequestMyUserState,
                'provideUserState': onUserStateProvided
            };
            mCallbacks.onSendChatMessage = sendChatMessage;
            mCallbacks.nameChange = saveUserNameChange;
            mCallbacks.nextMedia = nextVideoInQueue;
            mCallbacks.pauseMedia = pauseVideo;
            mCallbacks.playMedia = playVideo;
            mCallbacks.previousMedia = previousVideoInQueue;
            mCallbacks.search = searchVideos;
        }
    };
});
//# sourceMappingURL=musicroom.js.map