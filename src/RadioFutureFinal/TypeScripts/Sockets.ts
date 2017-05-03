import { WsMessage } from "./Contracts";

export interface ClientActions {

    clientSessionReady: (message: WsMessage) => void;
    clientUpdateUsersList: (message: WsMessage) => void;
    clientUpdateQueue: (message: WsMessage) => void;
    clientChatMessage: (message: WsMessage) => void;
    clientRequestUserState: (message: WsMessage) => void;
    clientProvideUserState: (message: WsMessage) => void;
    clientSearchResults: (message: WsMessage) => void;

}

export class MySocket {

    private socket: WebSocket;
    private clientActions: ClientActions;

    constructor(clientActions: ClientActions) {

        this.clientActions = clientActions;

        var uri = "ws://" + window.location.host + "/ws";
        var socket = new WebSocket(uri);
        socket.onopen = function (event) {};
        socket.onclose = function (event) {};

        socket.onmessage = (event) => {
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

    public emit(message: WsMessage) {
        if (this.socket.readyState === this.socket.CONNECTING) {
            setTimeout(() => {
                this.emit(message);
            }, 50);
            return;
        }
        this.socket.send(JSON.stringify(message));
    };

}
