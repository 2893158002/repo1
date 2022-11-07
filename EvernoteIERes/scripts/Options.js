Evernote.ClipperActions = {
    CLIP_URL : "0",
    CLIP_FULL_PAGE: "1",
    CLIP_ARTICLE: "2",
    CLIP_SELECTION: "3", // Selection is not supported by default
    CLIP_IMAGE: "4", // Image too
    CLIP_SIMPLIFIED_ARTICLE: "5",
    CLIP_SCREEN_SHOT: "6"
};

Evernote.ArticleSelectionOptions = {
    ENABLED : "0",
    DISABLED : "1",
    ENABLED_WITHOUT_HINTS : "2"
};

Evernote.Trigger = {
    ENABLED : true,
    DISABLED : false
};

Evernote.Options = {
    oneClickMode: false,
    action: {
        bydefault: "2",
        lastUsedEnable: true,
        lastUsed: "article"
    },
    tags: {
        alwaysEnable: false,
        alwaysData: ""
    },
    notebooks: {
        lastUsed: -1,
        lastUsedEnable: true,
        bydefault: ""
    },
    skitch: {
        lastUsedColor: ""
    },
    hints: {
        permanentScreenCapture : true
    },
    postClip : {
        show : false
    },
    /**
     * Return string representation of the object (you can use it in load method to restore object from string).
     */
    _serialize: function() {
        //return JSON.stringify(this, null, '\t');  CNN.com has own JSON.stringify with parse errors

        function strObj( obj ) {
            var i = 0;
            var optArr = [];

            for (var prop in obj) {
                if (obj.hasOwnProperty(prop) && typeof obj[prop] != 'function') {
                    var value;
                    if (typeof obj[prop] == 'object') {
                        value = strObj(obj[prop]);
                    } else if (typeof obj[prop] == 'string') {
                        var tempStr = obj[prop];
                        tempStr = tempStr.replace(/\\/g, "\\\\");
                        tempStr = tempStr.replace(/\"/g, "\\\"");
                        value = '"' + tempStr + '"';
                    } else {
                        value = obj[prop];
                    }
                    optArr[i] = '"' + prop + '":' + value;
                    i++;
                }
            }
            return '{' + optArr.toString() + '}';
        }
        return strObj(this);
    },

    load : function() {
        var optionsContent = Evernote.FS.getOptionsFileContent();
        this._load(optionsContent);
        Evernote.Logger.debug('Load options ' + JSON.stringify(this, null, '\t'));
    },

    _load : function(str) {
        if(str) {
            try {
                var options;

                options = JSON.parse(str);

                for (var prop in options) {
                    if (options[prop] && options.hasOwnProperty(prop)) {
                        this[prop] = options[prop];
                    }
                }
            } catch(e){
                // ignore
            }
        }
    },

    setScreenCaptureHintNonPermanent : function(){
        this.hints.permanentScreenCapture = false;
        this.save();
    },

    setDefaultAction : function(action) {
        this.action.bydefault = action;
        this.setLastUsedActionDisabled();
        this.save();
    },

    setDefaultNotebook : function(notebook) {
        this.notebooks.bydefault = notebook;
        this.setLastUsedNotebookDisabled();
        this.save();
    },

    setNotebook : function(notebookUid) {
        this.notebooks.lastUsed = notebookUid;
        this.save();
    },

    setLastUsedNotebookEnabled : function() {
        if (this.notebooks.lastUsedEnable == Evernote.Trigger.DISABLED) {
            this.notebooks.lastUsedEnable = Evernote.Trigger.ENABLED;
        }
        this.save();
    },

    setLastUsedNotebookDisabled : function() {
        if (this.notebooks.lastUsedEnable == Evernote.Trigger.ENABLED) {
            this.notebooks.lastUsedEnable = Evernote.Trigger.DISABLED;
        }
        this.save();
    },

    setLastUsedAction : function(action) {
        this.action.lastUsed = action;
        this.save();
    },

    setLastUsedActionEnabled : function () {
        if (this.action.lastUsedEnable == Evernote.Trigger.DISABLED) {
            this.action.lastUsedEnable = Evernote.Trigger.ENABLED;
        }
        this.save();
    },

    setLastUsedActionDisabled : function() {
        if (this.action.lastUsedEnable == Evernote.Trigger.ENABLED) {
            this.action.lastUsedEnable = Evernote.Trigger.DISABLED;
        }
    },

    setOneClickClipping : function(condition) {
        if (condition) {
            this.oneClickMode = Evernote.Trigger.ENABLED;
        } else {
            this.oneClickMode = Evernote.Trigger.DISABLED;
        }
        this.save();
    },

    setAlwaysTagsEnabled : function (condition) {
        if (condition) {
            this.tags.alwaysEnable = Evernote.Trigger.ENABLED;
        } else {
            this.tags.alwaysEnable = Evernote.Trigger.DISABLED;
        }
        this.save();
    },

    setAlwaysTagsString : function (str) {
        this.tags.alwaysData = str;
        this.save();
    },

    setPostClipDialogEnabled : function () {
        if (this.postClip.show == Evernote.Trigger.DISABLED) {
            this.postClip.show = Evernote.Trigger.ENABLED;
        }
        this.save();
    },

    setPostClipDialogDisabled : function () {
        if (this.postClip.show == Evernote.Trigger.ENABLED) {
            this.postClip.show = Evernote.Trigger.DISABLED;
        }
        this.save();
    },


    setLastUsedSkitchColor : function(color) {
        this.skitch.lastUsedColor = color;
        this.save();
    },

    save : function() {
        Evernote.Logger.debug('Save options: ' + JSON.stringify(this, null, '\t'));
        var jsonSer = this._serialize();
        Evernote.FS.writeOptionsToFile(jsonSer);
    }
};

