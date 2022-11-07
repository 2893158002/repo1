/**
 * ClipStyle is a container for CSS styles. It is able to add and remove
 * CSSStyleRules (and parse CSSRuleList's for rules), as well as
 * CSSStyleDeclaration's and instances of itself.
 * ClipStyle provides a mechanism to serialize itself via toString(), and
 * reports its length via length property. It also provides a method to clone
 * itself and expects to be manipulated via addStyle and removeStyle.
 */
Evernote.ClipStyle = function ClipStyle( css, filterFn, styleList ) {
    this.initialize( css, filterFn, styleList );
};

Evernote.ClipStyle.STYLES = [
    "background", "background-attachment", "background-clip", "background-color", "background-image", "background-origin", "background-position-x", "background-position-y", "background-position", "background-repeat", "background-size",
    "border-bottom", "border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-style", "border-bottom-width",
    "border-left", "border-left-color", "border-left-style", "border-left-width",
    "border-right", "border-right-color", "border-right-style", "border-right-width",
    "border-top", "border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width",
    "border-collapse", "border-spacing", "bottom", "box-shadow",
    "caption-side", "clear", "clip", "color", "content", "counter-increment", "counter-reset", "cursor",
    "direction", "display",
    "empty-cells",
    "float", "font", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight",
    "height",
    "ime-mode",
    "left", "letter-spacing", "line-height", "list-style", "list-style-image", "list-style-position", "list-style-type",
    "margin", "margin-bottom", "margin-left", "margin-right", "margin-top", "marker-offset", "max-height", "max-width", "min-height", "min-width",
    "opacity", "outline", "outline-color", "outline-offset", "outline-style", "outline-width", "overflow", "overflow-x", "overflow-y",
    "padding", "padding-bottom", "padding-left", "padding-right", "padding-top", "page-break-after", "page-break-before", "pointer-events", "position",
    "resize", "right",
    "table-layout", "text-align", "text-anchor", "text-decoration", "text-indent", "text-overflow", "text-shadow", "text-transform", "top",
    "vertical-align", "visibility",
    "white-space", "width", "word-spacing", "word-wrap",
    "z-index"
];

Evernote.ClipStyle.NO_INHERIT_STYLES = {
    "*":[ "background", "background-image", "background-color", "background-position", "background-repeat",
        "border-bottom", "border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-style", "border-bottom-width",
        "border-left", "border-left-color", "border-left-style", "border-left-width",
        "border-right", "border-right-color", "border-right-style", "border-right-width",
        "border-top", "border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width",
        "border-collapse", "border-spacing", "bottom",
        "clear",
        "display",
        "float",
        "height",
        "left", "list-style",
        "margin", "margin-bottom", "margin-left", "margin-right", "margin-top",
        "padding", "padding-bottom", "padding-left", "padding-right", "padding-top",
        "right",
        "text-decoration", "top",
        "width" ],
    "img":[ "height", "width" ]
};

Evernote.ClipStyle.CSS_GROUP = {
    "margin":[ "left", "right", "top", "bottom" ],
    "padding":[ "left", "right", "top", "bottom" ],
    "border":[ "width", "style", "color" ],
    "border-bottom":[ "width", "style", "color" ],
    "border-top":[ "width", "style", "color" ],
    "border-right":[ "width", "style", "color" ],
    "border-left":[ "width", "style", "color" ],
    "border-image":[ "outset", "repeat", "slice", "source", "width" ],
    "background":[ "attachment", "color", "image", "position", "repeat", "clip", "origin", "size" ],
    "font":[ "family", "size", "style", "variant", "weight", "size-adjust", "stretch", "+line-height" ],
    "list-style":[ "image", "position", "type" ]
};

Evernote.ClipStyle.CSS_GROUP.getExtForStyle = function ( name ) {
    var list = this[ name ];
    var extList = [ ];

    if ( list ) {
        for ( var i = 0; i < list.length; ++i ) {
            if ( list[ i ].indexOf( "+" ) >= 0 ) {
                var tmp = list[ i ];
                extList.push( tmp.replace( "+", "" ) );
            }
            else {
                extList.push( name + "-" + list[ i ] );
            }
        }
        return extList;
    }

    return null;
};

Evernote.ClipStyle.STYLE_ATTRIBUTES = {
    "bgcolor":"background-color",
    "text":"color"
};

Evernote.ClipStyle.INHERITED_STYLES = [
    "azimuth",
    "border-collapse", "border-spacing",
    "caption-side", "color", "cursor",
    "direction",
    "elevation", "empty-cells",
    "font-family", "font-size", "font-style", "font-weight", "font",
    "letter-spacing", "line-height", "list-style-image", "list-style-position", "list-style-type", "list-style",
    "orphans",
    "pitch-range", "pitch",
    "quotes",
    "richness",
    "speak-header", "speak-numeral", "speak-punctuation", "speak", "speak-rate", "stress",
    "text-align", "text-indent", "text-transform",
    "visibility", "voice-family", "volume",
    "white-space", "widows", "word-spacing"
];

Evernote.ClipStyle.prototype._collection = null;
Evernote.ClipStyle.prototype._filterFn = null;
Evernote.ClipStyle.prototype._styleList = null;

Evernote.ClipStyle.prototype.initialize = function ( css, filterFn, styleList ) {
    Evernote.Logger.debug( "ClipStyle.initialize()" );

    this._collection = new Evernote.StylesCollection();
    Evernote.Logger.debug( "ClipStyle.initialize: collection initialized()" );
    this._filterFn = (typeof filterFn == "function") ? filterFn : null;
    this._styleList = (styleList != null) ? styleList : Evernote.ClipStyle.STYLES;
    if(css) {
        this.addStyle( css, this._styleList );
    }
    Evernote.Logger.debug( "ClipStyle.initialize() end ");
};

Evernote.ClipStyle.prototype.fixBackground = function ( prop, value ) {
    if(prop && value) {
        if(prop.indexOf("background-image") != -1 && value.indexOf("url") != -1) {
            Evernote.Logger.debug("Start replace");
            var regExp = /url\((.*?)\)/;
            var res = value.replace(regExp, "url('$1')").replace(/('")|("')|('')/g, "'");
            Evernote.Logger.debug("End replace");
            return Evernote.GlobalUtils.escapeXML(res);

        }
    }
    return value;
};

Evernote.ClipStyle.prototype.addStyle = function ( style, styleList ) {
    Evernote.Logger.debug( "ClipStyle.addStyle()" );
    if ( style.length > 0 ) {
        var list = (styleList != null) ? styleList : this._styleList;
        for ( var i = 0; i < list.length; ++i ) {
            var prop = list[ i ];
            var value = Evernote.StyleElementExtension.getPropertyValue(style, prop );
            var importantPriority = !!((style.getPropertyPriority(prop) == 'important'));
            value = this.fixBackground(prop, value);
            this.addSimpleStyle( prop, value, importantPriority );
        }
    }
    else if ( style instanceof Evernote.ClipStyle ) {
        list = (styleList != null) ? styleList : style.getStylesNames();
        for ( var i = 0; i < list.length; ++i ) {
            var prop = list[ i ];
            value = style.getStyle( prop );
            importantPriority = style.isImportant( prop );
            value = this.fixBackground(prop, value);
            this.addSimpleStyle( prop, value, importantPriority );
        }
    }
    else if ( typeof style == 'object' && style != null ) {
        list = (styleList != null) ? styleList : style;
        for ( var prop in list ) {
            // In some cases, attempt to get currentStyle.outline ( or outlineWidth ) property in IE8 throws
            // 'unspecified error' and crash whole serilization process. So we wrap it into try {...} catch.

            try {
                if ( list.hasOwnProperty( prop ) ) {
                    var usedStyle = style[ prop ];
                    var pName = prop;
                    if(!usedStyle) {
                        usedStyle = style [list[prop]];
                        pName = list[prop];
                        if(!usedStyle) {
                            var propName = Evernote.IEStylePropertiesMapping.getPropertyNameFor(list[prop]);
                            if(propName) {
                                usedStyle = style[propName[1]];
                            }
                        }
                    }
                    usedStyle = this.fixBackground(pName, usedStyle);
                    this.addSimpleStyle( pName, usedStyle );
                }
            }  catch (err) {}
        }
    }
};

Evernote.ClipStyle.prototype.removeStyle = function ( style ) {
    Evernote.Logger.debug( "ClipStyle.removeStyle()" );
    if(style) {
        if ( window.CSSStyleDeclaration && Evernote.Utils.isInstanceOf(style, window.CSSStyleDeclaration) || style instanceof Array ) {
            for ( var i = 0; i < style.length; ++i ) {
                this.removeSimpleStyle( style[ i ] );
            }
        }
        else if ( style instanceof Evernote.ClipStyle ) {
            var stylesNames = style.getStylesNames();
            for ( i = 0; i < stylesNames.length; ++i ) {
                this.removeSimpleStyle( stylesNames[ i ] );
            }
        }
        else if ( typeof style == 'string' ) {
            this.removeSimpleStyle( style );
        }
    }
    Evernote.Logger.debug("ClipStyle.removeStyle() end")
};

Evernote.ClipStyle.prototype.mergeStyle = function ( style, override ) {
    Evernote.Logger.debug( "ClipStyle.mergeStyle()" );

    if ( style instanceof Evernote.ClipStyle ) {
        var stylesNames = style.getStylesNames();
        for ( var i = 0; i < stylesNames.length; ++i ) {
            var styleName = stylesNames[ i ];
            var styleValue = this._collection.getStyle( styleName );
            if ( styleValue == null || override || (style.isImportant( styleName ) && !this._collection.isImportant( styleName )) ) {
                var newValue = style.getStyle( styleName );
                if ( style.isImportant( styleName ) ) {
                    this._collection.addStyle( styleName, newValue, true );
                }
                else if ( override && !this._collection.isImportant( styleName ) ) {
                    this._collection.addStyle( styleName, newValue, false );
                }
                else if ( styleValue == null && !override ) {
                    this._collection.addStyle( styleName, newValue, style.isImportant( styleName ) );
                }
            }
        }
    }
};

Evernote.ClipStyle.prototype.getStylesNames = function () {
    return this._collection.getStylesNames();
};

Evernote.ClipStyle.prototype.getStyle = function ( prop ) {
    return this._collection.getStyle( prop );
};

Evernote.ClipStyle.prototype.isImportant = function ( prop ) {
    return this._collection.isImportant( prop );
};

Evernote.ClipStyle.prototype.addSimpleStyle = function ( prop, value, importantPriority ) {
    if ( typeof this._filterFn == "function" && !this._filterFn( prop, value ) ) {
        return;
    }
    var impl = Evernote.StylesReplacementRegistry.getImplementationFor(prop);
    if(impl && impl.getValue) {
        value = impl.getValue(value);
    }
    this._collection.addStyle( prop, value, importantPriority );
};

Evernote.ClipStyle.prototype.removeSimpleStyle = function ( prop ) {
    this._collection.removeStyle( prop );
};

Evernote.ClipStyle.prototype.toString = function () {
    var str = "";
    var stylesNames = this.getStylesNames();
    for ( var i = 0; i < stylesNames.length; ++i ) {
        var styleName = stylesNames[ i ];
        var value = this._collection.getStyle( styleName );
        if ( value != null && value.length > 0 ) {
            str += styleName + ":" + value + ";";
        }
    }

    return str;
};

Evernote.ClipStyle.CSSDefaultStyle = {
    "background-attachment": "scroll",
    "background-color" : "transparent",
    "background-image" : "none",
    "background-position-x" : "0px",
    "background-position-y" : "0px",
    "background-repeat" : "repeat",
    "border-bottom-style" : "none",
    "border-bottom-width" : "medium",
    "border-left-style" : "none",
    "border-left-width" : "medium",
    "border-right-style" : "none",
    "border-right-width" : "medium",
    "border-top-style" : "none",
    "border-top-width" : "medium",
    "border-collapse" : "separate",
    "bottom" : "auto",
    "clear" : "none",
    "height" : "auto",
    "left" : "auto",
    "margin-bottom" : "0px",
    "margin-left" : "0px",
    "margin-right" : "0px",
    "margin-top" : "0px",
    "max-height" : "none",
    "max-width" : "none",
    "min-height" : "0px",
    "min-width" : "0px",
    "overflow" : "visible",
    "overflow-x" : "visible",
    "overflow-y" : "visible",
    "padding" : "0px",
    "padding-bottom" : "0px",
    "padding-left" : "0px",
    "padding-right" : "0px",
    "padding-top" : "0px",
    "page-break-before" : "auto",
    "page-break-after" : "auto",
    "position" : "static",
    "right" : "auto",
    "text-align" : "left",
    "text-decoration" : "none",
    "text-indent" : "0px",
    "text-overflow" : "clip",
    "top" : "auto",
    "width" : "auto"
};

Evernote.ClipStyle.prototype.removeDefaultCssStyle = function () {
    var stylesNames = this.getStylesNames();
    for ( var i = 0; i < stylesNames.length; ++i ) {
        var styleName = stylesNames[ i ];
        var defaultCssValue = Evernote.ClipStyle.CSSDefaultStyle[styleName];
        var value = this.getStyle( styleName );
        if (!value)
            continue;
        if (defaultCssValue == value) {
            this.removeStyle(styleName);
        }
    }
};