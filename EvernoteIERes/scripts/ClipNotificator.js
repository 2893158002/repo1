Evernote.ClipNotificator = function ClipNotificator() {

};
// TODO: clip notificator is obsolete now. Remove it.

Evernote.ClipNotificator.WAIT_CONTAINER_ID = "evernoteContentClipperWait";
Evernote.ClipNotificator.SHOW_WAIT_MIN_TIME = 2000;

Evernote.ClipNotificator.prototype.showCopyNotification = function( doc, options, useAutoHide ) {

    Evernote.evernotePostClipPopup.fillOutPopup(options.title, options.notebookName);
    Evernote.evernotePostClipPopup.show();

    try {
        var wait = this.getWaitContainer( doc, Evernote.Addin.getLocalizedMessage(Evernote.Messages.CLIPPING) );
        wait.style.display = "none";
        this.centerBox(wait);

        if ( doc.body ) {
            doc.body.appendChild( wait );
        }

        if (useAutoHide)
        {
            var self = this;
            var timeout = this.constructor.SHOW_WAIT_MIN_TIME;
            setTimeout( function() {
                self.clearWait( doc );
            }, timeout );
        }
    }
    catch ( e ) {
        Evernote.Logger.error( "ClipNotificator.showCopyNotification() failed: error = " + e );
    }
};

Evernote.ClipNotificator.prototype.centerBox = function( container ) {

    // TODO: for what? It can be done with css.
    var topPosition = ((document.documentElement.scrollTop || document.body.scrollTop) + ((((document.documentElement.clientHeight || document.body.clientHeight) + (!container.offsetHeight && 0)) / 2) >> 0));
    var leftPosition = (((document.documentElement.clientWidth || document.body.clientWidth) / 2) - (container.offsetWidth / 2));
    container.style.position = "absolute";
    container.style.top = (topPosition-20) + "px";
    container.style.left = (leftPosition - 90) + "px";
};

Evernote.ClipNotificator.prototype.getWaitContainer = function( doc, msg ) {
    Evernote.Logger.debug( "ClipNotificator.getWaitContainer()" );

    var container = doc.getElementById( this.constructor.WAIT_CONTAINER_ID );
    if ( !container ) {
        container = doc.createElement( "evernotediv" );
        if(Evernote.Utils.isQuirkMode()) {
            container.className = "quirk-mode-container";
        }
        container.id = this.constructor.WAIT_CONTAINER_ID;

        var wait = doc.createElement( "div" );
        wait.id = this.constructor.WAIT_CONTAINER_ID + "Content";
        if(Evernote.BrowserDetection.isLessThanIE9()) {
            wait.className = "content-less-than-nine-container";
        }
        container.appendChild( wait );

        var center = doc.createElement( "center" );
        wait.appendChild( center );

        var spinner = doc.createElement( "div" );
        spinner.id = "evernote-spinner-container";
        center.appendChild( spinner );

        var text = doc.createElement( "span" );
        text.id = this.constructor.WAIT_CONTAINER_ID + "Text";
        center.appendChild( text );

        container._waitMsgBlock = text;
        container._waitMsgBlock.appendChild( doc.createTextNode( msg ) );
    }

    return container;
};

Evernote.ClipNotificator.prototype.clearWait = function( doc, immediately ) {
    Evernote.Logger.debug( "ClipNotificator.clearWait()" );

    var wait = doc.getElementById( Evernote.ClipNotificator.WAIT_CONTAINER_ID );
    if ( wait ) {
        wait.style.opacity = "0";
        if (immediately) {
            wait.parentNode.removeChild( wait );
        } else {
            setTimeout( function() {
                if ( wait.parentNode ) {
                    wait.parentNode.removeChild( wait );
                }
            }, 300 );
        }
    }

};