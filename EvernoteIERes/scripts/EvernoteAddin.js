/**
 * Proxy object for Evernote ActiveX component
 * @type {Object}
 */
Evernote.Addin = {
    _addon : null,
    isAuthenticated: true,

    init : function(addin) {
        this._addon = addin;
    },

    /**
     * Injects css specified by filename to specified document.
     * @param fileName - path to css
     * @param doc - document object
     */
    injectStyleSheet : function(doc, fileName) {
        try {
            this._addon.InjectStyleSheet(doc, fileName)
        } catch (e) {
            Evernote.Logger.error( "Addin.InjectStyleSheet() failed " + e );
        }
    },

    /**
     * Injects script content to specified document
     * @param doc - document object
     * @param content - content of the script file
     */
    injectScript : function(doc, content) {
        try {
            this._addon.InjectScript( doc, content );
        }
        catch ( e ) {
            Evernote.Logger.error( "Addin.injectScript() failed " + e );
        }
    },

    /**
     * Loads file content from disk
     * @param url - path to the file
     */
    loadFile : function(url) {
        try {
            return this._addon.LoadFile( url );
        } catch (e) {
            Evernote.Logger.error( "Addin.loadFile() failed " + e );
        }
    },

    /**
     * Append message to log file with specified level.
     * Supported levels:
     *  0 - debug
     *  1 - info
     *  2 - warning
     *  3 - error
     *  4 - critical
     * @param logLevel
     * @param message
     */
    log : function(logLevel, message)
    {
        try {
            this._addon.Log(logLevel, message)
        } catch (e) {
            Evernote.Logger.error("Failed to log message '" + message + "' to the log file due to error: " + e);
        }
    },

    /**
     * Opens new note window.
     */
    openNewNote : function() {
        try {
            this._addon.CreateNewNote();
        } catch (e) {
            Evernote.Logger.error("Failed to open new note window due to error: " + e);
        }
    },

    /**
     * Return path to directory on local filesystem for specified type.
     * @param type - type of directory to return. Currently supported types:
     *  options - directory, where options configuration is stored.
     *  resources - directory, where resources are located (images, scripts, etc.)
     */
    getPath : function(type)
    {
        try {
            return this._addon.GetAddinPath(type);
        } catch (e) {
            Evernote.Logger.error("Failed to clip full page due to error " + e);
        }
    },

    /**
     * Returns localized message by code.
     * @param code - number of message in resource file.
     */
    getLocalizedMessage : function(code) {
        try {
            return this._addon.GetLocalizedString(code) || 'l10n_error';
        } catch (e) {
            Evernote.Logger.error("Failed to retrieve localized message due to error " + e);
        }
    },

    clipNote : function(content, options, sourceUrl, imageUrls, silent, doc ) {
        var isSilentClip = silent ? 1 : 0;
        var images = imageUrls;
        if(!(images instanceof Array)) {
            images = [imageUrls];
        }
        try {
            var notebookUid = options.notebookUid | 0;
            try {
                notebookUid = options.notebookUid() | 0;
            } catch(e) {
                //Notebook uid is not a function, but just an integer that we saved on previous step, ignore exception here
            }
            this.ensureAuthenticated();
            Evernote.Logger.debug("Clip to " + (notebookUid) + " with tags: " + options.tags.join(",") + " ; comment: " + options.comments);
            return this._addon.ClipNote(options.title, content, sourceUrl, isSilentClip, images.join("#") , notebookUid, options.tags.join(","), "", doc,"EvernoteGlobalReceiver");
        } catch (e) {
            Evernote.Logger.error("Failed to clipNote due to error " + e);
        }
    },

    getCursorXPosition : function() {
        try {
            return this._addon.GetCursorXPosition();
        } catch (e) {
            Evernote.Logger.error("Failed to retrieve localized message due to error " + e);
            throw e;
        }

    },

    /**
     * Call Addin to get all notebooks (global "EvernoteGlobalReceiver" function is called with response)
     * @param document - document object
     */
    getNotebooks : function(document) {
        this.ensureAuthenticated();
        this._addon.GetNotebooks(document, "EvernoteGlobalReceiver", Evernote.NotebookTypes.PERSONAL);
        this.ensureAuthenticated();
        this._addon.GetNotebooks(document, "EvernoteGlobalReceiver", Evernote.NotebookTypes.BUSINESS);
        this.ensureAuthenticated();
        this._addon.GetNotebooks(document, "EvernoteGlobalReceiver", Evernote.NotebookTypes.LINKED);
    },

    /**
     * Call Addin to get all personal tags (global "EvernoteGlobalReceiver" function is called with response)
     * @param document - document object
     */
    getTags : function(document) {
        this.ensureAuthenticated();
        this._addon.GetTags(document, "EvernoteGlobalReceiver");
    },

    /**
     * Call Addin to get linked notebook tags (global "EvernoteGlobalReceiver" function is called with response)
     * @param document - document object
     */
    getLinkedTags : function(document, notebookUid) {
        this.ensureAuthenticated();
        this._addon.GetLinkedNotebooksTags(document, "EvernoteGlobalReceiver", notebookUid);
    },

    /**
     * Returns document location address
     * @param document - DOM document
     * @return {*}
     */
    getDocumentHref: function(document) {
        return this._addon.GetDocumentHref(document);
    },

    allowSetForegroundWindow: function(id) {
        this._addon.AllowSetForegroundWindow(id);
    },

    getProcessID: function(doc) {
        this.ensureAuthenticated();
        this._addon.GetProcessID(doc, "EvernoteGlobalReceiver");
    },

    resetAuthenticatedState: function() {
        this.isAuthenticated = true;
    },

    //This function should be called before every call to Addin that will establish connection with EvernoteClipper process.
    ensureAuthenticated: function() {
        if(!this.isAuthenticated) {
            throw new Evernote.AuthenticatedException("User is not authorized");
        }
    },

    processError: function(error) {
        if(error.code == Evernote.ErrorCodes.AUTHENTICATION_ERROR) {
            this.isAuthenticated = false;
        }
        return false;
    },

    getEvernoteVersion: function(document) {
        this._addon.GetEvernoteVersion(document, "EvernoteGlobalReceiver");
    },

    getServerLocation: function() {
        try {
            return this._addon.GetServerLocation();
        } catch (e) {
            Evernote.Logger.error("Failed to get Evernote server location due to error: " + e);
        }
    },

    getEvernoteVersionAsync: function(callback) {
        var requestID;
        try
        {
            requestID = Evernote.AsyncEngine.addRequest(callback);
            this._addon.GetEvernoteVersionAsync( Evernote.AsyncEngine.commonCallback, requestID );
        } catch(e) {
            Evernote.AsyncEngine.removeRequest(requestID);
            Evernote.Logger.error("Failed to get Evernote version (async) due to error: " + e);
        }
    },

    getNotebooksAsync : function(callback) {
        this.ensureAuthenticated();
        var requestID;
        try
        {
            requestID = Evernote.AsyncEngine.addRequest(callback);
            this._addon.GetNotebooksAsync( Evernote.AsyncEngine.commonCallback, requestID, Evernote.NotebookTypes.PERSONAL);
            requestID = Evernote.AsyncEngine.addRequest(callback);
            this._addon.GetNotebooksAsync( Evernote.AsyncEngine.commonCallback, requestID, Evernote.NotebookTypes.BUSINESS);
            requestID = Evernote.AsyncEngine.addRequest(callback);
            this._addon.GetNotebooksAsync( Evernote.AsyncEngine.commonCallback, requestID, Evernote.NotebookTypes.LINKED);
        } catch(e) {
            Evernote.AsyncEngine.removeRequest(requestID);
            Evernote.Logger.error("Failed to get notebooks (async) due to error: " + e);
        }
    },

    getTagsAsync : function(callback) {
        this.ensureAuthenticated();
        var requestID;
        try
        {
            requestID = Evernote.AsyncEngine.addRequest(callback);
            this._addon.GetTagsAsync( Evernote.AsyncEngine.commonCallback, requestID );
        } catch(e) {
            Evernote.AsyncEngine.removeRequest(requestID);
            Evernote.Logger.error("Failed to get tags (async) due to error: " + e);
        }
    },

    getLinkedTagsAsync : function(callback, args, notebookUid) {
        this.ensureAuthenticated();
        var requestID;
        try
        {
            requestID = Evernote.AsyncEngine.addRequest(callback, args);
            this._addon.GetLinkedNotebooksTagsAsync( Evernote.AsyncEngine.commonCallback, requestID, notebookUid );
        } catch(e) {
            Evernote.AsyncEngine.removeRequest(requestID);
            Evernote.Logger.error("Failed to get notebooks tags (async) due to error: " + e);
        }
    },

    clipNoteAsync : function(callback, content, options, sourceUrl, imageUrls, silent) {
        var isSilentClip = silent ? 1 : 0;
        var images = imageUrls;
        if(!(images instanceof Array)) {
            images = [imageUrls];
        }
        var requestID;
        try {
            requestID = Evernote.AsyncEngine.addRequest(callback);
            var notebookUid = options.notebookUid | 0;
            try {
                notebookUid = options.notebookUid() | 0;
            } catch(e) {

            }
            this.ensureAuthenticated();
            Evernote.Logger.debug("Clip to " + (notebookUid) + " with tags: " + options.tags.join(",") + " ; comment: " + options.comments);
            this._addon.ClipNoteAsync(Evernote.AsyncEngine.commonCallback, requestID, options.title, content, sourceUrl, isSilentClip, images.join("#") , notebookUid, options.tags.join(","), "");
        } catch (e) {
            Evernote.Logger.error("Failed to clipNote due to error " + e);
        }
    },

    /**
     * Performs security (HTTPS - Port: 443) asynchronous POST request. Example: https://www.evernote.com/Login.action
     * @param callback
     * @param url Example: "www.evernote.com"
     * @param urlNamedObject Example: "Login.action"
     * @param data - data for "POST" request
     * @constructor
     */
    asyncWebRequest : function(callback, url, urlNamedObject, data) {
        var requestID;
        try
        {
            requestID = Evernote.AsyncEngine.addRequest(callback);
            this._addon.AsyncWebRequest( Evernote.AsyncEngine.commonCallback, requestID, url, urlNamedObject, data);
        } catch(e) {
            Evernote.AsyncEngine.removeRequest(requestID);
            Evernote.Logger.error("Failed to exec async web request due to error: " + e);
        }
    },

    clipImageAsync : function(options, callback, url, imageBase64) {
        var requestID;
        try
        {
            requestID = Evernote.AsyncEngine.addRequest(callback);
            var notebookUid = options.notebookUid | 0;
            try {
                notebookUid = options.notebookUid() | 0;
            } catch(e) {
            }
            this._addon.ClipImageAsync(Evernote.AsyncEngine.commonCallback, requestID, notebookUid, options.title, url, options.tags.join(","), options.comments, imageBase64);
        } catch(e) {
            Evernote.AsyncEngine.removeRequest(requestID);
            Evernote.Logger.error("Failed to exec async web request due to error: " + e);
        }
    },

    getScreenshotBase64 : function(doc, coord) {
        try {
            return this._addon.GetScreenshotBase64Ex(doc, coord[0], coord[1], coord[2], coord[3]);
        } catch (e) {
            Evernote.Logger.error("Failed to get screnshot due to error: " + e);
        }
    },

    openLocalFile : function(logPath, flags)
    {
        try {
            if (!flags)
                flags = 1;

            this._addon.OpenLocalFile(document, logPath, flags);
        } catch (e) {
            Evernote.Logger.error("Failed to open local file due to error " + e);
        }
    },

    getLastLoginUser : function() {
        try {
            return this._addon.GetLastLoginUser();
        } catch (e) {
            Evernote.Logger.error( "GetLastLoginUser failed " + e );
        }
        return null;
    }
};