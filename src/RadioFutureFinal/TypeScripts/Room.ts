﻿//TODO: All this code is miserably awful. At some point it should be completely reworked.

var COLOR_LIST = ["red", "orange", "yellow", "green", "blue", "violet"];

import { MyUser, Media, Session, UserState, WsMessage } from "./Contracts";
import { Callbacks, UI } from "./ui";
import { MySocket } from "./Sockets"
import { Player } from "./Player"

declare var mobileBrowser: boolean;
declare var gapi: any;

var mMeUser: MyUser;
var mSession: Session;
var mUI: UI;
var mPlayer: Player;
var mSocket;

$(document).ready(function () {
    mUI = new UI(mobileBrowser, mCallbacks);
    mPlayer = new Player(mobileBrowser);
    mSocket = new MySocket(mMessageFunctions);
    setupJamSession();
});


//==================================================================
// Functions automatically called when youtube api's are ready
//==================================================================
function onYouTubeIframeAPIReady() {
    mPlayer.initializeYtPlayer(onPlayerStateChange);
}

function youtubeAPIInit() {
	gapi.client.setApiKey("AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc");
	gapi.client.load("youtube", "v3", function() {});
}

function onPlayerStateChange(event) {
    if(event.data==0) {
    	nextVideoInQueue();
    }
}

//==================================================================
// Backend video and queue control functions
//==================================================================
function deleteVideoInQueue(QueuePosition: number) {
	var id = mSession.Queue[QueuePosition].Id;
	mSession.Queue.splice(QueuePosition, 1);

    mUI.updateQueue(mSession.Queue, mMeUser.State.QueuePosition + 1);

    var message: WsMessage;
    var mediaToDelete: Media;
    mediaToDelete.Id = id;
    message.Action = 'DeleteMediaFromSession';
    message.Media = mediaToDelete;
    mSocket.emit('DeleteMediaFromSession', message);
}


function requestSyncWithUser(userId) {
    console.log('request sync with user');
    mSocket.emit('RequestSyncWithUser', { User: { Id: userId } });
}

//==================================================================
// WebSocket message response functions
//==================================================================

var mMessageFunctions = {
    'updateUser': onUpdateMeUser,
    'sessionReady': onSessionReady,
    'updateUsersList': onUpdateUsersList,
    'updateQueue': onUpdateQueue,
    'chatMessage': onReceivedChatMessage,
    'requestUserState': onRequestMyUserState,
    'provideUserState': onUserStateProvided
}

function onUserStateProvided(message: WsMessage) {
    var userToSyncWith = message.User;
    mMeUser.State.QueuePosition = userToSyncWith.State.QueuePosition;
    mMeUser.State.Time = userToSyncWith.State.Time;
    mMeUser.State.YTPlayerState = userToSyncWith.State.YTPlayerState;
    mUI.updateQueue(mSession.Queue, mMeUser.State.QueuePosition + 1);
    mPlayer.setPlayerContent(mSession.Queue, mMeUser.State);
}

function onRequestMyUserState(message: WsMessage) {
    var userData: MyUser;
    userData.Id = message.User.Id; // TODO: bad bad bad
    userData.State.QueuePosition = mMeUser.State.QueuePosition;
    userData.State.Time = Math.round(mPlayer.getCurrentTime());
    userData.State.YTPlayerState = mPlayer.getCurrentState();
    mSocket.emit('ProvideSyncToUser', { User: userData }); 
}


function onUpdateMeUser(message: WsMessage) {
    var user = message.User;
    mMeUser = user;	
}

function onSessionReady(message: WsMessage) {
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

function onUpdateUsersList(message: WsMessage) {
    var users = message.Session.Users;
    mSession.Users = users;
    mUI.updateUsersList(mSession.Users, mMeUser.Id);	
}

function onUpdateQueue(message: WsMessage) {
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

    var message: WsMessage;
    message.Action = 'UserJoinSession';
    message.User = mMeUser;
    message.Session = mSession;

	mSocket.emit(message);
}

var mCallbacks: Callbacks;
mCallbacks.onSendChatMessage = sendChatMessage;
mCallbacks.nameChange = saveUserNameChange;
mCallbacks.nextMedia = nextVideoInQueue;
mCallbacks.pauseMedia = pauseVideo;
mCallbacks.playMedia = playVideo;
mCallbacks.previousMedia = previousVideoInQueue;
mCallbacks.search = searchVideos;

function sendChatMessage(msg: string) {
    var message: WsMessage;
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
    var message: WsMessage;
    message.User = mMeUser;
    message.Action = 'SaveUserNameChange';
    mSocket.emit(message);
}

function nextVideoInQueue() {
    mMeUser.State.Time = 0;
    var queue = mSession.Queue;
	if((mMeUser.State.QueuePosition+1)<queue.length) {
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
	if(mMeUser.State.QueuePosition > 0) {
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
    var media: Media;
    media.VideoTitle = Title;
    media.VideoTitle = VideoId;
    media.ThumbURL = ThumbURL;
    media.UserId = mMeUser.Id;
    media.UserName = mMeUser.Name;
    var message: WsMessage;
    message.Action = 'AddMediaToSession';
    message.Media = media;
    //TODO: local add media
    mSocket.emit(media);
}






