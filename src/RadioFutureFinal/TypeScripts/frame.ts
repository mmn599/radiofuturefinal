export class FrameBuilder {

    mobileBrowser: boolean;

    constructor(mobileBrowser: boolean) {
        this.mobileBrowser = mobileBrowser;
    }

    public userMe(color: string, userName: string) : string {
        var currentHTML = "";
        if (this.mobileBrowser) {
            currentHTML = '<div class="div_user" style="background: ' + color + ';"> you </div>';
        }
        else {
            currentHTML =
                '<div style="text-align: left; display: flex; align-items: center;">' +
                       '<div style="display: flex; align-items: center; justify-content: center; float: left; cursor: pointer; margin-right: 16px; height: 48px; width: 48px; background: ' + color + ';">you</div>' +
                       '<span style="margin-right: 16px; float: right;">' + userName + '</span>' +
                '</div>';
        }
        return currentHTML;
    }

    public user(color: string, userId: number, userName: string) : string {
        var currentHTML = "";
        if (this.mobileBrowser) {
            currentHTML = '<div onclick="requestSyncWithUser(' + userId + ')" class="div_user" style="background: ' + color + ';">sync with ' + userName + '</div>';
        }
        else {
            currentHTML =
                '<div style="text-align: left; display: flex; align-items: center;">' +
                       '<div onclick="requestSyncWithUser(' + userId + ')" style="display: flex; align-items: center; justify-content: center; float: left; cursor: pointer; margin-right: 16px; height: 48px; width: 48px; background: ' + color + ';">sync</div>' +
                       '<span style="margin-right: 16px; float: right;">' + userName + '</span>' +
                '</div>';
        }
        return currentHTML;
    }
}