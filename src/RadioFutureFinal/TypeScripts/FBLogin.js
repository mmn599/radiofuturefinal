"use strict";
var FBLogin = (function () {
    function FBLogin(statusChangedFunc) {
        var _this = this;
        this.fbAsyncInit = function () {
            exports.FB.init({
                appId: '643410912518421',
                cookie: true,
                xfbml: true,
                version: 'v2.8'
            });
            exports.FB.AppEvents.logPageView();
            exports.FB.getLoginStatus(function (response) {
                this.statusChangedFunc(response);
            });
        };
        window.fbAsyncInit = this.fbAsyncInit;
        this.statusChangedFunc = statusChangedFunc;
        window.checkLoginState = exports.FB.getLoginStatus(function (response) {
            _this.statusChangedFunc(response);
        });
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
    return FBLogin;
}());
exports.FBLogin = FBLogin;
//# sourceMappingURL=FBLogin.js.map