Evernote.NodeSerializer = function NodeSerializer( tab, styleStrategy, includeBg , isRange) {
    this.initialize( tab, styleStrategy, includeBg , isRange);
};

Evernote.NodeSerializer.prototype._tab = null;
Evernote.NodeSerializer.prototype._styleStrategy = null;
Evernote.NodeSerializer.prototype._docBase = null;
Evernote.NodeSerializer.prototype._imagesUrls = null;
Evernote.NodeSerializer.prototype._isRange = null;
Evernote.NodeSerializer.prototype._serializedDom = "";
Evernote.NodeSerializer.prototype._includeBgStyles = true;

Evernote.NodeSerializer.prototype.initialize = function ( tab, styleStrategy, includeBg ,isRange ) {
    Evernote.Logger.debug( "DomSerializer.initialize()" );

    this._tab = tab;
    this._styleStrategy = (styleStrategy instanceof Evernote.ClipStylingStrategy) ? styleStrategy : null;
    this._imagesUrls = [ ];
    this._includeBgStyles = ( includeBg != null ) ? includeBg : true;
    this._isRange = ( isRange != null ) ? isRange : false;
    this.getDocumentBase();
};

Evernote.NodeSerializer.prototype.startNode = function ( serializedNode, root, fullPage ) {
    Evernote.Logger.debug( "Start to serialize node :" + serializedNode.node.nodeName + ", class = " + serializedNode.node.className + ", id = " + serializedNode.node.id );
    try {
        var node = serializedNode.node;
        if ( Evernote.ClipRules.isConditionalNode( node ) && Evernote.ElementSerializerFactory.getImplementationFor( node ) != null ) {
            var result = this.serializeConditionalNode( node, root, fullPage );
            this._serializedDom += result.content;
            // hack for desktop Win client
            if ( result.imageUrl ) {
                this._imagesUrls.push( result.imageUrl );
            }
            serializedNode.setStyle(result.nodeStyle);
            return serializedNode;
        }

        if ( node.nodeName.toLowerCase() == "embed" ) {
            var src = node.getAttribute( "src" );
            if ( src && (src.indexOf(".swf", src.length - ".swf".length) !== -1) ) {
                serializedNode.setStyle(new Evernote.ClipStyle());
                return serializedNode;
            }
        }

        if ( node.nodeName.toLowerCase() == "img" ) {
            var src = node.getAttribute( "src" );

            if (src && src.indexOf('&') != -1) {
                src =  src.slice(0, src.indexOf('&'));
            }

            var absoluteSource = Evernote.Utils.makeAbsolutePath(this._docBase, src).replace(/\s/g, "%20");
            node.setAttribute( "type", "put-media-type-here-for-" + absoluteSource);
            node.setAttribute( "hash", "put-hash-type-here-for-" + absoluteSource);
            node.setAttribute( "src", src);

            if ( src && src.indexOf( "data:image" ) < 0 ) {
                this._imagesUrls.push( src );
            }
        }

        var attrsStr = this.serializeAttributes( node );
        var stylesStr = "";

        var nodeName = Evernote.ClipRules.translateNode( node );

        if ( this._styleStrategy ) {

            var nodeStyle = this._styleStrategy.styleForNode( node, root, fullPage, Evernote.ClipStyleType.Default ).evaluated;

            var inhBgStyle = null;
            if ( this._includeBgStyles )
                inhBgStyle = this._styleStrategy.styleForNode( node, root, fullPage, Evernote.ClipStyleType.InheritedBgStyle ).inheritedBackground;

            if ( inhBgStyle != null )
                for ( var inhI = inhBgStyle.length - 1; inhI >= 0; inhI-- ) {
                    var inhStyle = inhBgStyle[inhI];
                    this._serializedDom += "<div " + this.serializeStyles( node, inhStyle ) + " >";
                    serializedNode.translateTo.push( "div" );
                }

            var pseudoStyle = this._styleStrategy.getNodeStyle( node, null, ":before" );

            if ( fullPage && node.nodeName.toLowerCase() == "body" ) {
                var wrapBodyStyle = new Evernote.ClipStyle( nodeStyle, null, Evernote.ClipStyle.CSS_GROUP.getExtForStyle( "background" ) );
                this._serializedDom += "<" + "div" + " " + this.serializeStyles( node, wrapBodyStyle ) + " >";
                serializedNode.translateTo.push( "div" );
                var bgGroup = Evernote.ClipStyle.CSS_GROUP.getExtForStyle( "background" );
                for ( var ind in bgGroup ) {
                    if ( bgGroup.hasOwnProperty( ind ) ) {
                        nodeStyle.removeStyle( bgGroup[ind] );
                    }
                }
            }

            // Bug 47705. dirty fix, may cause problems in some cases.
            if (this._isRange) {
                nodeStyle.addSimpleStyle('height', node.currentStyle.height);
            }

            if ( !fullPage && node == root ) {
                nodeStyle.removeStyle( "float" );
            }
            if ( !serializedNode.node.hasChildNodes() && !(nodeStyle.getStyle( "height" ) || node.getAttribute( "height" )) ) {
                nodeStyle.addStyle( {height:"0px"} );
            }
            if ( !serializedNode.node.hasChildNodes() && !(nodeStyle.getStyle( "width" ) || node.getAttribute( "width" )) ) {
                nodeStyle.addStyle( {width:"0px"} );
            }
            if(nodeStyle.getStyle("position") == "fixed") {
                nodeStyle.addStyle({position: "absolute"});
            }

            if ( (node.nodeName.toUpperCase() == "SPAN"/* || node.nodeName.toUpperCase() == "A"*/) && node.getElementsByTagName( "IMG" ).length > 0) {
                nodeName = "div";
                if ( !nodeStyle.getStyle( "display" ) )
                    nodeStyle.addStyle( {display:"inline"} );
            }
            if (node.nodeName.toUpperCase() == "TH" || node.nodeName.toUpperCase() == "TD") {
                nodeStyle.addStyle( {display:"table-cell"} );
            }

            nodeStyle.removeDefaultCssStyle();

            this._serializedDom += this.serializePseudoElement( node, pseudoStyle );
            stylesStr = this.serializeStyles( node, nodeStyle );

            if ( (nodeName.toLowerCase() == "div" /*|| nodeName.toLowerCase() == "span"*/) && nodeStyle.getStyle( "float" ) && nodeStyle.getStyle( "float" ) != "none" && serializedNode.parentNode && node.parentNode.nodeName.toLowerCase() != "a" ) {
                if ( !serializedNode.node.nextSibling || serializedNode.node.nextSibling.nodeType == 3 )
                    serializedNode.parentNode.isInlineBlock = true;
            }
        }

        Evernote.Logger.debug( node.nodeName + " " + attrsStr + " -> " + nodeName + " " + stylesStr );

        this._serializedDom += "<" + nodeName + " " + attrsStr + " " + stylesStr + " >";

        serializedNode.setStyle(nodeStyle);
        serializedNode.translateTo.push( nodeName );
        return serializedNode;
    }
    catch ( e ) {
        Evernote.Logger.error( "Failed to start serialize node :" + e );
        throw e;
    }
};

Evernote.NodeSerializer.prototype.serializePseudoElement = function ( node, pseudoStyle ) {
    try {
        var nodeName = Evernote.ClipRules.translateNode( node );
        if ( pseudoStyle.getStylesNames().length > 0 ) {
            var content = "&nbsp;";
            if ( pseudoStyle.getStyle( "content" ) ) {
                content = pseudoStyle.getStyle( "content" );
                pseudoStyle.removeStyle( "content" );
            }
            var beforeStylesStr = this.serializeStyles( node, pseudoStyle );
            return "<" + nodeName + " " + beforeStylesStr + " >" + content.replace( /"/g, '' ) + "</" + nodeName + ">";
        }
        return "";
    }
    catch ( e ) {
        Evernote.Logger.error( "Failed to  serialize pseudo element :" + e );
        throw e;
    }
};

Evernote.NodeSerializer.prototype.textNode = function ( node, range ) {
    this._serializedDom += this.serializeTextNode( node, range );
};

Evernote.NodeSerializer.prototype.endNode = function ( serializedNode ) {
    try {
        Evernote.Logger.debug( "end serialize node :" + serializedNode.translateTo );

        if ( serializedNode.isInlineBlock ) {
            var name = "div";
            if ( serializedNode.node.nodeName.toLowerCase() == "ul" ) {
                name = "li"
            }
            this._serializedDom += "<" + name + " style=\"clear: both; width: 0px; height: 0px;\">" + "&nbsp;" + "</" + name + ">"
        }

        var node = serializedNode.node;
        var serializedPseudo = "";
        var pseudoStyle = new Evernote.ClipStyle();
        if ( this._styleStrategy ) {
            pseudoStyle = this._styleStrategy.getNodeStyle( node, null, ":after" );
            if ( pseudoStyle.getStylesNames().length > 0 ) {
                var floatStyle = serializedNode.getStyle().getStyle( "float" );
                if ( floatStyle && !pseudoStyle.getStyle( "float" ) )
                    pseudoStyle.addStyle( { "float" : floatStyle } );

                if ( node.nodeName.toLowerCase() == "ul" )
                    serializedPseudo = this.serializePseudoElement( document.createElement( "div" ), pseudoStyle );
            }
        }

        while ( serializedNode.translateTo.length > 0 ) {
            var nodeName = serializedNode.translateTo.pop();
            if ( !Evernote.ClipRules.isSelfClosingNode( serializedNode.node ) ) {
                if ( !serializedNode.node.hasChildNodes() )
                    this._serializedDom += "&nbsp;";
            }

            if ( nodeName.toLowerCase() == "ul" ) {
                this._serializedDom += this.serializePseudoElement( document.createElement( "li" ), pseudoStyle );
            }
            this._serializedDom += "</" + nodeName + ">";
        }

        this._serializedDom += serializedPseudo;
    }
    catch ( e ) {
        Evernote.Logger.error( "Failed to end serialize node :" + e );
        throw e;
    }
};


Evernote.NodeSerializer.prototype.serializeTextNode = function ( node, range ) {
    Evernote.Logger.debug( "DomSerializer.serializeTextNode()" );

    try {
        var nodeValue = node.nodeValue;
        if ( !range ) {
            return Evernote.Utils.htmlEncode( nodeValue );
        }
        else {
            if ( range.startContainer == node && range.startContainer == range.endContainer ) {
                return Evernote.Utils.htmlEncode( nodeValue.substring( range.startOffset, range.endOffset ) );
            }
            else if ( range.startContainer == node ) {
                return Evernote.Utils.htmlEncode( nodeValue.substring( range.startOffset ) );
            }
            else if ( range.endContainer == node ) {
                return Evernote.Utils.htmlEncode( nodeValue.substring( 0, range.endOffset ) );
            }
            else if ( range.commonAncestorContainer != node ) {
                return Evernote.Utils.htmlEncode( nodeValue );
            }
        }
    }
    catch ( e ) {
        Evernote.Logger.error( "DomSerializer.serializeTextNode() failed " + e );
        throw e;
    }

    return "";
};

Evernote.NodeSerializer.prototype.serializeConditionalNode = function ( node, root, fullPage ) {
    Evernote.Logger.debug( "DomSerializer.serializeConditionalNode()" );
    var impl = Evernote.ElementSerializerFactory.getImplementationFor( node );
    if ( typeof impl == 'function' ) {
        var nodeStyle = (this._styleStrategy) ? this._styleStrategy.styleForNode( node, root, fullPage ).evaluated : null;
        if (nodeStyle)
            nodeStyle.removeDefaultCssStyle();
        var serializer = new impl( node, nodeStyle );
        var content = serializer.serialize( this._docBase );
        var imageUrl = serializer.getImageUrl();

        return { content:content, imageUrl:imageUrl, nodeStyle:nodeStyle };
    }

    return { content:"", imageUrl:"", nodeStyle:new Evernote.ClipStyle() };
};

Evernote.NodeSerializer.prototype.serializeAttributes = function ( node ) {
    Evernote.Logger.debug( "DomSerializer.serializeAttributes()" );

    try {
        var attrs = node.attributes;
        var str = "";

        for ( var i = 0; i < attrs.length; ++i ) {
            if ( !Evernote.ClipRules.isNoKeepNodeAttr( attrs[ i ], Evernote.ClipRules.translateNode( node ), node ) ) {
                var attrValue = (attrs[ i ].value) ? Evernote.GlobalUtils.escapeXML( attrs[ i ].value ) : "";
                if ( (attrs[ i ].name.toLowerCase() == "src" || attrs[ i ].name.toLowerCase() == "href") && attrValue.toLowerCase().indexOf( "http" ) != 0 ) {
                    attrValue = Evernote.Utils.makeAbsolutePath( this._docBase, attrValue );
                }
                str += " " + attrs[ i ].name.toLowerCase() + "=\"" + attrValue + "\"";
            }
        }

        return str;
    }
    catch ( e ) {
        Evernote.Logger.error( "DomSerializer.serializeAttributes() failed: error = " + e );
    }

    return "";
};

Evernote.NodeSerializer.prototype.serializeStyles = function ( node, nodeStyle ) {
    Evernote.Logger.debug( "DomSerializer.serializeStyles()" );

    try {
        var str = "";
        if(node.nodeName.toLowerCase() == "map") {
            //Map should not have style attribute according to Evernote DTD
            return "";
        }
        if ( node && nodeStyle instanceof Evernote.ClipStyle ) {
            str += " style=\"" + nodeStyle.toString().replace( /"/g, "" ) + "\"";
        }
        return str;
    }
    catch ( e ) {
        Evernote.Logger.error( "DomSerializer.serializeStyles() failed: error = " + e );
        throw e;
    }
    return "";
};

Evernote.NodeSerializer.prototype.getDocumentBase = function () {
    Evernote.Logger.debug( "DomSerializer.getDocumentBase()" );

    if ( !this._docBase ) {
        var baseTags = this._tab.document.getElementsByTagName( "base" );
        for ( var i = 0; i < baseTags.length; ++i ) {
            var baseTag = baseTags[ i ];
            if ( typeof baseTag == 'string' && baseTag.indexOf( "http" ) == 0 ) {
                this._docBase = baseTag;
            }
            if ( this._docBase ) {
                break;
            }
        }

        if ( !this._docBase ) {
            var location = this._tab.document.location;
            this._docBase = location.protocol + "//" + location.host + location.pathname.replace( /[^\/]+$/, "" );
        }
    }

    return this._docBase;
};

Evernote.NodeSerializer.prototype.getImagesUrls = function () {
    return this._imagesUrls;
};

Evernote.NodeSerializer.prototype.getSerializedDom = function () {
    return '<div style="position: relative;">' + this._serializedDom.replace(/[^\u0009\u000a\u000d\u0020-\uD7FF\uE000-\uFFFD]+/g, "") + '</div>';
};