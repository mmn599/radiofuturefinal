window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

$(document).ready(function(){

    console.log('document is ready');
	var pathname = window.location.pathname;
	var roomName = null;
	if(pathname.indexOf('\/rooms\/')>-1) {
		roomName = pathname.replace('\/rooms/', '');
	}

	mGlobals.ui.div_loading = $("#div_loading");
	mGlobals.ui.div_everything = $("#div_everything");

	var opts = {
	  lines: 13 // The number of lines to draw
	, length: 28 // The length of each line
	, width: 14 // The line thickness
	, radius: 42 // The radius of the inner circle
	, scale: 1 // Scales overall size of the spinner
	, corners: 1 // Corner roundness (0..1)
	, color: '#000' // #rgb or #rrggbb or array of colors
	, opacity: 0.25 // Opacity of the lines
	, rotate: 0 // The rotation offset
	, direction: 1 // 1: clockwise, -1: counterclockwise
	, speed: 1 // Rounds per second
	, trail: 60 // Afterglow percentage
	, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
	, zIndex: 2e9 // The z-index (defaults to 2000000000)
	, className: 'spinner' // The CSS class to assign to the spinner
	, top: '50%' // Top position relative to parent
	, left: '50%' // Left position relative to parent
	, shadow: false // Whether to render a shadow
	, hwaccel: false // Whether to use hardware acceleration
	, position: 'absolute' // Element positioning
	}
	var target = document.getElementById('div_loading');
	mGlobals.ui.spinner = new Spinner(opts).spin(target);

	mGlobals.ui.input_search = $("#input_search");
	mGlobals.ui.input_name = $("#name_input");
	mGlobals.ui.input_chat = $("#chat_input");
	mGlobals.ui.ul_chat = $("#ul_chat");
	mGlobals.ui.div_search_results = $("#div_search_results");

	mGlobals.ui.input_search.bind("propertychange input paste", function(event) {
		searchTextChanged($("#input_search").val());
	});

	mGlobals.ui.input_search.keypress(function(e) {
		if(e.which==13) {
			searchEnterPressed(mGlobals.ui.input_search);
		}
	});

	mGlobals.ui.input_name.keypress(function(e) {
		if(e.which==13) {
			UserNameChange(mGlobals.ui.input_name);
		}	
	})

	mGlobals.ui.input_chat.keypress(function(e) {
		if(e.which==13) {
			sendChatMessage(mGlobals.ui.input_chat);
		}	
	})

	document.body.addEventListener('click', function() {
		mGlobals.ui.div_search_results.fadeOut();
		if(mGlobals.input_search) {
			mGlobals.input_search.val("");
		}
	}, true); 
	/*
	$("#txt_email").keypress(function(e) {
		if(e.which==13) {
			emailQueue();
		}
	});
	*/
	$('.drawer').drawer();

});


//==================================================================
// Global variables
//==================================================================
var mConstants = {
	"PLAYING" : 1,
	"PAUSED" : 2
};

var mGlobals = {
	sessionInitialized : false,
	player_ready : false,
	url_room : null,
	youtube_api_ready : false,
	entered_jam : false,
	player : {},
	user : {},
	session : {},
	queue : [],
	current_users : [],
	ui : {}
};

//==================================================================
// UI Functions
//==================================================================

function searchTextChanged(text) {
	var divResults = $("#div_search_results");
	if(text.length==0) {
		divResults.fadeOut();
	}
}

function searchEnterPressed(input_search) {
	var divResults = $("#div_search_results");
	divResults.html("");
	searchVideos(input_search.val(), function(response) {
		$.each(response.items, function(index, item) {
		divResults.html(divResults.html() + "<div class='div_search_result' onClick='queueSelectedVideo(this)' data-VideoId='" + item.id.videoId + "' data-ThumbURL='"+item.snippet.thumbnails.medium.url+"'>" + '<p class="text_search_result">' +  item.snippet.title+ '</p></div>' );
	});
	});
	if(!divResults.is(':visible')) {
		divResults.fadeIn();
	}
}

function sessionReadyUI() {
	mGlobals.ui.div_loading.hide();
	mGlobals.ui.spinner.stop();
	mGlobals.ui.div_everything.animate({opacity: 1}, 'fast');
} 

function onPlayerReady(event) {
    console.log('player ready!');
	mGlobals.player_ready = true;
	if(mGlobals.youtube_api_ready) {
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

function updateQueueUI(starting_QueuePosition) {
	var queue = mGlobals.queue;
	var i = starting_QueuePosition;
	var j = 0;
	//TODO: make robust
	var end = 5;
	var div_queue = $("#div_footer");
	div_queue.html("");
	while(i<queue.length) {
		var media = queue[i];
		var innertht;
		if((j+1)%5===0) {
			innerht = "<div class='div_content' style='margin-right: 0'><img class='img_queue_item' data-QueuePosition='" + i + "' data-ThumbURL='" + media.ThumbURL + "' onmouseover='queueRollover(this)' onmouseout='queueRolloff(this)' src='" + media.ThumbURL + "'></img></div>";
		}
		else {
			innerht = "<div class='div_content'><img class='img_queue_item' data-QueuePosition='" + i + "' data-ThumbURL='" + media.ThumbURL + "' onmouseover='queueRollover(this)' onmouseout='queueRolloff(this)' src='" + media.ThumbURL + "'></img></div>";

		}
		div_queue.html(div_queue.html() + innerht);
		i++;
		j++;
	}
}

function emailQueue() {
	mGlobals.socket.emit('emailQueue', {email : $("#txt_email").val(), queue : mGlobals.queue});
	$("#txt_email").fadeOut();
}

function updateUsersListUI(users) {
	var usersList = document.getElementById('div_users_list');

	usersList.innerHTML = "";
	var divarr = [];
	for(var i=0;i<users.length;i++) {
		var user = users[i];
		//uses local user data instead of what is currently in the server
		if(user.Id===mGlobals.user.Id) {
			user = mGlobals.user;
		}
		var color = user.color;
		var QueuePosition = user.QueuePosition;
		if(QueuePosition!=-1) {
			current_video_Title = mGlobals.queue[QueuePosition].Title;
		}
		else {
			current_video_Title = "Nothing";
		}

		var div_user = document.createElement('div');
		div_user.style.background = user.color;
		div_user.className = "div_user tooltip";
		div_user.setAttribute('data-username', user.Name);

		var p_user = document.createElement('p');
		p_user.className = "p_user";
		p_user.setAttribute('data-username', user.Name);
		p_user.appendChild(document.createTextNode(user.Name.charAt(0)));

		var span_tooltip = document.createElement('span');
		span_tooltip.className = "tooltiptext";
		span_tooltip.setAttribute('data-username', user.Name);
		span_tooltip.innerHTML = "Click to sync with " + user.Name + "!";

		div_user.appendChild(p_user);
		div_user.appendChild(span_tooltip);
		usersList.appendChild(div_user);

		divarr.push(div_user);
	}
	for(var i=0;i<divarr.length;i++) {
		var mydiv = divarr[i];
		$(mydiv).click(function() {
			var username = event.target.getAttribute('data-username');
			syncWithUser(username);
		});
	}
	/*var usersList = document.getElementById('div_users_list');
	usersList.innerHTML = "";
	for(var i=0;i<users.length;i++) {
		var user = users[i];
		//uses local user data instead of what is currently in the server
		if(user.Id===mGlobals.user.Id) {
			user = mGlobals.user;
		}
		var color = user.color;
		var QueuePosition = user.QueuePosition;
		if(QueuePosition!=-1) {
			current_video_Title = mGlobals.queue[QueuePosition].Title;
		}
		else {
			current_video_Title = "Nothing";
		}
		mGlobals.queue[user.QueuePosition]
		var innerht = '<p class="p_user" style="white-space: nowrap;">' + '<span class="span_user" onclick="syncWithUserUI(this.getAttribute(\'data-username\'))" data-username="' + user.name +'" style="border-bottom:1px solid '+color+'; cursor: pointer;">'+user.name +  '</span>' + '</span><br><br>' + '</p>';//+ ' is listening to ' + '<span style="font-weight: bold;">' + current_video_Title + '</span>' + '</span><br><br>' + '</p>';
		usersList.innerHTML += innerht;
	}*/
}

function setupVideo() {
	if(mGlobals.user.QueuePosition!=-1) {
		var media = mGlobals.queue[mGlobals.user.QueuePosition];
		console.log(media);
		updateQueueUI(mGlobals.user.QueuePosition + 1);
		updatePlayerUI(media.YTVideoID, mGlobals.user.VideoTime, media.UserName, media.Title);		
	}
}

function UserNameChange(name_input) {
	name_input.hide();
	mGlobals.ui.input_chat.fadeIn();
	saveUserNameChange(name_input.val());
}

//==================================================================
// Backend video and queue control functions
//==================================================================
function deleteVideoInQueue(QueuePosition) {
	var id = mGlobals.queue[QueuePosition].Id;
	mGlobals.queue.splice(QueuePosition, 1);
	updateQueueUI(mGlobals.user.QueuePosition + 1);
	var data =  {
        Media : {Id : id}
	};
	mGlobals.socket.emit('deleteMediaFromSession', data);
}

function previousVideoInQueue() {
	mGlobals.user.VideoTime = 0;
	var queue = mGlobals.queue;
	if(mGlobals.user.QueuePosition>0) {
		var QueuePosition = mGlobals.user.QueuePosition = mGlobals.user.QueuePosition - 1;
		setupVideo();
		mGlobals.user.waiting = false;
	}
}

function nextVideoInQueue() {
	mGlobals.user.VideoTime = 0;
	var queue = mGlobals.queue;
	if((mGlobals.user.QueuePosition+1)<queue.length) {
		var QueuePosition = mGlobals.user.QueuePosition = mGlobals.user.QueuePosition + 1;
		setupVideo();
		mGlobals.user.waiting = false;
	}
	else {
		mGlobals.user.waiting = true;
	}
}

function queueSelectedVideo(elmnt) {
	mGlobals.ui.div_search_results.fadeOut();
	mGlobals.ui.input_search.val("");
	var VideoId = elmnt.getAttribute('data-VideoId');
	var Title = elmnt.innerText || element.textContent;
	var ThumbURL = elmnt.getAttribute('data-ThumbURL');
	var media = createMedia(Title, VideoId, ThumbURL, mGlobals.user.Id, mGlobals.user.name);
	var data = {
		Media : media
	};
	//TODO: local add media
	mGlobals.socket.emit('addMediaToSession', data);
}

//==================================================================
// Music Session setup and synchronization functions for session and user objects
// Basically all the hard stuff
//==================================================================

function syncWithUser(username) {
	var myuser = {}
	for(var i=0;i<mGlobals.current_users.length;i++) {
		if(mGlobals.current_users[i].name===username) {
			myuser = mGlobals.current_users[i];
		}
	}
	mGlobals.user.QueuePosition = myuser.QueuePosition;
	mGlobals.user.VideoTime = myuser.VideoTime;
	mGlobals.user.YtPlayerState = myuser.YtPlayerState;
	updateQueueUI(mGlobals.user.QueuePosition + 1);
	setupVideo();
}

function saveUserNameChange(name) {
	mGlobals.user.Name = name;
	for(var i=0;i<mGlobals.current_users;i++) {
		if(mGlobals.user.Id===mGlobals.current_users[i].Id) {
			mGlobals.current_users[i].name = name;
		}
	}
	var data = {
		User : mGlobals.user
	};
	mGlobals.socket.emit('saveUserNameChange', data);
}


function saveUserVideoState() {
	if(mGlobals.player_ready) {
		mGlobals.user.VideoTime = mGlobals.player.getCurrentTime();
		mGlobals.user.YtPlayerState = mGlobals.player.getPlayerState();
		var data = {
            User : mGlobals.user
		}
		mGlobals.socket.emit('saveUserVideoState', data);	
	}
}


function synchronizeUsers() {
    var data = {
        Session: { Id: mGlobals.sessionId }
    };
	mGlobals.socket.emit('synchronizeUsers', data);
}

//==================================================================
// WebSocket message response functions
//==================================================================

function updateUser(data) {
    var user = data.user;
	if(mGlobals.sessionInitialized) {
		mGlobals.user = user;	
	}
}

function sessionReady(data) {
    var session = data.Session;
	mGlobals.sessionId = session.Id;
	mGlobals.queue = session.Queue;
	mGlobals.current_users = session.Users;
    mGlobals.user = data.User;
	saveUserVideoState();
	setInterval(saveUserVideoState, 10000);
	if(mGlobals.queue.length==0) {
		$("#p_current_content_info").text("Queue up a song!");
		$("#p_current_recommender_info").text("Use the search bar above.");
	}
	nextVideoInQueue();
	updateUsersListUI(mGlobals.current_users);
	sessionReadyUI(mGlobals.session.name);
	mGlobals.sessionInitialized = true;
}

function updateUsersList(data) {
    var users = data.Session.Users;
	if(mGlobals.sessionInitialized) {
		mGlobals.current_users = users;
		updateUsersListUI(mGlobals.current_users);	
	}		
}

function updateQueue(data) {
    var queue = data.Session.Queue;
	if(mGlobals.sessionInitialized) {
		mGlobals.queue = queue;
		updateQueueUI(mGlobals.user.QueuePosition + 1);
		if(mGlobals.user.waiting) {
			nextVideoInQueue();
		}
	}
}

function receivedChatMessage(data) {
	var msg = data.ChatMessage;
	var userName = data.User.Name;
	var innerHTML = mGlobals.ui.ul_chat.html() || "";
	// mGlobals.ui.ul_chat.html(innerHTML +'<li><span style="color: '+user.color+'">'+user.name+'</span>'+'<span>'+ ': ' + msg+ '</span></li>');
	mGlobals.ui.ul_chat.html(innerHTML +'<li><span style="color: '+ "Blue" +'">'+ userName +'</span>'+'<span>'+ ': ' + msg+ '</span></li>');
	var children = mGlobals.ui.ul_chat.children();
	if(children.length>10) {
		children[0].remove();
	}
}

var messageFunctions = {
    'updateUser': updateUser,
    'sessionReady': sessionReady,
    'updateUsersList': updateUsersList,
    'updateQueue': updateQueue,
    'clientChatMessage': receivedChatMessage
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
        var data = JSON.parse(event.data);
        var action = data.Action;
        console.log('Received websocket message from server:');
        console.log(data);
        var func = messageFunctions[action];
        messageFunctions[action](data);
    };
    socket.onerror = function (event) {
        console.log("error: " + event.data);
    };
    socket.emit = function (action, data) {
        if (socket.readyState === socket.CONNECTING) {
            setTimeout(function () { socket.emit(action, data) }, 100);
            return;
        }
        console.log('Sending websocket message to server: ' + action);
        var message = {
            action: action,
            session: data.Session,
            media: data.Media,
            user: data.User,
            chatMessage: data.ChatMessage
        }
        console.log(message);
        socket.send(JSON.stringify(message));
    };
    mGlobals.socket = socket;
}

//TODO: synchronize so multiple entry points don't happen
function setupJamSession() {
	if(mGlobals.entered_jam) {
		return;
	}
	else {
		mGlobals.entered_jam = true;
	}

    console.log('setupJamSession');
	var pathname = window.location.pathname;
	var encodedSessionName = null;
	if(pathname.indexOf('\/rooms\/')>-1) {
		encodedSessionName = pathname.replace('\/rooms/', '');
	}

	setupSockets();
	setTimeout(function () { joinJamSession(encodedSessionName) }, 50);
}

function joinJamSession(encodedSessionName) {
	mGlobals.session.name = decodeURI(encodedSessionName);
	mGlobals.user = createTempUser('Anonymous');
	
	var data = {
		User : mGlobals.user,
		Session: { name: encodedSessionName },
	};
	mGlobals.socket.emit('userJoinSession', data);
	// setInterval(synchronizeUsers, 15000);
};

//==================================================================
// Chat functions
//==================================================================
function sendChatMessage(chat_input) {
	if(mGlobals.sessionInitialized) {
	    var data = {
            ChatMessage: chat_input.val(),
            User: { Name: mGlobals.User.Name }
	    }
	    mGlobals.socket.emit('chatMessage', data);
		chat_input.val("");
	}
}

//==================================================================
// Youtube API functions and player UI control
//==================================================================

function youtubeAPIInit() {
	gapi.client.setApiKey("AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc");
	gapi.client.load("youtube", "v3", function() {
	    console.log('youtube api loaded');
		mGlobals.youtube_api_ready = true;
		if(mGlobals.player_ready) {
			setupJamSession();
		}
	});
}

function onYouTubeIframeAPIReady() {
	mGlobals.player = new YT.Player('div_player', {
        height: 'auto',
        width: '100%',
        playerVars: {
        	controls: 0,
        	showinfo: 0,
        	autoplay: 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
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
	if(mGlobals.player_ready) {
		if(state==mConstants.PLAYING) {
			mGlobals.player.playVideo();
		}
		else if(state==mConstants.PAUSED) {
			mGlobals.player.pauseVideo();
		}
	}
}

function onPlayerStateChange(event) {
	//when video ends
    if(event.data==0) {
    	nextVideoInQueue();
    }
}

function updatePlayerUI(current_video, current_VideoTime, current_recommender_name, current_video_Title) {
	if(!mGlobals.player_ready) {
		setTimeout(updatePlayerUI(current_video, current_VideoTime, current_recommender_name), 1000);
	}
	mGlobals.player.loadVideoById(current_video, current_VideoTime, "large");	
    //TODO: Remove
	//mGlobals.player.loadVideoById("Phl82D57P58", 0, "large");
	$("#p_current_content_info").text(current_video_Title);
	$("#p_current_recommender_info").text('Recommended by: ' + current_recommender_name);
	var color = 'black';
	//TODO: shitty
	for(var i=0;i<mGlobals.current_users.length;i++) {
		var user = mGlobals.current_users[i];
		if(user.name===current_recommender_name) {
			color = user.color;
		} 
	}
	synchronizeUsers();
}

//TODO: Fix CamelCase stuff with JSON

//==================================================================
// Basically constructors. Probably a better way to do this.
//==================================================================

function createMedia(Title, VideoId, ThumbURL, UserId, recommender_name) {
    var media = {
        YTVideoId: VideoId,
        Title: Title,
        ThumbURL: ThumbURL,
        UserName: recommender_name,
        UserId: UserId
    };
    return media;
}

function createTempUser(nickname) {
	var user = {};
	user.temp = true;
	user.name = nickname;
	user.QueuePosition = -1;
	user.VideoTime = -1;
	user.YtPlayerState = -1;
	user.color = getRandomColor();
	return user;
}

//==================================================================
// Misc
//==================================================================
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
