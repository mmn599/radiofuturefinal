import { MyUser, Media, Session, UserState } from "./Contracts";
import { UICallbacks, UI } from "./UI";
import { MySocket, ClientActions } from "./Sockets";
import { IPlayer } from "./IPlayer";
import { PodcastPlayer } from "./PodcastPlayer";
import { FBLogin } from "./FBLogin";

class RoomManager implements UICallbacks, ClientActions {

    user: MyUser;
    session: Session;
    player: PodcastPlayer; 
    socket: MySocket;
    ui: UI;
    roomType: string;
    mobileBrowser: boolean;

    constructor(roomType: string, mobileBrowser: boolean) {
        this.roomType = roomType;
        this.mobileBrowser = mobileBrowser;
    }

    public init(encodedSessionName: string) {
        this.user = new MyUser();
        this.session = new Session();
        this.ui = new UI(this.mobileBrowser, this);
        this.player = new PodcastPlayer(this.ui, this.mobileBrowser, this.uiNextMedia, this.uiPreviousMedia);
        this.socket = new MySocket(this);
        this.setupJamSession(encodedSessionName);
        this.player.initPlayer(this.onPlayerStateChange);
    }

    setupJamSession(encodedSessionName: string) {
        this.session.Name = decodeURI(encodedSessionName);
        this.socket.JoinSession(this.session.Name);
    }

    fbStatusChanged = (response) => {
        if (response.status === "connected") {
            var fbUserId = response.authResponse.userID;
            this.socket.FbLogin(this.user.Id, fbUserId);
        }
    }

    //==================================================================
    // WebSocket message response functions
    //==================================================================

    clientProvideUserState = (msg) => {
        this.user.State.QueuePosition = msg.userState.QueuePosition;
        this.user.State.Time = msg.userState.Time;
        this.user.State.PlayerState = msg.userState.PlayerState;
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        this.onUserStateChange();
    }

    clientUserLoggedIn = (msg) => {
        this.user.Id = msg.newUserId;
        this.user.Name = msg.newUserName;
        this.ui.userLoggedIn(msg.newUserName);
    }

    clientRequestUserState(msg) {
        var myUserState = new UserState();
        myUserState.QueuePosition = this.user.State.QueuePosition;
        myUserState.Time = Math.round(this.player.getCurrentTime());
        myUserState.PlayerState = this.player.getCurrentState();
        this.socket.ProvideSyncToUser(myUserState, msg.userIdRequestor);
    }

    clientSessionReady(msg) {
        // TODO: this should get out of here!
        // TODO: the login flow needs to change
        let fbLogin = new FBLogin(this.fbStatusChanged);
        this.session = msg.session;
        this.user = msg.user;
        this.uiNextMedia();
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        this.ui.updateUsersList(this.session.Users, this.user.Id);
        this.ui.sessionReady();
    }

    clientUpdateUsersList(msg) {
        this.session.Users = msg.users;
        this.ui.updateUsersList(this.session.Users, this.user.Id);	
    }

    clientUpdateQueue(msg) {
        var wasWaiting = this.isUserWaiting();
        this.session.Queue = msg.queue;
        if (wasWaiting) {
            this.uiNextMedia();
        }
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
    }

    clientChatMessage(msg) {
        this.ui.onChatMessage(msg.userName, msg.message, 'blue');
    }

    clientSearchResults(msg) {
        this.ui.onSearchResults(msg.searchResults);
    }

    clientsUpdateUserName(msg) {
        var users = this.session.Users;
        // TODO: hashmap
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (user.Id === msg.userId) {
                user.Name = msg.newName;
            }
        }
        this.ui.updateUsersList(users, this.user.Id);
    }

    //
    // Mostly UI callback functions
    //

    uiSendChatMessage(msg: string) {
        this.socket.ChatMessage(msg, this.user.Name);
    }

    uiNameChange(newName: string) {
        this.user.Name = newName;
        this.socket.SaveUserNameChange(this.user.Id, this.user.Name);
    }

    uiSearch(query: string, page: number) {
        this.socket.Search(query, page);
    }

    uiGoToMedia(newQueuePosition: number) {
        this.user.State.QueuePosition = newQueuePosition;
        this.user.State.Time = 0;
        this.onUserStateChange();
    }

    uiNextMedia = () => {
        var queue = this.session.Queue;
        if(this.user.State.QueuePosition + 1 < queue.length) {
            this.user.State.Time = 0;
            this.user.State.QueuePosition += 1;
            this.onUserStateChange();
        }
    }

    uiPauseMedia = () => {
        this.player.pause();
    }

    uiPlayMedia = () => {
        this.player.play();
    }

    uiPreviousMedia = () => {
        this.user.State.Time = 0;
        var queue = this.session.Queue;
        if(this.user.State.QueuePosition > 0) {
            this.user.State.QueuePosition = this.user.State.QueuePosition - 1;
            this.onUserStateChange();
        }
    }

    uiQueueMedia = (media: Media) => {
        // TODO: awkward
        media.UserId = this.user.Id;
        media.UserName = this.user.Name;
        this.socket.AddMediaToSession(media);
    }

    uiDeleteMedia = (mediaId: number, position: number) => {
        // TODO: important: this should be done once the update is sent from server
        this.session.Queue.splice(position, 1);
        if (this.user.State.QueuePosition >= position) {
            this.user.State.QueuePosition -= 1;
            this.onUserStateChange();
        }
        this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);

        this.socket.DeleteMediaFromSession(mediaId);
    }

    uiRequestSyncWithUser = (userId) => {
        this.socket.RequestSyncWithUser(userId);
    }

    //
    // Misc
    //

    isUserWaiting = (): boolean => {
        var pos = this.user.State.QueuePosition;
        var length = this.session.Queue.length;
        return pos < 0 || ((pos == (length - 1)) && this.player.isStopped());
    }


    onUserStateChange() {
        if (this.user.State.QueuePosition >= 0 && this.user.State.QueuePosition < this.session.Queue.length) {
            this.player.setPlayerContent(this.session.Queue[this.user.State.QueuePosition], this.user.State.Time);
            this.ui.updateQueue(this.session.Queue, this.user.Id, this.user.State.QueuePosition);
        }
        else if (this.user.State.QueuePosition < 0) {
            this.player.nothingPlaying();
        }
        else if (this.user.State.QueuePosition >= this.session.Queue.length) {
            this.user.State.QueuePosition = this.session.Queue.length;
        }
    }

    onPlayerStateChange = (event) => {
        if(event.data==0) {
            this.uiNextMedia();
        }
    }

    onFatalError = () => {
        $("#div_everything").hide();
        $("#div_error").show();
    }

}

declare var mobileBrowser: boolean;
declare var roomType: string;
declare var roomName: string;

var mRoomManager = new RoomManager(roomType, mobileBrowser);
$(document).ready(function () {
    mRoomManager.init(roomName);
});


