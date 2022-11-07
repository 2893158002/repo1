Evernote.ClipperElementsIdentifiers = {

    _clipperElementsIds : [Constants.CLIP_DIALOG_ID, Constants.OPTIONS_DIALOG_ID, Constants.ATTR_DIALOG_ID, Constants.CLIP_DIALOG_NEW_ID, Constants.POST_CLIP_DIALOG_ID],

    match: function(node) {
        if(node && node.id) {
            var position = Evernote.ArrayExtension.indexOf(this._clipperElementsIds, node.id);
            if(position) {
                return position != -1;
            }
        }
        return false;
    }
};