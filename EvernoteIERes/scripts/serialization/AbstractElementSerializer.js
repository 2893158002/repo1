//"use strict";

Evernote.AbstractElementSerializer = function AbstractElementSerializer( node, nodeStyle ) {
    this.initialize( node, nodeStyle );
};

Evernote.AbstractElementSerializer.isResponsibleFor = function( /*navigator*/ ) {
    return false;
};

Evernote.AbstractElementSerializer.prototype._node = null;
Evernote.AbstractElementSerializer.prototype._nodeStyle = null;

Evernote.AbstractElementSerializer.prototype.handleInheritance = function( child/*, parent */) {
    Evernote.ElementSerializerFactory.ClassRegistry.push( child );
};

Evernote.AbstractElementSerializer.prototype.initialize = function( node, nodeStyle ) {
    this._node = node;
    this._nodeStyle = nodeStyle;
};

Evernote.AbstractElementSerializer.prototype.serialize = function( /*docBase*/ ) {
    return "";
};

Evernote.AbstractElementSerializer.prototype.getImageUrl = function() {
    return "";
};