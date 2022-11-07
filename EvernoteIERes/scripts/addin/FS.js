Evernote.FS = {
    _addon : null,

    init : function(addon) {
        this._addon = addon;
    },

    /**
     * Write content to the specified path.
     * @param content - content, that should be written to
     */
    writeOptionsToFile : function(content) {
        if (!this._addon)
            return;
        try {
            this._addon.WriteOptionsContent(content );
        } catch (e) {
            Evernote.Logger.error( "FS.writeOptionsToFile() failed " + e );
        }
    },

    /**
     * Read content of the file specified by path.
     * @return {string} - content of the file
     */
    getOptionsFileContent : function() {
        if (!this._addon)
            return null;
        try {
            return this._addon.ReadOptionsContent();
        } catch (e) {
            Evernote.Logger.error( "FS.getOptionsFileContent() failed " + e );
        }
        return null;
    }
};
