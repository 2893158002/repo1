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

    // TODO: replace with browser detection (test ie9 and others)
    this._ie9 = Evernote.BrowserDetection.isIE9() || this._doc.documentMode == '9';
    this._ie7 = Evernote.BrowserDetection.isIE7() || this._doc.documentMode == '7';

    this._elem = this._doc.getElementById( 'evernote-content' );
    this._jq_elem = Evernote.JQuery(this._elem);

    this.tags = [];
    this.noteTags = [];
    this.savedTags = [];
    this.notebooks = [];

    this._bootOK = false;

    this.isShown = false;
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
    this.showPlaceholders(container);
    this.resetFields();

    setTimeout(function(){
        self.bootstrap();
    },151);

    Evernote.Utils.setEvernoteLogo(".evernote-logo");
};

Evernote.NativePopup.prototype.localize = function() {
    Evernote.Logger.debug("localize");
    Evernote.GlobalUtils.localize(this._elem);
};

Evernote.NativePopup.prototype.modifyToCurrentIE = function() {
    if (this._ie9 == true) {
        this._jq_elem.addClass('evn-iexplorer9');
//        this._jq_elem.find('#saveButton').html('Explorer 9');
    } else if (this._ie7 == true) {
        this._jq_elem.addClass('evn-iexplorer7');
//        this._jq_elem.find('#saveButton').html('Explorer 7');
    }
};

Evernote.NativePopup.prototype.bootstrap = function() {
    try {
        var self = this;
        this._jq_elem.find('#evn-main-notebook').addClass('loading');
        this._jq_elem.find('#saveButton').addClass('evn-inactive');

        function processIfLogged() {
            Evernote.Logger.debug('Auth is valid. Can request notebooks.');

            self.notebooksLoader.getNotebooksAsync(function(){
                self.populateNotebookSelector();
            });
            self._bootOK = true;

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

    this.notebooks.sort(function(a,b){
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        return -1;
    });
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
        var notebook = this._jq_elem.find('#evn-main-notebook #textName').get(0);
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

    var noteStr = this._jq_elem.find('#evn-main-notebook')[0];

    noteStr.className = noteStr.className.replace(/\s*evn-type-[a-z]*/ig, '');
    noteStr.className += ' evn-type-' + type;
};

/**
 * Is called when data is received.
 * @param response
 */

Evernote.NativePopup.prototype.updateNotebooks = function(data) {
    this.notebooks = this.notebooks.concat(data);
};

Evernote.NativePopup.prototype.onDataReceived = function(response) {
    Evernote.Logger.debug("Evernote.NativePopup.prototype.onDataReceived");
    if(response.type) {
        if(response.type == "notebooks") {
//            this.notebooks = this.notebooks.concat(response.data);
        } else if(response.type == "tags") {
            this.tags = response.data;
        }
    }
};

Evernote.NativePopup.prototype.showPlaceholders = function(container) {

    container.find("textarea.title").placeholder({
        placeholderCSS: {
            'font':'italic 15px/18px sans-serif',
            'color':'#FFFFFF',
            'min-height': '18px',
            'position': 'absolute',
            'left':'9px',
            'top':'7px',
            'overflow': 'hidden'
        }
    });
    container.find("input.tags").placeholder({
        placeholderCSS: {
            'left':'-1px',
            'top':'1px'
        }
    });
    container.find("textarea.evernote-comments").placeholder({
        inputWrapper: null,
        placeholderCSS: {
            'left': '10px',
            'top': '0px'
        }
    });
    container.find('#evn-notebook-selector input.notebook').placeholder({
        placeholderCSS: {
            'left': '6px',
            'top': '2px'
        }
    });

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
    this._jq_elem.focus();

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
    var ownedBy = Evernote.Addin.getLocalizedMessage(Evernote.Messages.OWNED_BY);

    function removeNewLines( field ) {
        // Evernote can't clip note with carriage return symbol in title.
        // ie8 uses \r\n, ie9+ uses \n
        if (/\r\n/.test(field.value) || /\n/.test(field.value)) {
            field.value = field.value.replace(/\r\n/g,'').replace(/\n/g,'');
        }
    }

    function checkMaxLength( field, maxLen) {
        // Old ie ignores maxlenth attr in <textarea>
        if(field.value.length > maxLen) {
            title.value = title.value.substr(0, maxLen);
        }
    }

    var $title = this._jq_elem.find(".evernote-note-title textarea");
    var title = $title[0];
    var titleSpan = this._jq_elem.find(".evernote-note-title .expandingArea pre span")[0];

    var $comment = this._jq_elem.find(".comments-container textarea");
    var comment = $comment[0];
    var commentSpan = this._jq_elem.find(".comments-container .expandingArea pre span")[0];

    var commentCont = this._jq_elem.find(".comments-container");
    var tagInput = this._jq_elem.find('.evn-tags-container .tags');
    var tagContainer = this._jq_elem.find('.evn-tags-container');

    tagInput.focusin(function(){
        tagContainer.addClass('evn-active-tag');
    });
    tagInput.focusout(function(){
        tagContainer.removeClass('evn-active-tag');
    });
    commentCont.focusin(function(){
        commentCont.addClass('evn-active-comment');
    });
    commentCont.focusout(function(){
        commentCont.removeClass('evn-active-comment');
    });

    $title.focusin(function(){
       $title.addClass('evn-active-title');
    });
    $title.focusout(function(){
        $title.removeClass('evn-active-title');
    });

    title.attachEvent('onkeyup', function() {
        // bug 46376
        removeNewLines(title);
        checkMaxLength(title, 255);
        titleSpan.innerText = title.value;
    });
    title.attachEvent('onblur',function(){
        titleSpan.innerText = title.value;
        title.scrollTop = 0;
    });
    comment.attachEvent('onkeyup', function() {
        removeNewLines(comment);
        checkMaxLength(comment, 1000);
        commentSpan.innerText = comment.value;
    });
    comment.attachEvent('onblur',function(){
        commentSpan.innerText = comment.value;
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

    Evernote.Logger.debug("NativePopup.initControls: notebookSelector.append");

    this.tagsInput = container.find(".tags");
    this.comments = container.find(".evernote-comments");

    Evernote.Utils.hardInput(container.find(".title"));
    Evernote.Utils.hardInput(this.comments);

    Evernote.Logger.debug("NativePopup.initControls: tagsControl init");
    this.tagsControl = new Evernote.AutoCompleteBox(this.tags,
        this.tagsInput,
        {
            onSelect: Evernote.JQuery.proxy(this.addTag, this)
        }
    );
    this.tagsContainer = container.find(".added-tags-container");
    Evernote.JQuery(".tags-container").click(function(e) {
        e.preventDefault();
        var attr = Evernote.JQuery(".tags-container").find("input").attr('disabled');
        if (typeof attr === 'undefined' || attr === false)
        {
            Evernote.JQuery(".tags-container").find("input").focus();
        }
    });
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
            // screenShot
            break;
        case "5" :
            this._doc.getElementById('clearly').click();
            break;
        default :
            try {
                this._jq_elem.find('#' + code).click();
            } catch (ignore) {}
    }
};

Evernote.NativePopup.prototype.initControlsNew = function(container) {

    var self = this;

    function setActiveClipperEl( elem ) {
         var active = self._jq_elem.find('.clipper.evn-active');
            if (active) {
               active.removeClass('evn-active');
            }
            if (elem) elem.className += " evn-active";
    }

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
            self.notebookControl.updateView();
            popup.find('input.notebook').focus();
        }
    };

    function handleClipperElClick (evt) {
        self.hidePopupDialogs();
        if (/evn-active/ig.test(evt.srcElement.className)) return; //same action.

        setActiveClipperEl( evt.srcElement );
        if (self.getActiveClipperElementId() != 'none') Evernote.Options.setLastUsedAction(self.getActiveClipperElementId());

        if (evt.srcElement.id != "url" ) {
            Evernote.ClearlyController.hide();
        }

        switch (evt.srcElement.id) {
            case "article" :
                self.onActionChanged('0');
                break;
            case "clearly" :
                self.onActionChanged('clearly');
                break;
            case "fullPage" :
                self.onActionChanged('2');
                break;
            case "selection" :
                self.onActionChanged('1');
                break;
            case "url" :
                self.onActionChanged('3');
                Evernote.ClearlyController.hide();
                break;
        }
    }

    function hideGlobalTools() {
        self.hidePopupDialogs();
        self._jq_elem.removeClass('visible');
    }

    function showGlobalTools() {
        self._jq_elem.addClass('visible');
    }

    function save() {
        if (self._jq_elem.find('#evn-main-notebook').hasClass('loading')) return;
        var id = self.getActiveClipperElementId();
        Evernote.JQuery.proxy(self.clipNew( id ), self);
    }

    // variables

    var article = container.find('.clipper#article');
    var fullPage = container.find('.clipper#fullPage');
    var url = container.find('.clipper#url');
    var selection = container.find('.clipper#selection');

    var saveButton = container.find('#saveButton');
    var notebook = container.find('#evn-main-notebook');


    var clipperTools = container.find(".clipper");


    for (var i = 0 ; i < clipperTools.length ; i++ ) {
        clipperTools[i].attachEvent('onclick', handleClipperElClick);
    }

    notebook.click(this.switchNotebookSelector);
    saveButton.click(save);

    this.setActiveClipperEl = setActiveClipperEl;
    this.hideGlobalTools = hideGlobalTools;
    this.showGlobalTools = showGlobalTools;
};

Evernote.NativePopup.prototype.addTag = function(tagName) {
    this.tagsInput.val("");
    if (tagName) {
        tagName = Evernote.JQuery.trim(tagName);
    }

    var exist = Evernote.ArrayExtension.containsCaseIgnore(this.noteTags, tagName);
    if(tagName && tagName.length > 0 && !exist && this.noteTags.length < Evernote.NativePopup.MAX_TAGS_LIMIT) {
        this.noteTags.push(tagName);

        var tagLabel = Evernote.GlobalUtils.escapeXML(tagName);
        tagLabel = tagLabel.replace(' ','&#160;');

//        var tag = Evernote.JQuery(Evernote.Utils.format("<span class='evernote-added-tag-entry' data-name='{0}'>{1}<span class='evernote-close-button'></span></span>", tagName, tagLabel));

//        var tag = Evernote.JQuery(Evernote.Utils.format("<table cellspacing='0' class='evernote-added-tag-entry' title='{0}' data-name='{0}'><tr><td width='12'><div class='evn-tag-left'>&#160;</d></td><td class='evn-tag-center'><div class='tag_text'>{1}</div></td><td width='13'><div class='evernote-close-button'>&#160;</div></td></tr></table>", tagName, tagLabel));


        var tag = Evernote.JQuery(Evernote.Utils.format("<table cellspacing='0' class='evernote-added-tag-entry' title='{0}' data-name='{0}'><tr><td class='evn-tag-left'><div class='tag_text'>{1}</div></td><td class='evn-tag-right'><div class='evernote-close-button'>&#160;</div></td></tr></table>", tagName, tagLabel));

//        var tag = Evernote.JQuery(Evernote.Utils.format("<div class='evernote-added-tag-entry' title='{0}' data-name='{0}'><div class='evn-tag-left'>{1}</div><div class='evernote-close-button'>&#160;</div></div>", tagName, tagLabel));

        var self = this;

        tag.find(".evernote-close-button").click(function(e) {
            Evernote.Logger.debug("remove tag");
            var tagName = Evernote.JQuery(tag).closest('.evernote-added-tag-entry').attr("data-name");
            self.removeTag(tagName);
            Evernote.JQuery(tag).closest('.evernote-added-tag-entry').remove();
            e.stopPropagation();
        });

        tag.hide();
        this.tagsContainer.append(tag);
        this.adjustContainerHeight();


        // todo: bad practice. Find new element structure.
        // ie7 doesn't apply text-overflow property to table elements. bug 46380
        // timeout is for proper .offsetWidth calculation (element must be rendered when getting value)

        setTimeout(function(){
            tag.show();
            if (tag[0].offsetWidth > 177) {
                tag.addClass('evn-big-tag');
            };
        },0);


    }
    if (this.noteTags.length == Evernote.NativePopup.MAX_TAGS_LIMIT) {
        this.disableTagsWithText(this._textLimitTagsReached)
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
    var self = this;
    setTimeout(function() {
        self.adjustContainerHeight();
    }, 0);

    if (this.noteTags.length < Evernote.NativePopup.MAX_TAGS_LIMIT) {
       this.enableTagsWithText(this._textAddTags)
    }
};

Evernote.NativePopup.prototype.clearSelectedTags = function() {
    this.noteTags = [];
    this.tagsContainer.html("");
    this.tagsControl.clearSelectedTags();
    this.adjustContainerHeight();
    Evernote.JQuery(this._elem).find("input.tags").removeAttr('disabled');
    this._jq_elem.find('.evn-tags-container').removeAttr('disabled');
};


Evernote.NativePopup.prototype.tagsEnabled = function() {
    var el = this._jq_elem.find('input.tags').attr('disabled') == undefined;
    return el;
};

Evernote.NativePopup.prototype.disableTagsWithText = function(text) {
    var tagsInput = this._jq_elem.find("input.tags");
    tagsInput.val('');
    tagsInput.attr('placeholder', text);
    tagsInput.next().html(text);

    tagsInput.attr('disabled', 'disabled');
    this._jq_elem.find('.evn-tags-container').addClass('evn-tagcontainer-disabled');
    tagsInput.blur();
};

Evernote.NativePopup.prototype.enableTagsWithText = function(text) {
    var tagsInput = this._jq_elem.find("input.tags");
    if (this.noteTags.length == Evernote.NativePopup.MAX_TAGS_LIMIT) {
        tagsInput.attr('placeholder', this._textLimitTagsReached);
        tagsInput.next().html(this._textLimitTagsReached);
        return;
    }
    tagsInput.removeAttr('disabled');
    this._jq_elem.find('.evn-tags-container').removeClass('evn-tagcontainer-disabled');
    tagsInput.attr('placeholder', text);
    tagsInput.next().html(text);
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

Evernote.NativePopup.prototype.adjustContainerHeight = function() {
    if(Evernote.Utils.isQuirkMode() || Evernote.BrowserDetection.isLessThanIE9()) {
        Evernote.JQuery(Evernote.JQuery(".autoPadDiv","#evernote-content").get().reverse()).each( function(i , el) {
            if( Evernote.JQuery(el).is(":visible")) {
                var outerContainerHeight = Evernote.JQuery(el).outerHeight();
                Evernote.JQuery(el).parent().height(outerContainerHeight + 8);
                var parentH = Evernote.JQuery(el).parent().height();
                Evernote.JQuery(el).prev().height(parentH  -16);
            }
        });
        var self = this;
        setTimeout(function() {
            self.comments.css("display", "block");
            self.comments.css("display", "inline-block");
            self.tagsInput.css("display", "block");
            self.tagsInput.css("display", "inline-block");
        }, 0)
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
    else if(Evernote.Options.action.bydefault == Evernote.ClipperActions.CLIP_SIMPLIFIED_ARTICLE)
        this.action = 'clearly';

    if (Evernote.Options.action.lastUsedEnable == true) {
        var lUs = Evernote.Options.action.lastUsed;
        this.action = (lUs == 'selection') ? 'fullPage' : lUs;
    }

    if(this.docSelection) {
        this.action = 'selection';
    }

    var self = this;
    setTimeout(function(){
        self.setSelectedNew(self.action);
    },0);
    Evernote.Logger.debug("action is : " + this.action);
};

Evernote.NativePopup.prototype.bindKeyboardHandlers = function() {
    var self = this;
    this._onKeyDownFunc = function(e) {
        self.onKeyDown(e);
    };
    this._onKeyUpFunc = function(e) {
        self.onKeyUp(e);
    };

    document.attachEvent("onkeydown", this._onKeyDownFunc);
    document.attachEvent("onkeyup", this._onKeyUpFunc);
};

Evernote.NativePopup.prototype.getActiveClipperElementId = function() {
    var active = this._jq_elem.find('.clipper.evn-active');
    if ( active ) return active[0].id;
    return 'none';
};

Evernote.NativePopup.prototype.bindHideSubtoolsOnClick = function() {
    var self = this;

    this.closeSubtoolsOnClickOutsideFn = function(e) {
        // hide notebooks selector
        if (Evernote.JQuery(e.srcElement).closest('#' + Constants.CLIP_DIALOG_NEW_ID).length == 0)
        {
            self.hidePopupDialogs();
        }
    };

    try {
        document.attachEvent("onclick", this.closeSubtoolsOnClickOutsideFn);
    } catch (e) {
        Evernote.Logger.error( "NativePopup.bindHideSubtoolsOnClick() can't attachEvent" );
    }
};

Evernote.NativePopup.prototype.setPositionStyles = function() {
    //todo: very bad appearance in quirks
    if(Evernote.Utils.isQuirkMode()) {
        Evernote.Utils.fixedPosition(window, this._elem, 20, true);
    }

    this.modifyToCurrentIE();
    this.showGlobalTools();
};

Evernote.NativePopup.prototype.bindClickHandlers = function(container) {
    var self = this;

    container.find("#closeSidebar").click(Evernote.JQuery.proxy(function() {
        self.hide();
    }, this));

    container.find(".options-link").bind("click", function() {
        Evernote.Logger.debug("Show options");
        self._articleSelected = false;
        self._disableClipByEnter = true;
        self.hideGlobalTools();
        window.event.cancelBubble = true;
        Evernote.ClearlyController.hide();
        Evernote.contentPreviewer.showOverlay();
        Evernote.OptionsDialog.show();
    });
};

Evernote.NativePopup.prototype.onOptionsClosed = function() {
    this._disableClipByEnter = false;
    this._jq_elem.removeClass('one-click-mode');
    this.showGlobalTools();
    var actionToRestore = this._jq_elem.find('.clipper.evn-active').get(0).id;
    this.setActiveClipperEl( null );
    this.setSelectedNew( actionToRestore );
};

Evernote.NativePopup.prototype.getNotebookGuid = function() {
    return this.notebookControl.getSelected() ? this.notebookControl.getSelected().guid | 0 : 0;
};

Evernote.NativePopup.prototype.clipNew = function( id ) {
    if (id && typeof id == 'string') {
        var title = Evernote.JQuery(".evernote-note-title .title").val();
        var clipNoteOptions = {
            title: title,
            tags: this.noteTags,
            comments: this.getNoteComment().length > 0 ? Evernote.Utils.newLineToBr(Evernote.GlobalUtils.escapeXML(this.getNoteComment())) + "<hr/><br/>" : "",
            notebookUid:  this.getNotebookGuid()
        };
        this.hide();
        var notebookName = this._jq_elem.find('#evn-main-notebook #textName').html();
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
        }
    }
};

Evernote.NativePopup.prototype.onActionChanged = function(selectedId) {
    Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged start");
    this._articleSelected = false;
    this.action = selectedId;
    switch(selectedId) {
        case "0":
            this._articleSelected = true;
            Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged previewArticle");
            Evernote.contentPreviewer.previewArticle(this.reloadArticle);
            this.reloadArticle = false;
            break;
        case "1":
            Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged previewSelection");
            try {
                Evernote.Utils.clearSelection(window.document);
                Evernote.Utils.selectRange(window.document, this.docSelection);
            } catch(e) {
                //Could happen on IE, just ignore and continue
            }
            Evernote.contentPreviewer.previewSelection(this.docSelection);
            break;
        case "2":
            Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged previewFullPage");
            Evernote.contentPreviewer.previewFullPage();
            break;
        case "3":
            Evernote.Logger.debug("Evernote.NativePopup.prototype.onActionChanged previewUrl");

            Evernote.contentPreviewer.previewUrl();
            break;
        case "clearly":
            Evernote.contentPreviewer.clear();
            Evernote.ClearlyController.startClearly();
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
    Evernote.Logger.debug("NativePopup.show: bindUpdatePreviewOnResize");
    this.bindUpdatePreviewOnResize();
    Evernote.Logger.debug("NativePopup.show: finished");
};

Evernote.NativePopup.prototype.hidePopupDialogs = function() {
    if (this._jq_elem.find('#evn-notebook-selector').hasClass('visible')) {
        this.switchNotebookSelector();
    }
    var saveButton = Evernote.JQuery('#saveButton');
    saveButton.removeClass('focused');
};

//TODO: move next two functions into ContentVeil object.
Evernote.NativePopup.prototype.bindUpdatePreviewOnResize = function() {
    var context = this;
    this.onResizeFn = function() {
        //   context.onActionChanged();
    };
    Evernote.JQuery(window).resize(this.onResizeFn);
};

Evernote.NativePopup.prototype.unbindUpdatePreviewOnResize = function() {
    if(this.onResizeFn) {
        Evernote.JQuery(window).unbind("resize", this.onResizeFn);
        this.onResizeFn = undefined;
    }
};

Evernote.NativePopup.prototype.show = function() {
    if (Evernote.evernotePostClipPopup) Evernote.evernotePostClipPopup.hide();

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

    var self = this;
    setTimeout(function() {
        self.adjustContainerHeight();
    }, 0);
};

Evernote.NativePopup.prototype.clearBindings = function() {
    try {
        document.detachEvent("onkeydown", this._onKeyDownFunc);
        document.detachEvent("onkeyup", this._onKeyUpFunc);
    } catch( ignore ) {}

    if(this.closeOnClickOutsideFn) {
        if (document.attachEvent)
            document.detachEvent('onclick', this.closeOnClickOutsideFn);
        else if (document.addEventListener)
            document.removeEventListener ("click", this.closeOnClickOutsideFn, false);
        this.closeOnClickOutsideFn = undefined;
    }
};

Evernote.NativePopup.prototype.hide = function() {
    this._elem.className = '';
    this.setActiveClipperEl(null);
    Evernote.Notify.completeLoading();
    Evernote.contentPreviewer.clear();
    Evernote.ClearlyController.hide();
    Evernote.OptionsDialog.hide();
//    Evernote.Notify.hideAll();
    this.clearBindings();
    this.resetFields();
    this.unbindUpdatePreviewOnResize();
    this.reloadArticle = true;
    this.isShown = false;
};

Evernote.NativePopup.prototype.changeValue = function( field, value ) {
    // you must use this function instead of simple .val() for correct placeholder behavior.

    field = Evernote.JQuery(field);

    field.val( value );
    field.trigger('blur');
};

Evernote.NativePopup.prototype.resetFields = function() {
    this.clearSelectedTags();

    var commentsField = this._jq_elem.find(".evernote-comments");
    commentsField.val("");
    commentsField.next().show();
    this._jq_elem.find('.comments-container .expandingArea pre span').get(0).innerText = '';


    var title = PageContext.title.slice(0,255);
    Evernote.JQuery(".evernote-note-title .title", this._elem).val(title);
    // hide placeholder bacause it isn't listens to 'change' event.
    Evernote.JQuery(".evernote-note-title .title", this._elem).next().hide();
    Evernote.JQuery(".evernote-note-title .expandingArea pre span", this._elem).get(0).innerText = title;
};

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
        this.hide();
    }
};

Evernote.NativePopup.prototype.onKeyDown = function(evt) {
    Evernote.Logger.debug("On key down start");

    //Do not react on key events while options page is opened
    if(this._disableClipByEnter) {
        return;
    }

    if (event.keyCode == 13) {  // Enter key
        this.clipNew(this.getActiveClipperElementId());
        evt.returnValue = false;
        return;
    }

    if (event.keyCode == 9) {   // Tab key
        var focusedEl = Evernote.JQuery(":focus").get(0);
        var dialogEl =  Evernote.JQuery(".note-attributes").get(0);
        if (!Evernote.JQuery.contains(dialogEl, focusedEl)) {
            Evernote.JQuery(".note-attributes .title", this._elem).focus();
            evt.returnValue = false;
            return;
        }
    }

    // We won't do anything unless we're pretty sure we're correct.
    Evernote.Logger.debug("Onkeyup event: nudge handler");
    Evernote.Logger.debug("evt is " + evt);
    if (!evt) return;
    Evernote.Logger.debug("evt.srcElement is " + evt.srcElement);
    if (!evt.srcElement) return;
    Evernote.Logger.debug("evt.keyCode is " + evt.keyCode);
    if (!evt.keyCode) return;

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
        evt.returnValue = false;
    }
};