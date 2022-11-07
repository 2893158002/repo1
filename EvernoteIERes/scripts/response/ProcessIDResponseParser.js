Evernote.ProcessIDResponseParser = {
    parse : function(str) {
        Evernote.Logger.debug("ProcessIDResponseParser: response" + str);
        var xmlDom = Evernote.JQuery(str);
        var result = xmlDom.attr("process_id");
        return new Evernote.Response("process_id", result);
    },

    canParse: function(str) {
        var request = Evernote.JQuery(str).attr("request");
        return request && (request == "get_process_id");
    }
};

Evernote.ResponseReceiver.registerParser(Evernote.ProcessIDResponseParser);