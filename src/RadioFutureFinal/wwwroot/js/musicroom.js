//TODO: All this code is miserably awful. At some point it should be completely reworked.
var COLOR_LIST = ["red", "orange", "yellow", "green", "blue", "violet"];
var RoomState = (function () {
    function RoomState() {
    }
    return RoomState;
}());
var UserState = (function () {
    function UserState() {
    }
    return UserState;
}());
var MySocket = (function () {
    function MySocket(response_functions) {
        this.response_functions = response_functions;
        var uri = "ws://" + window.location.host + "/ws";
        var socket = new WebSocket(uri);
        socket.onopen = function (event) { };
        socket.onclose = function (event) { };
        socket.onmessage = function (event) {
            var data = JSON.parse(event.data);
            var action = data.Action;
            var func = response_functions[action];
            messageFunctions[action](data);
        };
        socket.onerror = function (event) { };
        this.socket = socket;
    }
    MySocket.prototype.emit = function (action, data) {
        if (this.socket.readyState === this.socket.CONNECTING) {
            setTimeout(function () { this.emit(action, data); }, 100);
            return;
        }
        var message = {
            action: action,
            session: data.Session,
            media: data.Media,
            user: data.User,
            chatMessage: data.ChatMessage
        };
        this.socket.send(JSON.stringify(message));
    };
    ;
    return MySocket;
}());
var MyUser = (function () {
    function MyUser() {
    }
    return MyUser;
}());
var mRoomState = new RoomState();
$(document).ready(function () {
    initialize_ui();
});
//==================================================================
// UI Functions
//==================================================================
function initialize_ui() {
    setup_spinner_ui();
    setup_info_rollover_ui();
    setup_input_ui();
    setup_player_control_ui();
}
function setup_spinner_ui() {
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
    mRoomState.spinner = new Spinner(opts).spin(target);
}
function setup_fade_ui(overall, results) {
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
}
function setup_info_rollover_ui() {
    if (!mobileBrowser) {
        setup_fade_ui($("#div_users_overall"), $("#div_user_results"));
        setup_fade_ui($("#div_queue_overall"), $("#div_queue_results"));
        setup_fade_ui($("#div_chat_overall"), $("#div_chat_results"));
        setup_fade_ui($("#div_cc_overall"), $("#div_cc_results"));
    }
}
function setup_input_ui() {
    var input_search = $("#input_search");
    input_search.keypress(function (e) {
        if (e.which == 13) {
            searchEnterPressed(input_search);
        }
    });
    var input_name = $("#input_name");
    input_name.keypress(function (e) {
        if (e.which == 13) {
            UserNameChange(input_name);
        }
    });
    if (mobileBrowser) {
        var input_chat = $("#input_chat");
        input_chat.keypress(function (e) {
            if (e.which == 13) {
                sendChatMessage(input_chat.val());
                input_chat.val("");
            }
        });
    }
    document.body.addEventListener('click', function () {
        $("#div_search_results").fadeOut();
        $("#input_search").val("");
    }, true);
    $("#input_search").bind("propertychange input paste", function (event) {
        searchTextChanged($("#input_search").val());
    });
}
function setup_player_control_ui() {
    $("#btn_previous").click(previousVideoInQueue);
    $("#btn_pause").click(pauseVideo);
    $("#btn_play").click(playVideo);
    $("#btn_next").click(nextVideoInQueue);
}
function searchTextChanged(text) {
    var divResults = $("#div_search_results");
    if (text.length == 0) {
        divResults.fadeOut();
    }
}
function searchEnterPressed(input_search) {
    var divResults = $("#div_search_results");
    divResults.html("");
    searchVideos(input_search.val(), function (response) {
        $.each(response.items, function (index, item) {
            divResults.html(divResults.html() + "<div class='div_search_result' onClick='queueSelectedVideo(this)' data-VideoId='" + item.id.videoId + "' data-ThumbURL='" + item.snippet.thumbnails.medium.url + "'>" + '<p class="text_search_result">' + item.snippet.title + '</p></div>');
        });
        input_search.blur();
    });
    if (!divResults.is(':visible')) {
        divResults.fadeIn();
    }
}
function sessionReadyUI() {
    $("#div_loading").hide();
    mRoomState.spinner.stop();
    $("#div_everything").animate({ opacity: 1 }, 'fast');
}
function onPlayerReady(event) {
    mRoomState.player_ready = true;
    if (mRoomState.youtube_api_ready) {
        setupJamSession();
    }
}
function queueRollover(item) {
    $(item).attr('src', '../images/cross.jpg');
    //TODO: can place statically
    $(item).attr('onclick', "deleteVideoInQueue(" + item.getAttribute('data-QueuePosition') + ")");
}
function queueRolloff(item) {
    $(item).attr('src', item.getAttribute('data-ThumbURL'));
}
function updateQueueUI(queue_position) {
    var queue = mRoomState.queue;
    var length = queue.length;
    var lengthUpNext = queue.length - queue_position;
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
        for (var i = queue_position; i < length; i++) {
            var media = queue[i];
            var currentHTML = "";
            if (mobileBrowser) {
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
}
// lol awful code
function frameUser(index, userId, userName, thisIsMe) {
    var currentHTML = "";
    if (thisIsMe) {
        if (mobileBrowser) {
            currentHTML = '<div class="div_user" style="background: ' + COLOR_LIST[index % COLOR_LIST.length] + ';"> you </div>';
        }
        else {
            currentHTML =
                '<div style="text-align: left; display: flex; align-items: center;">' +
                    '<div style="display: flex; align-items: center; justify-content: center; float: left; cursor: pointer; margin-right: 16px; height: 48px; width: 48px; background: ' + COLOR_LIST[index % COLOR_LIST.length] + ';">you</div>' +
                    '<span style="margin-right: 16px; float: right;">' + userName + '</span>' +
                    '</div>';
        }
    }
    else {
        if (mobileBrowser) {
            currentHTML = '<div onclick="requestSyncWithUser(' + userId + ')" class="div_user" style="background: ' + COLOR_LIST[index % COLOR_LIST.length] + ';">sync with ' + userName + '</div>';
        }
        else {
            currentHTML =
                '<div style="text-align: left; display: flex; align-items: center;">' +
                    '<div onclick="requestSyncWithUser(' + userId + ')" style="display: flex; align-items: center; justify-content: center; float: left; cursor: pointer; margin-right: 16px; height: 48px; width: 48px; background: ' + COLOR_LIST[index % COLOR_LIST.length] + ';">sync</div>' +
                    '<span style="margin-right: 16px; float: right;">' + userName + '</span>' +
                    '</div>';
        }
    }
    return currentHTML;
}
function updateUsersListUI(users) {
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
        var thisIsMe = (user.Id === mRoomState.user.Id);
        var currentHTML = frameUser(index, user.Id, user.Name, thisIsMe);
        html.push(currentHTML);
    });
    userResults.html(html.join(""));
}
function setupVideo() {
    if (mRoomState.user.QueuePosition != -1) {
        var media = mRoomState.queue[mRoomState.user.QueuePosition];
        updateQueueUI(mRoomState.user.QueuePosition + 1);
        updatePlayerUI(media, mRoomState.user.VideoTime, media.UserName);
    }
}
function UserNameChange(name_input) {
    name_input.hide();
    $("#input_search").fadeIn();
    saveUserNameChange(name_input.val());
}
//==================================================================
// Backend video and queue control functions
//==================================================================
function deleteVideoInQueue(QueuePosition) {
    var id = mRoomState.queue[QueuePosition].Id;
    mRoomState.queue.splice(QueuePosition, 1);
    updateQueueUI(mRoomState.user.QueuePosition + 1);
    var data = {
        Media: { Id: id }
    };
    mRoomState.socket.emit('DeleteMediaFromSession', data);
}
function previousVideoInQueue() {
    mRoomState.user.VideoTime = 0;
    var queue = mRoomState.queue;
    if (mRoomState.user.QueuePosition > 0) {
        var QueuePosition = mRoomState.user.QueuePosition = mRoomState.user.QueuePosition - 1;
        setupVideo();
        mRoomState.user.waiting = false;
    }
}
function playVideo() {
    $("#btn_play").hide();
    $("#btn_pause").show();
    mRoomState.player.playVideo();
}
function pauseVideo() {
    $("#btn_pause").hide();
    $("#btn_play").show();
    mRoomState.player.pauseVideo();
}
function nextVideoInQueue() {
    mRoomState.user.VideoTime = 0;
    var queue = mRoomState.queue;
    if ((mRoomState.user.QueuePosition + 1) < queue.length) {
        var QueuePosition = mRoomState.user.QueuePosition = mRoomState.user.QueuePosition + 1;
        setupVideo();
        mRoomState.user.waiting = false;
    }
    else {
        mRoomState.user.waiting = true;
    }
}
function queueSelectedVideo(elmnt) {
    $("#div_search_results").fadeOut();
    $("#input_search").val("");
    var VideoId = elmnt.getAttribute('data-VideoId');
    var Title = elmnt.innerText || elmnt.textContent;
    var ThumbURL = elmnt.getAttribute('data-ThumbURL');
    var media = createMedia(Title, VideoId, ThumbURL, mRoomState.user.Id, mRoomState.user.Name);
    var data = {
        Media: media
    };
    //TODO: local add media
    mRoomState.socket.emit('AddMediaToSession', data);
}
//==================================================================
// Music Session setup and synchronization functions for session and user objects
// Basically all the hard stuff
//==================================================================
function requestSyncWithUser(userId) {
    console.log('request sync with user');
    mRoomState.socket.emit('RequestSyncWithUser', { User: { Id: userId } });
}
function onRequestMyUserState(data) {
    console.log('on request my user state');
    var userIdRequestor = data.User.Id;
    var userData = new MyUser();
    userData.Id = userIdRequestor; // TODO: bad bad bad
    userData.State.QueuePosition = mRoomState.user.QueuePosition;
    userData.State.Time = Math.round(mRoomState.player.getCurrentTime());
    userData.State.PlayerState = mRoomState.player.getPlayerState();
    mRoomState.socket.emit('ProvideSyncToUser', { User: userData });
}
function onUserStateProvided(data) {
    console.log('on user state provided');
    var userToSyncWith = data.User;
    mRoomState.user.QueuePosition = userToSyncWith.QueuePosition;
    mRoomState.user.VideoTime = userToSyncWith.VideoTime;
    mRoomState.user.YtPlayerState = userToSyncWith.YtPlayerState;
    updateQueueUI(mRoomState.user.QueuePosition + 1);
    setupVideo();
}
function saveUserNameChange(name) {
    mRoomState.user.Name = name;
    for (var i = 0; i < mRoomState.current_users; i++) {
        if (mRoomState.user.Id === mRoomState.current_users[i].Id) {
            mRoomState.current_users[i].name = name;
        }
    }
    var data = {
        User: mRoomState.user
    };
    mRoomState.socket.emit('SaveUserNameChange', data);
}
//==================================================================
// WebSocket message response functions
//==================================================================
function onUpdateUser(data) {
    var user = data.user;
    if (mRoomState.session_initialized) {
        mRoomState.user = user;
    }
}
function onSessionReady(data) {
    var session = data.Session;
    mRoomState.session_id = session.Id;
    mRoomState.queue = session.Queue;
    mRoomState.current_users = session.Users;
    mRoomState.user = data.User;
    if (mRoomState.queue.length == 0) {
        $("#p_current_content_info").text("Queue up a song!");
        $("#p_current_recommender_info").text("Use the search bar above.");
    }
    nextVideoInQueue();
    updateUsersListUI(mRoomState.current_users);
    sessionReadyUI();
    mRoomState.session_initialized = true;
}
function onUpdateUsersList(data) {
    var users = data.Session.Users;
    if (mRoomState.session_initialized) {
        mRoomState.current_users = users;
        updateUsersListUI(mRoomState.current_users);
    }
}
function onUpdateQueue(data) {
    var queue = data.Session.Queue;
    if (mRoomState.session_initialized) {
        mRoomState.queue = queue;
        updateQueueUI(mRoomState.user.QueuePosition + 1);
        if (mRoomState.user.waiting) {
            nextVideoInQueue();
        }
    }
}
function onReceivedChatMessage(data) {
    var msg = data.ChatMessage;
    var userName = data.User.Name;
    //TODO: color stuff
    var numChildren = $("#ul_chat").length;
    var html = '<li class="chat"><span style="margin: 0; color: ' + COLOR_LIST[length % 6] + ';">' + userName + ': </span><span>' + msg + '</span></li>';
    $("#ul_chat").append(html);
}
var messageFunctions = {
    'updateUser': onUpdateUser,
    'sessionReady': onSessionReady,
    'updateUsersList': onUpdateUsersList,
    'updateQueue': onUpdateQueue,
    'chatMessage': onReceivedChatMessage,
    'requestUserState': onRequestMyUserState,
    'provideUserState': onUserStateProvided
};
function setupSockets() {
}
//TODO: synchronize so multiple entry points don't happen
function setupJamSession() {
    if (mRoomState.entered_jam) {
        return;
    }
    else {
        mRoomState.entered_jam = true;
    }
    // TODO: this should get out of here
    $("#div_yt_player").show();
    $("#div_podcast_player").hide();
    var pathname = window.location.pathname;
    var encodedSessionName = null;
    if (pathname.indexOf('\/rooms\/') > -1) {
        encodedSessionName = pathname.replace('\/rooms/', '');
    }
    setupSockets();
    setTimeout(function () { joinJamSession(encodedSessionName); }, 50);
}
function joinJamSession(encodedSessionName) {
    mRoomState.session.name = decodeURI(encodedSessionName);
    mRoomState.user = new MyUser();
    mRoomState.user.Name = 'Anonymous';
    var data = {
        User: mRoomState.user,
        Session: { name: encodedSessionName },
    };
    mRoomState.socket.emit('UserJoinSession', data);
}
;
//==================================================================
// Chat functions
//==================================================================
function sendChatMessage(msg) {
    if (mRoomState.session_initialized) {
        var data = {
            ChatMessage: msg,
            User: { Name: mRoomState.user.Name }
        };
        mRoomState.socket.emit('ChatMessage', data);
    }
}
//==================================================================
// Youtube API functions and player UI control
//==================================================================
// TODO: get a new key and get that shit out of here
function youtubeAPIInit() {
    gapi.client.setApiKey("AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc");
    gapi.client.load("youtube", "v3", function () {
        mRoomState.youtube_api_ready = true;
        if (mRoomState.player_ready) {
            setupJamSession();
        }
    });
}
function onYouTubeIframeAPIReady() {
    mRoomState.player = new YT.Player('div_yt_player', {
        height: 'auto',
        width: '100%',
        playerVars: {
            controls: 1,
            showinfo: 0,
            autoplay: 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    if (mobileBrowser) {
        var div_player = $("#div_player");
        div_player.height(div_player.width() * 9.0 / 16.0);
    }
}
function searchVideos(query, callback) {
    var request = gapi.client.youtube.search.list({
        part: "snippet",
        type: "video",
        q: encodeURIComponent(query).replace(/%20/g, "+"),
        maxResults: 5
    });
    //execute the request
    request.execute(callback);
}
function onPlayerStateChange(event) {
    //when video ends
    if (event.data == 0) {
        nextVideoInQueue();
    }
}
function updatePlayerUI(media, time, recommenderName) {
    if (!mRoomState.player_ready) {
        setTimeout(updatePlayerUI(media, time, recommenderName), 1000);
    }
    mRoomState.player.loadVideoById(media.YTVideoID, time, "large");
    $("#p_cc_summary").text(media.VideoTitle);
    if (!mobileBrowser) {
        var html = '<div style="text-align: left; display: flex; align-items: center;">' +
            '<img style="height: 90px; width: 160px; margin-right: 16px;" src="' + media.ThumbURL + '"/>' +
            '<span style="margin-right: 16px;">' + media.VideoTitle + '<br>' + 'Recommended by: ' + recommenderName + '</span>' +
            '</div>';
        $("#div_cc_results").html(html);
    }
}
//TODO: Fix CamelCase stuff with JSON
//==================================================================
// Basically constructors. Probably a better way to do this.
//==================================================================
function createMedia(Title, VideoId, ThumbURL, UserId, recommender_name) {
    var media = {
        YTVideoId: VideoId,
        VideoTitle: Title,
        ThumbURL: ThumbURL,
        UserName: recommender_name,
        UserId: UserId
    };
    return media;
}
//==================================================================
// Misc
//==================================================================
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
//# sourceMappingURL=musicroom.js.map