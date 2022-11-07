Evernote.ClipOptions = function ClipOptions(data) {
    this.clipAction = data.clipAction;
};

Evernote.ClipOptions.prototype.getClipAction = function() {
    return this.clipAction;
};