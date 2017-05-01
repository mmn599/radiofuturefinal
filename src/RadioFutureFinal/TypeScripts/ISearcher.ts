import { Media } from "./Contracts";

export interface ISearcher {
    search(query: string, callback: (media: Media[]) => void);
}