$(document).ready(function(){

	$("#txt_group_join").keypress(function(e) {
		if(e.which===13) {
			$(".wrapper").fadeOut(700, function() {
				window.location.href = "/rooms/youtube/" + $("#txt_group_join").val();
			});
		}
	});

});

