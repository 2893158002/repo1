Evernote.DocumentFinder = {

    findInjectableWindow: function(win) {
        if(!win.document.body || !win.document.body.tagName) {
            return win
        }
        else if( win.document.body.tagName.toLowerCase() == "body" ) {
            return win;
        }
        if( win.document.body.tagName.toLowerCase() == "frameset" ) {
            var frame = this.getFrame(win.document.body);
            return frame.contentWindow;
        }
    },

    getFrame: function(frameset) {
        for(var i = 0; i < frameset.childNodes.length; i++) {
            var child = frameset.childNodes[i];
            if(child.tagName && child.tagName.toLowerCase() == "frame") {
                return child;
            }
        }
    }
};