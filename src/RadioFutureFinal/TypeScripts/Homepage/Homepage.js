"use strict";
var FBLogin_1 = require("../FBLogin");
$(document).ready(function () {
    $("#txt_group_join").keypress(function (e) {
        if (e.which === 13) {
            $(".wrapper").fadeOut(700, function () {
                window.location.href = "/rooms/" + $("#txt_group_join").val();
            });
        }
    });
    var facebookLogin = new FBLogin_1.FBLogin(fbStatusChangedCallback);
});
function fbStatusChangedCallback(response) {
    if (response.status === "connected") {
        console.log(response);
        // $("#id_fb_login_btn").hide();
        var fbUserId = response.authResponse.userID;
        var url = "/fbusers/" + fbUserId;
        $.get(url, function (data) {
            var myUser = data;
            console.log(myUser);
        });
    }
    else {
    }
}
//# sourceMappingURL=Homepage.js.map