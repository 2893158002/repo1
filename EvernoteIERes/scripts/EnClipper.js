Evernote.EnClipper = {

    enClipperProcessId: -1,

    init: function() {
        Evernote.ResponseReceiver.subscribe(this);
        Evernote.Addin.getProcessID(document);
        Evernote.Addin.allowSetForegroundWindow(this.enClipperProcessId);
    },

    onDataReceived: function(data) {
        if(data && (data.type == "process_id")) {
            Evernote.EnClipper.enClipperProcessId = data.data | 0;
        }
    }
};