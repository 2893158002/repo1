
Evernote.ClipFullStylingStrategy = function ClipFullStylingStrategy( ) {
    this.initialize( );
};

Evernote.inherit( Evernote.ClipFullStylingStrategy, Evernote.ClipStylingStrategy, true );

Evernote.ClipFullStylingStrategy.prototype.styleForNode = function ( node, root, fullPage, clipStyleType ) {
    Evernote.Logger.debug( "ClipStylingStrategy.styleForNode()" );

    if ( clipStyleType == null ) {
        clipStyleType = Evernote.ClipStyleType.Default;
    }

    var bodyStyles = new Evernote.ClipStyle( [ ], function ( prop, value ) {
        return value != ""
    } );
    var inhFontStyles = new Evernote.ClipStyle( [ ] );
    var inhBgStyles = [ ];

    if ( (clipStyleType & Evernote.ClipStyleType.NodeStyle) == Evernote.ClipStyleType.NodeStyle ) {
        Evernote.Logger.debug( "ClipStylingStrategy.styleForNode(): get node style" );
        try {
            if ( node.nodeName.toLowerCase() == "body" ) {
                for ( var attrName in Evernote.ClipStyle.STYLE_ATTRIBUTES ) {
                    if ( Evernote.ElementExtension.hasAttribute(node, attrName) ) {
                        var cssPropName = Evernote.ClipStyle.STYLE_ATTRIBUTES[ attrName ];
                        var style = { };
                        style[ cssPropName ] = node.getAttribute( attrName );
                        bodyStyles.addStyle( style );
                    }
                }
            }
        } catch(e) {
            Evernote.Logger.error("ClipFullStylingStrategy.styleForNode failed to get attributes from body due to error " + e);
        }
        var evaluatedStyles = this.getNodeStyle( node );
        if ( node.nodeName.toLowerCase() == "table" && !evaluatedStyles.getStyle( "font-size" ) ) {
            evaluatedStyles.addStyle( {"font-size":"1em"} );
        }

        if ( node.nodeName.toLowerCase() == "img" ) {
            style = new Evernote.ClipStyle( Evernote.ElementExtension.getComputedStyle( node, null, this.getNodeView( node ) ), function ( prop, value ) {
                return value != ""
            } );
            evaluatedStyles.addStyle( { height:style.getStyle( "height" ) } );
            evaluatedStyles.addStyle( { width:style.getStyle( "width" ) } );
        }

        if ( evaluatedStyles.getStyle( "background-image" ) ) {
            var regExp = /url\((.*?)\)/;
            evaluatedStyles.addStyle( { "background-image": Evernote.StyleElementExtension.getPropertyValue(Evernote.ElementExtension.getComputedStyle( node, null, this.getNodeView( node ) ),  Evernote.IEStylePropertiesMapping.getPropertyNameFor("background-image") ).replace( regExp, "url('$1')").replace(/('")|("')|('')/g, "'")} );
        }

        if ( evaluatedStyles.getStyle( "height" ) == "100%" && Evernote.StyleElementExtension.getPropertyValue(Evernote.ElementExtension.getComputedStyle( node, null, this.getNodeView( node ) ), "height" ) == "0px" ) {
            evaluatedStyles.addStyle( { height:"0px" } );
        }
        bodyStyles.mergeStyle( evaluatedStyles, true );
    }

    if ( node == root && !fullPage ) {
        if ( (clipStyleType & Evernote.ClipStyleType.InheritedFontStyle) == Evernote.ClipStyleType.InheritedFontStyle ) {
            Evernote.Logger.debug( "ClipStylingStrategy.styleForNode(): get inherited font style" );
            inhFontStyles = this.inheritFontForNode( node, true );
            Evernote.Logger.debug( "ClipStylingStrategy.styleForNode(): inherited fonts " );
        }

        if ( (clipStyleType & Evernote.ClipStyleType.InheritedBgStyle) == Evernote.ClipStyleType.InheritedBgStyle ) {
            Evernote.Logger.debug( "ClipStylingStrategy.styleForNode(): get inherited bg style" );
            inhBgStyles = this.inheritBackgroundForNode( node, true );
        }
    }

    bodyStyles.mergeStyle( inhFontStyles, true );
    return {
        nodeStyle:bodyStyles,
        inheritedFonts:inhFontStyles,
        inheritedBackground:inhBgStyles,
        evaluated:bodyStyles
    };
};

Evernote.ClipFullStylingStrategy.prototype.getNodeStyle = function ( node, filterFn, pseudo ) {
    Evernote.Logger.debug( "ClipStylingStrategy.getNodeStyle()" );

    if ( pseudo == null || typeof pseudo == "undefined" ) {
        pseudo = "";
    }
    var style = new Evernote.ClipStyle([ ], filterFn);
    Evernote.Logger.debug( "Pseudo : " + pseudo );
    if ( pseudo == "" && node && typeof node.nodeType == 'number' && node.nodeType == 1 ) {
        var view = this.getNodeView( node );
        style = new Evernote.ClipStyle( Evernote.ElementExtension.getComputedStyle( node, null, view ), filterFn );
    }
    return style;
};

Evernote.ClipFullStylingStrategy.prototype.inheritFontForNode = function ( node, recur ) {
    Evernote.Logger.debug( "ClipFullStylingStrategy.inheritFontForNode()" );

    var fontStyle = new Evernote.ClipStyle();
    if ( !node ) {
        return fontStyle;
    }

    var parent = node;
    var styles = [ ];
    var nodes = [ ];

    var dynamicUnit = ["%", "em"];
    var sizeUnitRegExp = /(.*?)(em|%|px|pt)/;

    while ( parent ) {
        nodes.push( parent );
        styles.push( new Evernote.ClipStyle( this.getNodeStyle( parent ), function ( prop, value ) {
            return (Evernote.ArrayExtension.indexOf(Evernote.ClipStyle.INHERITED_STYLES,  prop ) > 0 && value != "inherit" );
        } ) );


        Evernote.Logger.debug( "Inh parent style:" + styles[styles.length - 1].toString() );

        if ( !recur || parent == document.body ) {
            break;
        }
        else {
            parent = parent.parentElement;
        }
    }

    //merge styles starting from low-priority parent styles
    Evernote.Logger.debug( "Styles inh for processing:" + (styles.length - 1) );
    for ( var i = styles.length - 1; i >= 0; i-- ) {
        var style = styles[ i ];
        var fontSize = fontStyle.getStyle( "font-size" );
        var overFontStyle = style.getStyle( "font-size" );
        Evernote.Logger.debug( "fontSize:" + fontSize + "    ;overFontStyle: " + overFontStyle );
        if ( fontSize && overFontStyle ) {
            var resFontSize = fontSize.match( sizeUnitRegExp );
            if ( resFontSize == null ) {
                continue;
            }
            var sizeVal = resFontSize[1];
            var sizeUnit = resFontSize[2];
            var resOverFontSize = overFontStyle.match( sizeUnitRegExp );

            if ( resOverFontSize == null ) {
                continue;
            }
            var overSizeVal = resOverFontSize[1];
            var overSizeUnit = resOverFontSize[2];

            if ( Evernote.ArrayExtension.indexOf(dynamicUnit, overSizeUnit ) != -1 ) {
                if ( overSizeUnit == "%" ) {
                    style.addStyle( { "font-size":(parseFloat( sizeVal ) * parseFloat( overSizeVal ) / 100).toString() + sizeUnit } );
                }
                else {
                    style.addStyle( { "font-size":(parseFloat( sizeVal ) * parseFloat( overSizeVal )).toString() + ((sizeUnit != "em") ? sizeUnit : overSizeUnit) } );
                }
            }
            Evernote.Logger.debug( "Style: " + i + "   ;Eval inh style:" + style.toString() );
        }

        fontStyle.mergeStyle( style, true );
    }

    return fontStyle;
};

Evernote.ClipFullStylingStrategy.prototype.inheritBackgroundForNode = function ( node, recur ) {
    Evernote.Logger.debug( "ClipFullStylingStrategy.inheritBackgroundForNode()" );

    var bgStyle = new Evernote.ClipStyle();
    if ( !node ) {
        return bgStyle;
    }

    var parent = node;
    var styles = [ ];
    var nodes = [ ];
    var topElement = (document.body.parentNode) ? document.body.parentNode : document.body;
    try {
        while ( parent ) {
            nodes.push( parent );
            var filterFn = function ( prop, value ) {
                return !(prop == "background-repeat" && (value == "no-repeat" || value == "repeat-y"));
            };
            var nodeStyle = new Evernote.ClipStyle( this.getNodeStyle( parent ), filterFn, Evernote.ClipStyle.CSS_GROUP.getExtForStyle( "background" ) );

            if ( !nodeStyle.getStyle( "background-repeat" ) ) {
                nodeStyle.removeStyle( "background-image" );
            }
            if ( !nodeStyle.getStyle( "background-color" ) && parent.getAttribute( "bgcolor" ) ) {
                Evernote.Logger.debug( "Set bgcolor attribute: " + parent.getAttribute( "bgcolor" ) );
                nodeStyle.addStyle( {"background-color":parent.getAttribute( "bgcolor" )} );
            }

            nodeStyle = this.evalBgPosition( node, parent, nodeStyle );
            if ( nodeStyle.getStylesNames().length > 0 ) {
                styles.push( nodeStyle );
                Evernote.Logger.debug( "Add inh bg style " + nodeStyle.toString() );
            }

            if ( !recur || parent == topElement ) {
                break;
            }
            else {
                parent = parent.parentNode;
            }
        }
    } catch(e) {
        Evernote.Logger.error("ClipFullStylingStrategy.prototype.inheritBackgroundForNode failed to error " + e);
    }

    return styles;
};

Evernote.ClipFullStylingStrategy.prototype.evalBgPosition = function ( node, inhNode, nodeBgStyle ) {
    Evernote.Logger.debug( "Dettermining background image offset" );

    var strPosToPercent = {
        "center":"50%",
        "top":"0%",
        "bottom":"100%",
        "right":"100%",
        "left":"0%"
    };

    var regExp = /url\((.*?)\)/;
    var bgImage = nodeBgStyle.getStyle( "background-image" );
    if ( !regExp.test( nodeBgStyle.getStyle( "background-image" ) ) || (bgImage && nodeBgStyle.getStyle( "background-image" ).indexOf( "data:image" ) >= 0) ) {
        Evernote.Logger.debug( "bgStyle: " + nodeBgStyle.toString() );
        return nodeBgStyle;
    }

    nodeBgStyle.addStyle( { "background-image": Evernote.StyleElementExtension.getPropertyValue(Evernote.ElementExtension.getComputedStyle( inhNode, null, this.getNodeView( inhNode ) ), Evernote.IEStylePropertiesMapping.getPropertyNameFor("background-image") ).replace( regExp, "url('$1')" ) } );

    var actualImage = new Image();
    actualImage.src = nodeBgStyle.getStyle( "background-image" ).match( regExp )[ 1 ].replace( /["']/g, "" );
    var bgNodeRect = this.getOffsetRect( inhNode );
    var nodeRect = this.getOffsetRect( node );
    var yDelta = nodeRect.top - bgNodeRect.top;
    var xDelta = nodeRect.left - bgNodeRect.left;

    var bgNodeBgPosX = 0;
    var bgNodeBgPosY = 0;
    var origPosX = 0;
    var origPosY = 0;

    if ( nodeBgStyle.getStyle( "background-position" ) ) {
        var bgPosition = nodeBgStyle.getStyle( "background-position" ).split( " " );
        bgNodeBgPosX = strPosToPercent[bgPosition[ 0 ]] != null ? strPosToPercent[bgPosition[ 0 ]] : bgPosition[ 0 ];
        bgNodeBgPosY = strPosToPercent[bgPosition[ 1 ]] != null ? strPosToPercent[bgPosition[ 1 ]] : bgPosition[ 1 ];

        if ( bgNodeBgPosX && bgNodeBgPosX.indexOf( "%" ) > 0 ) {
            origPosX = parseInt( bgNodeRect.width ) * (parseInt( bgNodeBgPosX ) / 100);
            origPosX -= parseInt(actualImage.width) * (parseInt(bgNodeBgPosX) / 100);
        }
        else {
            origPosX = parseInt( bgNodeBgPosX );
        }

        if ( bgNodeBgPosY && bgNodeBgPosY.indexOf( "%" ) > 0 ) {
            origPosY = parseInt( bgNodeRect.height ) * (parseInt( bgNodeBgPosY ) / 100);
            origPosY -= parseInt(actualImage.height) * (parseInt(bgNodeBgPosY) / 100);
        }
        else {
            origPosY = parseInt( bgNodeBgPosY );
        }
    }

    if ( isNaN( origPosX ) ) {
        origPosX = 0;
    }
    if ( isNaN( origPosY ) ) {
        origPosY = 0;
    }

    var xOffset = 0 - xDelta + origPosX;
    var yOffset = 0 - yDelta + origPosY;

    nodeBgStyle.addStyle( { "background-position":(xOffset + "px " + yOffset + "px") } );
    Evernote.Logger.debug( "bgStyle: " + nodeBgStyle.toString() );
    return nodeBgStyle;
};

Evernote.ClipFullStylingStrategy.prototype.getOffsetRect = function ( elem ) {
    Evernote.Logger.debug( "ClipCSSStyleWalker.getOffsetRect()" );

    var box = Evernote.ElementExtension.getBoundingClientRect(elem);
    var body = elem.ownerDocument.body;
    var docElem = elem.ownerDocument.documentElement;

    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;

    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top:Math.round( top ), left:Math.round( left ), width:box.width, height:box.height };
};