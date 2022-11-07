Evernote.TabSwitcher = {
    init : function () {
        Evernote.JQuery(".evernote-note-title textarea").keydown(this.tabClick);
        Evernote.JQuery("#saveButton").keydown(this.tabClick);
        Evernote.JQuery("#evn-notebook-selector .evn_search input").keydown(this.tabClick);
        Evernote.JQuery(".evn-tags-container input").keydown(this.tabClick);
        Evernote.JQuery(".comments-container textarea").keydown(this.tabClick);
    },

    tabClick : function (e) {
        if (e.keyCode == 9) {
            var found = false;
            var target = Evernote.JQuery(e.target).get(0);
            if (target == Evernote.JQuery(".evernote-note-title textarea").get(0)) {
                found = true;
                var saveButton = Evernote.JQuery('#saveButton');
                saveButton.addClass('focused');
                Evernote.JQuery("#saveButton").get(0).focus();
            }else if (target == Evernote.JQuery("#saveButton").get(0)) {
                found = true;
                var saveButton = Evernote.JQuery('#saveButton');
                saveButton.removeClass('focused');
                Evernote.evernotePopup.switchNotebookSelector();
                Evernote.JQuery("#evn-notebook-selector .evn_search input").get(0).focus();
            }else if (target == Evernote.JQuery("#evn-notebook-selector .evn_search input").get(0)) {
                found = true;
                var popup = Evernote.JQuery('#evn-notebook-selector');
                if (popup.hasClass('visible')) {
                    Evernote.evernotePopup.switchNotebookSelector();
                }
                Evernote.JQuery(".evn-tags-container input").get(0).focus();
            }else if (target == Evernote.JQuery(".evn-tags-container input").get(0)) {
                found = true;
                Evernote.JQuery(".comments-container textarea").get(0).focus();
            }else if (target == Evernote.JQuery(".comments-container textarea").get(0)) {
                found = true;
                Evernote.JQuery(".evernote-note-title textarea").get(0).focus();
            }
            if (found) {
                e.stopPropagation();
                return false;
            }
        }
    }
};

Evernote.NativePopup = function NativePopup( doc ) {
    this.init( doc );
//    this.hide();
};

Evernote.NativePopup.MAX_TAGS_LIMIT = 20;

Evernote.NativePopup.prototype.init = function( doc ) {
    Evernote.Logger.debug("NativePopup.init");
    this._doc = doc;

    this._elem = this._doc.getElementById( 'evernote-content' );
    this._jq_elem = Evernote.JQuery(this._elem);

    this._user = '';
    this._bootOK = false;

    this.tags = [];
    this.noteTags = [];
    this.savedTags = [];
    this.notebooks = [];

    this.skitch = null;
    this.isShown = false;
    this.tooltipTimeout = null;
    this.error = undefined;
    this.tagsLoader = new Evernote.TagsCachedLoader(this, this._doc);
    this.notebooksLoader = new Evernote.NotebooksPopupLoader(this, this.doc);

    this._textAddTags = Evernote.Addin.getLocalizedMessage(Evernote.Messages.ADD_TAG);
    this._textLimitTagsReached = Evernote.Addin.getLocalizedMessage(Evernote.Messages.LIMIT_TAGS_SHORT);
    this._textTagsNotSupported = Evernote.Addin.getLocalizedMessage(Evernote.Messages.TAGS_NOT_SUPPORTED);

    Evernote.Logger.debug("subscribe to responses from addin");
    Evernote.ResponseReceiver.subscribe(this);

    var self = this;
    var container = this._jq_elem;

    Evernote.Logger.debug("NativePopup.init: controls");
    this.initControls(container);
    this.initControlsNew(container);

    Evernote.Logger.debug("bindClickHandlers");
    this.bindClickHandlers(container);
    this.localize();
    this.resetFields();

    setTimeout(function() {
        self.bootstrap();
        container.focus();
    }, 150);
};

Evernote.NativePopup.prototype.hideEditTip = function() {
    // Removed from mockups. Not used now.

    var editTip = this._jq_elem.find('.evernote-note-title .edit-tip');
    editTip.addClass('visible');
    editTip.animate({'opacity':'0'}, 2 * 1000, null,
        function(){
            editTip.removeClass('visible');
            editTip.css({'opacity':''});
        }
    );
};

Evernote.NativePopup.prototype.localize = function() {
    Evernote.Logger.debug("localize");
    Evernote.GlobalUtils.localize(this._elem);
};

Evernote.NativePopup.prototype.bootstrap = function() {
    try {
        var self = this;
        this._jq_elem.find('#evn-main-notebook').addClass('loading');
        this._jq_elem.find('#saveButton').addClass('evn-inactive');

        function processIfLogged() {
            self._user = Evernote.Addin.getLastLoginUser();
            self._bootOK = true;

            Evernote.Logger.debug('Auth is valid. Can request notebooks.');
            self.notebooksLoader.getNotebooksAsync(function(){
                self.populateNotebookSelector();
            });



            Evernote.Notify.completeLoading();
            self.show();
            setTimeout(function()
            {
                Evernote.JQuery("#saveButton").get(0).focus();
            }, 1000);
        }
        this.tagsLoader.getPersonalTagsAsync( processIfLogged );
        Evernote.TabSwitcher.init();
    } catch (e) {
        Evernote.Logger.error("Failed to get notebooks or tags with error " + e);
    }
};

Evernote.NativePopup.prototype.sortNotebooks = function(){
    if (this.notebooks.sort); else { return; }

    function sortAlphabetically(a, b) {
        var an = a.name.toLowerCase();
        var bn = b.name.toLowerCase();
        return an.localeCompare(bn);
    }

    function sortForOldBrowsers(a, b) {
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        return -1;
    }

    try {
        this.notebooks.sort(sortAlphabetically);
    } catch (e) {
        this.notebooks.sort(sortForOldBrowsers)
    }
};

Evernote.NativePopup.prototype.populateNotebookSelector = function() {
    Evernote.Logger.debug('All notebooks were recieved. Populate selector');
    this.sortNotebooks();

    for (var i = 0 ;  i < this.notebooks.length ; i++ ) {
        with ( this.notebooks[i] ) {
            if ( hidden ) continue; // exclude read-only notebooks

            if ( stack ) {
                this.notebookControl.addStackIfNeeded( stack );
                this.notebookControl.addNotebookToStack(name, uid, typeText, author, null, null, stack);
            }
            else {
                this.notebookControl.addNotebookToAll(name, uid, typeText, author, null, null);
            }
        }
    }
    this._jq_elem.find('#evn-main-notebook').removeClass('loading');
    this._jq_elem.find('#saveButton').removeClass('evn-inactive');
    this.selectDefaultNotebook()
};

Evernote.NativePopup.prototype.selectDefaultNotebook = function() {
    Evernote.Logger.debug('Set default notebook selected');

    if (this.notebooks.length == 0) return;

    var selectedNotebookUid = this.notebooks[0].uid;

    var notebookToSearch;
    if ( Evernote.Options.notebooks.lastUsedEnable ) {
        notebookToSearch = Evernote.Options.notebooks.lastUsed;
    } else {
        notebookToSearch = Evernote.Options.notebooks.bydefault;
    }

    for (var i in this.notebooks) {
        if (this.notebooks[i].uid == notebookToSearch) {
            selectedNotebookUid = this.notebooks[i].uid;
            break;
        }
    }

    var selectedNotebook = this.getNotebookById(selectedNotebookUid);
    if (selectedNotebookUid) {
        this.notebookControl.select(selectedNotebook);
        this.updateNotebookField(selectedNotebook.name, selectedNotebook.typeText);
    }
};

Evernote.NativePopup.prototype.updateNotebooks = function(data) {
    this.notebooks = this.notebooks.concat(data);
    Evernote.Logger.debug('Popup.updateNotebooks: ' + this.notebooks.length);
};

Evernote.NativePopup.prototype.updateTags = function(tags) {
    if(tags) {
        this.tags = tags;
    }
};

Evernote.NativePopup.prototype.updateTagsAsync = function(tags) {
    if(tags) {
        this.tags = tags;
        this.tagsControl.updateData(this.tags);
    }
};

Evernote.NativePopup.prototype.updateNotebookField = function ( data , type) {
    Evernote.Logger.debug('updateNotebookField on global tools');

    if (typeof data == "string") {
        var notebook = this._doc.querySelector('#evn-main-notebook #textName');
        notebook.innerText = data.toString();
    }

    if (type); else return;

    // todo: move to Evernote.NotebookTypes
    var typesMapping = {
        1 : 'pers',
        2 : 'biz',
        3 : 'linked'
    };
    type = typesMapping[type] || type; // numbers should be converted to type names

    var noteStr = this._doc.querySelector('#evn-main-notebook');

    noteStr.className = noteStr.className.replace(/\s*evn-type-[a-z]*/ig, '');
    noteStr.className += ' evn-type-' + type;
};

/**
 * Is called when data is received.
 * @param response
 */
Evernote.NativePopup.prototype.onDataReceived = function(response) {
    Evernote.Logger.debug("Evernote.NativePopup.prototype.onDataReceived");
    if(response.type) {
        if(response.type == "notebooks") {
//            this.updateNotebooks(response.data);
        } else if(response.type == "tags") {
            this.tags = response.data;
        }
    }
};

Evernote.NativePopup.prototype.disableTagsIfNeeded = function( notebook ) {
    if (notebook.type == '3' || notebook.type == 'linked') {
        this.savedTags = this.noteTags;
        this.clearSelectedTags();
        this.disableTagsWithText( this._textTagsNotSupported );
    } else {
        this.addMultipleTags(this.savedTags);
        this.enableTagsWithText(this._textAddTags);
    }
};

Evernote.NativePopup.prototype.onNotebookSelected = function(notebook) {
    Evernote.Logger.debug("NativePopup:onNotebookSelected");

    this.updateNotebookField(notebook.notebookName, notebook.type);
    this._jq_elem.find('#evn-notebook-selector').removeClass('visible');
    this._jq_elem.find('#evn-main-notebook').removeClass('active-selector');

    if(this.latestSelectedNotebook) {
        if(this.latestSelectedNotebook.notebookGuid == notebook.notebookGuid) {
            //User have selected same notebook, do not need to reload and clear tags
            this.disableTagsIfNeeded( notebook );
            return;
        }

        if(this.latestSelectedNotebook.type == Evernote.NotebookTypes.PERSONAL_TEXT && notebook.type == Evernote.NotebookTypes.PERSONAL_TEXT) {
            //User have selected personal notebook as before, do not need to reload and clear tags
            return;
        }
    }
    var context = this;
    this.disableTagsIfNeeded( notebook );

    setTimeout(function() {
        switch (notebook.type) {
            case Evernote.NotebookTypes.LINKED:
            case Evernote.NotebookTypes.LINKED_TEXT:
                context.tagsLoader.getLinkedNotebookTagAsync(notebook.notebookGuid | 0);
                break;
            case Evernote.NotebookTypes.BUSINESS:
            case Evernote.NotebookTypes.BUSINESS_TEXT:
                var biz_notebooks = Evernote.ArrayExtension.filter(context.notebooks, function(el) {return el.type == Evernote.NotebookTypes.BUSINESS});
                context.tagsLoader.getBusinessTagsAsync(biz_notebooks);
                break;
            case Evernote.NotebookTypes.PERSONAL:
            case Evernote.NotebookTypes.PERSONAL_TEXT:
                context.tagsLoader.getPersonalTagsAsync();
                break;
        }
        Evernote.Logger.debug("Update data of tags control. Number of tags " + context.tags.length);
        context.latestSelectedNotebook = notebook;
        context._disableClipByEnter = false;
    }, 0);

};

Evernote.NativePopup.prototype.getNotebookById = function(uid) {
    for(var i = 0; i < this.notebooks.length; i++) {
        var notebook = this.notebooks[i];
        if(notebook.uid == uid) {
            return notebook;
        }
    }
    return undefined;
};

Evernote.NativePopup.prototype.getNoteComment = function() {
    return this.comments.val();
};


Evernote.NativePopup.prototype.initControls = function(container) {
    Evernote.Logger.debug("NativePopup.initControls: start");
    var self = this;

    var title = this._doc.querySelector(".evernote-note-title textarea");
    var titleSpan = this._doc.querySelector(".evernote-note-title .expandingArea pre span");
    var comment = this._doc.querySelector(".comments-container textarea");
    var commentSpan = this._doc.querySelector(".comments-container .expandingArea pre span");

    function removeNewLines( field ) {
        // Evernote can't clip note with \n symbol in title.
        if (/\n/.test(field.value)) {
            field.value = field.value.replace(/\n/g,'');
        }
    }

    title.addEventListener('input', function() {
        removeNewLines(title);
        titleSpan.innerText = title.value;
    });
    title.addEventListener('blur',function(){
        title.scrollTop = 0;
    });
    comment.addEventListener('input', function() {
        removeNewLines(comment);
        commentSpan.innerText = comment.value;
    });
    comment.addEventListener('blur',function(){
        comment.scrollTop = 0;
    });

    this.notebookControl = new NotebookSelector (container.find("#evn-notebook-selector .evn_search input"),
        container.find("#evn-notebook-selector .evn_search .cancel"),
        container.find("#evn-notebook-selector .list"),
        container.find("#evn-notebook-selector #evn_scrollable"),
        function ( notebook ) {
            self.onNotebookSelected(notebook);
        }
    );

    Evernote.JQuery("#evn-notebook-selector #evn_scrollable").mCustomScrollbar({
        theme:"evernote",
        scrollInertia:400
    });

    Evernote.Logger.debug("NativePopup.initControls: actionSelector append");
    this.tagsInput = container.find(".tags");
    this.comments = container.find(".evernote-comments");

    Evernote.Utils.hardInput(container.find(".title"));
    Evernote.Utils.hardInput(this.comments);

    Evernote.Logger.debug("NativePopup.initControls: tagsControl init");
    this.tagsControl = new Evernote.AutoCompleteBox(this.tags,
        this.tagsInput,
        {
            onSelect: Evernote.JQuery.proxy(this.addTag, this)
        } ,
        true
    );
    this.tagsContainer = container.find(".added-tags-container");
};

Evernote.NativePopup.prototype.setSelectedNew = function (code) {
        switch (code) {
            case "0" :
                this._doc.getElementById('article').click();
                break;
            case "1" :
                try {
                    this._doc.getElementById('selection').click();
                } catch (ignore) {}
                break;
            case "2" :
                this._doc.getElementById('fullPage').click();
                break;
            case "3" :
                this._doc.getElementById('url').click();
                break;
            case "4" :
                var self = this;
                setTimeout(function() {
                    self._doc.getElementById('screenShot').click();
                }, 0);
                break;
            case "5" :
                this._doc.getElementById('clearly').click();
                break;
            default :
                try {
                    this._doc.getElementById(code).click();
                } catch (ignore) {}
        }
};

Evernote.NativePopup.prototype.initControlsNew = function(container) {

    try {

        this.updateNotebookCustomScroll = function() {
            container.find("#evn-notebook-selector #evn_scrollable").mCustomScrollbar('update');
        };

        this.switchNotebookSelector = function() {
            var popup = container.find('#evn-notebook-selector');

            if (popup.hasClass('visible')) {
                popup.removeClass('visible');
                notebook.removeClass('active-selector');
                self._disableClipByEnter = false;
            } else {
                self._disableClipByEnter = true;
                popup.addClass('visible');
                notebook.addClass('active-selector');
                self.updateNotebookCustomScroll();
                popup.find('input.notebook').focus();
                popup.find('input.notebook').on('input', self.updateNotebookCustomScroll);
            }
        };

        var self = this;

        this.hideGlobalTools = function() {
            self.hidePopupDialogs();
            setTimeout(function(){
                self._jq_elem.removeClass('visible');
            },200);
        };

        this.showGlobalTools = function() {
            if (Evernote.Options.oneClickMode == true && false) { // temporary disabled
                this._jq_elem.addClass('one-click-mode')
            }
            setTimeout(function(){
                self._jq_elem.addClass('visible');
            },200);
        };

        function save() {
            if (self._jq_elem.find('#evn-main-notebook').hasClass('loading')) return;
            var id = self.getActiveClipperElementId();
            Evernote.JQuery.proxy(self.clipNew( id ), self);
        }

        function startClearly() {
            // TODO: clear contentPreviewer on clipper button click, not here.
            Evernote.contentPreviewer.clear();
            Evernote.ClearlyController.highlight();
            Evernote.ClearlyController.startClearly();
        }

        function setActiveClipperEl( elem ) {
            var active = self._doc.querySelector('.clipper.evn-active');
            if (active) {
                active.className = active.className.replace(/\s*evn-active/g, "");
            }
            if (elem) elem.className += " evn-active";
        }

        this.setPopupViewToNormalMode = function() {
            Evernote.Notify.hideAll();
            Evernote.contentPreviewer.clear();

            var actionToRestore = Evernote.Options.action.bydefault;
            if (Evernote.Options.action.lastUsedEnable == 1) {
                var lUs = Evernote.Options.action.lastUsed;
                actionToRestore = (lUs == 'selection') ? 'fullPage' : lUs;
            }
            if (actionToRestore != Evernote.ClipperActions.CLIP_SCREEN_SHOT && actionToRestore != "screenShot") {
                self.selectDefaultAction();
            } else {
                self.setSelectedNew('fullPage');
            }
            container.removeClass('screenshotMode');
        };

        function setPopupViewToScreenshotMode() {
            var t = container.find('.evernote-screenshotPopup .noteTitle');
            var curTitle = container.find(".evernote-note-title textarea").val();
            t.html(curTitle);

            container.addClass('screenshotMode');
        }

        function handleClipperElClick ( evt ) {
            self.hidePopupDialogs();
            self.hideSubTools();

            if (/evn-active/ig.test(evt.srcElement.className)) return; //same action.

            setActiveToolIcon('none');
            setActiveClipperEl( evt.srcElement );

            // todo: refactor
            if (self.getActiveClipperElementId() != 'none' && self.getActiveClipperElementId() != 'screenShot') {
                Evernote.Options.setLastUsedAction(self.getActiveClipperElementId());
            }

            if (evt.srcElement.id != "screenShot" && evt.srcElement.id != "url" ) {
                Evernote.ClearlyController.hide();
                Evernote.SkitchController.clearSkitch();
            }
            switch (evt.srcElement.id) {
                case "article" :
                    Evernote.ClearlyController.highlight();
                    self.onActionChanged('article');
                    break;
                case "fullPage" :
                    Evernote.ClearlyController.highlight();
                    self.onActionChanged('fullPage');
                    break;
                case "selection" :
                    self.onActionChanged('selection');
                    break;
                case "url" :
                    self.onActionChanged('url');
                    Evernote.ClearlyController.hide();
                    break;
                case "screenShot" :
                    Evernote.ClearlyController.disableHighlight();
                    Evernote.contentPreviewer.showScreenShotArea();
                    Evernote.Notify.screenCapture();
                    setPopupViewToScreenshotMode();
                    break;
            }
        }

        function showSubtool(id) {
            var tool = document.querySelector("#" + id);
            if (/expandable/.test(tool.className)) {
                var subtools = document.querySelector("#" + id + "+.subtool_panel");
                hideSubTools(subtools.className);
                if (/visible/.test(subtools.className)) {
                    subtools.className = subtools.className.replace(/\s*visible/g, "");
                } else {
                    subtools.className += " visible";
                }
            }
        }

        function setupScreenShot(coord, callback) {
            var active = self._doc.querySelector('.clipper.evn-active');
            self.switchToSkitch();
            Evernote.contentPreviewer.clear();
            if (!Evernote.SkitchController.isSkitching()) {
                self._jq_elem.one('transitionend',function(){
                    Evernote.SkitchController.setupSkitch(coord, callback);
                });
                self.hideGlobalTools();

                setActiveClipperEl(self._doc.querySelector('#screenShot.clipper'));
            } else {
                callback();
            }
        }

        function setActiveToolIcon(id) {
            if (/crop|zoomin|zoomout|color/ig.test(id)) {
                // Single-click tools. No need to mark as active.
            } else {
                container.find('.skitch.evn-active').removeClass('evn-active');
                container.find('.skitch#' + id).addClass('evn-active');
            }
        }

        function handleSkitchClick( evt ) {
            setActiveToolIcon(evt.srcElement.id);
            clearTimeout(self.tooltipTimeout);
            evt.srcElement.className = evt.srcElement.className.replace(/\stooltipon/ig,'');
            self.hidePopupDialogs();

            var handle = function()
            {
                var skitchColor = Evernote.JQuery(".skitch#color").attr("color");
                var request = { data : { tool : undefined, color: skitchColor } };
                switch (evt.srcElement.id) {
                    case "highlighter" :
                        hideSubTools();
                        request.data.tool = "highlighter";
                        Evernote.SkitchController.useSkitchTool(request);
                        Evernote.SkitchController.useSkitchColor(request);
                        break;
                    case "marker" :
                        hideSubTools();
                        request.data.tool = "marker";
                        Evernote.SkitchController.useSkitchTool(request);
                        Evernote.SkitchController.useSkitchColor(request);
                        break;
                    case "arrow" :
                    case "line" :
                    case "ellipse" :
                    case "roundedRectangle" :
                    case "rectangle" :
                        showSubtool(evt.srcElement.id);
                        request.data.tool = evt.srcElement.id;
                        Evernote.SkitchController.useSkitchTool(request);
                        Evernote.SkitchController.useSkitchColor(request);
                        break;
                    case "text" :
                        hideSubTools();
                        request.data.tool = "text";
                        Evernote.SkitchController.useSkitchTool(request);
                        Evernote.SkitchController.useSkitchColor(request);
                        break;
                    case "stampReject" :
                    case "stampExclaim" :
                    case "stampQuestion" :
                    case "stampAccept" :
                    case "stampPerfect" :
                        showSubtool(evt.srcElement.id);
                        request.data.tool = evt.srcElement.id;
                        Evernote.SkitchController.useSkitchTool(request);
                        Evernote.SkitchController.useSkitchColor(request);
                        break;
                    case "pixelate" :
                        hideSubTools();
                        request.data.tool = "pixelate";
                        Evernote.SkitchController.useSkitchTool(request);
                        Evernote.SkitchController.useSkitchColor(request);
                        break;
                    case "color" :
                        showSubtool(evt.srcElement.id);
                        Evernote.SkitchController.useSkitchColor(request);
                        break;
                    case "crop" :
                        hideSubTools();
                        self.hideGlobalTools();
                        request.data.tool = "crop";
                        Evernote.SkitchController.useSkitchTool(request);
                        Evernote.SkitchController.useSkitchColor(request);
                        break;
                    case "zoomout" :
                        hideSubTools();
                        Evernote.SkitchController.zoomOut();
                        break;
                    case "zoomin" :
                        hideSubTools();
                        Evernote.SkitchController.zoomIn();
                        break;
                }
                self.showExtSkitchTools(true);
            };

            Evernote.contentPreviewer.clear();
            setupScreenShot(null, handle);

        }

        function handleSubtoolClick( evt ) {
            var tool = evt.srcElement.getAttribute("tool");
            if (/colors/.test(evt.srcElement.parentNode.className)) {
                evt.srcElement.parentNode.previousElementSibling.setAttribute("color", tool);
                Evernote.Options.setLastUsedSkitchColor(tool);
                Evernote.SkitchController.useSkitchColor({data: {color : tool}});
            } else {
                evt.srcElement.parentNode.previousElementSibling.id = tool;
                Evernote.SkitchController.useSkitchTool({data: {tool : tool}});
            }
            hideSubTools();
        }

        function hideSubTools(exceptId) {
            var subToolsAll = container.find(".subtool_panel");
            for (var i = 0; i < subToolsAll.length; i++)
            {
                if (subToolsAll[i].className != exceptId)
                    subToolsAll[i].className = subToolsAll[i].className.replace(/\s*visible/g, "");
            }
        }

        function handleSkitchToolMousemove(evt) {
            clearTimeout(self.tooltipTimeout);
            var elem = this;
            self.tooltipTimeout = setTimeout(function() {
                if (!document.querySelector("#" + elem.id + "+.subtool_panel.visible") && (elem.getBoundingClientRect().left < evt.clientX)) {
                    elem.className += " tooltipon";
                }
            }, 250);
        }

        function handleSkitchToolMouseout() {
            clearTimeout(self.tooltipTimeout);
            this.className = this.className.replace(/\s*tooltipon/g, "");
        }

        // variables

        var article = container.find('.clipper#article');
        var clearly = container.find('.clipper#clearly');
        var fullPage = container.find('.clipper#fullPage');
        var url = container.find('.clipper#url');
        var selection = container.find('.clipper#selection');
        var screenShot = container.find('.clipper#screenShot');

        var clipHeader = container.find('.header#clipHeader span');
        var skitchHeader = container.find('.header#skitchHeader span');
        var fileHeader = container.find('.header#fileHeader span');
        var saveButton = container.find('#saveButton');
        var cancelButton = container.find('#cancelButton');
        var notebook = container.find('#evn-main-notebook');

        // event handlers

        var clipperTools = container.find(".clipper");
        for (var i = 0 ; i < clipperTools.length ; i++ ) {
            clipperTools[i].addEventListener('click', handleClipperElClick);
        }

        clearly.click(startClearly);
        notebook.click(this.switchNotebookSelector);
        cancelButton.click(this.setPopupViewToNormalMode);
        saveButton.click(save);

        container.on('skitchSuccess', function(){
            self.showGlobalTools();
        });

        container.on('startCropping', function(){
            self._elem.style.display = 'none';
        });

        container.on('stopCropping', function(){
            self._elem.style.display = 'block';
        });

        container.on('cancelScreenshot', self.setPopupViewToNormalMode);
        container.on('readyToScreenshot', function(e, topX, topY, bottomX, bottomY){
            Evernote.Notify.hideAll();
            Evernote.Options.setLastUsedAction(self.getActiveClipperElementId());

            setupScreenShot([topX, topY, bottomX, bottomY],function()
            {
                var skitchColor = Evernote.JQuery(".skitch#color").attr("color");
                var request = {  data : { tool : "arrow",  color: skitchColor } };
                container.removeClass('screenshotMode');
                setActiveToolIcon(request.data.tool);
                Evernote.SkitchController.useSkitchTool(request);
                Evernote.SkitchController.useSkitchColor(request);
                Evernote.ClearlyController.hide();
                self.onActionChanged('screenShot');
                Evernote.Options.setScreenCaptureHintNonPermanent();
            });

        });

        var Tooltips = {
            arrow : Evernote.Addin.getLocalizedMessage(Evernote.Messages.ARROW),
            color : Evernote.Addin.getLocalizedMessage(Evernote.Messages.COLOR),
            stampReject :Evernote.Addin.getLocalizedMessage(Evernote.Messages.STAMP_REJECT),
            crop : Evernote.Addin.getLocalizedMessage(Evernote.Messages.CROP),
            highlighter : Evernote.Addin.getLocalizedMessage(Evernote.Messages.IMAGE_HIGHLIGHTER),
            marker : Evernote.Addin.getLocalizedMessage(Evernote.Messages.MARKER),
            pixelate : Evernote.Addin.getLocalizedMessage(Evernote.Messages.PIXELATE),
            text : Evernote.Addin.getLocalizedMessage(Evernote.Messages.TEXT),
            zoomin : Evernote.Addin.getLocalizedMessage(Evernote.Messages.ZOOM_IN),
            zoomout : Evernote.Addin.getLocalizedMessage(Evernote.Messages.ZOOM_OUT),
            forbidden : Evernote.Addin.getLocalizedMessage(Evernote.Messages.FORBIDDEN)
        };

        var skitchTools = container.find(".skitch");
        for (var i = 0 ; i < skitchTools.length ; i++ ) {
            skitchTools[i].addEventListener('click', handleSkitchClick);
            skitchTools[i].addEventListener("mousemove", handleSkitchToolMousemove);
            skitchTools[i].addEventListener("mouseout", handleSkitchToolMouseout);

            skitchTools[i].setAttribute('tooltip', Tooltips[skitchTools[i].id]);
        }

        var subtools = container.find(".subtool");
        for (var i = 0; i < subtools.length; i++) {
            subtools[i].addEventListener("click", handleSubtoolClick);
        }

        this.switchToClipper();
        this.setActiveClipperEl = setActiveClipperEl;

    } catch (e) {
        Evernote.ConsoleLogger.warn('initControlsNew error' + e.message);
    }
};

Evernote.NativePopup.prototype.switchToSkitch = function(){
    // show skitch, hide clipper
    Evernote.JQuery('#skitchHeader').show();
    Evernote.JQuery('#clipHeader').hide();
    this._jq_elem.find('.skitch_quintuple').show();
    this._jq_elem.find('.clipper').hide();
};

Evernote.NativePopup.prototype.switchToClipper = function(){
    // vice versa
    Evernote.JQuery('#skitchHeader').hide();
    Evernote.JQuery('#clipHeader').show();
    this._jq_elem.find('.skitch_quintuple').hide();
    this._jq_elem.find('.clipper').show();

};

Evernote.NativePopup.prototype.addTag = function(tagName) {
    if (tagName ==  this._textAddTags) return; // Facebook placeholders problem.
    this.tagsInput.val("");
    if (tagName)
        tagName = Evernote.JQuery.trim(tagName);

    var exist = Evernote.ArrayExtension.containsCaseIgnore(this.noteTags, tagName);
    if(tagName && tagName.length > 0 && !exist && this.noteTags.length < Evernote.NativePopup.MAX_TAGS_LIMIT) {
        this.noteTags.push(tagName);
        var tag = Evernote.JQuery(Evernote.Utils.format("<span class='evernote-added-tag-entry' title='{0}' data-name='{0}'><span class='tag_text'>{1}</span><span class='evernote-close-button'></span></span>", tagName, Evernote.GlobalUtils.escapeXML(Evernote.Utils.cutToLength(tagName, 25))));
        var self = this;
        tag.find(".evernote-close-button").click(function(e) {
            Evernote.Logger.debug("remove tag");
            var tagName = Evernote.JQuery(this).parent().attr("data-name");
            self.removeTag(tagName);
            Evernote.JQuery(this).parent().remove();
            e.stopPropagation();
        });
        this.tagsContainer.append(tag);
    }
    if (this.noteTags.length == Evernote.NativePopup.MAX_TAGS_LIMIT) {
        this.disableTagsWithText(this._textLimitTagsReached);
    }
};

Evernote.NativePopup.prototype.removeLastTag = function() {
    var lastTag = Evernote.JQuery(".evernote-added-tag-entry:last");
    if(lastTag.length > 0) {
        var tagName = lastTag.attr("data-name");
        this.removeTag(tagName);
        lastTag.remove();
    }
};

Evernote.NativePopup.prototype.removeTag = function(tagName) {
    Evernote.ArrayExtension.remove(this.noteTags, tagName);

    this.tagsControl.removeTagFromSelection(tagName);

    if (this.noteTags.length < Evernote.NativePopup.MAX_TAGS_LIMIT) {
        this.enableTagsWithText(this._textAddTags);
    }
    this._jq_elem.find("input.tags").focus();
};

Evernote.NativePopup.prototype.clearSelectedTags = function() {
    this.noteTags = [];
    this.tagsContainer.empty();
    this.tagsControl.clearSelectedTags();
    this.enableTagsWithText(this._textAddTags);
};


Evernote.NativePopup.prototype.tagsEnabled = function() {
    return this._elem.querySelector('input.tags').hasAttribute('disabled') == false;
};
Evernote.NativePopup.prototype.disableTagsWithText = function(text) {
    var tagsInput = this._jq_elem.find("input.tags");
    tagsInput.val('');
    tagsInput.attr('placeholder', text);
    tagsInput.attr('disabled', 'disabled');
    tagsInput.blur();
};

Evernote.NativePopup.prototype.enableTagsWithText = function(text) {
    var tagsInput = this._jq_elem.find("input.tags");
    if (this.noteTags.length == Evernote.NativePopup.MAX_TAGS_LIMIT) {
        tagsInput.attr('placeholder', this._textLimitTagsReached);
        return;
    }
    tagsInput.removeAttr('disabled');
    tagsInput.attr('placeholder', text);
};

Evernote.NativePopup.prototype.setAlwaysTags = function() {
    if (Evernote.Options.tags.alwaysEnable && this.tagsEnabled()) {
        this.addMultipleTags(Evernote.Options.tags.alwaysData);
    }
};

Evernote.NativePopup.prototype.addMultipleTags = function( tags ) {
    if (!tags.splice) { // is Array?
        tags = tags.split(',');
    }
    for (var i = 0; i < tags.length; i++) {
        this.addTag(tags[i]);
    }
};

Evernote.NativePopup.prototype.selectDefaultAction = function() {
    Evernote.Logger.debug("Evernote.NativePopup.prototype.selectDefaultAction: start");

    this.action = 'fullPage';

    /* find default action*/
    this._selectionFinder = new Evernote.SelectionFinder(window.document);

    if(Evernote.Options.action.bydefault == Evernote.ClipperActions.CLIP_URL)
        this.action = 'url';
    else if(Evernote.Options.action.bydefault == Evernote.ClipperActions.CLIP_ARTICLE)
        this.action = 'article';
    else if(Evernote.Options.action.bydefault == Evernote.ClipperActions.CLIP_SCREEN_SHOT)
        this.action = 'screenShot';
    else if(Evernote.Options.action.bydefault == Evernote.ClipperActions.CLIP_SIMPLIFIED_ARTICLE)
        this.action = 'clearly';

    if (Evernote.Options.action.lastUsedEnable == 1) {
        var lUs = Evernote.Options.action.lastUsed;
        this.action = (lUs == 'selection') ? 'fullPage' : lUs;
    }

    if(this.docSelection) {
        this.action = 'selection';
    }

    if (Evernote.Options.skitch.lastUsedColor) {
        Evernote.JQuery(".skitch#color").attr("color", Evernote.Options.skitch.lastUsedColor);
    }

    var self = this;
    if (this.isShown == false) {
        this._jq_elem.one('transitionend', function(){self.setSelectedNew(self.action)});
    } else {
        this.setSelectedNew(this.action);
    }
    Evernote.Logger.debug("Evernote.NativePopup.prototype.selectDefaultAction: end");
};

Evernote.NativePopup.prototype.bindKeyboardHandlers = function() {
    var self = this;
    this._onKeyDownFunc = function(e) {
        self.onKeyDown(e);
    };
    this._onKeyUpFunc = function(e) {
        self.onKeyUp(e);
    };

    document.addEventListener("keydown", this._onKeyDownFunc, false);
    document.addEventListener("keyup", this._onKeyUpFunc, false);
};

Evernote.NativePopup.prototype.getActiveClipperElementId = function() {
    var active = this._doc.querySelector('.clipper.evn-active');
    if ( active ) return active.id;
    return 'none';
};

Evernote.NativePopup.prototype.hideSubTools = function(exceptId) {
    var subToolsAll = this._jq_elem.find(".subtool_panel");
    for (var i = 0; i < subToolsAll.length; i++)
    {
        if (subToolsAll[i].className != exceptId)
            subToolsAll[i].className = subToolsAll[i].className.replace(/\s*visible/g, "");
    }
};

Evernote.NativePopup.prototype.showExtSkitchTools = function(visible) {
    var pairs = document.querySelectorAll(".skitch_pair.conditional");
    for (var i = 0; i < pairs.length; i++) {
        pairs.item(i).className = pairs.item(i).className.replace(/\s*hidden/g, "");
        if (!visible)
            pairs.item(i).className += " hidden";
    }
};

Evernote.NativePopup.prototype.bindHideSubtoolsOnClick = function() {
    var self = this;

    this.closeSubtoolsOnClickOutsideFn = function(e) {

        // hide instruments panels
        if (Evernote.SkitchController.isSkitching() &&
            Evernote.JQuery(e.target).closest('#' + Constants.CLIP_DIALOG_NEW_ID).length == 0)
        {
            self.hideSubTools( null );
        }

        // hide notebooks selector
        if (Evernote.JQuery(e.target).closest('#' + Constants.CLIP_DIALOG_NEW_ID).length == 0)
        {
            self.hidePopupDialogs();
        }
    };

    try {
        document.addEventListener("click", this.closeSubtoolsOnClickOutsideFn, false);
    } catch (e) {
        Evernote.Logger.error( "NativePopup.bindHideSubtoolsOnClick() can't attachEvent" );
    }
};

Evernote.NativePopup.prototype.setPositionStyles = function() {
    this._elem.style.display = 'block';
    this.showGlobalTools();
};

Evernote.NativePopup.prototype.bindClickHandlers = function(container) {
    var self = this;
    container.find("#closeSidebar").click(Evernote.JQuery.proxy(function() {
            if (container.hasClass('screenshotMode')) {
                self.setPopupViewToNormalMode();
            }else {
                this.hide();
                Evernote.SkitchController.clearSkitch();
            }
        }, this));

    container.find(".options-link").bind("click", function() {
        self._elem.style.display = 'none'; /* bug 45634 */
        self.isShown = false;

        self._articleSelected = false;
        self._disableClipByEnter = true;
        self.hideGlobalTools();
        window.event.cancelBubble = true;
        Evernote.ClearlyController.hide();
        Evernote.ClearlyController.disableHighlight();
        Evernote.contentPreviewer.showOverlay();
//        Evernote.SkitchController.disable();
        Evernote.OptionsDialog.show();
    });
};

Evernote.NativePopup.prototype.onOptionsClosed = function() {
    this._elem.style.display = 'block';
    this.isShown = true;

    this._disableClipByEnter = false;
//    Evernote.SkitchController.enable();
    this._jq_elem.removeClass('one-click-mode');
    this.showGlobalTools();

    var actionToRestore = this._doc.querySelector('.clipper.evn-active').id;
    if (actionToRestore == 'screenShot') {
        Evernote.contentPreviewer.clear();
        return;
    }

    this.setActiveClipperEl( null );
    this.setSelectedNew( actionToRestore );
};

Evernote.NativePopup.prototype.getNotebookGuid = function() {
    return this.notebookControl.getSelected() ? this.notebookControl.getSelected().guid | 0 : 0;
};

Evernote.NativePopup.prototype.clipNew = function( id ) {
    if (id && typeof id == 'string') {
        var title = Evernote.JQuery(".evernote-note-title .title").val();

    if (Evernote.Addin.getLastLoginUser() != this._user) {
        // todo: handle new user login.
    }

    var clipNoteOptions = {
        title: title,
        tags: this.noteTags,
        comments: this.getNoteComment().length > 0 ? Evernote.Utils.newLineToBr(Evernote.GlobalUtils.escapeXML(this.getNoteComment())) + "<hr/><br/>" : "",
        notebookUid: this.getNotebookGuid()
    };
    this.hide();

    Evernote.contentPreviewer.clear();
    event.cancelBubble = true;
    Evernote.Options.setNotebook(this.getNotebookGuid());
    Evernote.Options.setLastUsedAction(id);
    switch( id ) {
        case "article":
            Evernote.Clipper.clipArticle(clipNoteOptions);
            break;
        case "clearly":
            Evernote.Clipper.clipArticle(clipNoteOptions, true);
            break;
        case "selection":
            Evernote.Clipper.clipSelection(this.docSelection, clipNoteOptions);
            break;
        case "fullPage":
            Evernote.Clipper.clipFullPage(clipNoteOptions);
            break;
        case "url":
            Evernote.Clipper.clipUrl(clipNoteOptions);
            break;
        case "screenShot":
            Evernote.SkitchController.getImageBase64(function(base64Image) {
                Evernote.Clipper.clipBase64Image(clipNoteOptions, base64Image);
                Evernote.SkitchController.clearSkitch();
            });
            break;
        }
    }
};

Evernote.NativePopup.prototype.onActionChanged = function(selectedId) {
    Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged start");
    this._articleSelected = false;
    this.action = selectedId;
    switch(selectedId) {
        case 'article':
            this._articleSelected = true;
            Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged previewArticle");
            Evernote.contentPreviewer.previewArticle(this.reloadArticle);
            this.reloadArticle = false;
            window.focus();
            break;
        case 'selection':
            Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged previewSelection");
            try {
                Evernote.Utils.clearSelection(window.document);
                Evernote.Utils.selectRange(window.document, this.docSelection);
            } catch(e) {
                //Could happen on IE, just ignore and continue
            }
            Evernote.contentPreviewer.previewSelection(this.docSelection);
            break;
        case 'fullPage':
            Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged previewFullPage");
            Evernote.contentPreviewer.previewFullPage();
            break;
        case 'url':
            Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged previewUrl");
            Evernote.contentPreviewer.previewUrl();
            break;
        case 'screenShot':
            Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged previewScreenShot");
            // TODO: It does nothing. Why?
            break;
    }
    Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged finished");
};

Evernote.NativePopup.prototype.showControls = function() {
    this.docSelection = Evernote.Utils.saveSelection(window);
    var selectionClipTool =  this._doc.getElementById('selection');

    if(this.docSelection === null)    {
        selectionClipTool.className += ' hidden';
    }
    else {
        selectionClipTool.className = selectionClipTool.className.replace(/\s*hidden/g,'');
    }
    Evernote.Logger.debug("NativePopup.show: selectDefaultAction");
    this.selectDefaultAction();
    Evernote.Logger.debug("NativePopup.show: set Always Tags");
    this.setAlwaysTags();
    Evernote.Logger.debug("NativePopup.show: bindKeyboardHandlers");
    this.bindKeyboardHandlers();
    Evernote.Logger.debug("NativePopup.show: bindHideSubtoolsOnClick");
    this.bindHideSubtoolsOnClick();
    Evernote.Logger.debug("NativePopup.show: hide subtools and popup dialogs");
    this.hidePopupDialogs();
    this.hideSubTools();
    Evernote.Logger.debug("NativePopup.show: finished");
};

Evernote.NativePopup.prototype.hidePopupDialogs = function() {
    if (this._jq_elem.find('#evn-notebook-selector').hasClass('visible')) {
        this.switchNotebookSelector();
    }
    var saveButton = Evernote.JQuery('#saveButton');
    saveButton.removeClass('focused');
};

Evernote.NativePopup.prototype.show = function() {
    if (Evernote.evernotePostClipPopup) Evernote.evernotePostClipPopup.hide();

    // we should use Evernote.Addin.getLastLoginUser() instead of dumb _bookOK flag. But addin always returns empty value.
    if (this._bootOK == false) {
        Evernote.Notify.startLoading();
        this.bootstrap();
        return;
    }

    Evernote.Options.load();
    this.selectDefaultNotebook();
    this.showControls();
    this.setPositionStyles();
    this.isShown = true;
};

Evernote.NativePopup.prototype.clearBindings = function() {
    try {
        document.removeEventListener("keydown", this._onKeyDownFunc, false);
        document.removeEventListener("keyup", this._onKeyUpFunc, false);
    } catch( ignore ) {}

    document.removeEventListener("click", this.closeSubtoolsOnClickOutsideFn, false);
};

Evernote.NativePopup.prototype.hide = function() {
    var self = this;
    function hideRoutine() {
        self._elem.style.display = 'none';
        self._elem.className = '';
        self.setActiveClipperEl(null);
        self.switchToClipper();
        Evernote.Notify.completeLoading();
        Evernote.contentPreviewer.clear();
        Evernote.ClearlyController.hide();
        Evernote.ClearlyController.disableHighlight();
        Evernote.OptionsDialog.hide();
        Evernote.SkitchController.clearSkitch();
//      TODO: hide all notifies, except one with error.
        Evernote.Notify.hideAll();
        self.clearBindings();
        self.resetFields();
        self.reloadArticle = true;
        self.isShown = false;
    }

    // see bug #46205
    if (this.isShown == true) {
        this._jq_elem.one('transitionend', hideRoutine);
        this._jq_elem.removeClass('visible');
    } else {
        hideRoutine();
    }
};

Evernote.NativePopup.prototype.resetFields = function() {
    this.clearSelectedTags();

    this._jq_elem.find('.comments-container .evernote-comments').val('');
    this._jq_elem.find('.comments-container .expandingArea pre span').html('');

    var title = PageContext.title.slice(0,255);
    Evernote.JQuery(".evernote-note-title .title", this._elem).val(title);
    Evernote.JQuery(".evernote-note-title .expandingArea pre span", this._elem).val(title);
};

// fixme: Error handler uses this method
Evernote.NativePopup.prototype.processError = function(error) {
    this.error = error;
    Evernote.Notify.completeLoading();
    if (this.isShown) this.hide();
};

Evernote.NativePopup.prototype.onKeyUp = function(evt) {
    if (event.keyCode == 27) {  // Escape
        if (this._disableClipByEnter) { // options is visible
            Evernote.OptionsDialog.close();
            return;
        }
        if (this._jq_elem.hasClass('screenshotMode')) { //crosshair state
            this.setPopupViewToNormalMode();
            return;
        }
        if (Evernote.SkitchController.isSkitching() && Evernote.SkitchController.isCropping()) {
            return;
        }
        this.hide();
        Evernote.SkitchController.clearSkitch();
    }
};

Evernote.NativePopup.prototype.onKeyDown = function(evt) {
    Evernote.Logger.debug("On key up start");

    //Do not react on key events while options are opened
    if(this._disableClipByEnter) {
        return;
    }

    if (event.keyCode == 13) {  // Enter key
        if (Evernote.SkitchController.isSkitching() && Evernote.SkitchController.isCropping()) {
            return;
        }
        this.clipNew(this.getActiveClipperElementId());
        evt.returnValue = false;
        return;
    }

    if (event.keyCode == 9) {   // Tab key
        var focusedEl = Evernote.JQuery(":focus").get(0);
        var dialogEl =  Evernote.JQuery(".note-attributes").get(0);
    }

    // We won't do anything unless we're pretty sure we're correct.
    Evernote.Logger.debug("onkeydown event: nudge handler");
    Evernote.Logger.debug("evt is " + evt);
    if (!evt) return;
    Evernote.Logger.debug("evt.srcElement is " + evt.srcElement);
    if (!evt.srcElement) return;
    Evernote.Logger.debug("evt.keyCode is " + evt.keyCode);
    if (!evt.keyCode) return;

//    if (Evernote.Options.articleSelection == Evernote.ArticleSelectionOptions.DISABLED) return;

    if(!this._articleSelected)
        return;

    var clipAction = this.getActiveClipperElementId();
    Evernote.Logger.debug("Currently selected action " + clipAction);
    if (clipAction != "article") {
        Evernote.Logger.debug("Ignore call from non-article selection");
        // We only allow this for "article" selections.
        return;
    }

    var skipTypes = ["select", "textarea"];
    Evernote.Logger.debug("evt.srcElement.nodeName " + evt.srcElement.nodeName);
    if(evt.srcElement.nodeName) {
        for (var i = 0; i < skipTypes.length; i++) {
            if (evt.srcElement.nodeName.toLowerCase() == skipTypes[i]) {
                return;
            }
        }
    }

    var key = evt.keyCode;
    // Note: the keys in here are all coerced to strings!
    var keyMap = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
    };

    if (keyMap[key]) {
        Evernote.contentPreviewer.previewNudge(keyMap[key]);
        evt.preventDefault ? evt.preventDefault() : (evt.returnValue=false); // prevent page scrolling from keyboard
        evt.returnValue = false;
    }
};