"use strict";
var PodcastSearcher = (function () {
    function PodcastSearcher() {
    }
    PodcastSearcher.prototype.init = function (secret, appId) {
        if (appId === void 0) { appId = null; }
        var Audiosearch = require('audiosearch-client-node');
        this.audiosearch = new Audiosearch(appId, secret);
    };
    PodcastSearcher.prototype.search = function (query, callback) {
        this.audiosearch.searchEpisodes('radiolab').then(function (results) {
            console.log(results);
        });
    };
    return PodcastSearcher;
}());
exports.PodcastSearcher = PodcastSearcher;
//# sourceMappingURL=PodcastSearcher.js.map