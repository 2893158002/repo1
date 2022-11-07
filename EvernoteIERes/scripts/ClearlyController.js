Evernote.ClearlyController = {
    _created : false,
    _visible : false,
    _logEnabled : false,
    _detectResult : null,

    logger : function(text) {
        if (!this._logEnabled) return;
        console.log('[Clearly] : ' + text);
    },

    getSimplifiedArticle : function() {
        this.logger('getSimplifiedArticle()');
        return Evernote.JQuery('#evernoteClearlyArticle #box #text').get(0);
    },

    changeFrameClassTo : function(className) {
        this.clearlyFrame[0].className = '';
        this.clearlyFrame.addClass(className);
    },

    hide : function() {
        this.logger('hide()');
        var self = this;
        if (this._created && this._visible) {
            this.clearlyBackground.stop();
            this.changeFrameClassTo('processing');
            this.clearlyBackground.animate({right:'100%'}, 500, null,
                function() {
                    self.changeFrameClassTo('temphidden');
                    window.focus();
                }
            );
            this._visible = false;
        }
    },

    show : function() {
        this.logger('show()');
        var self = this;
        if (this._created && !this._visible) {
            this.clearlyBackground.stop();
            this.changeFrameClassTo('processing');
            this.clearlyBackground.animate({ right: "0px" }, 500, null,
                function() {
                    self.changeFrameClassTo('visible');
                    window.focus();
                }
            );
            this._visible = true;
        }
    },

    detectComponent : function(callback) {
        this.logger('detectComponent()');
        window.ClearlyComponent__detect = {
            callbacks: {
                finished: function(data) {
                    if (callback) callback(data);
                }
            },
            window: window,
            document: document,
            jQuery: Evernote.JQuery
        };

        window.ClearlyComponent__detect = initClearlyComponent__detect(window.ClearlyComponent__detect);
        window.ClearlyComponent__detect.start();
    },

    reformatComponent : function(callback){
        this.logger('reformatComponent()');
        window.ClearlyComponent__reformat = {
            callbacks: {
                frameCreated: function(data) {
                    if (callback) callback(data);
                }
            },
            settings: {
                cssPath: 'css/clearly',
                pageLabel: "page ",
                onCreateFrameUseThisId: "evernoteClearlyArticle",
                onCreateFrameDoNotInsertCSS: true
            },
            window: window,
            document: document,
            jQuery: Evernote.JQuery
        };

        window.ClearlyComponent__reformat = initClearlyComponent__reformat(window.ClearlyComponent__reformat);
        window.ClearlyComponent__reformat.createFrame();
    },

    getContentElementAndHTML : function (callback) {
        this.logger('getContentElementAndHTML()');
        this.detectComponent(callback);
    },

    getClearlyArticleText : function(callback) {
        this.logger('getClearlyArticleText()');
        this.detectComponent(callback);
    },

    assignClearlyArticleContent : function()  {
        this.logger('showClearlyArticleContent()');
        window.ClearlyComponent__reformat.$iframeBox.find('#text #pages')[0].innerHTML = this._detectResult;
    },

    setContainersSize : function() {
        var maxHeight = Math.max(document.body.scrollHeight, this.clearlyFrame.scrollHeight);

        try { //old ie throws error
            this.clearlyFrame[0].style.height = maxHeight + "px";
        } catch (e) {

        }
    },

    startClearly : function() {
        this.logger('startClearly()');

        var self = this;

        if (this._created) {
            self.show();
            return;
        }

        function onDetectEnd(data) {
            self._detectResult = data._html.replace(/(id|class)="(.*?)"/ig,'cid="$2"');
            self.assignClearlyArticleContent();
            self.show();
        }

        function onFrameCreated() {
            self.clearlyFrame = window.ClearlyComponent__reformat.$iframe;
            self.clearlyBackground = window.ClearlyComponent__reformat.$iframeBackground;
            self._created = true;
            self.setContainersSize();
            self.detectComponent(onDetectEnd);
        }

        window.scrollTo(0,0);
        this.reformatComponent(onFrameCreated);
    },

    isReady : function() {
        return this._created;
    },

    isVisible : function() {
        return this._visible;
    },

    highlight : function () {
        this.logger('highlight()');
        var numTextHighlights;

        window.ClearlyComponent__highlight = {
            callbacks: {
                highlightAdded: function() {
                    numTextHighlights++;
                },
                highlightDeleted: function() {
                    numTextHighlights--;
                }
            },
            settings: {
                imgPath: "images/"
            },
            window: window,
            document: document,
            jQuery: Evernote.JQuery
        };

        window.ClearlyComponent__highlight = initClearlyComponent__highlight(window.ClearlyComponent__highlight);
        window.ClearlyComponent__highlight.insertCSS();
        window.ClearlyComponent__highlight.addMouseHandlers();

        window.ClearlyComponent__highlight.enable();
    },

    disableHighlight : function() {
        this.logger('disableHighlight()');
        if (window.ClearlyComponent__highlight) {
            window.ClearlyComponent__highlight.disable();
        }
    },

    removeHighlighted : function() {
        this.logger('removeHighlighed()');
//        Evernote.JQuery('.clearly_highlight_delete_element').click();
    }
};