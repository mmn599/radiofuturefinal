"use strict";
var Contracts_1 = require("./Contracts");
var PodcastSearcher = (function () {
    function PodcastSearcher() {
    }
    PodcastSearcher.prototype.init = function (secret, appId) {
        if (appId === void 0) { appId = null; }
        console.log(secret);
    };
    PodcastSearcher.prototype.search = function (query, callback) {
        var medias = [];
        for (var i = 0; i < 3; i++) {
            var media = new Contracts_1.Media();
            media.MP3Source = "https://rss.art19.com/episodes/a05b129d-52e8-4baa-8446-e97db62a2bbb.mp3";
            media.Title = "Pod Save America";
            media.ThumbURL = "https://dfkfj8j276wwv.cloudfront.net/images/0d/28/33/81/0d283381-724c-4caa-abad-b470e950d72d/9fe8d62a052c05af026cccbc86ce1073e04f363fcc7c5fda6ce7b40c5ac23fad0bc8595632402b605e0683e40a6726f8cd25a9ee88ca38a3b1ac33b108a7c5c2.jpeg";
        }
    };
    return PodcastSearcher;
}());
exports.PodcastSearcher = PodcastSearcher;
//# sourceMappingURL=PodcastSearcher.js.map