Evernote.AsyncEngine = {
    _requests : {},
    _requestIDCounter: 0,

    addRequest : function(callback, args) {
        this._requestIDCounter++;
        this._requests[this._requestIDCounter] =
            {
                callbackFunc: callback,
                callbackArgs: args
            };
        return this._requestIDCounter;
    },

    removeRequest : function(requestID) {
        this._requests[requestID] = null;
        delete this._requests[requestID];
    },

    commonCallback : function(requestID, result) {
        var object = Evernote.AsyncEngine._requests[requestID];
        if (object && object.callbackFunc) {
            object.callbackFunc(result, object.callbackArgs);
            Evernote.AsyncEngine.removeRequest(requestID);
        }
        return 0;
    }
};