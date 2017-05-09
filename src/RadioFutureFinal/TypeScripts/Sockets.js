"use strict";
var MySocket = (function () {
    function MySocket(clientActions) {
        this.clientActions = clientActions;
        var uri = "ws://" + window.location.host + "/ws";
        var socket = new WebSocket(uri);
        socket.onopen = function (event) { };
        socket.onclose = function (event) { };
        socket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            var action = message.action;
            if (clientActions[action]) {
                clientActions[action](message);
            }
            else {
                throw new Error("bad client action");
            }
        };
        socket.onerror = function (event) {
            $(".div_everything").hide();
            $("#div_error").show();
        };
        this.socket = socket;
    }
    MySocket.prototype.emit = function (data) {
        var _this = this;
        if (this.socket.readyState === this.socket.CONNECTING) {
            setTimeout(function () {
                _this.emit(data);
            }, 50);
            return;
        }
        else {
            var jsonString = JSON.stringify(data);
            this.socket.send(jsonString);
        }
    };
    ;
    // TODO: fancy way to generalize these functions
    MySocket.prototype.JoinSession = function (sessionName) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName
        };
        this.emit(data);
    };
    MySocket.prototype.AddMediaToSession = function (media) {
        var data = {
            action: 'AddMediaToSession',
            media: media
        };
        this.emit(data);
    };
    MySocket.prototype.DeleteMediaFromSession = function (mediaId) {
        this.DeleteMediaFromSession.toString();
        var data = {
            action: 'DeleteMediaFromSession',
            mediaId: mediaId
        };
        this.emit(data);
    };
    MySocket.prototype.ChatMessage = function (chatMessage, userName) {
        var data = {
            action: 'ChatMessage',
            chatMessage: chatMessage,
            userName: userName
        };
        this.emit(data);
    };
    MySocket.prototype.RequestSyncWithUser = function (userIdRequestee) {
        var data = {
            action: 'RequestSyncWithUser',
            userIdRequestee: userIdRequestee
        };
        this.emit(data);
    };
    MySocket.prototype.ProvideSyncToUser = function (userState, userIdRequestor) {
        var data = {
            action: 'ProvideSyncToUser',
            userIdRequestor: userIdRequestor,
            userState: userState
        };
        this.emit(data);
    };
    MySocket.prototype.Search = function (query, page) {
        var data = {
            action: 'Search',
            query: query,
            page: page
        };
        this.emit(data);
    };
    MySocket.prototype.FbLogin = function (oldUserId, fbUserId) {
        var data = {
            action: "FbLogin",
            oldUserId: oldUserId,
            fbUserId: fbUserId
        };
        this.emit(data);
    };
    return MySocket;
}());
exports.MySocket = MySocket;
//# sourceMappingURL=Sockets.js.map