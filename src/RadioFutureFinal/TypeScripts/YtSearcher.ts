import { Media } from "./Contracts";

declare var gapi: any;

export class YtSearcher {

    constructor(key: string) {
        this.init(key);
    }

    private init(key: string) {
        if (gapi && gapi.client && gapi.client.setApiKey && gapi.client.load) {
            gapi.client.setApiKey("AIzaSyC4A-dsGk-ha_b-eDpbxaVQt5bR7cOUddc");
            gapi.client.load("youtube", "v3", function () { });
        } 
        else {
            setTimeout(() => { this.init(key) }, 50);
        }
    }

    search(query: string, callback: (media: Media[]) => void) {
        var request = gapi.client.youtube.search.list({
            part: "snippet",
            type: "video",
            q: encodeURIComponent(query).replace(/%20/g, "+"),
            maxResults: 5
        });
        request.execute((results) => {
            var medias = [];
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                var media = new Media();
                media.YTVideoID = result.id.videoId;
                media.ThumbURL = result.snippet.thumbnails.medium.url;
                media.Title = result.snippet.title;
                medias.push(media);
            }
            callback(medias);
        });
    }
}