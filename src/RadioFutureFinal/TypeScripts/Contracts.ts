export class Media {
    Id: number;
    UserId: number;
    UserName: string;
    YTVideoID: number;
    MP3Source: string;
    OGGSource: string;
    Title: string;
    ThumbURL: string;
    Description: string;
    Show: string;
}

export class MyUser {

    constructor() {
        this.State = new UserState();
    }

    Id: number;
    Name: string;
    State: UserState;
    Temporary: boolean;
    Sessions: Session[];
}

export class UserState {

    constructor() {
        this.Time = 0;
        this.QueuePosition = -1;
        this.PlayerState = 0;
    }

    Time: number;
    QueuePosition: number;
    PlayerState: number;
}

export class Session {
    Id: number;
    Name: string;
    Users: MyUser[];
    Queue: Media[];
}