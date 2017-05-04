import { UserState, Session, MyUser, Media } from "./Contracts";

export interface ClientActions {
    clientSessionReady: (session: Session, user: MyUser) => void;
    clientUpdateUsersList: (users: MyUser[]) => void;
    clientUpdateQueue: (queue: Media[]) => void;
    clientChatMessage: (message: string, userName: string) => void;
    clientRequestUserState: (userIdRequestor: number) => void;
    clientProvideUserState: (userState: UserState) => void;
    clientSearchResults: (searchResults: Media[]) => void;
}

export interface ServerActions {
    JoinSession(sessionName: string) : void;
    AddMediaToSession(media: Media) : void;
    DeleteMediaFromSession(mediaId: number) : void;
    SaveUserNameChange(userId: number, newName: string) : void;
    ChatMessage(chatMessage: string, userName: string) : void;
    RequestSyncWithUser(userIdRequestee: number) : void;
    ProvideSyncToUser(userState: UserState, userIdRequestor: number) : void;
    Search(query: string, page: number) : void;
}

export class MySocket implements ServerActions {

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

    private emit(data) {
        if (this.socket.readyState === this.socket.CONNECTING) {
            setTimeout(() => {
                this.emit(data);
            }, 50);
            return;
        }
        this.socket.send(JSON.stringify(data));
    };

    // TODO: maybe move

    public JoinSession(sessionName: string) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName;
        }
        this.emit(data);
    }

    public AddMediaToSession(media: Media) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName;
        }
        this.emit(data);
    }

    public DeleteMediaFromSession(mediaId: number) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName;
        }
        this.emit(data);
    }

    public SaveUserNameChange(userId: number, newName: string) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName;
        }
        this.emit(data);

        
        
    }

    public ChatMessage(chatMessage: string, userName: string) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName;
        }
        this.emit(data);

    }

    public RequestSyncWithUser(userIdRequestee: number) {

    }

    public ProvideSyncToUser(userState: UserState, userIdRequestor: number) {

    }

    public Search(query: string, page: number) {

    }


}
