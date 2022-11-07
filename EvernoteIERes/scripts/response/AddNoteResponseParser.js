Evernote.AddNoteResponseParser = {
    parse : function(str) {
        Evernote.Logger.debug("AddNoteResponseParser: response" + str);
        var xmlDom = Evernote.JQuery(str);
        var result = xmlDom.attr("notebook_name");
        return new Evernote.Response("clipped", result);
    },

    canParse: function(str) {
        var request = Evernote.JQuery(str).attr("request");
        return request && (request == "add_note");
    }
};

Evernote.ResponseReceiver.registerParser(Evernote.AddNoteResponseParser);