"use strict";
var Requestor = (function () {
    function Requestor() {
        var _this = this;
        this.JoinSession = function (sessionName, callback) {
            $.ajax({
                type: 'GET',
                url: _this.getJoinSessionUrl(sessionName),
                success: function (response) {
                    var session = response;
                    callback(session);
                },
                error: function (error) {
                    console.log(error);
                }
            });
        };
        this.Search = function (query, page, callback) {
            $.ajax({
                type: 'GET',
                url: _this.getSearchUrl(),
                data: { query: query, page: page },
                success: function (response) {
                    var searchResults = response;
                    callback(searchResults);
                },
                error: function (error) {
                    console.log(error);
                }
            });
        };
        this.AddMediaToSession = function (sessionId, media, callback) {
            $.ajax({
                type: 'POST',
                url: _this.getAddMediaUrl(sessionId),
                data: { mediaString: JSON.stringify(media) },
                success: function (response) {
                    var updatedQueue = response;
                    callback(updatedQueue);
                }
            });
        };
        this.DeleteMediaFromSession = function (sessionId, mediaId, callback) {
            $.ajax({
                type: 'POST',
                url: _this.getDeleteMediaUrl(sessionId, mediaId),
                success: function (response) {
                    var updatedQueue = response;
                    callback(updatedQueue);
                }
            });
        };
    }
    Requestor.prototype.getRoot = function () {
        return window.location.origin + "/session";
    };
    Requestor.prototype.getJoinSessionUrl = function (sessionName) {
        return this.getRoot() + "/JoinSession/" + encodeURI(sessionName);
    };
    Requestor.prototype.getAddMediaUrl = function (sessionId) {
        return this.getRoot() + "/AddMedia/" + sessionId;
    };
    Requestor.prototype.getDeleteMediaUrl = function (sessionId, mediaId) {
        return this.getRoot() + "/DeleteMedia/" + sessionId + "/" + mediaId;
    };
    Requestor.prototype.getSearchUrl = function () {
        return this.getRoot() + "/Search";
    };
    return Requestor;
}());
exports.Requestor = Requestor;
//# sourceMappingURL=Requestor.js.map