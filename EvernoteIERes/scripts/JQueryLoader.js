/**
 * Represents JQuery loader that allow to have two versions of JQuery loaded on the same page
 * @type {Object}
 */
Evernote.JQueryLoader = {
    /**
     * Initializes jquery instance on global Evernote context
     */
    initJQuery : function() {
        if (!Evernote.JQuery) {
            Evernote.JQuery = $.noConflict(true);
        }
    }
};

(function () {
    if (!Evernote.JQuery) {
        Evernote.JQuery = $.noConflict(true);
    }
}());