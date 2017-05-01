export class Media {
    Id: number;
    UserId: number;
    UserName: string;
    YTVideoID: number;
    MP3Source: string;
    OGGSource: string;
    Title: string;
    ThumbURL: string;
}

export class MyUser {

    constructor() {
        this.State = new UserState();
    }

    Id: number;
    Name: string;
    State: UserState;
}

export class UserState {

    constructor() {
        this.Time = 0;
        this.QueuePosition = -1;
        this.YTPlayerState = 0;
        this.Waiting = false;
    }

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