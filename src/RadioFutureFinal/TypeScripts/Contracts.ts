export class Media {
    Id: number;
    MP3Source: string;
    OGGSource: string;
    Title: string;
    ThumbURL: string;
    Description: string;
    Show: string;
}

export class Session {
    Id: number;
    Name: string;
    Queue: Media[];
}