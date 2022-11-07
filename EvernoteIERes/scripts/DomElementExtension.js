Evernote.ElementExtension = {
    querySelector : function(selector, doc) {
        if(!doc) {
            doc = document;
        }
        if(doc.querySelector) {
            return doc.querySelector(selector);
        }
        else {
            var head = doc.documentElement.firstChild;
            var styleTag = doc.createElement("STYLE");
            head.appendChild(styleTag);
            doc.__qsResult = [];

            styleTag.styleSheet.cssText = selector + "{x:expression(document.__qsResult.push(this))}";
            window.scrollBy(0, 0);
            head.removeChild(styleTag);

            var result = [];
            for (var i in doc.__qsResult)
                result.push(doc.__qsResult[i]);
            return result;
        }
    },

    getComputedStyle : function(element, pseudoElement, win) {
        var pseudo = pseudoElement;
        var target = win;
        if(!target)
            target = window;
        if(!pseudo) {
            pseudo = null;
        }
        if(target.getComputedStyle)
            return target.getComputedStyle(element, pseudo);
        if(element.currentStyle) {
            try {
				var fixedElement = Evernote.Utils.cloneObject(element.currentStyle);
				fixedElement['fontSize'] = Evernote.Utils.getIEComputedStyle(element, 'fontSize');
				return fixedElement; 
			}             
            catch (err) {
                return element.currentStyle;
            }
        }
        return null;
    },

    hasParentNode : function(element) {
        return element.parentNode && element.parentNode.nodeType != 9 && element.parentNode.nodeType != 11;
    },

    getBoundingClientRect : function(element) {
        if(element && element.getBoundingClientRect) {
            var rect = element.getBoundingClientRect();
            var width = rect.width || element.offsetWidth || element.boundingWidth;
            var height = rect.height || element.offsetHeight || element.boundingHeight;
            return {
                left : rect.left,
                right : rect.right,
                top : rect.top,
                bottom : rect.bottom,
                width : width,
                height : height
            }
        }
        return null;
    },

    hasAttribute : function(node, attrName) {
        if(node) {
            if(node.hasAttribute) {
                return node.hasAttribute(attrName);
            }
            if(node.attributes) {
                var attrValue = node.attributes[attrName];
                return typeof attrValue != typeof undefined;
            }
        }
    }
};