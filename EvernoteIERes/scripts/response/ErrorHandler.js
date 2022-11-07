Evernote.ErrorHandlerParser = {

    parse : function(str) {
        Evernote.Logger.warn("Received error " + str);
        var error = Evernote.JQuery(str);
        var errorCode = error.attr("code");
        var errorMessage = error.attr("details");
        switch (errorCode) {
            case "LoginFailure" :
                errorMessage = Evernote.Addin.getLocalizedMessage(Evernote.Messages.LOGIN_FAILED);
                break;
        }
        var msg = {
            message: errorMessage,
            code: errorCode
        };

        return new Evernote.Response("error", msg);
    },

    canParse: function(str) {
        var request = Evernote.JQuery(str).get(0);
        return (request && (request.nodeName == "ERROR"));
    }
};

Evernote.ResponseReceiver.registerParser(Evernote.ErrorHandlerParser);