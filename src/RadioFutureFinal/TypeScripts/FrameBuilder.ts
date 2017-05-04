import { Media } from "./Contracts";

export class FrameBuilder {

    public user(color: string, userId: number, userName: string, thisIsMe: boolean) : string {
        var meHtml = thisIsMe ? 'onclick="requestSyncWithUser(' + userId + ')" ' : "";
        var syncHTML = thisIsMe ? 'you' : 'sync';
        var syncHTMLMobile = thisIsMe ? 'you' : 'sync with ' + userName;
        var currentHTML =
            '<div style="text-align: left; display: flex; align-items: center;">' +
            '<div ' + meHtml + 'style="display: flex; align-items: center; justify-content: center; float: left; cursor: pointer; margin-right: 16px; height: 48px; width: 48px; background: ' + color + ';">' + syncHTML + '</div>' +
                   '<span style="margin-right: 16px; float: right;">' + userName + '</span>' +
            '</div>';
        return currentHTML;
    }
}