Evernote.Loader = {
    load: function() {
        try {
            window.jQueryForClearlyComponent = Evernote.JQuery;
            Evernote.Logger.debug("Jquery loaded");
            Evernote.Logger.debug("Show loading sign");
            Evernote.Notify.startLoading();
            Evernote.Logger.debug("Init clearly");
            initClearly(window);
            Evernote.Logger.debug("Clearly initialized");
            Evernote.Logger.debug("Init EnClipper");
            Evernote.EnClipper.init();
            Evernote.Logger.debug("EnClipper initialized");
            Evernote.Logger.debug("Init page info");
            Evernote.pageInfo = new PageInfo();
            Evernote.Logger.debug("Init content preview");
            Evernote.contentPreviewer = new ContentPreview();
            Evernote.Logger.debug("Init options");
            Evernote.Options.load();
            Evernote.Logger.debug("Start init of popup");
            Evernote.Logger.debug("Clipper is " + Evernote.Clipper);
            Evernote.evernotePopup = new Evernote.NativePopup( document );
            Evernote.evernotePostClipPopup = new Evernote.PostClipPopup( document );
            if (Evernote.SkitchController) Evernote.SkitchController.init();
            Evernote.Logger.debug("Popup initialized");
//            if(!Evernote.evernotePopup.isShown)
//                Evernote.evernotePopup.show();
            Evernote.Logger.debug("Popup is visible now");
            Evernote.Logger.debug("Loader finished without errors");
        }
        catch ( e ) {
            alert(e);
            Evernote.Logger.error( 'load failed ' + e );
            throw e;
        }
    }
};

window.curvyCornersNoAutoScan = false;
window.curvyCornersVerbose = false;
Evernote.Addin.init(EvernoteExternal.Addin);
Evernote.FS.init(EvernoteExternal.Addin);
Evernote.Logger = Evernote.LoggerConfigurator.getLogger();
Evernote.Logger.debug("Start loading");
Evernote.JQueryLoader.initJQuery();
if(document.readyState == "complete" || document.readyState == "interactive")
    Evernote.Loader.load();
else {
    Evernote.GlobalUtils.executeOnDomReady(Evernote.Loader.load);
}