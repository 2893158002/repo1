//"use strict";

Evernote.ClipRules = {
    isNoKeepNodeAttr : function( attribute, nodeName, node ) {
        if ( !attribute ) {
            return true;
        }

        var attrName = attribute.name.toLowerCase();
        var attrValue = attribute.value.toLowerCase();
        if((node.nodeName.toUpperCase() == "SPAN" || node.nodeName.toUpperCase() == "A") && node.getElementsByTagName( "IMG" ).length > 0) {
            nodeName = "div";
        }
        var attributesToKeepForNode = this.KEEP_NODE_ATTRIBUTES[nodeName];
        if(attributesToKeepForNode) {
            var keepAttributeForNode = typeof attributesToKeepForNode[attrName] != 'undefined';
        }
        return typeof this.NOKEEP_NODE_ATTRIBUTES[ attrName ] != 'undefined'
            || !keepAttributeForNode
            || attrName.substring( 0, 2 ) == "on"
            || attrName.indexOf("xml") == 0
            || attrValue.indexOf("function(") >= 0
            || (attrName == "href" && attrValue.substring( 0, 11 ) == "javascript:");
    },

    isConditionalNode : function( node ) {
        return node && typeof this.CONDITIONAL_NODES[ node.nodeName.toUpperCase() ] != 'undefined';
    },

    translateNode : function( node ) {
        var nodeName = this.NODE_NAME_TRANSLATIONS[ node.nodeName.toUpperCase() ] || node.nodeName.toUpperCase();
        return (typeof this.SUPPORTED_NODES[ nodeName ] != "undefined") ? nodeName.toLowerCase() : this.NODE_NAME_TRANSLATIONS[ "*" ].toLowerCase();
    },

    isSupportedNode : function( node ) {
        return node && typeof this.SUPPORTED_NODES[ node.nodeName.toUpperCase() ] != 'undefined';
    },

    isRejectedNode : function( node ) {
        return node && typeof this.REJECTED_NODES[ node.nodeName.toUpperCase() ] != 'undefined';
    },

    isNonAncestorNode : function( node ) {
        return node && typeof this.NON_ANCESTOR_NODES[ node.nodeName.toUpperCase() ] != 'undefined';
    },

    isSelfClosingNode : function( node ) {
        return node && typeof this.SELF_CLOSING_NODES[ node.nodeName.toUpperCase() ] != 'undefined';
    }
};

Evernote.ClipRules.KEEP_NODE_ATTRIBUTES = {
    "a" : {
        "title": null,
        "dir" : null,
        "accesskey": null,
        "charset": null,
        "type": null,
        "name": null,
        "href": null,
        "hreflang": null,
        "rel": null,
        "rev": null,
        "shape": null,
        "coords": null,
        "target": null
    },

    "abbr" : {
        "title": null,
        "dir" : null
    },

    "acronym" : {
        "title": null,
        "dir" : null
    },

    "address" : {
        "title": null,
        "dir" : null
    },

    "area" : {
        "title": null,
        "dir" : null,
        "accesskey": null,
        "shape": null,
        "coords": null,
        "href": null,
        "nohref": null,
        "alt": null,
        "target": null
    },

    "b" : {
        "title": null,
        "dir" : null
    },

    "bdo" : {
        "title": null,
        "dir" : null
    },

    "big" : {
        "title": null,
        "dir" : null
    },

    "blockquote" : {
        "title": null,
        "dir" : null,
        "cite": null
    },

    "br" : {
        "title": null,
        "clear": null
    },

    "caption" : {
        "title": null,
        "dir" : null,
        "align": null
    },

    "center" : {
        "title": null,
        "dir" : null
    },

    "cite" : {
        "title": null,
        "dir" : null
    },

    "code" : {
        "title": null,
        "dir" : null
    },

    "col" : {
        "title": null,
        "dir" : null,
        "span" : null,
        "width" : null,
        "align" : null,
        "char" : null,
        "charoff" : null,
        "valign" : null
    },

    "colgroup" : {
        "title": null,
        "dir" : null,
        "span" : null,
        "width" : null,
        "align" : null,
        "char" : null,
        "charoff" : null,
        "valign" : null
    },

    "dd" : {
        "title": null,
        "dir" : null
    },

    "del" : {
        "title": null,
        "dir" : null,
        "cite" : null,
        "datetime" : null
    },

    "dfn" : {
        "title": null,
        "dir" : null
    },

    "div" : {
        "title": null,
        "dir" : null,
        "align" : null
    },

    "dl": {
        "title": null,
        "dir" : null,
        "compact" : null
    },

    "dt": {
        "title": null,
        "dir" : null
    },

    "em": {
        "title": null,
        "dir" : null
    },

    "font": {
        "title": null,
        "dir" : null,
        "size" : null,
        "color" : null,
        "face" : null
    },

    "h1": {
        "title": null,
        "dir" : null,
        "align" : null
    },

    "h2": {
        "title": null,
        "dir" : null,
        "align" : null
    },

    "h3": {
        "title": null,
        "dir" : null,
        "align" : null
    },

    "h4": {
        "title": null,
        "dir" : null,
        "align" : null
    },

    "h5": {
        "title": null,
        "dir" : null,
        "align" : null
    },

    "h6": {
        "title": null,
        "dir" : null,
        "align" : null
    },

    "hr": {
        "title": null,
        "dir" : null,
        "align" : null,
        "noshade" : null,
        "size" : null,
        "width" : null
    },

    "i": {
        "title": null,
        "dir" : null
    },

    "img": {
        "title": null,
        "dir" : null,
        "src" : null,
        "alt" : null,
        "name" : null,
        "longdesc" : null,
        "height" : null,
        "width" : null,
        "usemap" : null,
        "ismap" : null,
        "align" : null,
        "border" : null,
        "hspace" : null,
        "vspace" : null
    },

    "en-media": {
        "type" : null,
        "hash" : null,
        "title" : null,
        "dir" : null,
        "alt" : null,
        "longdesc" : null,
        "height" : null,
        "width" : null,
        "usemap" : null,
        "align" : null,
        "border" : null,
        "hspace" : null,
        "vspace" : null
    },

    "ins": {
        "title": null,
        "dir" : null,
        "cite" : null,
        "datetime" : null
    },

    "kbd": {
        "title": null,
        "dir" : null
    },

    "li": {
        "title": null,
        "dir" : null,
        "type" : null,
        "value" : null
    },

    "map": {
        "dir" : null,
        "title" : null,
        "name" : null
    },

    "ol": {
        "title" : null,
        "dir" : null,
        "type" : null,
        "compact" : null,
        "start" : null
    },

    "p": {
        "title" : null,
        "dir" : null,
        "align" : null
    },

    "pre": {
        "title" : null,
        "dir" : null,
        "width" : null
    },

    "s": {
        "title" : null,
        "dir" : null
    },


    "samp": {
        "title" : null,
        "dir" : null
    },

    "small": {
        "title" : null,
        "dir" : null
    },

    "span": {
        "title" : null,
        "dir" : null
    },

    "strike": {
        "title" : null,
        "dir" : null
    },

    "strong": {
        "title" : null,
        "dir" : null
    },

    "sub": {
        "title" : null,
        "dir" : null
    },

    "sup": {
        "title" : null,
        "dir" : null
    },

    "table": {
        "title" : null,
        "dir" : null,
        "summary" : null,
        "width" : null,
        "border" : null,
        "cellspacing" : null,
        "cellpadding" : null,
        "align" : null,
        "bgcolor" : null
    },

    "tbody": {
        "title" : null,
        "dir" : null,
        "align" : null,
        "char" : null,
        "charoff" : null,
        "valign" : null
    },

    "td": {
        "title" : null,
        "dir" : null,
        "align" : null,
        "char" : null,
        "charoff" : null,
        "valign" : null,
        "abbr" : null,
        "rowspan" : null,
        "colspan" : null,
        "nowrap" : null,
        "bgcolor" : null,
        "width" : null,
        "height" : null
    },

    "tfoot": {
        "title" : null,
        "dir" : null,
        "align" : null,
        "char" : null,
        "charoff" : null,
        "valign" : null
    },

    "th": {
        "title" : null,
        "dir" : null,
        "align" : null,
        "char" : null,
        "charoff" : null,
        "valign" : null,
        "abbr" : null,
        "rowspan" : null,
        "colspan" : null,
        "nowrap" : null,
        "bgcolor" : null,
        "width" : null,
        "height" : null
    },

    "thead": {
        "title" : null,
        "dir" : null,
        "align" : null,
        "char" : null,
        "charoff" : null,
        "valign" : null
    },

    "tr": {
        "title" : null,
        "dir" : null,
        "align" : null,
        "char" : null,
        "charoff" : null,
        "valign" : null,
        "bgcolor" : null
    },

    "tt": {
        "title" : null,
        "dir" : null
    },

    "u": {
        "title" : null,
        "dir" : null
    },

    "ul": {
        "title" : null,
        "dir" : null,
        "type" : null,
        "compact" : null
    },

    "var": {
        "title" : null,
        "dir" : null
    }
};

Evernote.ClipRules.NOKEEP_NODE_ATTRIBUTES = {
    "style" : null,
    "tabindex" : null
};

Evernote.ClipRules.CONDITIONAL_NODES = {
    "EMBED" : null,
    "OBJECT" : null,
    "IMG" : null,
    "VIDEO" : null
};

Evernote.ClipRules.NODE_NAME_TRANSLATIONS = {
    "HTML" : "DIV",
    "BODY" : "DIV",
    "FORM" : "DIV",
    "CANVAS" : "DIV",
    "CUFON" : "DIV",
    "EMBED" : "IMG",
    "BUTTON" : "SPAN",
    "INPUT" : "SPAN",
    "LABEL" : "SPAN",
    "BDI" : "SPAN",
    "IMG" : "EN-MEDIA",
    "*" : "DIV"
};

Evernote.ClipRules.SUPPORTED_NODES = {
    "A" : null,
    "ABBR" : null,
    "ACRONYM" : null,
    "ADDRESS" : null,
    "AREA" : null,
    "B" : null,
    "BUTTON" : null,
    "BDO" : null,
    "BIG" : null,
    "BLOCKQUOTE" : null,
    "BR" : null,
    "CAPTION" : null,
    "CENTER" : null,
    "CITE" : null,
    "CODE" : null,
    "COL" : null,
    "COLGROUP" : null,
    "DD" : null,
    "DEL" : null,
    "DFN" : null,
    "DIV" : null,
    "DL" : null,
    "DT" : null,
    "EM" : null,
    "FONT" : null,
    "FORM" : null,
    "H1" : null,
    "H2" : null,
    "H3" : null,
    "H4" : null,
    "H5" : null,
    "H6" : null,
    "HR" : null,
    "HTML" : null,
    "I" : null,
    "IMG" : null,
    "EN-MEDIA" : null,
    "INPUT" : null,
    "INS" : null,
    "KBD" : null,
    "LI" : null,
    "MAP" : null,
    "OL" : null,
    "P" : null,
    "PRE" : null,
    "Q" : null,
    "S" : null,
    "SAMP" : null,
    "SMALL" : null,
    "SPAN" : null,
    "STRIKE" : null,
    "STRONG" : null,
    "SUB" : null,
    "SUP" : null,
    "TABLE" : null,
    "TBODY" : null,
    "TD" : null,
    "TFOOT" : null,
    "TH" : null,
    "THEAD" : null,
    "TR" : null,
    "TT" : null,
    "U" : null,
    "UL" : null,
    "VAR" : null
};

Evernote.ClipRules.REJECTED_NODES = {
    "SCRIPT" : null,
    "LINK" : null,
    "IFRAME" : null,
    "STYLE" : null,
    "SELECT" : null,
    "OPTION" : null,
    "OPTGROUP" : null,
    "NOSCRIPT" : null,
    "PARAM" : null,
    "HEAD" : null,
    "EVERNOTEDIV" : null,
    "CUFONTEXT" : null,
    "NOEMBED" : null
};

Evernote.ClipRules.NON_ANCESTOR_NODES = {
    "OL" : null,
    "UL" : null,
    "LI" : null
};

Evernote.ClipRules.SELF_CLOSING_NODES = {
    "IMG" : null,
    //"INPUT" : null,
    "BR" : null
};
