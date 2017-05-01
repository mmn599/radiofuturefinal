import { Media } from "./Contracts";

export interface ISearcher {
    init(secret: string, appId?: string);
    search(query: string, callback: (media: Media[]) => void);
}