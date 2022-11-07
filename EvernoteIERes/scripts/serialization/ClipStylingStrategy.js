//"use strict";

Evernote.ClipStylingStrategy = function ClipStylingStrategy( ) {
    this.initialize( );
};

Evernote.ClipStylingStrategy.prototype.initialize = function( ) {

};

Evernote.ClipStylingStrategy.prototype.styleForNode = function(  /*node, root, fullPage, clipStyleType*/ ) {
    return null;
};

Evernote.ClipStylingStrategy.prototype.getNodeView = function ( node ) {
    var doc = node.ownerDocument;
    return (doc.defaultView) ? doc.defaultView : null;
};

Evernote.ClipStylingStrategy.prototype.getNodeStyle = function( node, filterFn, pseudo ) {
    Evernote.Logger.debug( "ClipStylingStrategy.getNodeStyle()" );

    var style = new Evernote.ClipStyle();
    if ( pseudo != "" ) {
        return style;
    }

    if ( node && typeof node.nodeType == 'number' && node.nodeType == 1 ) {
        var view = this.getNodeView( node );
        style = new Evernote.ClipStyle( Evernote.ElementExtension.getComputedStyle( node, null, view ), filterFn );
    }

    return style;
};

Evernote.ClipStyleType = {
    NodeStyle : 0x01,
    InheritedFontStyle: 0x02,
    InheritedBgStyle: 0x04,
    AllStyle : 0x01 | 0x02 | 0x04,
    Default : 0x01 | 0x02
};