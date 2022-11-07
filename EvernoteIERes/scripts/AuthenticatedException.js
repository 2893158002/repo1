Evernote.AuthenticatedException = function(msg){
    this.msg = msg;
    this.code = Evernote.ErrorCodes.AUTHENTICATION_ERROR;
};