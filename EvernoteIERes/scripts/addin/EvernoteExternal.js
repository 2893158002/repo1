if(typeof external.menuArguments.EvernoteExternal == typeof undefined) {
    /**
     * Represents external Evernote namespace to collect all top level components passed to page context.
     */
    external.menuArguments.EvernoteExternal = {
        cursorXPosition : null
    };

    function isLocalResource(document) {
        try {
            var pageUrl = getPageUrl(document);
            return pageUrl.length > 0 && pageUrl.indexOf("http") == -1;
        } catch(e) {
            //We may ignore exception, because it only occurs on http pages
        }
        return false;
    }

    function getPageUrl(document) {
        try {
            return Evernote.Addin.getDocumentHref(document);
        }catch(e) {
            //Ignore exceptions, since PageContext should exists on all pages
        }
        return "";
    }
}