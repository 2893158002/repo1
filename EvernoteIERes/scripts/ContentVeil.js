function ContentVeil() {

    var veil = document.createElement("div");
    veil.id = "evernoteContentVeil";
    var inner = document.createElement("div");
    inner.id = "evernoteInnerBox";
    var pageCounter = document.createElement("div");
    pageCounter.id = "evernotePageCounter";
    veil.appendChild(pageCounter);
    veil.appendChild(inner);

    var pageHeight = document.body.scrollHeight; // used for infinite scroll handling

    /*

    IE10 doesn't support pointer-events:none;
    So we had to replace existing veil with new one, combined of 8 divs.
    Four of them has border to outline content, and four divs in corners has white filling only.

    There is no any element in center, over the content, so nothing will catch mouse events.
    It helps other functions, especially html highlighter, works as expected.

    veil structure:

      veilNW |  veilTop   | veilNE
    veilLeft |            | veilRight
      veilSW | veilBottom | veilSE

    */

    var veilTop = document.createElement("div");
    veilTop.id = "evernoteContentVeilTop";
    var veilLeft = document.createElement("div");
    veilLeft.id = "evernoteContentVeilLeft";
    var veilRight = document.createElement("div");
    veilRight.id = "evernoteContentVeilRight";
    var veilBottom = document.createElement("div");
    veilBottom.id = "evernoteContentVeilBottom";

    var veilNW = document.createElement("div");
    veilNW.id = "evernoteContentVeilNW";
    var veilNE = document.createElement("div");
    veilNE.id = "evernoteContentVeilNE";
    var veilSE = document.createElement("div");
    veilSE.id = "evernoteContentVeilSE";
    var veilSW = document.createElement("div");
    veilSW.id = "evernoteContentVeilSW";


    var veilAll = Evernote.JQuery([veilTop,veilBottom,veilLeft,veilRight]);
    var veilCorners = Evernote.JQuery([veilNW,veilNE,veilSE,veilSW]);
    veilAll.addClass('EvConVeil');
    veilCorners.addClass('EvConVeilCorn');

    function fireClickUnderVeil(evt) {
        var veil = Evernote.JQuery(this);
        veil.hide();
        var bottomElement = document.elementFromPoint(evt.clientX, evt.clientY);
        veil.show();
        bottomElement.click();
    }

    // make veil imperceptible for mouse clicks.
    veilAll.click(fireClickUnderVeil);
    veilCorners.click(fireClickUnderVeil);

    var tooltipTimeout;

    var topExpandContract;
    var bottomExpandContract;
    for (var i = 0; i < 2; i++) {
        var expand = document.createElement("div");
        var contract = document.createElement("div");
        expand.className = "evernoteArticleExpand";
        contract.className = "evernoteArticleContract";

        expand.setAttribute('tooltip', Evernote.Addin.getLocalizedMessage(Evernote.Messages.EXPAND));
        expand.setAttribute('unselectable', 'on');
        contract.setAttribute('tooltip',Evernote.Addin.getLocalizedMessage(Evernote.Messages.CONTRACT));
        contract.setAttribute('unselectable','on');

        expand.addEventListener("mousemove", nudgeMousemoveHandler);
        expand.addEventListener("mouseout", nudgeMouseoutHandler);
        contract.addEventListener("mousemove", nudgeMousemoveHandler);
        contract.addEventListener("mouseout", nudgeMouseoutHandler);

        expand.addEventListener("click", function() {
            Evernote.contentPreviewer.previewNudge('up');
        });
        contract.addEventListener("click", function() {
            Evernote.contentPreviewer.previewNudge('down');
        });
        if (i == 0) {
            topExpandContract = document.createElement("div");
            topExpandContract.className = "evernoteExpandContract evernoteUsingExpandContract";
            topExpandContract.appendChild(expand);
            topExpandContract.appendChild(contract);
            veilTop.appendChild(topExpandContract);
        } else {
            bottomExpandContract = document.createElement("div");
            bottomExpandContract.id = "bottomExpandContract";
            bottomExpandContract.className = "evernoteExpandContract";
            bottomExpandContract.appendChild(expand);
            bottomExpandContract.appendChild(contract);
            veilBottom.appendChild(bottomExpandContract);
        }
    }



    function nudgeMousemoveHandler(evt) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(function() {
            evt.srcElement.className += " tooltipon";
        }, 250);
    }

    function nudgeMouseoutHandler() {
        clearTimeout(tooltipTimeout);
        this.className = this.className.replace(/\s*tooltipon/g, "");
    }

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
        veilAll.removeClass('evernoteShadowBoxActi');

        if (!doNotResetPageCount) {
            setPageCount();
        }

        topExpandContract.className = topExpandContract.className.replace(/\s*evernoteUsingExpandContract/g, "");
        bottomExpandContract.className = bottomExpandContract.className.replace(/s*evernoteUsingExpandContract/g, "");

        showElements("embed");
        showElements("object");
        showElements("iframe");

        blank();
    }

    function blank() {
        veil.style.height = document.body.scrollHeight  - 6 + "px";
        veil.style.width = document.body.scrollWidth - 6  + "px";
        veil.style.borderWidth = "0";
    }

    function gray() {
        show();
        inner.style.display = "none";
        veil.style.backgroundColor = "rgba(255, 255, 255, 0.75)";


        veilAll.each(function(){this.style.borderWidth = "0";});
        veilAll.addClass('evernoteGrayFillingActi');
        revealRectNew({
            top:0,
            bottom:getPageHeight(),
            left:0,
            right:0,
            width:document.body.scrollWidth,
            height:getPageHeight()
        });
    }

    function show() {
        inner.style.display = "";
        veil.style.backgroundColor = "";

        veilAll.each(function(){this.style.borderWidth = ""});
        veilAll.removeClass('evernoteGrayFillingActi');
        if (!Evernote.ElementExtension.hasParentNode(veil)) {
            document.body.appendChild(veil);
            veilAll.each(function(){document.body.appendChild(this)});
            veilCorners.each(function(){document.body.appendChild(this)});
        }
    }

    function hide() {
        if (Evernote.ElementExtension.hasParentNode(veil)) {
            veilAll.each(function(){this.parentNode.removeChild(this)});
            veilCorners.each(function(){this.parentNode.removeChild(this)});
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

    function getPageHeight() {
        var h = Math.abs(window.innerHeight - document.body.scrollHeight) < 15 ? document.body.scrollHeight : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        var wh = window.innerHeight;
        if ((wh - h) > 15) return wh;
        return h;
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

        var veilWidth = veil.style.width.replace("px", "");
        var veilHeight = veil.style.height.replace("px", "");

        inner.className = inner.className.replace(/\s*evernoteShadowBox/g, "");
        veil.className = inner.className.replace(/\s*evernoteShadowBox/g, "");
        veilAll.removeClass('evernoteShadowBoxActi');
        if (shadowBox) {
            veilAll.addClass('evernoteShadowBoxActi');
            inner.className += " evernoteShadowBox";
            veil.className += " evernoteShadowBox";
        }

        inner.style.display = "block";
        veil.style.borderLeftWidth = Math.max(x, 0) + "px";
        veil.style.borderTopWidth = Math.max(y, 0) + "px";
        veil.style.borderRightWidth = Math.max((veilWidth - x - width), 0) + "px";
        veil.style.borderBottomWidth = Math.max((veilHeight - y - height), 0) + "px";

        /*oh my gosh*/

        var rectNew = {
            top:Math.max(y, 0),
            left:Math.max(x, 0),
            bottom:Math.max((veilHeight - y - height),0),
            right:Math.max((veilWidth - x - width),0),
            width:document.body.scrollWidth,
            height:getPageHeight()
        };

        if (!shadowBox) {
            rectNew.width = rectNew.width - 4;
            rectNew.height = rectNew.height - 4;
        } else {
            rectNew.width = rectNew.width - 6;
            rectNew.height = rectNew.height - 6;
        }

        /*
         // debug part.
         function toFix(rect) {
         for (var prop in rect) {
         rect[prop] = rect[prop].toFixed(0);
         }
         return rect;
         }

         console.log('old ' + JSON.stringify(toFix(rect)));
         console.log('new ' + JSON.stringify(toFix(rectNew)));
         */

        revealRectNew(rectNew);
    }

    function revealRectNew(rect) {
        veilLeft.style.height = rect.height - rect.bottom - rect.top + 2 + 'px';
        veilLeft.style.width = rect.left + 'px';
        veilLeft.style.top = rect.top  -1 + 'px';

        veilRight.style.height = rect.height - rect.bottom - rect.top + 2 + 'px';
        veilRight.style.width = rect.right + 'px';
        veilRight.style.top = rect.top - 1 + 'px';
        veilRight.style.left = rect.width - rect.right + 'px';

        veilTop.style.height = rect.top + 'px';
        veilTop.style.left = rect.left + 'px';
        veilTop.style.right = rect.right + 'px';
        veilTop.style.width = rect.width - rect.right - rect.left + 'px';

        veilBottom.style.height = rect.bottom + 'px';
        veilBottom.style.width = rect.width - rect.right - rect.left + 'px';
        veilBottom.style.left = rect.left + 'px';
        veilBottom.style.right = rect.right + 'px';
        veilBottom.style.top = rect.height - rect.bottom + 'px';

        veilNW.style.height = Math.max(rect.top - 1, 0) + 'px';
        veilNW.style.width = rect.left + 'px';

        veilNE.style.height = Math.max(rect.top - 1, 0) + 'px';
        veilNE.style.width = rect.right + 'px';
        veilNE.style.left = rect.width - rect.right + 'px';

        veilSW.style.height = Math.max(rect.bottom - 1, 0) + 'px';
        veilSW.style.top = rect.height - rect.bottom + 1 + 'px';
        veilSW.style.width = rect.left + 'px';

        veilSE.style.height = Math.max(rect.bottom - 1, 0) + 'px';
        veilSE.style.top = rect.height - rect.bottom + 1 + 'px';
        veilSE.style.left = rect.width - rect.right + 'px';
        veilSE.style.width = rect.right + 'px';
    }

    function revealStaticRect(rect, elt, shadowBox) {
        revealRect(rect, elt, true, shadowBox);
    }

    function outlineElement(element, scrollTo, shadowBox, articleAdjustment) {
        // See notes in Preview.js for why we use this method instead of just calling element.getBoundingClientRect().
        var rect = Evernote.contentPreviewer.computeDescendantBoundingBox(element);
        if (rect) {
            reset(articleAdjustment);
            revealRect(rect, element, true, shadowBox);

            if (scrollTo) {
                element.scrollIntoView();
            }

            hideElements("embed", element);
            hideElements("object", element);
            hideElements("iframe", element);

            topExpandContract.className += " evernoteUsingExpandContract";

            if (rect.height - 30  > window.innerHeight) {
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

    function setPageCount(count) {
        if (!count) {
            pageCounter.innerText = "";
        } else if (count == 1) {
            //TODO: test l10n
            pageCounter.innerText = "oneMorePageFound";
        } else {
            //TODO:test l10n
            pageCounter.innerText = "morePagesFound" + count;
        }
        pageCounter.scrollIntoView(true);
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

        if (pageHeight < document.body.scrollHeight - 30) {
            pageHeight = document.body.scrollHeight;
            onResizeHandle();
        }
    };

    var onResizeHandle = function(e) {
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

        // todo: switch gray filling to position: fixed.
        if (veilAll.hasClass('evernoteGrayFillingActi')) {
            gray();
        }
    };

    window.addEventListener("resize", onResizeHandle);
    window.addEventListener("scroll", onScrollHandle, false);

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