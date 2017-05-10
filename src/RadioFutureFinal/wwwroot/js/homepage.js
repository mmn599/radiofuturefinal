$(document).ready(function(){

	$("#txt_group_join").keypress(function(e) {
        if (e.which === 13) {
            goToPlaylist();
		}
	});

    $("#btn_go").click(goToPlaylist);

    function goToPlaylist() {

            var playlistName = $("#txt_group_join").val();
            var valid = validPlaylistName(playlistName);

            if (!valid) {
                $("#txt_group_join").attr("placeholder", "don't use special characters");
                $("#txt_group_join").val("");
            }
            else {
                $(".wrapper").fadeOut(700, function() {
                    window.location.href = "/rooms/" + playlistName;
                });
            }

    }

    function validPlaylistName(playlistName) {
        console.log('yeet');
        return /^[a-z0-9!?. ]+$/i.test(playlistName);
    }

});

