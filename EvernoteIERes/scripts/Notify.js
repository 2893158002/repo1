/**
 * Created by Chizhikov on 09.02.14.
 */

Evernote.Notify = {
    OPTIONS_ID: 'evernoteSaveOptionsSign',
    GLOBAL_ID:  'evernoteLoadingSign',
    ERROR_ID:   'evernoteErrorPopup',
    LOGO_ID:    'evernoteLogo',

    ERR_MSG_ID: 'ev_err_message',
    SCREENCAPTURE_ID: 'evernoteScreenCaptureTip',
    OPTIONS_MESS_ID: 'evernoteSaveOptionsMessage',

    buildNotifierWithId : function( id ) {
        var el = document.createElement('div');
        el.id = id;
        el.className = 'evn-Notifier';
        document.body.appendChild(el);
        return el;
    },

    createOptionsNotifier : function() {
        Evernote.Logger.debug('Evernote.Notify: Build saving notifier');

        var on = this.buildNotifierWithId(this.OPTIONS_ID);

        var mess = document.createElement('div');
        mess.className = this.OPTIONS_MESS_ID;
        mess.innerHTML = Evernote.Addin.getLocalizedMessage(Evernote.Messages.SAVING);

        on.appendChild(mess);
        return on;
    },

    createScreenCaptureTip : function() {
        Evernote.Logger.debug('Evernote.Notify: Build screen capture tip');

        var scn = this.buildNotifierWithId(this.SCREENCAPTURE_ID);

        var title = document.createElement('p');
        title.className = 'evernoteScreenCaptureTitle';
        title.innerHTML = Evernote.Addin.getLocalizedMessage(Evernote.Messages.TAKE_A_SCREENSHOT);

        var text  = document.createElement('p');
        text.className = 'evernoteScreenCaptureText';
        text.innerHTML = Evernote.Addin.getLocalizedMessage(Evernote.Messages.SCREEN_CAPTURE_TOAST);

        scn.appendChild(title);
        scn.appendChild(text);

        scn.addEventListener('click',function(){
            scn.className = scn.className.replace(/\s*visible/ig,'');
        });

        return scn;
    },

    optionsSaved : function() {
        Evernote.Logger.debug('Evernote.Notify: Show element with self-destruct timer');

        var on = document.getElementById(this.OPTIONS_ID) || this.createOptionsNotifier();
        on.className += ' visible';
        setTimeout(function(){
            on.className = on.className.replace(/visible/ig,'');
        },350);
    },

    isOptionsSaving : function() {
        var on = document.getElementById(this.OPTIONS_ID);
        return on && on.className && on.className.indexOf("visible") != -1;
    },

    startLoading : function() {
        try {
            var gn = document.getElementById(this.GLOBAL_ID) || this.buildNotifierWithId(this.GLOBAL_ID);
            gn.innerHTML = '<div id="' + this.LOGO_ID + '"></div>';
            gn.style.display = 'block';
        } catch (ignore) {
            // Do not want notifier crashes whole extension.
        }
    },

    completeLoading : function() {
        var gn = document.getElementById(this.GLOBAL_ID);
        if (gn) gn.style.display = 'none';
    },

    createErrorNotifier : function() {
        Evernote.Logger.debug('Evernote.Notify: Build error notifier');

        var x = document.createElement('div');
        x.className = 'closeCross';
        x.addEventListener('click',function(){
            this.parentElement.className = this.parentElement.className.replace(/\s?visible/ig,'');
            Evernote.JQuery("#evernote-content").trigger('errorClosed');
        });

        var en = this.buildNotifierWithId(this.ERROR_ID);
        en.innerHTML = '<div id="' + this.ERR_MSG_ID + '"></div>';
        en.appendChild(x);

        en.addEventListener('transitionend',function(){
            if (/visible/ig.test(this.className)) {
                Evernote.JQuery("#evernote-content").trigger('errorShown');
                Evernote.JQuery("#" + Constants.POST_CLIP_DIALOG_ID).trigger('errorShown');
            }
        });

        return en;
    },

    error : function( message ) {

        // this part is obsolete. Errors shows in post-clip dialog.
        Evernote.Logger.debug('Evernote.Notify: Show error window');

        var er = document.getElementById(this.ERROR_ID) || this.createErrorNotifier();
        er.querySelector('#' + this.ERR_MSG_ID).innerHTML = message.replace(/\n/g, "<br/>");
        er.className += ' visible';
    },

    screenCapture : function() {
        Evernote.Logger.debug('Evernote.Notify: Show screen capture tip');

        var screen_tip = document.getElementById(this.SCREENCAPTURE_ID) || this.createScreenCaptureTip();
        var jq_scn = Evernote.JQuery(screen_tip);

        jq_scn.addClass('visible');

        if (!Evernote.Options.hints.permanentScreenCapture) {
            setTimeout(function(){
                jq_scn.fadeOut(500);
            }, 3 * 1000);
        }
    },

    hideAll : function() {
        try {
            Evernote.JQuery('.evn-Notifier').removeClass('visible');
        } catch(ignore){}
    }
};