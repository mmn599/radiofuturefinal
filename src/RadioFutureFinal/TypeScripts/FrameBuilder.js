"use strict";
var FrameBuilder = (function () {
    function FrameBuilder() {
    }
    FrameBuilder.prototype.user = function (color, userId, userName, thisIsMe) {
        var meHtml = thisIsMe ? 'onclick="requestSyncWithUser(' + userId + ')" ' : "";
        var syncHTML = thisIsMe ? 'you' : 'sync';
        var syncHTMLMobile = thisIsMe ? 'you' : 'sync with ' + userName;
        var currentHTML = '<div style="text-align: left; display: flex; align-items: center;">' +
            '<div ' + meHtml + 'style="display: flex; align-items: center; justify-content: center; float: left; cursor: pointer; margin-right: 16px; height: 48px; width: 48px; background: ' + color + ';">' + syncHTML + '</div>' +
            '<span style="margin-right: 16px; float: right;">' + userName + '</span>' +
            '</div>';
        return currentHTML;
    };
    return FrameBuilder;
}());
exports.FrameBuilder = FrameBuilder;
//# sourceMappingURL=FrameBuilder.js.map