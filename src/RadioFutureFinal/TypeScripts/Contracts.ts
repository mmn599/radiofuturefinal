export class Media {
    Id: number;
    UserId: number;
    UserName: string;
    YTVideoID: number;
    VideoTitle: string;
    ThumbURL: string;
}

export class MyUser {
    Id: number;
    Name: string;
    State: UserState;
}

export class UserState {
    Time: number;
    QueuePosition: number;
    YTPlayerState: number;
    Waiting: boolean;
}

export class Session {
    Id: number;
    Name: string;
    Users: MyUser[];
    Queue: Media[];
}

export class WsMessage {
    Action: string;
    Session: Session;
    Media: Media;
    User: MyUser;
    ChatMessage: string;
}