import { Media } from "./Contracts";
import { ISearcher } from "./ISearcher";

declare function require(name: string);

export class PodcastSearcher implements ISearcher {

    audiosearch: any;

    constructor() {

    }

    init(secret: string, appId = null) {
        var Audiosearch = require('../wwwroot/js/audiosearch.js');
        this.audiosearch = new Audiosearch(appId, secret);
    }

    search(query: string, callback: (media: Media[]) => void) {
        this.audiosearch.searchEpisodes('radiolab').then(function (results) {
            // do stuff here.
            console.log(results);
        });
    }
}