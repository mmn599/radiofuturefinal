import { Session, Media } from "./Contracts";

export class Requestor {

    private getRoot() {
        return window.location.origin + "/session";
    }

    private getJoinSessionUrl(sessionName: string) {
        return this.getRoot() + "/JoinSession/" + encodeURI(sessionName);
    }

    private getAddMediaUrl(sessionId: number) {
        return this.getRoot() + "/AddMedia/" + sessionId;
    }

    private getDeleteMediaUrl(sessionId: number, mediaId: number) {
        return this.getRoot() + "/DeleteMedia/" + sessionId + "/" + mediaId;
    }

    private getSearchUrl() {
        return this.getRoot() + "/Search";
    }


    public JoinSession = (sessionName: string, callback: (session: Session) => void,
                                                errorCallback: (error) => void = null) => {
        $.ajax({
            type: 'GET',
            url: this.getJoinSessionUrl(sessionName),
            success: function (response) {
                var session = <Session>response;
                callback(session);
            },
            error: function (error) {
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        });
    }

    public Search = (query: string, page: number, callback: (searchResults: Media[]) => void,
                                                    errorCallback: (error) => void = null) => {
        $.ajax({
            type: 'GET',
            url: this.getSearchUrl(),
            data: {query: query, page: page},
            success: function (response) {
                var searchResults = <Media[]>response;
                callback(searchResults);
            },
            error: function (error) {
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        });
    }

    public AddMediaToSession = (sessionId: number, media: Media, callback: (updatedQueue: Media[]) => void,
                                                                    errorCallback: (error) => void = null) => {
        $.ajax({
            type: 'POST',
            url: this.getAddMediaUrl(sessionId),
            data: { mediaString: JSON.stringify(media) },
            success: function (response) {
                var updatedQueue = <Media[]>response;
                callback(updatedQueue);
            },
            error: function (error) {
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        });
    }

    public DeleteMediaFromSession = (sessionId: number, mediaId: number, callback: (updatedQueue: Media[]) => void,
                                                                            errorCallback: (error) => void = null) => {
        $.ajax({
            type: 'POST',
            url: this.getDeleteMediaUrl(sessionId, mediaId),
            success: function (response) {
                var updatedQueue = <Media[]>response;
                callback(updatedQueue);
            },
            error: function (error) {
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        });
    }

}