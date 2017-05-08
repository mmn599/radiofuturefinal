import { MyUser } from "../Contracts"
import { FBLogin } from "../FBLogin"

$(document).ready(function(){
	$("#txt_group_join").keypress(function(e) {
		if(e.which===13) {
			$(".wrapper").fadeOut(700, function() {
				window.location.href = "/rooms/" + $("#txt_group_join").val();
			});
		}
	});

    var facebookLogin = new FBLogin(fbStatusChangedCallback);
});

function fbStatusChangedCallback(response) {
    if (response.status === "connected") {
        $("#id_fb_login_btn").hide();
        var fbUserId = response.authResponse.userID;
        var url = `/fbusers/${fbUserId}`;
        $.get(url, function (data) {
            console.log(data);
            var myUser = <MyUser>data;
            console.log(myUser);
        });
    }
    // TODO: handle
    else {
       
    }
}

