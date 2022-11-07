Evernote.VersionResponseParser = {
    parse : function(str) {
        var xmlDom = Evernote.JQuery(str);
        var result = xmlDom.attr("version");
        return new Evernote.Response("version", result);
    },

    canParse: function(str) {
        var request = Evernote.JQuery(str).attr("request");
        return (request && (request == "get_version"));
    }
};

Evernote.ResponseReceiver.registerParser(Evernote.VersionResponseParser);