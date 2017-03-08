function onYouTubeIframeAPIReady() {
	var player = new YT.Player('div_player', {
        height: '100%',
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

function onPlayerReady() { }

function onPlayerStateChange() { }
