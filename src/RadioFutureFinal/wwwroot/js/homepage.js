$(document).ready(function(){

	$("#txt_group_join").keypress(function(e) {
		if(e.which===13) {
			$(".wrapper").fadeOut(700, function() {
				window.location.href = "/rooms/" + $("#txt_group_join").val();
			});
		}
	});

    window.fbAsyncInit = function() {
        FB.init({
            appId: '643410912518421',
            cookie: true,
            xfbml: true,
            version: 'v2.8'
        });
        FB.AppEvents.logPageView();
        FB.getLoginStatus(function (response) {
            statusChangeCallback(response);
        });
     };

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    function statusChangeCallback(response) {
        if (response.status === "connected") {
            $("#id_fb_login_btn").hide();
        }
    }

    window.checkLoginState = checkLoginState;
    function checkLoginState() {
        FB.getLoginStatus(function (response) {
            statusChangeCallback(response);
        });
    }
});
