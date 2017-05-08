$(document).ready(function () {
    $("#txt_group_join").keypress(function (e) {
        if (e.which === 13) {
            $(".wrapper").fadeOut(700, function () {
                window.location.href = "/rooms/" + $("#txt_group_join").val();
            });
        }
    });
    window.fbAsyncInit = fbAsyncInit;
    window.checkLoginState = checkLoginState;
    loadFacebookSDK();
});
function checkLoginState() {
    FB.getLoginStatus(function (response) {
        fbStatusChangedCallback(response);
    });
}
function loadFacebookSDK() {
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
}
function fbAsyncInit() {
    FB.init({
        appId: '643410912518421',
        cookie: true,
        xfbml: true,
        version: 'v2.8'
    });
    FB.AppEvents.logPageView();
    FB.getLoginStatus(function (response) {
        fbStatusChangedCallback(response);
    });
}
function fbStatusChangedCallback(response) {
    if (response.status === "connected") {
        $("#id_fb_login_btn").hide();
        var fbUserId = response.authResponse.userID;
        var url = window.location.hostname + ("/fbusers/" + fbUserId);
        $.get(url, function (data) {
            alert("Data Loaded: " + data);
        });
    }
}
//# sourceMappingURL=Homepage.js.map