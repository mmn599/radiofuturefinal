(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        console.log(response.authResponse.userID);
    }
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJUeXBlU2NyaXB0cy9Ib21lcGFnZS9Ib21lcGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0VBLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFFakIsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVMsQ0FBQztRQUN2QyxFQUFFLENBQUEsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMvRCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7SUFDRixDQUFDLENBQUMsQ0FBQztJQUNNLE1BQU8sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2xDLE1BQU8sQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQ2hELGVBQWUsRUFBRSxDQUFDO0FBRXRCLENBQUMsQ0FBQyxDQUFDO0FBRUg7SUFDSSxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsUUFBUTtRQUNoQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRDtJQUNJLENBQUMsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDZCxJQUFJLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUEsTUFBTSxDQUFDO1FBQUEsQ0FBQztRQUNuQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3BDLEVBQUUsQ0FBQyxHQUFHLEdBQUcscUNBQXFDLENBQUM7UUFDL0MsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBRUQ7SUFDSSxFQUFFLENBQUMsSUFBSSxDQUFDO1FBQ0osS0FBSyxFQUFFLGlCQUFpQjtRQUN4QixNQUFNLEVBQUUsSUFBSTtRQUNaLEtBQUssRUFBRSxJQUFJO1FBQ1gsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQyxDQUFDO0lBQ0gsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUMzQixFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsUUFBUTtRQUNoQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxpQ0FBaUMsUUFBUTtJQUNyQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlDLENBQUM7QUFDTCxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImRlY2xhcmUgdmFyIEZCOiBhbnk7XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xyXG5cclxuXHQkKFwiI3R4dF9ncm91cF9qb2luXCIpLmtleXByZXNzKGZ1bmN0aW9uKGUpIHtcclxuXHRcdGlmKGUud2hpY2g9PT0xMykge1xyXG5cdFx0XHQkKFwiLndyYXBwZXJcIikuZmFkZU91dCg3MDAsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvcm9vbXMvXCIgKyAkKFwiI3R4dF9ncm91cF9qb2luXCIpLnZhbCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9KTtcclxuICAgICg8YW55PndpbmRvdykuZmJBc3luY0luaXQgPSBmYkFzeW5jSW5pdDtcclxuICAgICg8YW55PndpbmRvdykuY2hlY2tMb2dpblN0YXRlID0gY2hlY2tMb2dpblN0YXRlO1xyXG4gICAgbG9hZEZhY2Vib29rU0RLKCk7XHJcblxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGNoZWNrTG9naW5TdGF0ZSgpIHtcclxuICAgIEZCLmdldExvZ2luU3RhdHVzKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgIGZiU3RhdHVzQ2hhbmdlZENhbGxiYWNrKHJlc3BvbnNlKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsb2FkRmFjZWJvb2tTREsoKSB7XHJcbiAgICAoZnVuY3Rpb24oZCwgcywgaWQpe1xyXG4gICAgICAgIHZhciBqcywgZmpzID0gZC5nZXRFbGVtZW50c0J5VGFnTmFtZShzKVswXTtcclxuICAgICAgICBpZiAoZC5nZXRFbGVtZW50QnlJZChpZCkpIHtyZXR1cm47fVxyXG4gICAgICAgIGpzID0gZC5jcmVhdGVFbGVtZW50KHMpOyBqcy5pZCA9IGlkO1xyXG4gICAgICAgIGpzLnNyYyA9IFwiLy9jb25uZWN0LmZhY2Vib29rLm5ldC9lbl9VUy9zZGsuanNcIjtcclxuICAgICAgICBmanMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoanMsIGZqcyk7XHJcbiAgICB9KGRvY3VtZW50LCAnc2NyaXB0JywgJ2ZhY2Vib29rLWpzc2RrJykpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmYkFzeW5jSW5pdCgpIHtcclxuICAgIEZCLmluaXQoe1xyXG4gICAgICAgIGFwcElkOiAnNjQzNDEwOTEyNTE4NDIxJyxcclxuICAgICAgICBjb29raWU6IHRydWUsXHJcbiAgICAgICAgeGZibWw6IHRydWUsXHJcbiAgICAgICAgdmVyc2lvbjogJ3YyLjgnXHJcbiAgICB9KTtcclxuICAgIEZCLkFwcEV2ZW50cy5sb2dQYWdlVmlldygpO1xyXG4gICAgRkIuZ2V0TG9naW5TdGF0dXMoZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgZmJTdGF0dXNDaGFuZ2VkQ2FsbGJhY2socmVzcG9uc2UpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZiU3RhdHVzQ2hhbmdlZENhbGxiYWNrKHJlc3BvbnNlKSB7XHJcbiAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSBcImNvbm5lY3RlZFwiKSB7XHJcbiAgICAgICAgJChcIiNpZF9mYl9sb2dpbl9idG5cIikuaGlkZSgpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlLmF1dGhSZXNwb25zZS51c2VySUQpO1xyXG4gICAgfVxyXG59XHJcblxyXG4iXX0=
