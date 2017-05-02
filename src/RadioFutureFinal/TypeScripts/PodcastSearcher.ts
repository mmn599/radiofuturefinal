import { Media } from "./Contracts";
import { ISearcher } from "./ISearcher";

declare function require(name: string);

export class PodcastSearcher implements ISearcher {

    audiosearch: any;

    init(secret: string, appId = null) {
        var Audiosearch = require('audiosearch-client-node');
        this.audiosearch = new Audiosearch(appId, secret);
    }

    search(query: string, callback: (media: Media[]) => void) {
        this.audiosearch.searchEpisodes('radiolab').then(function (results) {
            console.log(results);
        });
    }
}