export interface Media {
    Id: number;
    UserId: number;
    UserName: string;
    YTVideoID: number;
    VideoTitle: string;
    ThumbURL: string;
}

export interface MyUser {
    Id: number;
    Name: string;
    State: UserState;
}

export interface UserState {
    Time: number;
    QueuePosition: number;
    YTPlayerState: number;
    Waiting: boolean;
}

export interface Session {
    Id: number;
    Name: string;
    Users: MyUser[];
    Queue: Media[];
}

export interface WsMessage {
    Action: string;
    Session: Session;
    Media: Media;
    User: MyUser;
    ChatMessage: string;
}