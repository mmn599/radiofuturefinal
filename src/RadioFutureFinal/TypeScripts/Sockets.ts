import { UserState, Session, MyUser, Media } from "./Contracts";

export interface ClientActions {
    clientSessionReady: (session: Session, user: MyUser) => void;
    clientUpdateUsersList: (users: MyUser[]) => void;
    clientUpdateQueue: (queue: Media[]) => void;
    clientChatMessage: (message: string, userName: string) => void;
    clientRequestUserState: (userIdRequestor: number) => void;
    clientProvideUserState: (userState: UserState) => void;
    clientSearchResults: (searchResults: Media[]) => void;
    clientUserLoggedIn: (newUserId: number, newUserName: string) => void;
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
    FbLogin(oldUserId: number, fbUserId: number) : void;
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

    private emit(data) {
        if (this.socket.readyState === this.socket.CONNECTING) {
            setTimeout(() => {
                this.emit(data);
            }, 50);
            return;
        }
        else {
            var jsonString = JSON.stringify(data);
            this.socket.send(jsonString);
        }
    };

    // TODO: fancy way to generalize these functions

    public JoinSession(sessionName: string) {
        var data = {
            action: 'JoinSession',
            sessionName: sessionName
        }
        this.emit(data);
    }

    public AddMediaToSession(media: Media) {
        var data = {
            action: 'AddMediaToSession',
            media: media
        }
        this.emit(data);
    }

    public DeleteMediaFromSession(mediaId: number) {
        this.DeleteMediaFromSession.toString();
        var data = {
            action: 'DeleteMediaFromSession',
            mediaId: mediaId
        }
        this.emit(data);
    }

    public SaveUserNameChange(userId: number, newName: string) {
        var data = {
            action: 'SaveUserNameChange',
            userId: userId,
            newName: newName
        }
        this.emit(data);
    }

    public ChatMessage(chatMessage: string, userName: string) {
        var data = {
            action: 'ChatMessage',
            chatMessage: chatMessage,
            userName: userName
        }
        this.emit(data);
    }

    public RequestSyncWithUser(userIdRequestee: number) {
        var data = {
            action: 'RequestSyncWithUser',
            userIdRequestee: userIdRequestee
        }
        this.emit(data);
    }

    public ProvideSyncToUser(userState: UserState, userIdRequestor: number) {
        var data = {
            action: 'ProvideSyncToUser',
            userIdRequestor: userIdRequestor,
            userState: userState
        }
        this.emit(data);
    }

    public Search(query: string, page: number) {
        var data = {
            action: 'Search',
            query: query,
            page: page
        }
        this.emit(data);
    }

    public FbLogin(oldUserId: number, fbUserId: number) {
        var data = {
            action: "FbLogin",
            oldUserId: oldUserId,
            fbUserId: fbUserId
        };
        this.emit(data);
    }


}
