import { Media } from "./Contracts";
import { ISearcher } from "./ISearcher";

declare var gapi: any;

export class YtSearcher implements ISearcher {

    ready: boolean;

    constructor(key: string) {
        this.ready = false;
        this.init(key);
    }

    init(secret: string, appId = null) {
        if (gapi && gapi.client && gapi.client.setApiKey && gapi.client.load) {
            gapi.client.setApiKey(secret);
            gapi.client.load("youtube", "v3", function () { });
            this.ready = true;
        } 
        else {
            setTimeout(() => { this.init(secret) }, 50);
        }
    }

    // better way to check for ready
    search(query: string, callback: (media: Media[]) => void) {
        if (this.ready) {
            var request = gapi.client.youtube.search.list({
                part: "snippet",
                type: "video",
                q: encodeURIComponent(query).replace(/%20/g, "+"),
                maxResults: 5
            });
            request.execute((results) => {
                var items = results.items;
                var medias = [];
                for (var i = 0; i < items.length; i++) {
                    var result = items[i];
                    var media = new Media();
                    media.YTVideoID = result.id.videoId;
                    media.ThumbURL = result.snippet.thumbnails.medium.url;
                    media.Title = result.snippet.title;
                    medias.push(media);
                }
                callback(medias);
            });
        }
        else {
            setTimeout(() => { this.search(query, callback) }, 50);
        }
        
    }
}