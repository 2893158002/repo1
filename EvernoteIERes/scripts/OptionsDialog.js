Evernote.OptionsDialog = {

    container : null,

    show : function() {
        this.init();
        Evernote.Options.load();
        this.populateOptions();
        if(this.container) {
            this.container.show();
        }
    },

    populateOptions : function() {
        this.dafaultActionElement.val(Evernote.Options.action.bydefault);
        this.alwaysTagsInput.val(Evernote.Options.tags.alwaysData);
        this.alwaysTagsCheckbox[0].checked = Evernote.Options.tags.alwaysEnable;
        this.oneClickClippingCheckbox[0].checked = Evernote.Options.oneClickMode;
        if (Evernote.Options.action.lastUsedEnable) {
            this.lastUsedActionElement[0].checked = true;
        } else {
            this.articleSelectionRadioElement[0].checked = true;
        }
        if (Evernote.Options.notebooks.lastUsedEnable) {
            this.lastUsedNotebookElement[0].checked = true;
        } else {
            this.alwaysStartInNotebook[0].checked = true;
        }
        if (Evernote.Options.postClip.show) {
            this.showPostClip[0].checked = true;
        } else {
            this.closePostClip[0].checked = true;
        }

        // populate notebooks selector

        this.defaultNotebookElement.empty();
        var notebooks = Evernote.evernotePopup.notebooks;

        function addNotebookToSelector( item , selector ) {
            var opt = document.createElement('option');

            var full_name = item.name;
            if (item.author) full_name += '  (' + item.author + ')';

            opt.value = item.uid;
            opt.innerHTML = full_name;
            selector.append(opt);
        }

        for (var i = 0; i < notebooks.length ; i++) {
            if (notebooks[i].hidden) continue; // skip read-only notebooks
            addNotebookToSelector( notebooks[i],  this.defaultNotebookElement);
        }

        this.defaultNotebookElement.val(Evernote.Options.notebooks.bydefault);

    },

    hide : function() {
        if(this.container) {
            this.container.hide();
        }
    },

    close : function() {
        Evernote.Logger.debug("On close");
        this.hide();
        // todo: replace with Evernote.Utils.sendMessageToPopup
        Evernote.evernotePopup.onOptionsClosed();
        window.event.cancelBubble = true;
    },

    insertCopyright : function() {
        var text = Evernote.Addin.getLocalizedMessage(Evernote.Messages.COPYRIGHT);
        var year = new Date().getFullYear();
        text = text.replace('2013', year);
        this.container.find('#evn-copyright').text(text)
    },

    modifyToCurrentIE : function() {
        var version = document.documentMode;

        // global class for style fixes
        this.container.addClass('evn-options-for-ie-' + version);

        // Only ie10+ supports screen capture.
        if ( version >= 10 ) {
            var screenOpt = document.createElement('option');
            screenOpt.setAttribute('value', 6);
            screenOpt.setAttribute('message','SCREENSHOT');
            this.container.find('select.default-action-option').append(screenOpt);
        }

        // ie7 and ie8 doesn't support native placeholders
        // todo: implement custom placeholder
    },

    init : function() {
        if(!this.container) {
            this.container = Evernote.JQuery("#" + Constants.OPTIONS_DIALOG_ID);
            var self = this;
            var container = this.container;

            this.modifyToCurrentIE();

            this.dafaultActionElement = container.find("select.default-action-option");
            this.lastUsedActionElement = container.find("#lastUsedAction");
            this.articleSelectionRadioElement = container.find("#alwaysStartIn");

            this.defaultNotebookElement = container.find("select.default-notebook-option");
            this.lastUsedNotebookElement = container.find("#lastUsedNotebook");
            this.alwaysStartInNotebook = container.find("#alwaysStartInNotebook");

            this.alwaysTagsCheckbox = container.find("#alwaysTagWith");
            this.alwaysTagsInput = container.find("#alwaysTags");
            this.oneClickClippingCheckbox = container.find("#oneClickClipping");

            this.showPostClip = container.find('#showSuccessful');
            this.closePostClip =  container.find('#automaticallyClose');

            this.closeButton = container.find("#evn-footer #evn-done");
            this.closeButton.click( function() {
                if (!Evernote.Notify.isOptionsSaving())
                    self.close()
            });

            this.logsButton = container.find('#copyLogs');
            this.logsButton.click( function() {
               self.showLogs();
            });

            this.tabHeaders = container.find('.evn-tab');
            this.tabHeaders.click( function(e) {
                var tab = Evernote.JQuery(e.srcElement).closest('.evn-tab');
                var id = tab[0].id;

                var active = container.find('.evn-pressed');
                if (active) active.removeClass('evn-pressed');

                tab.addClass('evn-pressed');

                var pinch = container.find('.evn-pinch');
                pinch.removeClass().addClass('evn-pinch');
                pinch.addClass(id + 'Active');
            });


            this.bindModificationHandlers();
            Evernote.GlobalUtils.localize(this.container[0]);
            this.insertCopyright();

            Evernote.ResponseReceiver.subscribe(this);
            setTimeout(function() {
                try {
                    Evernote.Addin.getEvernoteVersion(document);
                } catch (e) {
                    Evernote.Logger.error("Failed to get version with error " + e);
                }
            }, 150);
        }
    },

    showLogs: function() {
        var logFile = Evernote.Addin.getPath("logfile");
        Evernote.Addin.openLocalFile(logFile, BrowserNavConstants.NAVOPENNEWTAB);
    },

    bindModificationHandlers : function() {
        var self = this;

        this.dafaultActionElement.change(function() {
            this.blur();
            Evernote.Options.setDefaultAction(self.dafaultActionElement.val());
            Evernote.Notify.optionsSaved();
        });
        this.articleSelectionRadioElement.change(function() {
            Evernote.Options.setDefaultAction(self.dafaultActionElement.val());
            Evernote.Notify.optionsSaved();
        });
        this.lastUsedActionElement.change(function () {
            Evernote.Options.setLastUsedActionEnabled();
            Evernote.Notify.optionsSaved();
        });

        this.lastUsedNotebookElement.change(function() {
            Evernote.Options.setLastUsedNotebookEnabled();
            Evernote.Notify.optionsSaved();
        });

        this.defaultNotebookElement.change(function(){
            Evernote.Options.setDefaultNotebook(self.defaultNotebookElement.val());
            Evernote.Notify.optionsSaved()
        });

        this.alwaysStartInNotebook.change(function() {
            Evernote.Options.setLastUsedNotebookDisabled();
            Evernote.Notify.optionsSaved();
        });

        this.oneClickClippingCheckbox.change(function () {
            Evernote.Options.setOneClickClipping(this.checked);
            Evernote.Notify.optionsSaved();
        });
        this.alwaysTagsCheckbox.change(function () {
            Evernote.Options.setAlwaysTagsEnabled(this.checked);
            Evernote.Notify.optionsSaved();
        });
        this.alwaysTagsInput.change(function(){
            Evernote.Options.setAlwaysTagsString(this.value);
            Evernote.Notify.optionsSaved();
        });

        this.showPostClip.change(function(){
            Evernote.Options.setPostClipDialogEnabled();
            Evernote.Notify.optionsSaved();
        });

        this.closePostClip.change(function(){
            Evernote.Options.setPostClipDialogDisabled();
            Evernote.Notify.optionsSaved();
        });

        // bug 46192
        Evernote.Utils.hardInput(this.alwaysTagsInput);
    },

    /**
     * Is called when data is received.
     * @param response
     */
    onDataReceived : function(response) {
        Evernote.Logger.debug("Evernote.NativePopup.prototype.onDataReceived");
        if(response.type && (response.type == "version")) {
            Evernote.Logger.debug("Evernote version is " + response.data);
            var versionEl = this.container.find("#evn-versionInfo");
            var text = Evernote.Addin.getLocalizedMessage(Evernote.Messages.VERSION);
            versionEl.text(text + ': ');
            var versionValue = this.container.find("#evn-versionValue");
            versionValue.text(response.data);
        }
    }
};