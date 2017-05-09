﻿export var FB: any;

export class FBLogin {

    statusChangedFunc: any;
    checkStateFunc: any;

    constructor(statusChangedFunc: any) {
        (<any>window).fbAsyncInit = function() {
            var fbsdk = (<any>window).FB;
            fbsdk.init({
                appId: '643410912518421',
                cookie: true,
                xfbml: true,
                version: 'v2.8'
            });
            fbsdk.AppEvents.logPageView();
            fbsdk.getLoginStatus((response) => {
                statusChangedFunc(response);
            });
            (<any>window).checkLoginState = () => {
                fbsdk.getLoginStatus((response) => {
                    statusChangedFunc(response);
                })
            };
        };
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

}