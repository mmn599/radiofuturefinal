import { FrameBuilder } from "./FrameBuilder";
import { Media } from "./Contracts";

declare var Spinner: any;

export class UICallbacks {
    previousMedia: any;
    nextMedia: any;
    playMedia: any;
    pauseMedia: any;
    onSendChatMessage: any;
    search: any;
    nameChange: any;
}

export class UI {

    private spinner: any;
    private callbacks: UICallbacks;
    private mobileBrowser: boolean;
    private frameBuilder: FrameBuilder;

    constructor(mobileBrowser: boolean, callbacks: UICallbacks) {
        this.mobileBrowser = mobileBrowser;
        this.frameBuilder = new FrameBuilder(mobileBrowser);
        this.callbacks = callbacks;
        this.initialize();
    }

    private initialize() {
        this.setupSpinnerUI();
        this.setupInfoRolloverUI();
        this.setupInputUI();
        this.setupPlayerControlButtons();
    }

    public sessionReady() {
        $("#div_loading").hide();
        this.spinner.stop();
        $("#div_everything").animate({opacity: 1}, 'fast');
    } 

    private setupSpinnerUI() {
        var opts = {
            lines: 13 // The number of lines to draw
            , length: 28 // The length of each line
            , width: 14 // The line thickness
            , radius: 42 // The radius of the inner circle
            , scale: 1 // Scales overall size of the spinner
            , corners: 1 // Corner roundness (0..1)
            , color: '#000' // #rgb or #rrggbb or array of colors
            , opacity: 0.25 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 1 // Rounds per second
            , trail: 60 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , top: '50%' // Top position relative to parent
            , left: '50%' // Left position relative to parent
            , shadow: false // Whether to render a shadow
            , hwaccel: false // Whether to use hardware acceleration
            , position: 'absolute' // Element positioning
        }
        var target = document.getElementById('div_loading');
        this.spinner = new Spinner(opts).spin(target);
    }

    private setupFadeUI(overall, results) {
        overall.mouseenter((e) => {
            if (!results.is(':visible')) {
                results.fadeIn();
            }
        });
        overall.mouseleave((e) => {
            if (results.is(':visible')) {
                results.fadeOut();
            }
        });
    }

    private setupInfoRolloverUI() {
        if (!this.mobileBrowser) {
            this.setupFadeUI($("#div_users_overall"), $("#div_user_results"));
            this.setupFadeUI($("#div_queue_overall"), $("#div_queue_results"));
            this.setupFadeUI($("#div_chat_overall"), $("#div_chat_results"));
            this.setupFadeUI($("#div_cc_overall"), $("#div_cc_results"));
        }
    }

    private searchTextChanged(text) {
        var divResults = $("#div_search_results");
        if(text.length==0) {
            divResults.fadeOut();
        }
    }

    private setupInputUI() {
        var inputSearch = $("#input_search");
        inputSearch.keypress((e) => {
            if (e.which == 13) {
                this.searchEnterPressed(inputSearch);
            }
        });
        var input_name = $("#input_name");
        input_name.keypress((e) => {
            if (e.which == 13) {
                this.userNameChange(input_name);
            }
        });
        if (!this.mobileBrowser) {
            var input_chat = $("#input_chat");
            input_chat.keypress((e) => {
                if (e.which == 13) {
                    this.callbacks.onSendChatMessage(input_chat.val());
                    input_chat.val("");
                }
            });
        }
        document.body.addEventListener('click', () => {
            $("#div_search_results").fadeOut();
            $("#input_search").val("");
        }, true);
        $("#input_search").bind("propertychange input paste", (event) => {
            this.searchTextChanged($("#input_search").val());
        });
    }

    private setupPlayerControlButtons() {
        $("#btn_previous").click(this.callbacks.previousMedia);
        $("#btn_pause").click(() => {
            $("#btn_pause").hide();
            $("#btn_play").show();
            this.callbacks.pauseMedia();
        });
        $("#btn_play").click(() => {
            $("#btn_play").hide();
            $("#btn_pause").show();
            this.callbacks.playMedia();
        });
        $("#btn_next").click(this.callbacks.nextMedia);
    }

    private searchEnterPressed(input_search) {
        var divResults = $("#div_search_results");
        divResults.html("");
        this.callbacks.search(input_search.val(), (results) => {
            $.each(results.items, (index, item) => {
                divResults.html(divResults.html() + "<div class='div_search_result' onClick='queueSelectedVideo(this)' data-VideoId='" + item.id.videoId + "' data-ThumbURL='"+item.snippet.thumbnails.medium.url+"'>" + '<p class="text_search_result">' +  item.snippet.title+ '</p></div>' );
            });
            input_search.blur();
        });
        if(!divResults.is(':visible')) {
            divResults.fadeIn();
        }
    }

    public updateQueue(queue: Media[], userIdMe: number, queuePosition: number) {
        var length = queue.length;
        var summary = length + " things in the playlist";
        if (length == 1) {
            summary = length + " thing in the playlist";
        }
        else if (length <= 0) {
            summary = "Nothing in the playlist. Queue something!";
        }
        $("#p_queue_summary").text(summary);

        var queueResults = $("#div_queue_results");
        var html = [];
        for (var i = 0; i < length; i++) {
            var media = queue[i];
            var onThis = i === queuePosition;
            var currentHTML = this.frameBuilder.media(media, i, media.UserId === userIdMe, onThis);
            html.push(currentHTML);
        }

        queueResults.html(html.join(""));
    }


    public updateUsersList(users, userIdMe: number) {
        var num = users.length;
        var summary = users.length + " users in the room";
        if (num == 1) {
            summary = users.length + " user in the room";
        }
        $("#p_users_summary").text(summary);
        var userResults = $("#div_user_results");
        var html = [];
        //TODO: put style in css and make scrolley
        $.each(users, (index, user) => {
            var thisIsMe = (user.Id === userIdMe);
            var currentHTML = this.frameBuilder.user('green', user.Id, user.Name, thisIsMe);
            html.push(currentHTML);
        });
        userResults.html(html.join(""));
    }

    public userNameChange(name_input) {
        name_input.hide();
        $("#input_search").fadeIn();
        this.callbacks.nameChange(name_input.val());
    }

    public onChatMessage(userName: string, msg: string) {
        //TODO: color stuff
        var html = '<li class="chat"><span style="margin: 0; color: ' + 'blue' + ';">' + userName + ': </span><span>' + msg + '</span></li>';
        $("#ul_chat").append(html);
    }
}