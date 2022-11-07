Evernote.ErrorResponseParser = {

    parse : function(str) {
        Evernote.Logger.warn("Received error " + str);
        var error = Evernote.JQuery(str);
        var errorCode = error.attr("code");
        var errorMessage = null;
        var problem = null;
        if(error.length == 1) {
            var problems = error.find("problem");
            if(problems && problems.length > 0) {
                problem = Evernote.JQuery(problems[0]);
            }
        }
        else if(error.length > 2) {
            errorMessage = error[2].toString();
        }
        if(problem) {
            errorMessage = problem.text();
        } else if(!errorMessage) {
            errorMessage = error.attr("details");
        }
        switch (errorCode) {
            case Evernote.ErrorCodes.AUTHENTICATION_ERROR :
                errorMessage = Evernote.Addin.getLocalizedMessage(Evernote.Messages.LOGIN_FAILED);
                break;
            case Evernote.ErrorCodes.CLIP_ERROR :
                errorMessage = Evernote.Addin.getLocalizedMessage(Evernote.Messages.CLIP_FAILED_TITLE) + "\n" + errorMessage;
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

Evernote.ResponseReceiver.registerParser(Evernote.ErrorResponseParser);