export class Media {
    id: number;
    mp3Source: string;
    oggSource: string;
    title: string;
    thumbURL: string;
    description: string;
    Show: string;
}

export class Session {
    id: number;
    name: string;
    queue: Media[];
    hits: number;
}