Evernote.VideoElementSerializer = function VideoElementSerializer( node, nodeStyle ) {
    this.initialize( node, nodeStyle );
};

Evernote.inherit( Evernote.VideoElementSerializer, Evernote.AbstractElementSerializer, true );

Evernote.VideoElementSerializer.isResponsibleFor = function( node ) {
    return node && node.nodeType == Evernote.Node.ELEMENT_NODE && node.nodeName.toLowerCase() == "video";
};

Evernote.VideoElementSerializer.prototype.serialize = function( /*docBase*/ ) {
    Evernote.Logger.debug( "VideoElementSerializer.serialize()" );

    try {
        var width = this._node.offsetWidth;
        var height = this._node.offsetHeight;
        var doc = this._node.ownerDocument;

        var canvas = doc.createElement( "CANVAS" );
        canvas.width = width;
        canvas.height = height;

        var context = canvas.getContext( "2d" );
        context.drawImage( this._node, 0, 0, width, height );

        var dataUrl = canvas.toDataURL( "image/png" );
        context.clearRect( 0, 0, width, height );

        this._nodeStyle.addStyle( { "background-image" : "url('" + dataUrl + "')",
            "width" : width + "px",
            "height" : height + "px",
            "display" : "block" } );

        return "<a style=\"" + this._nodeStyle.toString().replace( /"/g, "" ) + "\"" + "href='" + doc.defaultView.location.href + "'>&nbsp;</a>";
    }
    catch ( e ) {
        Evernote.Logger.error( "VideoElementSerializer.serialize() failed: error = " + e );
    }

    return "";
};