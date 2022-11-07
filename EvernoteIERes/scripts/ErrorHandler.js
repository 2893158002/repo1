Evernote.ErrorHandler = {

    getHandler: function() {
        return [Evernote.Addin, Evernote.evernotePopup, Evernote.evernotePostClipPopup, Evernote.AlertErrorHandler];
    },

    onDataReceived : function(response) {
        if(response.type) {
            if(response.type == "error") {
                this.notifyHandlers(response.data);

            }
        }
    },

    notifyHandlers : function(error) {
        for(var i = 0; i < this.getHandler().length; i++) {
            var handler = this.getHandler()[i];
            if(handler && handler.processError && handler.processError(error)) {
                return;
            }
        }
    }
};

Evernote.ResponseReceiver.subscribe(Evernote.ErrorHandler);