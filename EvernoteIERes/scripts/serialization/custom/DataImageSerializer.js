Evernote.DataImageSerializer = function DataImageSerializer( node, nodeStyle ) {
    if ( !nodeStyle ) {
        nodeStyle = new Evernote.ClipStyle();
    }

    this.initialize( node, nodeStyle );
};

Evernote.inherit( Evernote.DataImageSerializer, Evernote.AbstractElementSerializer, true );

Evernote.DataImageSerializer.isResponsibleFor = function( node ) {
    try {
        if ( node && node.nodeType == Evernote.Node.ELEMENT_NODE && node.nodeName.toLowerCase() == "img" ) {
            var src = node.getAttribute( "src" );
            if ( src && src.indexOf( "data:image" ) != -1 ) {
                return true;
            }
        }
    } catch(e) {
        Evernote.Logger.error("DataImageSerializer.isResponsibleFor failed due to error " + e);
    }
    return false;
};

Evernote.DataImageSerializer.prototype.serialize = function( /*docBase*/ ) {
    Evernote.Logger.debug( "DataImageSerializer.serialize()" );

    try {
        this._nodeStyle.addStyle( { "background-image" : "url('" + this._node.getAttribute( "src" ) + "')",
            "width" : this._node.offsetWidth + "px",
            "height" : this._node.offsetHeight + "px",
            "background-repeat" : "no-repeat",
            "display" : "block" } );

        return "<span style=\"" + this._nodeStyle.toString().replace( /"/g, "" ) + "\"" + ">&nbsp;</span>";
    }
    catch ( e ) {
        Evernote.Logger.error( "DataImageSerializer.serialize() failed: error = " + e );
    }

    return "";
};