Evernote.ResponseReceiver = {
    parsers : [],
    receivers : [],

    onResponse: function(str) {
        Evernote.Logger.debug("Response received" + str);
        for(var i = 0; i < Evernote.ResponseReceiver.parsers.length; i++) {
            if(Evernote.ResponseReceiver.parsers[i].canParse && Evernote.ResponseReceiver.parsers[i].canParse(str)) {
                Evernote.ResponseReceiver.notify(Evernote.ResponseReceiver.parsers[i].parse(str));
            }
        }
    },

    registerParser: function(parser) {
        Evernote.ResponseReceiver.parsers.push(parser);
    },

    subscribe: function(receiver) {
        Evernote.ResponseReceiver.receivers.push(receiver);
    },

    notify: function(data) {
        for(var i=0; i < Evernote.ResponseReceiver.receivers.length; i++) {
            Evernote.ResponseReceiver.receivers[i].onDataReceived(data);
        }
    }
};

function EvernoteGlobalReceiver(str) {
    Evernote.ResponseReceiver.onResponse(str);
}
