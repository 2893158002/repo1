Evernote.NotebooksLoader = {

    notebooks: [],

    // TODO: add cache;

    getNotebookByUid: function(uid) {
        Evernote.ResponseReceiver.subscribe(this);
        Evernote.Addin.getNotebooks(document);
        for(var i = 0; i < this.notebooks.length; i++) {
            if(this.notebooks[i].uid == uid) {
                return this.notebooks[i];
            }
        }
        return null;
    },

    onDataReceived: function(response) {
        if(response.type) {
            if(response.type == "notebooks") {
                this.notebooks = this.notebooks.concat(response.data);
            }
        }
    }
};


Evernote.NotebooksPopupLoader = function( subscriber , doc ) {
    this.subscriber = subscriber;
    this.doc = doc;
    this.cache = [];
};


Evernote.NotebooksPopupLoader.prototype.getNotebooksAsync = function( onSuccess ) {
    var self = this;
    var countNotebooksResponse = 0;

    Evernote.Addin.getNotebooksAsync(function(response, args)
    {
        if (Evernote.NotebookResponseParser.canParse(response))
        {
            var res = Evernote.NotebookResponseParser.parse(response);
            countNotebooksResponse++;
            self.subscriber.updateNotebooks.call(self.subscriber, res.data);

            if (countNotebooksResponse == 3)
            {
                onSuccess();
            }
        }
    });


};