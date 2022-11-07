try {
    Evernote.Addin.init(EvernoteExternal.Addin);
    Evernote.Addin.resetAuthenticatedState();
    Evernote.FS.init(EvernoteExternal.Addin);
    Evernote.Logger = Evernote.LoggerConfigurator.getLogger();
    if(!Evernote.JQuery)
        Evernote.JQueryLoader.initJQuery();
    window.jQueryForClearlyComponent = Evernote.JQuery;
    initClearly(window);


    // todo: create bulletproof function for popup close before context-clipping.
    if (Evernote.evernotePopup) Evernote.evernotePopup.hide();
    if (Evernote.SkitchController) Evernote.SkitchController.clearSkitch();

    Evernote.Logger.debug("Init EnClipper");
    Evernote.EnClipper.init();
    Evernote.Logger.debug("EnClipper initialized");
    Evernote.pageInfo = new PageInfo();
    if (!Evernote.contentPreviewer) Evernote.contentPreviewer = new ContentPreview();
    Evernote.Options.load();

    Evernote.evernotePostClipPopup = new Evernote.PostClipPopup( document );

    if (EvernoteExternal.Addin.isServerAvailable()) {
        Evernote.Clipper.clipWithOptions(EvernoteExternal.clipOptions);
    }
} catch(e) {
    throw e;
}