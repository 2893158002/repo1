Evernote.NotebookResponseParser = {
    parse : function(str) {
        str = Evernote.GlobalUtils.decodeXML(str);
        var xmlDom = Evernote.JQuery(str);
        var result = [];
        var type = xmlDom.attr("type");
        if(xmlDom.length == 1) {
            var notebooks = xmlDom.find("notebook");
            for(var i = 0; i < notebooks.length; i++) {
                var notebook = Evernote.JQuery(notebooks[i]);
                var notebookObj = Evernote.NotebookResponseParser.createNotebook(type,notebook);
                if(notebookObj) {
                    result.push(notebookObj);
                }
            }
        }
        else if(xmlDom.length > 1) {
            for(var i = 1; i < xmlDom.length - 1; i += 2) {
                var notebook = Evernote.JQuery(xmlDom[i]);
                var notebookObj = Evernote.NotebookResponseParser.createNotebook(type, notebook);
                if(notebookObj) {
                    result.push(notebookObj);
                }
            }
        }
        return new Evernote.Response("notebooks", result);
    },

    createNotebook : function(type, notebook) {
        var notebookType;
        var notebookTypeText;
        switch (type) {
            case "personal":
                notebookType = Evernote.NotebookTypes.PERSONAL;
                notebookTypeText = Evernote.NotebookTypes.PERSONAL_TEXT;
                break;
            case "business":
                notebookType = Evernote.NotebookTypes.BUSINESS;
                notebookTypeText = Evernote.NotebookTypes.BUSINESS_TEXT;
                break;
            case "linked":
                notebookType = Evernote.NotebookTypes.LINKED;
                notebookTypeText = Evernote.NotebookTypes.LINKED_TEXT;
                break;
        }
        var hidden = false;
        var writableAttrValue = notebook.attr("writable");

        if (notebookType == Evernote.NotebookTypes.BUSINESS) {
            return null
        }

        if(notebookType == Evernote.NotebookTypes.LINKED) {
            var business = notebook.attr("business");

            if(business && ((business | 0) == 1)) {
                notebookType = Evernote.NotebookTypes.BUSINESS;
                notebookTypeText = Evernote.NotebookTypes.BUSINESS_TEXT;
            }
        }

        if(notebookType == Evernote.NotebookTypes.LINKED || notebookType == Evernote.NotebookTypes.BUSINESS) {
            if(!writableAttrValue || (writableAttrValue | 0) != 1) {
                if(notebookType == Evernote.NotebookTypes.LINKED)
                    return null;
                else {
                    hidden = true;
                }
            }
        }

        var owner = notebook.attr("owner");
        if (owner && owner == Evernote.evernotePopup._user)
            owner = undefined;

        return new Evernote.Notebook(
            notebookType,
            notebook.attr("name"),
            notebook.attr("uid"),
            notebook.attr("stack"),
            owner,
            hidden,
            notebookTypeText
        );
    },

    canParse: function(str) {
        var request = Evernote.JQuery(str).attr("request");
        return (request && (request == "get_notebooks"));
    }
};

Evernote.ResponseReceiver.registerParser(Evernote.NotebookResponseParser);