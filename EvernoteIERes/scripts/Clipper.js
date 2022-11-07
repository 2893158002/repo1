/**
 * Represents clipper object that is capable of clipping elements from pages or clip elements based on preferences.
 */
Evernote.Clipper = {

    _serializer : Evernote.JSSerializer,

    _clipNotifier : new Evernote.ClipNotificator(),

    _defaultOptions : {
        title: PageContext.title,
        tags: [],
        comments: "",
        notebookUid: -1,
        notebookName : ""
    },

    /**
     * Clips article element (one that user selected or default if no selection was made).
     */
    clipArticle : function(options, clearly) {
        var currentOptions = this.initOptions(options);
        this._clipNotifier.showCopyNotification(document, currentOptions);
        var self = this;
        setTimeout(function() {
            var article
            if ( clearly ) {
                article = Evernote.ClearlyController.getSimplifiedArticle();
            } else {
                article = Evernote.contentPreviewer.getArticleElement();
            }
            if(!article) {
                article = Evernote.pageInfo.getDefaultArticle(function(article) {});
            }
            var resultFunc = function(serializedDom) {
                self._clipNotifier.clearWait(document);
                Evernote.Addin.clipNote(currentOptions.comments + serializedDom.content, currentOptions, PageContext.url, serializedDom.imageUrls, true, document);
                Evernote.ClearlyController.hide();
            };
            self._serializer.serializeAsync(article, false, resultFunc);
        }, 100);
    },

    initOptions: function(options) {
        if(!options)
            options = this._defaultOptions;
        options = Evernote.JQuery.extend({}, this._defaultOptions, options);
        if(!options.title || Evernote.JQuery.trim(options.title).length == 0)
            options.title = Evernote.Addin.getLocalizedMessage(Evernote.Messages.UNTITLED_NOTE);
        options.title = Evernote.JQuery.trim(Evernote.Utils.cutToLength(options.title, 255, " "));

        /* get notebook name */
        var notebookUid = options.notebookUid || 0;
        var notebook = Evernote.NotebooksLoader.getNotebookByUid(notebookUid);

        if(!notebook) {
            options.notebookName = Evernote.Addin.getLocalizedMessage(Evernote.Messages.DEFAULT_NOTEBOOK);
        } else {
            options.notebookName = notebook.name;
        }

        return options;
    },

    /**
     * Clips full page.
     */
    clipFullPage : function(options) {
        Evernote.Logger.debug("Clipper: clipFullPage");
        var currentOptions = this.initOptions(options);
        this._clipNotifier.showCopyNotification(document , currentOptions);
        var self = this;
        setTimeout(function() {
            Evernote.Logger.debug("Start clipping of full page");
            var resultFunc = function(serializedDom) {
                self._clipNotifier.clearWait(document);
                Evernote.Logger.debug("Image urls " + JSON.stringify(serializedDom.imageUrls));
                Evernote.Logger.debug("Send clip to EN");
                Evernote.Addin.clipNote(currentOptions.comments + serializedDom.content, currentOptions, PageContext.url, serializedDom.imageUrls, true, document);
            };
            self._serializer.serializeAsync(null, true, resultFunc);
        }, 100);
    },

    /**
     * Clips url with favicon (if favicon is recognized)
     */
    clipUrl : function(options) {
        var currentOptions = this.initOptions(options);
        this._clipNotifier.showCopyNotification(document, currentOptions, true);
        var self = this;
        setTimeout(function() {
            var snippet = Evernote.contentPreviewer.getSnippetText();
            if (snippet) {
                snippet = snippet.replace(/(<([^>]+)>)/ig,"");
                var content = Evernote.GlobalUtils.createUrlClipContent(PageContext.title, PageContext.url, PageContext.getFavIconUrl(), snippet);
                Evernote.Addin.clipNote(currentOptions.comments + content, currentOptions, PageContext.url, PageContext.getFavIconUrl(), true, document);
            }else {
                self._clipNotifier.clearWait(document, true);
                Evernote.ClearlyController.getClearlyArticleText( function (data) {
                    snippet = data._html.replace(/(<([^>]+)>)/ig,"");
                    var content = Evernote.GlobalUtils.createUrlClipContent(PageContext.title, PageContext.url, PageContext.getFavIconUrl(), snippet);
                    Evernote.Addin.clipNote(currentOptions.comments + content, currentOptions, PageContext.url, PageContext.getFavIconUrl(), true, document);
                });
            }
        }, 100);
    },

    /**
     * Clips selection from the page.
     */
    clipSelection : function( range, options ) {
        var currentOptions = this.initOptions(options);
        this._clipNotifier.showCopyNotification(document , currentOptions);
        var self = this;
        setTimeout(function() {
            var resultFunc = function(serializedDom) {
                self._clipNotifier.clearWait(document);
                if(serializedDom) {
                    Evernote.Addin.clipNote(currentOptions.comments + serializedDom.content, currentOptions, PageContext.url, serializedDom.imageUrls, true, document);
                }
            };
            self._serializer.serializeSelectionAsync( range, resultFunc );
        }, 100);
    },

    /**
     * Clips image from the page.
     */
    clipImage : function(options ) {
        if (!options.imageElement) {
            Evernote.Logger.debug("clipImage Empty element");
            return;
        }
        var currentOptions = this.initOptions(options);
        this._clipNotifier.showCopyNotification(document , currentOptions);
        var self = this;

        var clojureBug = Evernote.BrowserDetection.isIE7();
        var CUSTOM_ID = 'evn-image-for-clip';

        if (clojureBug) {
            // add attr to find this element later			
            Evernote.JQuery(document).find(options.imageElement).attr( CUSTOM_ID ,'true');
        }

        setTimeout(function() {
            var elementToSerialize = options.imageElement;
            if (clojureBug) {
                var elem = Evernote.JQuery('*['+ CUSTOM_ID +']');
                elementToSerialize = Evernote.JQuery('*['+ CUSTOM_ID +']')[0];
                elem.removeAttr(CUSTOM_ID);
            }
            Evernote.Logger.debug("Start clipping of image");
            var resultFunc = function(serializedDom) {
                self._clipNotifier.clearWait(document);
                Evernote.Logger.debug("Image urls " + JSON.stringify(serializedDom.imageUrls));
                Evernote.Logger.debug("Send clip to EN");
                Evernote.Addin.clipNote(currentOptions.comments + serializedDom.content, currentOptions, PageContext.url, serializedDom.imageUrls, true, document);
            };
            self._serializer.serializeAsync(elementToSerialize, false, resultFunc);
        }, 100);
    },

    /**
     * Clips part of the page, defined in option (url, article or full page) or selection if presented.
     */
    clipWithOptions : function(clipOptions) {

        function getNotebook() {
            return {uid : -1};
        }

        var notebookToClipTo = getNotebook();

        var alwaysTags = [];
        if (notebookToClipTo.type != Evernote.NotebookTypes.LINKED && Evernote.Options.tags.alwaysEnable == true) {
            alwaysTags = Evernote.Options.tags.alwaysData.split(',');
        }

        var options = {
            notebookUid: notebookToClipTo.uid,
            imageElement: EvernoteExternal.imageElement,
            tags: alwaysTags
        };

        if(clipOptions.getClipAction() == Evernote.ClipperActions.CLIP_SELECTION && Evernote.Utils.hasSelection(window)) {
            Evernote.Clipper.clipSelection(null, options);
        }
		 else if(clipOptions.getClipAction() == Evernote.ClipperActions.CLIP_URL) {
            Evernote.Clipper.clipUrl(options);
        } else if(clipOptions.getClipAction() == Evernote.ClipperActions.CLIP_FULL_PAGE) {
            Evernote.Clipper.clipFullPage(options);
        } else if(clipOptions.getClipAction() == Evernote.ClipperActions.CLIP_IMAGE) {
            Evernote.Clipper.clipImage(options);
        } else {
            Evernote.Logger.warn("Unknown option is specified : " + clipOptions.getClipAction());
        }
    },

    clipBase64Image : function(options, base64Image) {
        var self = this;
        var currentOptions = this.initOptions(options);
        this._clipNotifier.showCopyNotification(document , currentOptions);
        Evernote.Addin.clipImageAsync(options, function(result) {
            EvernoteGlobalReceiver(result);
        }, PageContext.url, base64Image);
    }
};