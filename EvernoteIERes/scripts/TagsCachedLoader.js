Evernote.TagsCachedLoader = function(subscriber, doc) {
    this.subscriber = subscriber;
    this.doc = doc;
    this.cache = [];
};

Evernote.TagsCachedLoader.prototype.getPersonalTags = function() {
    if(this.cache["personal"]) {
        return this.subscriber.updateTags(this.cache["personal"]);
    }
    Evernote.Addin.getTags(this.doc);
    this.cache["personal"] = this.subscriber.tags;
};

Evernote.TagsCachedLoader.prototype.getPersonalTagsAsync = function( onSuccess ) {
    if(this.cache["personal"]) {
        return this.subscriber.updateTagsAsync(this.cache["personal"]);
    }
    var context = this;
    Evernote.Addin.getTagsAsync(function(response)
    {
        if (Evernote.TagsResponseParser.canParse(response)) {
            var res = Evernote.TagsResponseParser.parse(response);
            context.cache["personal"] = res.data;
            context.subscriber.updateTagsAsync.call(context.subscriber, context.cache["personal"]);
            if (onSuccess) onSuccess();
        } else if (Evernote.ErrorResponseParser.canParse(response)) {
            var res = Evernote.ErrorResponseParser.parse(response);
            Evernote.ErrorHandler.onDataReceived(res);
        }
    });
};

Evernote.TagsCachedLoader.prototype.getLinkedNotebookTag = function(uid) {
    if(this.cache[uid]) {
        return this.subscriber.updateTags(this.cache[uid]);
    }
    Evernote.Addin.getLinkedTags(this.doc, uid | 0);
    this.cache[uid] = this.subscriber.tags;
};

Evernote.TagsCachedLoader.prototype.getLinkedNotebookTagAsync = function(uid) {
    if(this.cache[uid]) {
        return this.subscriber.updateTagsAsync(this.cache[uid]);
    }

    var context = this;
    Evernote.Addin.getLinkedTagsAsync(function(response)
    {
        if (Evernote.TagsResponseParser.canParse(response))
        {
            var res = Evernote.TagsResponseParser.parse(response);
            context.cache[uid] = res.data;
            context.subscriber.updateTagsAsync.call(context.subscriber, context.cache[uid]);
        }
    }, uid | 0 );
};

Evernote.TagsCachedLoader.prototype.getBusinessTags = function(businessNotebooks) {
    if(businessNotebooks) {
        var resultTags = [];
        for(var i = 0; i < businessNotebooks.length; i++) {
            if(!this.cache[businessNotebooks[i].uid]) {
                Evernote.Addin.getLinkedTags(this.doc, businessNotebooks[i].uid | 0);
                this.cache[businessNotebooks[i].uid] = this.subscriber.tags;
            }
            if(this.cache[businessNotebooks[i].uid])
                resultTags = resultTags.concat(this.cache[businessNotebooks[i].uid]);
        }
        this.subscriber.updateTags(resultTags);
    }
};

Evernote.TagsCachedLoader.prototype.getBusinessTagsAsync = function(businessNotebooks) {
    if(businessNotebooks) {
        var resultTags = [];
        var resultGot = 0;
        var context = this;

        for(var i = 0; i < businessNotebooks.length; i++) {
            if(!this.cache[businessNotebooks[i].uid]) {
                Evernote.Addin.getLinkedTagsAsync(function(response, args)
                {
                    if (Evernote.TagsResponseParser.canParse(response))
                    {
                        var res = Evernote.TagsResponseParser.parse(response);
                        context.cache[args] = res.data;
                        resultTags = resultTags.concat(res.data);
                        resultGot++;
                        if (resultGot == businessNotebooks.length)
                        {
                            // todo: responses are the same for any business notebook. resultTags contains a lot of duplicates.
                            context.subscriber.updateTagsAsync.call(context.subscriber, resultTags);
                        }
                    }
                }, businessNotebooks[i].uid | 0, businessNotebooks[i].uid | 0);
            }else {
                resultTags = resultTags.concat(this.cache[businessNotebooks[i].uid]);
                resultGot++;
                if (resultGot == businessNotebooks.length)
                {
                    context.subscriber.updateTagsAsync.call(context.subscriber, resultTags);
                }
            }
        }
    }
};