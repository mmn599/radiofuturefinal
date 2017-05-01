"use strict";
var Contracts_1 = require("./Contracts");
var YtSearcher = (function () {
    function YtSearcher(key) {
        this.ready = false;
        this.init(key);
    }
    YtSearcher.prototype.init = function (secret, appId) {
        var _this = this;
        if (appId === void 0) { appId = null; }
        if (gapi && gapi.client && gapi.client.setApiKey && gapi.client.load) {
            gapi.client.setApiKey(secret);
            gapi.client.load("youtube", "v3", function () { });
            this.ready = true;
        }
        else {
            setTimeout(function () { _this.init(secret); }, 50);
        }
    };
    // better way to check for ready
    YtSearcher.prototype.search = function (query, callback) {
        var _this = this;
        if (this.ready) {
            var request = gapi.client.youtube.search.list({
                part: "snippet",
                type: "video",
                q: encodeURIComponent(query).replace(/%20/g, "+"),
                maxResults: 5
            });
            request.execute(function (results) {
                var medias = [];
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    var media = new Contracts_1.Media();
                    media.YTVideoID = result.id.videoId;
                    media.ThumbURL = result.snippet.thumbnails.medium.url;
                    media.Title = result.snippet.title;
                    medias.push(media);
                }
                callback(medias);
            });
        }
        else {
            setTimeout(function () { _this.search(query, callback); }, 50);
        }
    };
    return YtSearcher;
}());
exports.YtSearcher = YtSearcher;
//# sourceMappingURL=YtSearcher.js.map