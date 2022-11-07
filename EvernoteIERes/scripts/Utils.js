/**
 * Global utilities.
 */
Evernote.Utils = {
    _prevTime : null,

    getIEComputedStyle : function(elem, prop) {
        //Dean Edwards method. See first comment here: http://bit.ly/cMSs9R

        var value = elem.currentStyle[prop] || 0;
        var leftCopy = elem.style.left;
        var runtimeLeftCopy = elem.runtimeStyle.left;

        elem.runtimeStyle.left = elem.currentStyle.left;
        elem.style.left = (prop === "fontSize") ? "1em" : value;
        value = elem.style.pixelLeft + "px";

        elem.style.left = leftCopy;
        elem.runtimeStyle.left = runtimeLeftCopy;
        return value
    },

    sendMessageToPopup : function( message ){
        Evernote.JQuery("#" + Constants.CLIP_DIALOG_ID).trigger(message);
    },

    pushTimeWithPrefix : function(prefix) {
        var time = new Date;
        var passed;

        time = time.getTime();
        passed = time - this._prevTime;
        this._prevTime = time;
        console.log(prefix + ': ' + passed + 'ms');
    },


    cloneObject : function(obj){
        if(obj == null || typeof(obj) != 'object')
            return obj;
        if(obj.constructor == Array)
            return [].concat(obj);
        var temp = {};
        for(var key in obj)
            temp[key] = this.cloneObject(obj[key]);
        return temp;
    },

    saveSelection : function(win) {
        Evernote.Logger.debug( "Utils.SaveSelection()" );
        var selectionFinder = new Evernote.SelectionFinder(win.document);
        selectionFinder.find( true );
        if(selectionFinder.hasSelection()) {
            return Evernote.Utils.cloneRange(selectionFinder.getRange());
        }
        return null;
    },

    clearSelection : function(doc) {
        if(doc.getSelection) {
            doc.getSelection().removeAllRanges();
        }
    },

    /**
     * Make selection of passed range in document.
     * @param doc - DOM object
     * @param range - selection range
     */
    selectRange : function(doc, range) {
        if(doc.getSelection) {
            doc.getSelection().addRange(range);
        }
        else if (doc.selection && range) {
            range.select();
        }
    },

    /**
     * Creates copy of selection range only if it supports it, otherwise returns same range
     * @param range - Range object
     * @return {Range}
     */
    cloneRange : function(range) {
        Evernote.Logger.debug("cloneRange: start");
        if(range && range.cloneRange) {
            return range.cloneRange();
        }
        if(range.duplicate) {
            Evernote.Logger.debug("cloneRange: result = " + range.duplicate());
            return range.duplicate();
        }
        return range;
    },

    /**
     * Checks whether selection is presented.
     * @param win - window object that should be checked.
     * @return true - if selection is presented, false otherwise.
     */
    hasSelection : function(win) {
        Evernote.Logger.debug( "Utils.hasSelection()" );
        var selectionFinder = new Evernote.SelectionFinder(win.document)
        if ( selectionFinder.hasSelection() ) {
            return true;
        }
        else {
            selectionFinder.find( true );
            return selectionFinder.hasSelection();
        }
    },

    /**
     * Gets favicon url from the document (if any)
     * @param doc - document to inspect.
     * @return url to the favicon or null.
     */
    getFavIconUrl : function(doc) {
        var links = doc.getElementsByTagName("link");
        var i;
        for (i = 0; i < links.length; i++) {
            if (links[i].rel) {
                var rels = links[i].rel.toLowerCase().split(/\s+/);
                if (Evernote.ArrayExtension.indexOf(rels, "icon") !== -1) {
                    // Found it!
                    return links[i].href;
                }
            }
        }
        return null;
    },

    /**
     * If passed string length is more than length argument, than string is trimmed to length and dots are added
     * (total length of the returned string does not exceed specified length).
     * @param str - string to trim
     * @param length - max number of characters in the string
     * @param addition - text to be added to truncated string
     * @return {*}
     */
    cutToLength : function(str, length, addition) {
        if(!addition) {
            addition = "...";
        }
        if(str.length > length) {
            return (str.substring(0, length-3) + addition);
        }
        return str;
    },

    /**
     * Change new line symbol to html <br/>
     */
    newLineToBr : function(str) {
        return str.replace(/(\r\n|\n|\r)/gm, "<br/>");
    },

    /**
     * Encodes html specific characters (<, >, &, etc.) in specified string
     * @param str - string to encode.
     * @return new string with encoded characters.
     */
    htmlEncode : function( str ) {
        var result = "";
        for ( var i = 0; i < str.length; i++ ) {
            var charcode = str.charCodeAt( i );
            var aChar = str[ i ];
            if(!aChar) {
                aChar = str.charAt(i);
            }
            if(charcode >= 55296 )
                result += aChar;
            else if ( charcode > 0x7f ) {
                result += "&#" + charcode + ";";
            }
            else if ( aChar == '>' ) {
                result += "&gt;";
            }
            else if ( aChar == '<' ) {
                result += "&lt;";
            }
            else if ( aChar == '&' ) {
                result += "&amp;";
            }
            else {
                result += str[ i ] ? str[ i ] : str.charAt(i);
            }
        }

        return result;
    },

    /**
     * Absolutize specified url by specified base.
     * @param base - base url
     * @param href - relative url (from base)
     */
    makeAbsolutePath : function ( base, href ) {
        function parseURI( url ) {
            var m = String( url ).replace( /^\s+|\s+$/g, '' ).match( /^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/ );
            // authority = '//' + user + ':' + pass '@' + hostname + ':' port
            return (m ? {
                href : m[ 0 ] || '',
                protocol : m[ 1 ] || '',
                authority : m[ 2 ] || '',
                host : m[ 3 ] || '',
                hostname : m[ 4 ] || '',
                port : m[ 5 ] || '',
                pathname : m[ 6 ] || '',
                search : m[ 7 ] || '',
                hash : m[ 8 ] || ''
            } : null);
        }

        function absolutizeURI( base, href ) {// RFC 3986
            function removeDotSegments( input ) {
                var output = [];
                input.replace( /^(\.\.?(\/|$))+/, '' )
                    .replace( /\/(\.(\/|$))+/g, '/' )
                    .replace( /\/\.\.$/, '/../' )
                    .replace( /\/?[^\/]*/g, function ( p ) {
                        if ( p === '/..' ) {
                            output.pop();
                        }
                        else {
                            output.push( p );
                        }
                    } );
                return output.join( '' ).replace( /^\//, input.charAt( 0 ) === '/' ? '/' : '' );
            }

            href = parseURI( href || '' );
            base = parseURI( base || '' );

            return !href || !base ? null : (href.protocol || base.protocol) +
                (href.protocol || href.authority ? href.authority : base.authority) +
                removeDotSegments( href.protocol || href.authority || href.pathname.charAt( 0 ) === '/' ? href.pathname :
                    (href.pathname ? ((base.authority && !base.pathname ? '/' : '') +
                        base.pathname.slice( 0, base.pathname.lastIndexOf( '/' ) + 1 ) + href.pathname) : base.pathname) ) +
                (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
                href.hash;
        }
        return absolutizeURI( base, href );

    },

    getNestedDocuments : function( doc ) {
        Evernote.Logger.debug( "Utils.getNestedDocuments()" );

        var docs = [ ];
        try {
            var frames = ( doc ) ? doc.getElementsByTagName( "frame" ) : [ ];
            for ( var i = 0; i < frames.length; ++i ) {
                if ( frames[ i ].contentDocument ) {
                    docs.push( frames[ i ].contentDocument );
                }
            }

            var iframes = ( doc ) ? doc.getElementsByTagName( "iframe" ) : [ ];
            for ( i = 0; i < iframes.length; ++i ) {
                if ( iframes[ i ].contentDocument ) {
                    docs.push( iframes[ i ].contentDocument );
                }
            }
        } catch (e) {
            Evernote.Logger.error("getNestedDocuments failed with error " + e);
        }
        Evernote.Logger.debug( "Utils.getNestedDocuments() end" );
        return docs;

    },

    isSupportedUrl : function(url) {
        return url.indexOf("http") == 0;
    },

    getFontSizeInPixels : function(elementFontSize) {
        function computedStyle(element, property){
            var s = false;
            if(window.getComputedStyle){
                s = window.getComputedStyle(element, null).getPropertyValue(property);
            } else if(element.currentStyle){
                var p = property.split('-');
                var str = new String('');
                for(var i = 0; i < p.length; i++){
                    str += (i > 0)?(p[i].substr(0, 1).toUpperCase() + p[i].substr(1)):p[i];
                }
                s = element.currentStyle[str];
            }
            return s;
        }

        function getPercentageSize(size) {
            var currentFontSize = parseFloat(size);
            var htmlFontSize = 16;
            var htmlElement = document.getElementsByTagName("html");
            if(htmlElement && htmlElement.length > 0) {
                var htmlComputedFontSize = computedStyle(htmlElement[0], "font-size");
                if(htmlComputedFontSize && htmlComputedFontSize.indexOf("%") == -1) {
                    htmlFontSize = Evernote.Utils.getFontSizeInPixels(htmlComputedFontSize);
                }
            }
            return htmlFontSize * currentFontSize / 100;
        }

        var size = elementFontSize;
        if(size.indexOf("em") > -1) {
            var defFont = computedStyle(document.body, "font-size");
            if(defFont.indexOf("pt") > -1){
                defFont = Math.round(parseInt(defFont)*96/72);
            } else if(defFont.indexOf("%") > -1)  {
                defFont = getPercentageSize(defFont);
            } else{
                defFont = parseInt(defFont);
            }
            size = Math.round(defFont * parseFloat(size));
        }
        else if(size.indexOf("pt") > -1){
            size = Math.round(parseInt(size)*96/72)
        } else if(size.indexOf("%") > -1) {
            size = getPercentageSize(size);
        }
        return parseInt(size);
    },

    innerWidth : function() {
        if(window.innerWidth)
            return window.innerWidth;

        var doc= (document.body.clientWidth)? document.body: document.documentElement;
        return doc.clientWidth;
    },

    innerHeight : function() {
        if(window.innerHeight)
            return window.innerHeight;

        var doc= (document.body.clientHeight)? document.body: document.documentElement;
        return doc.clientHeight;
    },

    scrollTop : function() {
        var doc = document.body.scrollTop ? document.body : document.documentElement;
        return doc.scrollTop;
    },

    scrollLeft : function() {
        var doc = document.body.scrollLeft ? document.body : document.documentElement;
        return doc.scrollLeft;
    },

    /**
     * Stopped propagation of keydown events for passed selector.
     * @param selector - could be element or jquery selector.
     */
    hardInput : function(selector) {
        this.elem = Evernote.JQuery(selector);
        this.elem.keydown(function(e) {
            e.stopPropagation();
        });
    },

    isQuirkMode : function() {
        return document.compatMode == "BackCompat" && !Evernote.BrowserDetection.isIE11();
    },

    isQuirkModeNew : function() {
        return document.compatMode == "BackCompat" && Evernote.BrowserDetection.isLessThanIE9();
    },

    isInstanceOf : function(obj, type) {
        if(obj && type) {
            try {
                return obj instanceof type;
            } catch (e) {
                return type.toString().indexOf(typeof obj) != -1;
            }
        }
        return false;
    },

    changeBackgroundImage : function(element, localpath) {
        if(element.style) {
            element.style.backgroundImage = "url('file:///" + localpath.replace(/\\/g, "/").replace(/\s/g, "%20") + "')";
        }
    },

    format: function(str) {
        var args = arguments;
        return str.replace(/\{(\d+)\}/g, function (m, n) { return args[(n | 0)+1]; });
    },

    fixIERangeObject : function(range,win) { //Only for IE8 and below.
        win=win || window;

        if(!range) return null;
        if(!range.startContainer && win.document.selection) { //IE8 and below

            var _findTextNode=function(parentElement,text) {
                //Iterate through all the child text nodes and check for matches
                //As we go through each text node keep removing the text value (substring) from the beginning of the text variable.
                var container=null,offset=-1;
                for(var node=parentElement.firstChild; node; node=node.nextSibling) {
                    if(node.nodeType==3) {//Text node
                        var find=node.nodeValue;
                        var pos=text.indexOf(find);
                        if(pos==0 && text!=find) { //text==find is a special case
                            text=text.substring(find.length);
                        } else {
                            container=node;
                            offset=text.length-1; //Offset to the last character of text. text[text.length-1] will give the last character.
                            break;
                        }
                    }
                }
                //Debug Message
                //alert(container.nodeValue);
                return {node: container,offset: offset}; //nodeInfo
            };

            var rangeCopy1=range.duplicate(), rangeCopy2=range.duplicate(); //Create a copy
            var rangeObj1=range.duplicate(), rangeObj2=range.duplicate(); //More copies :P

            rangeCopy1.collapse(true); //Go to beginning of the selection
            rangeCopy1.moveEnd('character',1); //Select only the first character
            rangeCopy2.collapse(false); //Go to the end of the selection
            rangeCopy2.moveStart('character',-1); //Select only the last character

            //Debug Message
            // alert(rangeCopy1.text); //Should be the first character of the selection
            var parentElement1=rangeCopy1.parentElement(), parentElement2=rangeCopy2.parentElement();

            //If user clicks the input button without selecting text, then moveToElementText throws an error.
            if(window.HTMLInputElement && (parentElement1 instanceof window.HTMLInputElement || parentElement2 instanceof HTMLInputElement)) {
                return null;
            }
            rangeObj1.moveToElementText(parentElement1); //Select all text of parentElement
            rangeObj1.setEndPoint('EndToEnd',rangeCopy1); //Set end point to the first character of the 'real' selection
            rangeObj2.moveToElementText(parentElement2);
            rangeObj2.setEndPoint('EndToEnd',rangeCopy2); //Set end point to the last character of the 'real' selection

            var text1=rangeObj1.text; //Now we get all text from parentElement's first character upto the real selection's first character
            var text2=rangeObj2.text; //Here we get all text from parentElement's first character upto the real selection's last character

            var nodeInfo1=_findTextNode(parentElement1,text1);
            var nodeInfo2=_findTextNode(parentElement2,text2);

            // todo: dirty fix
            if (!nodeInfo1.node) {
                nodeInfo1.node = parentElement1;
            }

            if (!nodeInfo2.node) {
                nodeInfo2.node = parentElement2;
            }

            //Finally we are here
            range.startContainer=nodeInfo1.node;
            range.startOffset=nodeInfo1.offset;
            range.endContainer=nodeInfo2.node;
            range.endOffset=nodeInfo2.offset+1; //End offset comes 1 position after the last character of selection.
        }
        return range;
    },

    unionRectangles : function(rect1, rect2) {
        var rect = {
            top: (Math.min(rect1.top, rect2.top)),
            bottom: (Math.max(rect1.bottom, rect2.bottom)),
            left: (Math.min(rect1.left, rect2.left)),
            right: (Math.max(rect1.right, rect2.right))
        };
        rect.width = rect.right - rect.left;
        rect.height = rect.bottom - rect.top;

        return rect;
    },


    fixedPosition : function(win, el, topOffset, immediate) {
        function applyPosition(elem) {
            if(elem) {
                var scrollPosition = win.document.documentElement.scrollTop || win.document.body.scrollTop;
                var offset;
                if(typeof topOffset == "function") {
                    offset = topOffset();
                } else {
                    offset = scrollPosition + topOffset;
                }
                elem.animate({top: offset}, 100);
            }
        }

        if(el) {
            var elem = Evernote.JQuery(el);
            if(Evernote.Utils.isQuirkMode())  {
                elem.css("position", "absolute");
                if (win.attachEvent)
                    win.attachEvent("onscroll", function() {applyPosition(elem);});
                else if (win.addEventListener)
                    win.addEventListener("scroll", function() {applyPosition(elem);}, false);
                else
                    Evernote.Logger.error( "Utils.fixedPosition() can't attachEvent" );
                if(immediate) {
                    applyPosition(elem);
                }
            }
        }
    },

    mergeCustomComboBoxStrings : function(notebook, owner, ownedByStr, maxLen) {

        var totalLen = notebook.length;
        if (owner.length) {
            // format: "space","(","<owned by localize string>","space","<owner>",")"
            // magic number "4" is: "space","(","space",")"
            totalLen += ownedByStr.length + owner + 4;
        }

        if (totalLen <= maxLen) {
            return {
                note: notebook,
                own: "",
                title: ""
            };
        }

        var half = maxLen / 2 - 2;

        if (owner.length == 0) {
            return {
                note: notebook.substr(0, half) + "..." + notebook.substring(notebook.length - half, notebook.length),
                own: "",
                title: notebook
            };
        }

        var ownerFormatStr = "(" + ownedByStr + " " + owner + ")";
        var title = notebook + ownerFormatStr;
        var resultString = title.substr(0, half) + "..." + title.substr(title.length - half);

        if (notebook.length <= half) {
            return  {
                note: notebook,
                own: "..." + title.substr(title.length - notebook.length),
                title: notebook + " " + ownerFormatStr
            };
        }else if (ownerFormatStr <= half) {
            return  {
                note: notebook.substr(0, maxLen - ownerFormatStr.length) + "...",
                own: ownerFormatStr,
                title: notebook + " " + ownerFormatStr
            };
        }else {
            return  {
                note: resultString.substr(0, resultString.length - half),
                own: resultString.substr(half + 3),
                title: notebook + " " + ownerFormatStr
            };
        }
    },

    setEvernoteLogo : function(selector) {
        var serverLocation = Evernote.Addin.getServerLocation();
        Evernote.Logger.debug("Evernote server location is " + serverLocation);
        if (serverLocation.length && serverLocation.indexOf("international") == -1) {
            var evernoteLogoEl = Evernote.JQuery(selector);
            if (evernoteLogoEl) {
                var imageFileName = "oldclipper/images/web-clipper-logo_" + serverLocation + ".png";
                this.changeBackgroundImage(evernoteLogoEl.get(0), Evernote.Addin.getPath("resources") + imageFileName);
            }
        }
    },

    Selection : {
        getRangeCount : function(selection) {
            if(selection.rangeCount) {
                return selection.rangeCount;
            }
            return 1;
        },

        getRangeAt : function(selection, pos) {
            if(selection.getRangeAt) {
                selection.getRangeAt(pos);
            }
            return selection;
        },

        getCommonAncestorContainer : function(range) {
            if(range.commonAncestorContainer) {
                return range.commonAncestorContainer;
            }
            else if(range.parentElement) {
                return range.parentElement();
            }
            return null;
        }
    }

};