// This is all pretty bad code. Should be thoroughly reorganized.
"use strict";
// TODO: find a better way to expose these functions to html?
window.queueSelectedVideo = queueSelectedVideo;
window.requestSyncWithUser = requestSyncWithUser;
window.deleteMedia = deleteMedia;
var Contracts_1 = require("./Contracts");
var UI_1 = require("./UI");
var Sockets_1 = require("./Sockets");
var PodcastPlayer_1 = require("./PodcastPlayer");
var YtPlayer_1 = require("./YtPlayer");
var YtSearcher_1 = require("./YtSearcher");
var mUser = new Contracts_1.MyUser();
var mSession = new Contracts_1.Session();
var mSearcher;
var mPlayer;
var mSocket;
var mUI;
$(document).ready(function () {
    // TODO: this will go away once callbacks is an interface
    var callbacks = new UI_1.UICallbacks();
    callbacks.onSendChatMessage = onSendChatMessage;
    callbacks.nameChange = saveUserNameChange;
    callbacks.nextMedia = nextMedia;
    callbacks.pauseMedia = onBtnPause;
    callbacks.playMedia = onBtnPlay;
    callbacks.previousMedia = previousMedia;
    callbacks.search = onSearchVideos;
    // TODO: remove
    var playerType = "podcasts";
    if (playerType == "podcasts") {
        mPlayer = new PodcastPlayer_1.PodcastPlayer(mobileBrowser);
    }
    else {
        mPlayer = new YtPlayer_1.YtPlayer(mobileBrowser);
        // TODO: get rid of this key
        mSearcher = new YtSearcher_1.YtSearcher('AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc');
    }
    mUI = new UI_1.UI(mobileBrowser, callbacks);
    mSocket = new Sockets_1.MySocket(mMessageFunctions);
    setupJamSession();
    mPlayer.initPlayer(onPlayerStateChange);
});
function setupJamSession() {
    var pathname = window.location.pathname;
    var encodedSessionName = pathname.replace('\/rooms/', '');
    mSession.Name = decodeURI(encodedSessionName);
    mUser.Name = 'Anonymous';
    var message = new Contracts_1.WsMessage();
    message.Action = 'UserJoinSession';
    message.User = mUser;
    message.Session = mSession;
    mSocket.emit(message);
}
//==================================================================
// WebSocket message response functions
//==================================================================
var mMessageFunctions = {
    'updateUser': onUpdateMeUser,
    'sessionReady': onSessionReady,
    'updateUsersList': onUpdateUsersList,
    'updateQueue': onUpdateQueue,
    'ChatMessage': onReceivedChatMessage,
    'requestUserState': onRequestMyUserState,
    'provideUserState': onUserStateProvided
};
function onUserStateProvided(message) {
    var userToSyncWith = message.User;
    mUser.State.QueuePosition = userToSyncWith.State.QueuePosition;
    mUser.State.Time = userToSyncWith.State.Time;
    mUser.State.YTPlayerState = userToSyncWith.State.YTPlayerState;
    mUI.updateQueue(mSession.Queue, mUser.Id, mUser.State.QueuePosition);
    var currentMedia = mSession.Queue[mUser.State.QueuePosition];
    userStateChange();
}
function onRequestMyUserState(message) {
    var userData = new Contracts_1.MyUser();
    userData.Id = message.User.Id; // TODO: bad bad bad
    userData.State.QueuePosition = mUser.State.QueuePosition;
    userData.State.Time = Math.round(mPlayer.getCurrentTime());
    userData.State.YTPlayerState = mPlayer.getCurrentState();
    var outgoingMsg = new Contracts_1.WsMessage();
    outgoingMsg.Action = 'ProvideSyncToUser';
    outgoingMsg.User = userData;
    mSocket.emit(outgoingMsg);
}
function onUpdateMeUser(message) {
    var user = message.User;
    mUser = user;
}
function onSessionReady(message) {
    mSession = message.Session;
    mUser = message.User;
    // TODO: get rid of this bullshit
    if (mSession.Queue.length == 0) {
        $("#p_current_content_info").text("Queue up a song!");
        $("#p_current_recommender_info").text("Use the search bar above.");
    }
    nextMedia();
    mUI.updateQueue(mSession.Queue, mUser.Id, mUser.State.QueuePosition);
    mUI.updateUsersList(mSession.Users, mUser.Id);
    mUI.sessionReady();
}
function onUpdateUsersList(message) {
    var users = message.Session.Users;
    mSession.Users = users;
    mUI.updateUsersList(mSession.Users, mUser.Id);
}
function onUpdateQueue(message) {
    mSession.Queue = message.Session.Queue;
    if (mUser.State.Waiting) {
        nextMedia();
    }
    mUI.updateQueue(mSession.Queue, mUser.Id, mUser.State.QueuePosition);
}
function onReceivedChatMessage(message) {
    var chatMessage = message.ChatMessage;
    var userName = message.User.Name;
    mUI.onChatMessage(userName, chatMessage);
}
//
// Mostly UI callback functions
//
function onSendChatMessage(msg) {
    var message = new Contracts_1.WsMessage();
    message.Action = 'ChatMessage';
    message.ChatMessage = msg;
    message.User = mUser;
    mSocket.emit(message);
}
function onPlayerStateChange(event) {
    if (event.data == 0) {
        nextMedia();
    }
}
function onSearchVideos(query, callback) {
}
function saveUserNameChange(newName) {
    mUser.Name = newName;
    var message = new Contracts_1.WsMessage();
    message.User = mUser;
    message.Action = 'SaveUserNameChange';
    mSocket.emit(message);
}
function userStateChange() {
    if (mUser.State.QueuePosition >= 0 && mUser.State.QueuePosition < mSession.Queue.length) {
        mPlayer.setPlayerContent(mSession.Queue[mUser.State.QueuePosition], mUser.State.Time);
        mUser.State.Waiting = false;
    }
    else if (mUser.State.QueuePosition < 0 || mUser.State.QueuePosition == mSession.Queue.length) {
        // TODO: set player content to 'waiting on next video'
        mUser.State.Waiting = true;
    }
    else if (mUser.State.QueuePosition == mSession.Queue.length) {
    }
}
function nextMedia() {
    mUser.State.Time = 0;
    var queue = mSession.Queue;
    if (mUser.State.QueuePosition + 1 < queue.length) {
        mUser.State.QueuePosition = mUser.State.QueuePosition + 1;
    }
    else if (mUser.State.QueuePosition >= 0) {
        mUser.State.QueuePosition = queue.length;
    }
    userStateChange();
}
function onBtnPause() {
    mPlayer.pause();
}
function onBtnPlay() {
    mPlayer.play();
}
function previousMedia() {
    mUser.State.Time = 0;
    var queue = mSession.Queue;
    if (mUser.State.QueuePosition > 0) {
        mUser.State.QueuePosition = mUser.State.QueuePosition - 1;
        userStateChange();
    }
}
//==================================================================
// These functions are called directly embedded into the html... kinda weird
//==================================================================
function requestSyncWithUser(userId) {
    console.log('request sync with user');
    var user = new Contracts_1.MyUser();
    user.Id = userId;
    var message = new Contracts_1.WsMessage();
    message.Action = 'RequestSyncWithUser';
    message.User = user;
    mSocket.emit(message);
}
function queueSelectedVideo(elmnt) {
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
    media.UserId = mUser.Id;
    media.UserName = mUser.Name;
    var message = new Contracts_1.WsMessage();
    message.Action = 'AddMediaToSession';
    message.Media = media;
    //TODO: local add media
    mSocket.emit(message);
}
function deleteMedia(mediaId, position) {
    mSession.Queue.splice(position, 1);
    if (mUser.State.QueuePosition >= position) {
        mUser.State.QueuePosition -= 1;
        userStateChange();
    }
    mUI.updateQueue(mSession.Queue, mUser.Id, mUser.State.QueuePosition);
    var mediaToDelete = new Contracts_1.Media();
    mediaToDelete.Id = mediaId;
    var message = new Contracts_1.WsMessage();
    message.Action = 'DeleteMediaFromSession';
    message.Media = mediaToDelete;
    mSocket.emit(message);
}
//# sourceMappingURL=Room.js.map