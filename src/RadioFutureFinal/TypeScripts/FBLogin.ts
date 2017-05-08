export var FB: any;

export class FBLogin {

    statusChangedFunc: any;
    checkStateFunc: any;

    constructor(statusChangedFunc) {
        (<any>window).fbAsyncInit = this.fbAsyncInit;
        this.statusChangedFunc = statusChangedFunc;
        (<any>window).checkLoginState = FB.getLoginStatus((response) => {
            this.statusChangedFunc(response);
        });
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

    fbAsyncInit = () => {
        FB.init({
            appId: '643410912518421',
            cookie: true,
            xfbml: true,
            version: 'v2.8'
        });
        FB.AppEvents.logPageView();
        FB.getLoginStatus(function (response) {
            this.statusChangedFunc(response);
        });
    }

}