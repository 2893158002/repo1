//"use strict";

Evernote.SerializedNode = function SerializedNode( node, parent ) {
    this.node = node;
    this._parentSerializedNode = parent;
    this.translateTo = [ ];
};

Evernote.SerializedNode.prototype.translateTo = null;
Evernote.SerializedNode.prototype.node = null;
Evernote.SerializedNode.prototype._parentSerializedNode = null;

Evernote.SerializedNode.prototype.setStyle = function ( clipStyle ) {
    this._clipStyle = clipStyle;
};

Evernote.SerializedNode.prototype.getStyle = function () {
    return this._clipStyle;
};

Evernote.SerializedNode.prototype.parentNode = function () {
    return this._parentSerializedNode;
};
