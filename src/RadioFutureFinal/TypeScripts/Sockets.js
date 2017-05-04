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
            var action = message.Action;
            if (clientActions[action]) {
                clientActions[action](message);
            }
            else {
                throw new Error("bad client action");
            }
        };
        socket.onerror = function (event) {
            // TODO: handle
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
        this.socket.send(JSON.stringify(data));
    };
    ;
    // TODO: maybe move
    MySocket.prototype.JoinSession = function (sessionName) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName
        };
        this.emit(data);
    };
    MySocket.prototype.AddMediaToSession = function (media) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName
        };
        this.emit(data);
    };
    MySocket.prototype.DeleteMediaFromSession = function (mediaId) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName
        };
        this.emit(data);
    };
    MySocket.prototype.SaveUserNameChange = function (userId, newName) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName
        };
        this.emit(data);
    };
    MySocket.prototype.ChatMessage = function (chatMessage, userName) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName
        };
        this.emit(data);
    };
    MySocket.prototype.RequestSyncWithUser = function (userIdRequestee) {
    };
    MySocket.prototype.ProvideSyncToUser = function (userState, userIdRequestor) {
    };
    MySocket.prototype.Search = function (query, page) {
    };
    return MySocket;
}());
exports.MySocket = MySocket;
//# sourceMappingURL=Sockets.js.map