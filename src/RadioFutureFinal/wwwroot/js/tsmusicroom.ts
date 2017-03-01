/// <reference path="./DefinitelyTyped/jquery.d.ts" />

import $ from "jquery";
declare var gapi: any; // Magic

var mConstants = {
    "PLAYING": 1,
    "PAUSED": 2
};

var mGlobals = {
    playerReady: false,
    ytApiReady: false,
    sessionReady: false,
    user: new User(),
    session: null,
    ytPlayer: null,
    socket: null
};


class Session {
    sessionId: number;
    sessionName: string;
    users: Array<User>; 
    queue: Array<Media>;
}

class User {
    userId: number;
    userName: string;
    color: string;
    videoTime: number;
    queuePosition: number;
    ytPlayerState: number;
    waiting: boolean;
    temp: boolean;
    // TODO: some variable to indicate user has not been saved
    constructor() {
        this.userName = name;
        this.temp = true;
    }
}

class Media {
    mediaId: number;
    mediaTitle: string;
    userId: number;
    userName: string;
    ytVideoId: string;
    likes: number;
    dislikes: number;
    thumbURL: string;
    constructor(title: string, videoId: string, thumbURL: string, userId: number, userName: string) {
        this.mediaTitle = title;
        this.ytVideoId = videoId;
        this.thumbURL = thumbURL;
        this.userId = userId;
        this.userName = userName;
    }
}

class WsMessage {
    action: string;
    session: Session;
    media: Media;
    user: User;
}


$(document).ready(function () {

    var pathname = window.location.pathname;
    var roomName = null;
    if (pathname.indexOf('\/rooms\/') > -1) {
        roomName = pathname.replace('\/rooms/', '');
    }

    var input_search = $("#input_search");
    input_search.bind("propertychange input paste", function (event) {
        searchTextChanged(input_search.val());
    });
    input_search.keypress(function (e) {
        if (e.which == 13) {
            searchEnterPressed(input_search.val());
        }
    });

    var input_chat = $("#input_chat");
    input_chat.keypress(function (e) {
        if (e.which == 13) {
            sendChatMessage(input_chat.val());
            input_chat.val("");
        }
    });

    var input_name = $("#input_name");
    input_name.keypress(function (e) {
        if (e.which == 13) {
            var newName = input_name.val();
            saveUserNameChange(name);
            input_name.hide();
            input_chat.fadeIn();
        }
    });

    document.body.addEventListener('click', function () {
        $("#div_search_results").fadeOut();
        if (input_search) {
            input_search.val("");
        }
    }, true);

	/*
	$("#chat_input").keypress(function(e) {
		if(e.which==13) {
			sendChatMessage();		
		}
	});
	$("#txt_email").keypress(function(e) {
		if(e.which==13) {
			emailQueue();
		}
	});
	*/

    $('.drawer').drawer();
});

//==================================================================
// UI Functions
//==================================================================

function searchTextChanged(text: string) {
    var divResults = $("#div_search_results");
    if (text.length == 0) {
        divResults.fadeOut();
    }
}

function searchEnterPressed(query: string) {
    var divResults = $("#div_search_results");
    divResults.html("");
    searchVideos(query, function (response) {
        $.each(response.items, function (index, item) {
            divResults.html(divResults.html() + "<div class='div_search_result' onClick='queueSelectedVideo(this)' data-videoId='" + item.id.videoId + "' data-thumb_URL='" + item.snippet.thumbnails.medium.url + "'>" + '<p class="text_search_result">' + item.snippet.title + '</p></div>');
        });
    });
    if (!divResults.is(':visible')) {
        divResults.fadeIn();
    }
}

function sessionReadyUI() {
    $("#div_loading").hide();
    $("#div_everything").animate({ opacity: 1 }, 'fast');
}

function onPlayerReady(eventArgs: YT.EventArgs) {
    mGlobals.playerReady = true;
    if (mGlobals.ytApiReady) {
        setupJamSession();
    }
}

function queueRollover(item: HTMLElement) {
    $(item).attr('src', '../images/cross.jpg');
    $(item).attr('onclick', "deleteVideoInQueue(" + item.getAttribute('data-queuePosition') + ")");
}

function queueRolloff(item: HTMLElement) {
    $(item).attr('src', item.getAttribute('data-thumb_URL'));
}

function updateQueueUI(starting_queuePosition: number) {
    var queue = mGlobals.session.queue;
    var i = starting_queuePosition;
    var j = 0;
    //TODO: make robust
    var end = 5;
    var div_queue = $("#div_footer");
    div_queue.html("");
    while (i < queue.length) {
        var media = queue[i];
        var innerht = "";
        if ((j + 1) % 5 === 0) {
            innerht = "<div class='div_content' style='margin-right: 0'><img class='img_queue_item' data-queuePosition='" + i + "' data-thumb_URL='" + media.thumb_URL + "' onmouseover='queueRollover(this)' onmouseout='queueRolloff(this)' src='" + media.thumb_URL + "'></img></div>";
        }
        else {
            innerht = "<div class='div_content'><img class='img_queue_item' data-queuePosition='" + i + "' data-thumb_URL='" + media.thumb_URL + "' onmouseover='queueRollover(this)' onmouseout='queueRolloff(this)' src='" + media.thumb_URL + "'></img></div>";
        }
        div_queue.html(div_queue.html() + innerht);
        i++;
        j++;
    }
}

function emailQueue() {
    //mGlobals.socket.emit('emailQueue', { email: $("#txt_email").val(), queue: mGlobals.queue });
    //$("#txt_email").fadeOut();
}

function updateUsersListUI(users: Array<User>) {

    var usersList = document.getElementById('div_users_list');

    usersList.innerHTML = "";
    var divarr = [];
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        //uses local user data instead of what is currently in the server
        if (user.userId === mGlobals.user.userId) {
            user = mGlobals.user;
        }
        var color = user.color;
        var queuePosition = user.queuePosition;
        var current_video_title = "";
        if (queuePosition != -1) {
            mGlobals.session.queue[queuePosition].mediaTitle;
        }
        else {
            current_video_title = "Nothing";
        }

        var div_user = document.createElement('div');
        div_user.style.background = user.color;
        div_user.className = "div_user tooltip";
        div_user.setAttribute('data-userId', user.userId.toString());

        var p_user = document.createElement('p');
        p_user.className = "p_user";
        p_user.setAttribute('data-username', user.userName);
        p_user.appendChild(document.createTextNode(user.userName.charAt(0)));

        var span_tooltip = document.createElement('span');
        span_tooltip.className = "tooltiptext";
        span_tooltip.setAttribute('data-username', user.userName);
        span_tooltip.innerHTML = "Click to sync with " + user.userName + "!";

        div_user.appendChild(p_user);
        div_user.appendChild(span_tooltip);
        usersList.appendChild(div_user);

        divarr.push(div_user);
    }
    for (var i = 0; i < divarr.length; i++) {
        var mydiv = divarr[i];
        $(mydiv).click(function (event: Event) {
            var userId = Number(event.srcElement.getAttribute('data-userId'));
            syncWithUser(userId);
        });
    }
}

function setupVideo() {
    if (mGlobals.user.queuePosition != -1) {
        var media = mGlobals.session.queue[mGlobals.user.queuePosition];
        updateQueueUI(mGlobals.user.queuePosition + 1);
        updatePlayerUI(media.ytVideoId, mGlobals.user.videoTime, media.userName, media.mediaTitle);
    }
}

//==================================================================
// Backend video and queue control functions
//==================================================================
function deleteVideoInQueue(queuePosition: number) {
    var queue = mGlobals.session.queue;
    var id = queue[queuePosition].ytVideoId;
    queue.splice(queuePosition, 1);
    updateQueueUI(mGlobals.user.queuePosition + 1);
    var data = {
        recommendationId: id
    };
    mGlobals.socket.emit('deleteRecommendationFromSession', data);
}

function previousVideoInQueue() {
    mGlobals.user.videoTime = 0;
    var queue = mGlobals.session.queue;
    if (mGlobals.user.queuePosition > 0) {
        var queuePosition = mGlobals.user.queuePosition = mGlobals.user.queuePosition - 1;
        setupVideo();
        mGlobals.user.waiting = false;
    }
}

function nextVideoInQueue() {
    mGlobals.user.videoTime = 0;
    var queue = mGlobals.session.queue;
    if ((mGlobals.user.queuePosition + 1) < queue.length) {
        var queuePosition = mGlobals.user.queuePosition = mGlobals.user.queuePosition + 1;
        setupVideo();
        mGlobals.user.waiting = false;
    }
    else {
        mGlobals.user.waiting = true;
    }
}

function queueSelectedVideo(elmnt: Element) {
    $("#div_search_results").fadeOut();
    $("#input_search").val("");
    var videoId = elmnt.getAttribute('data-videoId');
    var title = elmnt.textContent || elmnt.textContent;
    var thumb_url = elmnt.getAttribute('data-thumb_URL');
    var media = new Media(title, videoId, thumb_url, mGlobals.user.userId, mGlobals.user.userName);
    var data = {
        sessionId: mGlobals.session.sessionId,
        media: media
    };
    //TODO: local add recommendation
    mGlobals.socket.emit('addRecommendationToSession', data);
}

//==================================================================
// Music Session setup and synchronization functions for session and user objects
// Basically all the hard stuff
//==================================================================

// TODO: use id instead of name
function syncWithUser(userId: number) {
    var currentUsers = mGlobals.session.users;
    for (var i = 0; i < currentUsers.length; i++) {
        if (currentUsers[i].userId === userId) {
            var myuser = currentUsers[i];
            mGlobals.user.queuePosition = myuser.queuePosition;
            mGlobals.user.videoTime = myuser.videoTime;
            mGlobals.user.ytPlayerState = myuser.ytPlayerState;
            updateQueueUI(mGlobals.user.queuePosition + 1);
            setupVideo();
        }
    }
}

function saveUserNameChange(newName: string) {
    mGlobals.user.userName = newName;
    // TODO: this is silly
    var currentUsers = mGlobals.session.users;
    for (var i = 0; i < currentUsers.length; i++) {
        if (mGlobals.user.userId === currentUsers[i].userId) {
            currentUsers[i].userName = newName;
        }
    }
    var data = {
        user: mGlobals.user
    };
    mGlobals.socket.emit('saveUserNameChange', data);
}


function saveUserVideoState() {
    if (mGlobals.playerReady) {
        mGlobals.user.videoTime = mGlobals.ytPlayer.getCurrentTime();
        mGlobals.user.ytPlayerState = mGlobals.ytPlayer.getPlayerState();
        mGlobals.socket.emit('saveUserVideoState', mGlobals.user);
    }
}

function setupSocketEvents() {
    //receives the newest user and session objects from database
    mGlobals.socket.on('updateUser', updateUser);
    mGlobals.socket.on('sessionReady', sessionReady);
    mGlobals.socket.on('updateUsersList', updateUsersList);
    mGlobals.socket.on('updateQueue', updateQueue);
    mGlobals.socket.on('clientChatMessage', receivedChatMessage);
    mGlobals.socket.on('foundGenreJam', foundGenreJam);
}

function receivedChatMessage(msg: string, user: User) {
    var ul_chat = $("#ul_chat");
    var innerHTML = ul_chat.html() || "";
    ul_chat.html(innerHTML + '<li><span style="color: ' + user.color + '">' + user.userName + '</span>' + '<span>' + ': ' + msg + '</span></li>');
    var children = ul_chat.children();
    if (children.length > 10) {
        children[0].remove();
    }
}

function synchronizeUsers() {
    mGlobals.socket.emit('synchronizeUsers');
}

function updateUsersList(users: Array<User>) {
    if (mGlobals.sessionReady) {
        mGlobals.session.users = users;
        updateUsersListUI(mGlobals.session.users);
    }
}

function updateQueue(queue: Array<Media>) {
    if (mGlobals.sessionReady) {
        mGlobals.session.queue = queue;
        updateQueueUI(mGlobals.user.queuePosition + 1);
        if (mGlobals.user.waiting) {
            nextVideoInQueue();
        }
    }
}

function updateUser(user: User) {
    if (mGlobals.sessionReady) {
        mGlobals.user = user;
    }
}

function sessionReady(session: Session, user?: User) {
    mGlobals.session = session;
    // TODO: get rid of temp stuff
    if (mGlobals.user.temp) {
        mGlobals.user = user;
    }
    saveUserVideoState();
    setInterval(saveUserVideoState, 10000);
    if (mGlobals.session.queue.length == 0) {
        $("#p_current_content_info").text("Queue up a song!");
        $("#p_current_recommender_info").text("Use the search bar above.");
    }
    nextVideoInQueue();
    updateUsersListUI(mGlobals.session.users);
    sessionReadyUI();
    mGlobals.sessionReady = true;
}

function handleSocketMessage(event) {
    console.log('Received socket message with: ');
    console.log(event.data);
}

function handleSocketError(event) {
    alert('Socket error');
    console.log(event);
}

function setupSockets() {
    var uri = "ws://" + window.location.host + "/ws";
    var socket = new WebSocket(uri);
    socket.onopen = function (event) {
        console.log("opened connection to " + uri);
    };
    socket.onclose = function (event) {
        console.log("closed connection from " + uri);
    };
    socket.onmessage = function (event) {
        handleSocketMessage(event);
    };
    socket.onerror = function (event) {
        handleSocketError(event);
    };
    mGlobals.socket = socket;

    setupSocketEvents();
}

function foundGenreJam(data) {
    joinJamSession(data.genreName);
}

//three entry points: genre, url, text box
function setupJamSession() {
    console.log('setting up jam session!');
    var sessionName = 'sessionName'; //TODO: get session name from url
    if (mGlobals.sessionReady) {
        return;
    }
    setupSockets();
    joinJamSession(sessionName);
    mGlobals.sessionReady = true;
}

function joinJamSession(sessionName: string) {

    mGlobals.session.sessionName = decodeURI(sessionName);
    mGlobals.user = new User();

    var data = {
        user: mGlobals.user,
        sessionName: sessionName
    };
    mGlobals.socket.emit('userJoinSession', data);

    setInterval(synchronizeUsers, 5000);
};

//==================================================================
// Chat functions
//==================================================================
function sendChatMessage(chatMessage: string) {
    if (mGlobals.sessionReady) {
        mGlobals.socket.emit('chatMessage', chatMessage); 
    }
}

//==================================================================
// Youtube API functions and player UI control
//==================================================================

function youtubeAPIInit() {
    gapi.client.setApiKey("AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc");
    gapi.client.load("youtube", "v3", function () {
        mGlobals.ytApiReady = true;
        if (mGlobals.playerReady) {
            setupJamSession();
        }
    });
}

function onYouTubeIframeAPIReady() {
    var playerOptions = {
        width: '100%',
        height: 'auto',
        playerVars: {
            controls: 0,
            showinfo: 0,
            autoplay: 1
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    }
    var player = new YT.Player('div_player', playerOptions);
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

function updatePlayerState(state) {
    if (mGlobals.playerReady) {
        if (state == mConstants.PLAYING) {
            mGlobals.ytPlayer.playVideo();
        }
        else if (state == mConstants.PAUSED) {
            mGlobals.ytPlayer.pauseVideo();
        }
    }
}

function onPlayerStateChange(eventArgs: YT.EventArgs) {
    //when video ends
    if (eventArgs.data == 0) {
        nextVideoInQueue();
    }
}

function updatePlayerUI(currentVideo: string, videoTime: number, recommenderName: string, videoTitle: string) {
    if (!mGlobals.playerReady) {
        setTimeout(updatePlayerUI(currentVideo, videoTime, recommenderName, videoTitle), 1000);
    }
    mGlobals.ytPlayer.loadVideoById(currentVideo, videoTime, "large");
    $("#p_current_content_info").text(videoTitle);
    $("#p_current_recommender_info").text('Recommended by: ' + recommenderName);
    var color = 'black';
    //TODO: shitty
    var currentUsers = mGlobals.session.users;
    for (var i = 0; i < currentUsers.length; i++) {
        var user = currentUsers[i];
        if (user.userName === recommenderName) {
            color = user.color;
        }
    }
    synchronizeUsers();
}