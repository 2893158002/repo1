if(Evernote.evernotePopup) {
    if (Evernote.SkitchController && Evernote.SkitchController.isSkitching() && Evernote.SkitchController.isCropping())
    {
        Evernote.SkitchController.cancelCrop();
    } else {
        Evernote.Addin.resetAuthenticatedState();
        Evernote.evernotePopup.hide();
    }
}