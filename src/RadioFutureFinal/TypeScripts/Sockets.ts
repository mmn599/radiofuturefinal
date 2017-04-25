import { WsMessage } from "./Contracts";

export class MySocket {

    private socket: WebSocket;
    private response_functions: { [action: string]: (data: any) => void };

    constructor(response_functions: { [action: string]: (message: WsMessage) => void }) {
        this.response_functions = response_functions;
        var uri = "ws://" + window.location.host + "/ws";
        var socket = new WebSocket(uri);
        socket.onopen = function (event) {};
        socket.onclose = function (event) {};
        socket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            var action = message.Action;
            var responsefunc = response_functions[action];
            // TODO: exception when not found
            responsefunc(message);
        };
        socket.onerror = function (event) {};
        this.socket = socket;
    }

    public emit(message: WsMessage) {
        if (this.socket.readyState === this.socket.CONNECTING) {
            setTimeout(() => {
                this.emit(message);
            }, 100);
            return;
        }
        this.socket.send(JSON.stringify(message));
    };

}
