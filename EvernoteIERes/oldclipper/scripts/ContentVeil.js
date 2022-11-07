function ContentVeil() {

    var veil = document.createElement("div");
    veil.id = "evernoteContentVeil";
    var inner = document.createElement("div");
    inner.id = "evernoteInnerBox";


    function fireClickUnderVeil(evt) {
        veil.style.display = 'none';
        var bottomElement = document.elementFromPoint(evt.clientX, evt.clientY);
        veil.style.display = 'block';
        bottomElement.click();
    }

    // make veil imperceptible for mouse clicks.
    veil.attachEvent('onclick', fireClickUnderVeil);

    var topExpandContract;
    var bottomExpandContract;
    for (var i = 0; i < 2; i++) {
        var expand = document.createElement("span");
        var contract = document.createElement("span");
        expand.className = "evernoteArticleExpand";
        contract.className = "evernoteArticleContract";

//        expand.setAttribute('tooltip', Evernote.Addin.getLocalizedMessage(Evernote.Messages.EXPAND));
//        expand.setAttribute('unselectable', 'on');
//        contract.setAttribute('tooltip',Evernote.Addin.getLocalizedMessage(Evernote.Messages.CONTRACT));
//        contract.setAttribute('unselectable','on');

        expand.attachEvent("onclick", function() {
            Evernote.contentPreviewer.previewNudge('up');
        });
        contract.attachEvent("onclick", function() {
            Evernote.contentPreviewer.previewNudge('down');
        });
        if (i == 0) {
            topExpandContract = document.createElement("div");
            topExpandContract.className = "evernoteExpandContract evernoteUsingExpandContract";
            topExpandContract.appendChild(expand);
            topExpandContract.appendChild(contract);
        } else {
            bottomExpandContract = document.createElement("div");
            bottomExpandContract.id = "bottomExpandContract";
            bottomExpandContract.className = "evernoteExpandContract";
            bottomExpandContract.appendChild(expand);
            bottomExpandContract.appendChild(contract);
        }
    }

    veil.appendChild(topExpandContract);
    veil.appendChild(inner);
    veil.appendChild(bottomExpandContract);

    // We keep a record of what we're currently showing (at least in some cases) so that we can update it in case the
    // state of the page changes (like if the user scrolls).
    var currentlyShownRect = null;
    var currentlyShownElt = null;
    var currentRectOffsetTop = 0;
    var currentRectOffsetLeft = 0;
    var currentlyStatic = false;
    var currentlyShadowBox = false;

    function reset(doNotResetPageCount) {
        currentlyShownRect = null;
        currentlyShownElt = null;
        currentRectOffsetTop = 0;
        currentRectOffsetLeft = 0;
        currentlyShadowBox = false;

        inner.className = inner.className.replace(/\s*evernoteShadowBox/g, "");
        veil.className = inner.className.replace(/\s*evernoteShadowBox/g, "");

        if (!doNotResetPageCount) {
//            setPageCount();
        }

        topExpandContract.className = topExpandContract.className.replace(/\s*evernoteUsingExpandContract/g, "");
        bottomExpandContract.className = bottomExpandContract.className.replace(/s*evernoteUsingExpandContract/g, "");

        showElements("embed");
        showElements("object");
        showElements("iframe");

        if(Evernote.Utils.isQuirkMode()) {
            veil.className = "evernote-top-fixed-position-quirks";
        }

        blank();
    }

    function blank() {
        veil.style.height = document.body.scrollHeight  + "px";
        veil.style.width = document.body.scrollWidth  + "px";
        veil.style.borderWidth = "0";
    }

    function gray() {
        show();
        inner.style.display = "none";
        try {
            veil.style.backgroundColor = "rgba(255, 255, 255, 0.75)";
        } catch (e) {
            veil.style.backgroundColor = "rgb(255, 255, 255)";
        }
    }

    function show() {
        Evernote.Logger.debug("Content veil show");
        inner.style.display = "";
        veil.style.backgroundColor = "";
        if (!Evernote.ElementExtension.hasParentNode(veil)) {
            document.body.appendChild(veil);
        }
    }

    function hide() {
        if (Evernote.ElementExtension.hasParentNode(veil)) {
            veil.parentNode.removeChild(veil);
        }
    }

    function isHidden() {
        if (Evernote.ElementExtension.hasParentNode(veil)) {
            return false;
        }
        return true;
    }

    // Makes a rectangle bigger in all directions by the number of pixels specified (or smaller, if 'amount' is
    // negative). Returns the new rectangle.
    function expandRect(rect, amount) {
        return {
            top: (rect.top - amount),
            left: (rect.left - amount),
            bottom: (rect.bottom + amount),
            right: (rect.right + amount),
            width: (rect.width + (2 * amount)),
            height: (rect.height + (2 * amount))
        };
    }


    function revealRect(rect, elt, staticView, shadowBox) {

        // Save this info.
        currentlyShownRect = rect;
        currentlyShownElt = elt;
        currentRectOffsetTop = Evernote.Utils.scrollTop();
        currentRectOffsetLeft = Evernote.Utils.scrollLeft();
        currentlyStatic = staticView;
        currentlyShadowBox = shadowBox;

        // We expand the rectangle for two reasons.
        // 1) we want to expand it by the width of the stroke, so that when we draw out outline, it doesn't overlap our
        // content.
        // 2) We want to leave a little extra room around the content for aesthetic reasons.
        rect = expandRect(rect, 8);
        var x = rect.left;
        var y = rect.top;
        var width = rect.width;
        var height = rect.height;

        /*var veilWidth = Evernote.Utils.innerWidth(); //veil.style.width.replace("px", "");
        var veilHeight = Evernote.Utils.innerHeight(); //veil.style.height.replace("px", "");*/

        var veilWidth = veil.style.width.replace("px", "");
        var veilHeight = veil.style.height.replace("px", "");

        inner.className = inner.className.replace(/\s*evernoteShadowBox/g, "");
        veil.className = inner.className.replace(/\s*evernoteShadowBox/g, "");

        if (shadowBox) {
            inner.className += " evernoteShadowBox";
            veil.className += " evernoteShadowBox";
        }

        inner.style.display = "block";
        veil.style.borderLeftWidth = Math.max(x, 0) + "px";
        veil.style.borderTopWidth = Math.max(y, 0) + "px";
        veil.style.borderRightWidth = Math.max((veilWidth - x - width), 0) + "px";
        veil.style.borderBottomWidth = Math.max((veilHeight - y - height), 0) + "px";

        if (Evernote.BrowserDetection.isIE7() || document.documentMode == '7') {
            // ie7 doesn't support 'border-box' value.

            function val(prop) {
                return prop.replace(/px/, '');
            }
            var vs = veil.style;
            vs.width = (val(vs.width) - val(vs.borderLeftWidth) - val(vs.borderRightWidth)) + "px";
            vs.height = (val(vs.height) - val(vs.borderTopWidth) - val(vs.borderBottomWidth)) + "px";
        }

        Evernote.Logger.debug("revealRect finished");
    }

    function revealStaticRect(rect, elt, shadowBox) {
        revealRect(rect, elt, true, shadowBox);
    }

    function outlineElement(element, scrollTo, shadowBox, articleAdjustment) {
        // See notes in Preview.js for why we use this method instead of just calling element.getBoundingClientRect().

        var rect = Evernote.contentPreviewer.computeDescendantBoundingBox(element);
        if (rect) {
            
            var mutableRect = {
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
                width: rect.width,
                height: rect.height
            };

            // We don't want to adjust ourselves into odd positions if the page is scrolled.
            var sLeft = Evernote.Utils.scrollLeft();
            var sTop = Evernote.Utils.scrollTop();

            var BORDER_MIN = 9;
            if (mutableRect.left < (BORDER_MIN - sLeft)) {
                mutableRect.width -= (BORDER_MIN - sLeft) - mutableRect.left;
                mutableRect.left = (BORDER_MIN - sLeft);
            }
            if (mutableRect.top < (BORDER_MIN - sTop)) {
                mutableRect.height -= (BORDER_MIN - sTop) - mutableRect.top;
                mutableRect.top = (BORDER_MIN - sTop);
            }

            // Get the wider of our two possible widths.
            var width = Math.max(document.body.scrollWidth, Evernote.Utils.innerWidth());

            if (mutableRect.right > (width - BORDER_MIN - sLeft)) {
                mutableRect.right = (width - BORDER_MIN - sLeft);
                mutableRect.width = mutableRect.right - mutableRect.left;
            }

            reset(articleAdjustment);
            revealStaticRect(mutableRect, true, shadowBox);

            hideElements("embed", element);
            hideElements("object", element);
            hideElements("iframe", element);

            topExpandContract.className += " evernoteUsingExpandContract";

            if (rect.height > Evernote.JQuery(window).height()) {
                bottomExpandContract.className += " evernoteUsingExpandContract";
            } else {
                bottomExpandContract.className = bottomExpandContract.className.replace(/\s*evernoteUsingExpandContract/g, "");
            }

            show();
        }
        else {
            Evernote.Logger.warn("Couldn't create rectangle from element: " + element.toString());
        }
    }

    function hideAllActiveObjects() {
        hideElements("embed");
        hideElements("object");
        hideElements("iframe");
    }


    function hideElements (tagName, exceptInElement) {
        var els = document.getElementsByTagName(tagName);
        for (var i = 0; i < els.length; i++) {
            els[i].enSavedVisibility = els[i].style.visibility;
            els[i].style.visibility = "hidden";
        }
        showElements(tagName, exceptInElement);
    }

    function showElements (tagName, inElement) {
        if (!inElement) {
            inElement = document;
        }
        var els = inElement.getElementsByTagName(tagName);
        for (var i = 0; i < els.length; i++) {
            if (typeof els[i].enSavedVisibility !== "undefined") {
                els[i].style.visibility = els[i].enSavedVisibility;
                try {
                    delete els[i].enSavedVisibility;
                } catch(e) {
                    els[i].enSavedVisibility = undefined;
                }
            }
        }
    }

    function getElement() {
        return veil;
    }

    var onScrollHandle =  function(e) {
        if (currentlyShownRect && !currentlyStatic) {
            var rect = {
                top: currentlyShownRect.top,
                bottom: currentlyShownRect.bottom,
                left: currentlyShownRect.left,
                right: currentlyShownRect.right,
                width: currentlyShownRect.width,
                height: currentlyShownRect.height
            };

            var vert = Evernote.Utils.scrollTop() - currentRectOffsetTop;
            var horiz = Evernote.Utils.scrollLeft() - currentRectOffsetLeft;

            if (!vert && !horiz) {
                return;
            }

            rect.top -= vert;
            rect.bottom -= vert;
            rect.left -= horiz;
            rect.right -= horiz;
            blank();
            revealRect(rect, currentlyShownElt);
        }
    };

    Evernote.JQuery(window).resize( function(e) {
        if (currentlyShownElt) {
            var rect = Evernote.contentPreviewer.computeDescendantBoundingBox(currentlyShownElt);
            if (rect) {
                blank();
                if (currentlyShadowBox) {
                    revealRect(rect, currentlyShownElt, true, true);
                } else {
                    revealRect(rect, currentlyShownElt, true, false);
                }
            }
        }
        if (inner.style.display == 'none') {
            gray();
        }
    });

    if (window.attachEvent)
        window.attachEvent("onscroll", onScrollHandle);
    else if (window.addEventListener)
        window.addEventListener("scroll", onScrollHandle, false);
    else
        Evernote.Logger.error( "ContentVeil can't attachEvent" );



    // Public API:
    this.reset = reset;
    this.show = show;
    this.gray = gray;
    this.hide = hide;
    this.revealRect = revealRect;
    this.revealStaticRect = revealStaticRect;
    this.outlineElement = outlineElement;
    this.expandRect = expandRect;
    this.hideAllActiveObjects = hideAllActiveObjects;
}