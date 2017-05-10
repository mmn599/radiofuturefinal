$(document).ready(function(){

	$("#txt_group_join").keypress(function(e) {
        if (e.which === 13) {
            goToPlaylist();
		}
	});

    $("#btn_go").click(goToPlaylist);

    function goToPlaylist() {
        $(".wrapper").fadeOut(700, function() {
            window.location.href = "/rooms/" + $("#txt_group_join").val();
        });
    }

});

