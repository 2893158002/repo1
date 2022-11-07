Evernote.TagsResponseParser = {
    parse : function(str) {
        str = Evernote.GlobalUtils.decodeXML(str);
        var xmlDom = Evernote.JQuery(str);
        var result = [];
        if(xmlDom.length == 1) {
            var tags = xmlDom.find("tag");
            for(var i = 0; i < tags.length; i++) {
                var tag = Evernote.JQuery(tags[i]);
                result.push(Evernote.TagsResponseParser.createTag(tag));
            }
        } else if(xmlDom.length > 1) {
            for(var i = 1; i < xmlDom.length - 1; i += 1) {
                var tag = Evernote.JQuery(xmlDom[i]);
                if(tag.attr("uid")) {
                    result.push(Evernote.TagsResponseParser.createTag(tag));
                }
            }
        }
        return new Evernote.Response("tags", result);
    },

    createTag: function(tag) {
        return new Evernote.Tag(
            tag.attr("name"),
            tag.attr("uid")
        );
    },

    canParse: function(str) {
        var request = Evernote.JQuery(str).attr("request");
        return request && (request == "get_tags" || request == "get_linked_notebook_tags");
    }
};

Evernote.ResponseReceiver.registerParser(Evernote.TagsResponseParser);