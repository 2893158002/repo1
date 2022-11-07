function ContentPreview() {
    Evernote.Logger.debug("Start creating preview box");

    var contentVeil = new ContentVeil();
    var screenshotVeil = new ScreenshotVeil();
    Evernote.Logger.debug("End creating preview box");
    // Stores a reference to the last element that we used as a preview.
    var previewElement = null;
    var article = null;
    var snippet = null;

    function buildUrlElement() {
        var urlEl = document.createElement("div");
        urlEl.id = "evernotePreviewContainer";
        var className = "yui3-cssreset";
        if(Evernote.Utils.isQuirkMode()) {
            className += " evernote-middle-fixed-position-quirks"
        }
        urlEl.className = className;
        return urlEl;
    }

    Evernote.Logger.debug("Build url element");
    var urlElement = buildUrlElement();

    function showUrlElement() {
        Evernote.Logger.debug("ContentPreview: showUrlElement start");
        if (!Evernote.ElementExtension.hasParentNode(urlElement)) {
            document.documentElement.appendChild(urlElement);
        }

        // Make sure we're centered in the window.
        var elStyle = Evernote.ElementExtension.getComputedStyle(urlElement, '');
        var w = parseInt(Evernote.StyleElementExtension.getPropertyValue(elStyle, "width"));
        var h = parseInt(Evernote.StyleElementExtension.getPropertyValue(elStyle, "height"));

        if (isNaN(w) || isNaN(h)) {
            // IE8
            w =  Evernote.JQuery(urlElement).width();
            h = Evernote.JQuery(urlElement).height();
        }

        if (w && h) {
            urlElement.style.marginLeft = (0 - w / 2) + "px";
            urlElement.style.marginTop = (0 - h / 2) + "px";
        }

        Evernote.Logger.debug("ContentPreview: showUrlElement end");
    }

    function hideUrlElement() {
        if (Evernote.ElementExtension.hasParentNode(urlElement)) {
            urlElement.parentNode.removeChild(urlElement);
        }
    }

    function showScreenShotArea() {
        clear();
        screenshotVeil.show();
    }

    function showOverlay()  {
        previewElement = null;
        clear();
        contentVeil.reset();
        contentVeil.hideAllActiveObjects();
        contentVeil.gray();
    }

    function previewUrl() {
        clear();

        function buildContent ( data ) {
            var title = PageContext.title;
            var url = PageContext.url;
            var favIconUrl = PageContext.getFavIconUrl();
            snippet = data.replace(/(<([^>]+)>)/ig,""); // remove html tags from text

            urlElement.innerHTML = Evernote.GlobalUtils.createUrlClipContent(title, url, favIconUrl, snippet);

            var element = Evernote.JQuery(urlElement);

            if(Evernote.Utils.isQuirkMode() && !element.hasClass("evernote-fixed-position-fix")) {
                element.addClass("evernote-fixed-position-fix");
            }

            showUrlElement();
            contentVeil.reset();
            contentVeil.hideAllActiveObjects();
            contentVeil.gray();

        }

        Evernote.ClearlyController.getClearlyArticleText( function (data) {
            buildContent(data._html);
        });
    }

    // This doesn't remove internal state of previewElement, because another script may not have finished clipping until
    // after the page looks 'clear'.
    function clear() {
        contentVeil.reset();
        contentVeil.hide();
        screenshotVeil.hide();
        hideUrlElement();
    }

    function _previewArticle () {
        Evernote.Logger.debug("Start previewing article element");
        if (previewElement)
        {
            var selectionFrame;
            if (typeof Evernote.pageInfo !== undefined) {
                selectionFrame = Evernote.pageInfo.getSelectionFrame();
            }
            Evernote.Logger.debug("Selection frame selected " + selectionFrame);
            if (selectionFrame) {

                var rect = {
                    width: selectionFrame.width,
                    height: selectionFrame.height,
                    top: selectionFrame.offsetTop,
                    bottom: (selectionFrame.height + selectionFrame.offsetTop),
                    left: selectionFrame.offsetLeft,
                    right: (selectionFrame.width + selectionFrame.offsetLeft)
                };
                Evernote.Logger.debug("contentVeil.revealStaticRect " + rect);
                contentVeil.revealStaticRect(contentVeil.expandRect(rect, -9), selectionFrame, true);
                Evernote.Logger.debug("contentVeil.show ");
                contentVeil.show();
            }
            else {
                // TODO: Scroll into article view.
                contentVeil.outlineElement(previewElement, false, true);
                window.scrollTo(0, previewElement.offsetTop - 30);
            }
        }
        else {
            Evernote.Logger.warn("Couldn't find a preview element. We should switch to 'full page' mode.");
        }
    }

    /**
     * Finds and preview article element.
     * If reloadArticle is specified and equals to true, then discard previously found article and re-start search of article again.
     * Otherwise use article found on previous call (if this is the first call then article will be searched anyway).
     * @param reloadArticle
     */
    function previewArticle (reloadArticle) {

        clear();
        previewElement = null;
        if(reloadArticle) {
            article = null;
        }
        Evernote.Logger.debug("Evernote.pageinfo " + Evernote.pageInfo);
        if (typeof Evernote.pageInfo !== undefined) {
            if(!article) {
                previewElement = Evernote.pageInfo.getDefaultArticle(function(el){
                    Evernote.Logger.debug("Article element " + el.nodeName);
                    previewElement = el;
                    article = el;
                    Evernote.Logger.debug("Preview article ");
                    _previewArticle();
                });
                article = previewElement;
            } else {
                previewElement = article;
                _previewArticle();
            }
        }
        else {
            Evernote.Logger.warn("Couldn't find a 'pageInfo' object.");
        }
    }

    // When nudging the preview around the page, we want to skip nodes that aren't interesting. This includes empty
    // nodes, containers that have identical contents to the already selected node, invisible nodes, etc.
    // @TODO: There's a lot more we could probably add here.
    function looksInteresting(candidate, given) {

        if (!candidate) {
            Evernote.Logger.warn("Can't determine if 'null' is interesting (it's probably not).");
            return false;
        }
        // This is the parent of our 'HTML' tag, but has no tag itself. There's no reason it's ever more interesting than
        // the HTML element.
        if (candidate === window.document) {
            return false;
        }

        //Disable clip of evernote main popup
        if(Evernote.JQuery(candidate).closest("#evernote-content").length != 0) {
            return false;
        }

        // Elements with neither text nor images are not interesting.
        if (!candidate.textContent && (candidate.getElementsByTagName("img").length === 0)) {
            return false;
        }

        // Elements with 0 area are not interesting.
        var rect = Evernote.ElementExtension.getBoundingClientRect(candidate);
        if (!rect.width || !rect.height) {
            return false;
        }

        // Invisible elements are not interesting.
        var style = Evernote.ElementExtension.getComputedStyle(candidate);
        if ((style.visibility === "hidden") || (style.display === "none")) {
            return false;
        }

        // If the nodes have a parent/child relationship, then they're only interesting if their visible contents differ.
        if (candidate.parentNode && given.parentNode) {
            if ((candidate.parentNode == given) || (given.parentNode == candidate)) {
                if ((candidate.textContent === given.textContent) &&
                    (candidate.getElementsByTagName("img").length === given.getElementsByTagName("img").length)) {
                    return false;
                }
            }
        }
        return true;
    }

    // Returns the current article element, which may not be the same as the auto-detected one if the user has 'nudged'
    // the selection around the page.
    function getArticleElement() {
        return previewElement;
    }

    function nudgePreview(direction) {
        Evernote.Logger.debug("nudgePreview start");
        if (!previewElement) {
            return;
        }

        var oldPreview = previewElement;
        Evernote.Logger.debug("nudgePreview: direction is " + direction);
        Evernote.Logger.debug("nudgePreview: previewElement is " + previewElement.nodeName);
        switch (direction) {
            case "up":
                var temp = previewElement.parentNode;
                while (temp) {
                    if (looksInteresting(temp, previewElement)) {
                        // If we move up and then down, we want to move back to where we started, not the first child.
                        temp.enNudgeDescendToNode = previewElement;
                        previewElement = temp;
                        break;
                    }
                    temp = temp.parentNode;
                }
                break;
            case "down":
                Evernote.Logger.debug("nudgePreview: previewElement.enNudgeDescendToNode is " + previewElement.enNudgeDescendToNode);
                if (previewElement.enNudgeDescendToNode)
                {
                    var temp = previewElement.enNudgeDescendToNode;
                    // @TODO: make sure we clean these up somewhere else if we never reverse our nudging.
                    try {
                        delete previewElement.enNudgeDescendToNode;
                    } catch(e) {
                        previewElement.enNudgeDescendToNode = undefined;
                    }
                    previewElement = temp;
                } else {
                    previewElement = descendTreeUntilUniqueElement(previewElement);
                }
                break;
                Evernote.Logger.debug("nudgePreview: previewElement.children.length = " + previewElement.children.length);
                for (var i = 0; i < previewElement.children.length; i++) {
                    Evernote.Logger.debug("nudgePreview: checking child is " + previewElement.children[i].nodeName);
                    if (looksInteresting(previewElement.children[i], previewElement)) {
                        Evernote.Logger.debug("nudgePreview: found interesting child" + previewElement.children[i]);
                        previewElement = previewElement.children[i];
                        break;
                    }
                }
                break;
            case "left":
                var temp = previewElement.previousElementSibling;
                while (temp) {
                    if (looksInteresting(temp, previewElement)) {
                        previewElement = temp;
                        break;
                    }
                    temp = temp.previousElementSibling;
                }
                break;
            case "right":
                var temp = previewElement.nextElementSibling;
                while (temp) {
                    if (looksInteresting(temp, previewElement)) {
                        previewElement = temp;
                        break;
                    }
                    temp = temp.nextElementSibling;
                }
                break;
            default:
                Evernote.Logger.warn("Unhandled nudge direction: " + direction);
        }

        // Drawing is expensive so don't bother if nothing changed.
        if (oldPreview !== previewElement) {
            Evernote.Logger.debug("nudgePreview: draw new element.");

            function enoughSize(elem) {
                var el = Evernote.JQuery(elem);
                var w = el.width();
                var h = el.height();
                return (w > 30 && h > 15)
            }

//            if (enoughSize(previewElement) === false) return;

            contentVeil.outlineElement(previewElement, false, true, true);
            article = previewElement;

            // TODO: scroll into Element view here (probably, attach to Expand/Contract Container
            window.scrollTo(0, previewElement.offsetTop - 30);
        }
    }

    function sameElement(a, b) {
        var aRect = a.getBoundingClientRect();
        var bRect = b.getBoundingClientRect();
        if (aRect.bottom == bRect.bottom && aRect.height == bRect.height
            && aRect.left == bRect.left && aRect.right == bRect.right
            && aRect.top == bRect.top && aRect.width == bRect.width) {
            return false;
        } else if ((a.textContent === b.textContent) &&
            (a.getElementsByTagName("img").length === b.getElementsByTagName("img").length)) {
            return false;
        }
    }

    function descendTreeUntilUniqueElement(parent) {
        for (var i = 0; i < parent.children.length; i++) {
            if (sameElement(parent.children[i], parent)) {
                return descendTreeUntilUniqueElement(parent.children[i]);
            } else if (looksInteresting(parent.children[i], parent)) {
                return parent.children[i];
            }
        }
        return parent;
    }


    function previewFullPage() {
        var borderWidth = 4;
        var w = document.documentElement.scrollWidth;
        var h = document.documentElement.scrollHeight;

        var rect = {
            bottom: (h - borderWidth),
            top: (borderWidth),
            left: (borderWidth),
            right: (w - borderWidth),
            width: (w - (2 * borderWidth)),
            height: (h - (2 * borderWidth))
        };

        clear();
        contentVeil.reset();
        contentVeil.revealStaticRect(rect, document.body);
        contentVeil.show();
        contentVeil.hideAllActiveObjects();
    }

    // Creates the union of two rectangles, which is defined to be the smallest rectangle that contains both given
    // rectangles.
    function unionRectangles(rect1, rect2) {
        var rect = {
            top: (Math.min(rect1.top, rect2.top)),
            bottom: (Math.max(rect1.bottom, rect2.bottom)),
            left: (Math.min(rect1.left, rect2.left)),
            right: (Math.max(rect1.right, rect2.right))
        }
        rect.width = rect.right - rect.left;
        rect.height = rect.bottom - rect.top;

        return rect;
    }

    // Returns true if the rectangles match, false otherwise.
    function rectanglesEqual(rect1, rect2) {
        if (!rect1 && !rect2) return true;
        if (!rect1) return false;
        if (!rect2) return false;
        if (rect1.top != rect2.top) return false;
        if (rect1.bottom != rect2.bottom) return false;
        if (rect1.left != rect2.left) return false;
        if (rect1.right != rect2.right) return false;
        if (rect1.width != rect2.width) return false;
        if (rect1.height != rect2.height) return false;
        return true;
    }

    // If the user triple-clicks a paragraph, we will often get a selection that includes the next paragraph after the
    // selected one, but only up to offset 0 in that paragraph. This causes the built in getBoundingClientRect to give a
    // box that includes the whole trailing paragraph, even though none of it is actually selected. Instead, we'll build
    // our own bounding rectangle that omits the trailing box.
    // @TODO: Currently this computes a box that is *too big* if you pass it a range that doesn't have start and/or end
    // offsets that are 0, because it will select the entire beginning and ending node, instead of jsut the selected
    // portion.
    function computeAlternateBoundingBox(range) {

        // If the end of selection isn't at offset 0 into an element node (rather than a text node), then we just return the
        // original matching rectangle.
        if ((range.endOffset !== 0) ||
            (range.endContainer && range.endContainer.nodeType !== Evernote.Node.ELEMENT_NODE) ||
            ( range.startContainer && range.startContainer && range.startContainer.getBoundingClientRect) ||
            ( range.endContainer && range.endContainer.getBoundingClientRect) ||
            ( range.commonAncestorContainer && range.commonAncestorContainer.getBoundingClientRect)
            ) {
            var rect = range.getBoundingClientRect();
            if(rect.top == 0 && rect.bottom == 0 && rect.left == 0 && rect.right == 0) {
                if(range.commonAncestorContainer && range.commonAncestorContainer.getBoundingClientRect) {
                    rect = range.commonAncestorContainer.getBoundingClientRect();
                } else if(range.startContainer && range.startContainer.getBoundingClientRect) {
                    rect = range.startContainer.getBoundingClientRect();
                } else if(range.endContainer && range.endContainer.getBoundingClientRect) {
                    rect = range.endContainer.getBoundingClientRect();
                }
            }
            var mutableRect = {
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
                width: rect.width,
                height: rect.height
            };
            return mutableRect;
        }

        // This is the one we don't want.
        var endElementRect = null;
        try {
            endElementRect = Evernote.ElementExtension.getBoundingClientRect(range.endContainer);
        }
        catch(ex) {
            Evernote.Logger.warn("Couldn't get a bounding client rect for our end element, maybe it's a text node.");
        }

        // We look for a rectangle matching our end element, and if we find it, we don't copy it to our list to keep.
        // You'd think we could just grab the last element in range.getClientRects() here and trim that one, which might be
        // true, but the spec makes no claim that these are returned in order, so I don't want to rely on that.
        // We keep track if we remove a rectangle, as we're only trying to remove one for the trailnig element. If there are
        // more than one matching rectangle, we want to keep all but one of them.
        var foundEnd = false;
        var keptRects = [];
        var initialRects = range.getClientRects();
        for (var i = 0; i < initialRects.length; i++) {
            if (rectanglesEqual(endElementRect, initialRects[i]) && !foundEnd) {
                foundEnd = true;
            }
            else {
                keptRects.push(initialRects[i]);
            }
        }

        // Now compute our new bounding box and return that.
        if (keptRects.length == 0) return Evernote.ElementExtension.getBoundingClientRect(range);
        if (keptRects.length == 1) return keptRects[0];

        var rect = keptRects[0];
        for (var i = 1; i < keptRects.length; i++) {
            rect = unionRectangles(rect, keptRects[i]);
        }

        return rect;
    }

    // If every edge of the rectangle is in negative space,
    function rectIsOnScreen(rect) {
        // rtl pages have actual content in "negative" space. This case could be handled better.
        if (document.dir == "rtl") {
            return false;
        }
        // If both top and bottom are in negative space, we can't see this.
        if (rect.bottom < 0 && rect.top < 0) {
            return false;
        }
        // Or, if both left and right are in negative space, we can't see this.
        if (rect.left < 0 && rect.right < 0) {
            return false;
        }
        // Probably visible.
        return true;
    }

    function applyElementRect(element, rect) {
        var newRect = rect;
        var tempRect = Evernote.ElementExtension.getBoundingClientRect(element);

        tempRect = {
            bottom: tempRect.bottom + window.pageYOffset,
            height: tempRect.height,
            left: tempRect.left + window.pageXOffset,
            right: tempRect.right + window.pageXOffset,
            top: tempRect.top + window.pageYOffset,
            width: tempRect.width
        };

    // Skip elements that are positioned off screen.
        if (!rectIsOnScreen(tempRect)) {
            return newRect;
        }
    var cs = getComputedStyle(element);
    // We won't descend into hidden elements.
    if (cs.display == "none") {
      return newRect;
    }
    // don't union a big rectangle that has hidden overflow
    if (cs.overflowX == "hidden" || cs.overflowY == "hidden") {
      return newRect;
    }
        // We skip anything with an area of one px or less. This is anything that has "display: none", or single pixel
        // images for loading ads and analytics and stuff. Most hidden items end up at 0:0 and will stretch our rectangle
        // to the top left corner of the screen if we include them. Sometimes single pixels are deliberately placed off
        // screen.
        if ((tempRect.width * tempRect.height) > 1) {
            newRect = unionRectangles(tempRect, rect);
        }
        if (element.children) {
            for (var i = 0; i < element.children.length; i++) {
                newRect = applyElementRect(element.children[i], newRect);
            }
        }
        return newRect;
    }

    // In the case of positioned elements, a bounding box around an element doesn't necessarily contain its child
    // elements, so we have this method to combine all of these into one bigger box. ContentVeil calls this function.
    function computeDescendantBoundingBox(element) {
        if (!element) return {top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0};
        var rect = element.getBoundingClientRect();
        var li = rect.top + window.pageYOffset
        return applyElementRect(element, {
            bottom: rect.bottom + window.pageYOffset,
            height: rect.height,
            left: rect.left + window.pageXOffset,
            right: rect.right + window.pageXOffset,
            top: rect.top + window.pageYOffset,
            width: rect.width
        });
    }

    function previewSelection(sel) {

        var selection;
        var selectionFrame;
        if(sel) {
            selection = sel;
        }
        else if (typeof Evernote.pageInfo !== undefined) {
            selection = Evernote.pageInfo.getSelection();
            // If our selection is in a frame or iframe, we'll compute an offset relative to that, so we need to adjust it by
            // the offset of the frame.
            selectionFrame = Evernote.pageInfo.getSelectionFrame();
        }

        contentVeil.reset();

        var frameRect = null;
        if (selectionFrame) {
            frameRect = Evernote.ElementExtension.getBoundingClientRect(selectionFrame);
        }

        var range, rect, i;

        // If !selection, then something has gone awry.
        if (selection) {
            clear();
            contentVeil.reset();
            // We attempt to highlight each selection, but this hasn't been tested for more than a single selection.
            for (i = 0; i < Evernote.Utils.Selection.getRangeCount(selection); i++) {
                range = Evernote.Utils.Selection.getRangeAt(selection, i);

                rect = computeAlternateBoundingBox(range);

                rect.top += document.documentElement.scrollTop;
                rect.bottom += document.documentElement.scrollTop;
                rect.left += document.documentElement.scrollLeft;
                rect.right += document.documentElement.scrollLeft;

                // Actual adjustment mentioned earlier regarding frames.
                if (frameRect) {
                    rect.left += frameRect.left;
                    rect.right += frameRect.left;
                    rect.top += frameRect.top;
                    rect.bottom += frameRect.top;
                }

                contentVeil.revealStaticRect(rect, selectionFrame, false);
                contentVeil.show();
            }
        }
        contentVeil.show();
        contentVeil.hideAllActiveObjects();
    }

    function getSnippetText() {
        return snippet;
    }

    // Public API:
    this.getArticleElement = getArticleElement;
    this.looksInteresting = looksInteresting;
    this.computeDescendantBoundingBox = computeDescendantBoundingBox;
    this.previewArticle = previewArticle;
    this.previewFullPage = previewFullPage;
    this.previewSelection = previewSelection;
    this.previewUrl = previewUrl;
    this.clear = clear;
    this.previewNudge = nudgePreview;
    this.showOverlay = showOverlay;
    this.getSnippetText = getSnippetText;
    this.showScreenShotArea = showScreenShotArea;
}