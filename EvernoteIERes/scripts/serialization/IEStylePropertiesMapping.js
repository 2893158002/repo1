Evernote.IEStylePropertiesMapping = {

    _mapping : {
        "background-attachment" : "backgroundAttachment",
        "background-color" : "backgroundColor",
        "background-image" : "backgroundImage",
        "background-repeat" : "backgroundRepeat",
        "background-position-x" : "backgroundPositionX",
        "background-position-y" : "backgroundPositionY",

        "border-bottom-color" : "borderBottomColor",
        "border-bottom-style" : "borderBottomStyle",
        "border-bottom-width" : "borderBottomWidth",

        "border-left-color" : "borderLeftColor",
        "border-left-style" : "borderLeftStyle",
        "border-left-width" : "borderLeftWidth",

        "border-right-color" : "borderRightColor",
        "border-right-style" : "borderRightStyle",
        "border-right-width" : "borderRightWidth",

        "border-top-color" : "borderTopColor",
        "border-top-style" : "borderTopStyle",
        "border-top-width" : "borderTopWidth",
        "border-collapse" : "borderCollapse",

        "font-family" : "fontFamily",
        "font-size" : "fontSize",
        "font-style" : "fontStyle",
        "font-weight" : "fontWeight",

        "float" : "styleFloat",

        "ime-mode" : "imeMode",

        "letter-spacing" : "letterSpacing",

        "line-height" : "lineHeight",

        "list-style-image" : "listStyleImage",
        "list-style-position" : "listStylePosition",
        "list-style-type" : "listStyleType",

        "margin-bottom" : "marginBottom",
        "margin-left" : "marginLeft",
        "margin-right" : "marginRight",
        "margin-top" : "marginTop",

        "max-height" : "maxHeight",
        "max-width" : "maxWidth",
        "min-height" : "minHeight",
        "min-width" : "minWidth",

        "overflow-x" : "overflowX",
        "overflow-y" : "overflowY",

        "padding-bottom" : "paddingBottom",
        "padding-left" : "paddingLeft",
        "padding-right" : "paddingRight",
        "padding-top" : "paddingTop",

        "page-break-after" : "pageBreakAfter",
        "page-break-before" : "pageBreakBefore",

        "table-layout" : "tableLayout",

        "text-align" : "textAlign",
        "text-decoration" : "textDecoration",
        "text-indent" : "textIndent",
        "text-overflow" : "textOverflow",
        "text-transform" : "textTransform",

        "vertical-align" : "verticalAlign",
        "white-space" : "whiteSpace",
        "word-spacing" : "wordSpacing",
        "word-wrap" : "wordWrap",
        "z-index" : "zIndex"
    },

    getPropertyNameFor: function(styleName) {
        return [styleName, this._mapping[styleName]];
    },
    getPropertiesList: function() {
        return this._mapping;
    }
};