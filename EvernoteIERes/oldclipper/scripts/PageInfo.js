function PageInfo() {

    // This is a map of hostnames (for hostnames that begin with 'www.', the 'www.' will be stripped off first, so don't
    // include it in your lookup string) to CSS selectors. When we try and locate an article in a page, we'll see if we
    // can find the doamin for the page in this list, and if so, we'll try and find an element that matches the given
    // selector. If no element is returned, we'll fall back to the heuristic approach.
    var specialCases = {
        "penny-arcade.com": "div.contentArea > div.comic > img",
        "aspicyperspective.com": "div.entry-content",
        "thewirecutter.com": "div#content",
        "katespade.com": "div#pdpMain",
        "threadless.com": "section.product_section",
        "yelp.com": "div#bizBox",
        "flickr.com": "div#photo",
        "instagr.am": "div.stage > div.stage-inner",
        "stackoverflow.com": "div#mainbar",
        "makeprojects.com": "div#guideMain",
        "cookpad.com": "div#main",
        "imgur.com": "div.image",
        "smittenkitchen.com": "div.entry",
        "allrecipes.com": "div#content-wrapper",
        "qwantz.com": "img.comic",
        "questionablecontent.net": "img#strip",
        "cad-comic.com": "div#content"
    }

    var useFoundImage = [
        "xkcd.com"
    ]

    // These are the items we're trying to collect. This first block is trivial.
    var containsImages = Boolean(document.getElementsByTagName("img").length > 0);
    var documentWidth = document.width;
    var documentHeight = document.height;
    var url = document.location.href;
    var documentLength = document.body.textContent ? document.body.textContent.length : 0;

    // These take slightly more work and are initialized only when requested.
    var article = null;
    var articleBoundingClientRect = null;
    var selection = false; // This is easy to get, but is always "false" at load time until the user selects something.
    var selectionIsInFrame = false;
    var documentIsFrameset = false;
    var selectionFrameElement = null;
    var recommendationText = null;

    // Internal state variables to keep us duplicating work.
    var hasCheckedArticle = false;

    // Experimental recognition of 'image' pages (like photo sites and comics).
    function findImage() {
        var imgs = document.getElementsByTagName("img");
        var biggest = null;
        var biggestArea = 0;

        try {
            for (var i = 0; i < imgs.length; i++) {
                var style = Evernote.ElementExtension.getComputedStyle(imgs[i]);
                var width = style.width.replace(/[^0-9.-]/g, "");
                var height = style.height.replace(/[^0-9.-]/g, "");
                var area = width * height;
                if (!biggest || area > biggestArea) {
                    biggest = imgs[i];
                    biggestArea = area;
                }
            }
        } catch (e) {
            // error on mail.com
        }
        return biggest;
    }

    function getAncestors(node) {
        var an = [];
        while (node) {
            an.unshift(node);
            node = node.parentNode;
        }
        return an;
    }

    function getDeepestCommonNode(nodeList1, nodeList2) {
        var current = null;
        for (var i = 0; i < nodeList1.length; i++) {
            if (nodeList1[i] === nodeList2[i]) {
                current = nodeList1[i];
            }
            else {
                break;
            }
        }
        return current;
    }

    function getCommonAncestor(nodeList) {
        if (!nodeList.length) return null;

        if (nodeList.length == 1) return nodeList[0];
        var lastList = getAncestors(nodeList[0]);

        var node = null;
        for (var i = 1; i < nodeList.length; i++) {
            var list = getAncestors(nodeList[i]);
            node = getDeepestCommonNode(lastList, list);
            lastList = getAncestors(node);
        }
        return node;
    }

    function getBiggestImage(callback) {
        getDefaultArticle(function(art) {
            var imgs;
            if (art) {
                imgs = Evernote.JQuery(art).find('img');
            } else {
                imgs = Evernote.JQuery("img");
            }

            var maxHeight = 0;
            var maxWidth = 0;
            var maxImage;
            for (var i = 0; i < imgs.length; i++) {
                var w = imgs[i].width;
                var h = imgs[i].height;
                if (w * h > maxWidth * maxHeight) {
                    maxHeight = h;
                    maxWidth = w;
                    maxImage = imgs[i].src;
                }
            }
            callback({ src: maxImage, width: maxWidth, height: maxHeight });
        });
    }

    function clearlyCallback(data, callback) {
        Evernote.Logger.debug("Clearly callback invoked");
        findImage();

        // See if we should special-case this.
        var host = getHostname();
        if (specialCases[host])
        {
            var candidate = Evernote.ElementExtension.querySelector(specialCases[host]);
            if (candidate) {
                Evernote.Logger.debug("Found article in specialCases");
                article = candidate;
                articleBoundingClientRect = Evernote.ElementExtension.getBoundingClientRect(article);
            }
        }

        // Or see if it's a special case image page.
        else if (Evernote.ArrayExtension.indexOf(useFoundImage, host) != -1) {
            article = findImage();
            if (article) {
                Evernote.Logger.debug("Found article in image");
                articleBoundingClientRect = Evernote.ElementExtension.getBoundingClientRect(article);
            }
        }

        // If it's not a special case, see if it's a single image.
        if (!article) {
            var imageTypes = ['jpeg', 'jpg', 'gif', 'png'];
            var urlExtension = document.location.href.replace(/^.*\.(\w+)$/, "$1");
            if (urlExtension && (Evernote.ArrayExtension.indexOf(imageTypes, urlExtension) != -1)) {
                var candidate = Evernote.JQuery("body > img");
                if (candidate.length > 0) {
                    Evernote.Logger.debug("Found article in a single image");
                    article = candidate.get(0);
                    articleBoundingClientRect = Evernote.ElementExtension.getBoundingClientRect(article);
                }
            }
        }

        // If we still didn't find an article, let's see if maybe it's in a frame. Cleary fails on frames so we try this
        // check before we use our clearly info.
        if (!article) {
            if (document.body.nodeName.toLowerCase() == "frameset") {
                documentIsFrameset = true;
                var frame = findBiggestFrame();
                if (frame && frame.contentDocument && frame.contentDocument.documentElement) {
                    selectionFrameElement = frame;
                    article = frame.contentDocument.documentElement;
                    articleBoundingClientRect = Evernote.ElementExtension.getBoundingClientRect(article);
                }
            }
        }

        // If we didn't use any of our special case handling, we'll use whatever clearly found.
        if (!article) {
            Evernote.Logger.debug("Use clearly find article");
            if (data && data._elements && data._elements.length) {
                article = data._elements[0];
                if (data._elements.length > 1) {

                    // This will include *all* clearly elements (and whatever else in in between them).
                    article = getCommonAncestor(data._elements);

                    // This includes *just the last (and therefore most important)* element from the clearly detection.
                    // article = data._elements[data._elements.length - 1];
                }

                if (article.nodeType === ( window.Node ? window.Node.TEXT_NODE : 1)) {
                    article = article.parentNode;
                }
            }
        }

        if(article) {
            if(Evernote.JQuery(article).closest("#evernote-content").length != 0)
                article = undefined;
        }

        // If clearly found nothing (because it failed), then use the body of the document.
        if (!article) {
            article = document.body;
        }

        hasCheckedArticle = true;
        callback();
    }

    // This will try and determine the 'default' page article. It will only run once per page, but it's specifically
    // called only on demand as it can be expensive.
    function findArticle(callback) {

        function afterInject() {
            // If we'd previously computed an article element, but it's lost its parent or become invisible, then we'll try
            // and re-compute the article. This can happen if, for example the page dynamically udaptes itself (like showing
            // the latest news article in a box that updates periodically). This doesn't guarantee that we clip something
            // sane if this happens, (if the page re-writes itself while a clip is taking place, the results are
            // indeterminate), but it will make such things less likely.
            if (article &&
                (!article.parentNode || !article.getBoundingClientRect || Evernote.ElementExtension.getBoundingClientRect(article).width == 0)) {
                article = null;
                hasCheckedArticle = false;
            }
            Evernote.Logger.debug("afterInject");
            if (!hasCheckedArticle) {
                Evernote.Logger.debug("no article");
                if (!window || !window.ClearlyComponent)
                {
                    Evernote.Logger.warn("Couldn't find clearly!");
                    clearlyCallback(null, callback);
                }
                else {
                    Evernote.Logger.debug("Call clearly to select article");
                    try {
                        Evernote.ClearlyController.getContentElementAndHTML(function(data){clearlyCallback(data, callback)});
                    } catch(e) {
                        Evernote.Logger.error("Failed to find article by clearly due to error " + e);
                        clearlyCallback(null, callback);
                    }
                }
            }
            // If the page is big enough, clearly is excruciatingly slow. We'll jsut get the whole page.
            // @TODO: Maybe clearly can get faster.
            else if (document.body.innerHTML.length > (1024 * 1024)) {
                Evernote.Logger.warn("Page over 1mb, skipping article detection.");
                clearlyCallback(null, callback);
            }
            else {
                Evernote.Logger.debug("callback");
                callback();
            }
        }

        afterInject();

    }

    function findBiggestFrame() {
        var frames = document.getElementsByTagName("frame");
        var candidate = null;
        var candidateSize = 0;
        for (var i = 0; i < frames.length; i++) {
            if (frames[i].width && frames[i].height) {
                var area = frames[i].width * frames[i].height;
                if (area > candidateSize) {
                    candidate = frames[i];
                    candidateSize = area;
                }
            }
        }
        return candidate;
    }

    function getHostname() {
        var match = document.location.href.match(/^.*?:\/\/(www\.)?(.*?)(\/|$)/);
        if (match) {
            return match[2];
        }
        return null;
    }

    function getDefaultArticle(callback) {
        Evernote.Logger.debug("getDefaultArticle");
        findArticle(function(){callback(article)});
        // Article already exists, so we'll return it.
        if (article) return article;
    }

    // Looks for selections in the current document and descendent (i)frames.
    // Returns the *first* non-empty selection.
    function getSelection() {

        // First we check our main window and return a selection if that has one.
        var selection = window.getSelection();
        if (selection && selection.rangeCount && !selection.isCollapsed) {
            return selection;
        }

        // Then we'll try our frames and iframes.
        var docs = [];
        var iframes = document.getElementsByTagName("iframe");
        for (var i = 0; i < iframes.length; i++) {
            docs.push(iframes[i]);
        }
        var frames = document.getElementsByTagName("frame");
        for (var i = 0; i < frames.length; i++) {
            docs.push(frames[i]);
        }

        var urlBase = document.location.href.replace(/^(https?:\/\/.*?)\/.*/i, "$1").toLowerCase();
        for (var i = 0; i < docs.length; i++) {

            // If frames/iframes fail a same origin policy check, then they'll through annoying errors, and we wont be able
            // to access them anyway, so we attempt to skip anything that wont match.
            if (docs[i].src && docs[i].src.toLowerCase().substr(0, urlBase.length) !== urlBase) {
                continue;
            }

            var doc = docs[i].contentDocument;

            if (doc) {
                var frameSelection = doc.getSelection();
                if (frameSelection && frameSelection.rangeCount && !frameSelection.isCollapsed) {
                    selectionIsInFrame = true;
                    selectionFrameElement = docs[i];
                    return frameSelection;
                }
            }
            else {
                Evernote.Logger.warn("iframe contained no Document object.");
            }
        }

        // Didn't find anything.
        return null;
    }

    function getUrl() {
        return url;
    }

    function getText(node, soFar, maxLen) {
        if (node.nodeType == Evernote.Node.TEXT_NODE) {
            var trimmed = node.textContent.trim().replace(/\s+/g, " ");
            if (trimmed === " " || trimmed === "") return soFar;
            return soFar + " " + trimmed;
        }

        var banned = [
            "style",
            "script",
            "noscript"
        ];

        if (node.nodeType == Evernote.Node.ELEMENT_NODE) {
            if (Evernote.ArrayExtension.indexOf(banned, node.nodeName.toLowerCase()) == -1) {
                for (var i = 0; i < node.childNodes.length; i++) {
                    soFar = getText(node.childNodes[i], soFar, maxLen);
                    if (soFar.length > maxLen) {
                        return soFar;
                    }
                }
            }
        }
        return soFar;
    }

    function getRecommendationText() {
        var text = "";
        var MAX_LEN = 5000;
        var selection = getSelection();
        if (selection) {
            var df = selection.getRangeAt(0).cloneContents();
            var div = document.createElement("div");
            div.appendChild(df);
            text = getText(div, "", MAX_LEN);
        }

        else if (article) {
            text = getText(article, "", MAX_LEN);
        }
        else {
            text = getText(document.body, "", MAX_LEN);
        }
        text = document.title + " " + text;
        return text;
    }

    // Note: you must call getSelection() first to populate this field!
    function getSelectionFrame() {
        return selectionFrameElement;
    }

    function checkClearly() {
        var clearlyDoc = Evernote.ElementExtension.querySelector("iframe#readable_iframe");
        if (clearlyDoc) clearlyDoc = clearlyDoc.contentDocument;
        if (clearlyDoc) clearlyDoc = Evernote.ElementExtension.querySelector("body#body div#box", clearlyDoc);
        if (clearlyDoc) {
            article = clearlyDoc;
            articleBoundingClientRect = Evernote.ElementExtension.getBoundingClientRect(article);
        }
    }

    // @TODO: This is fairly incomplete.
    function getFavIconUrl() {
        var links = document.getElementsByTagName("link");
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
    }

    function _getInfoRequestHandler(data, request, sender, sendResponse) {
        var isSelected = getSelection();

        checkClearly();

        var response = {
            containsImages: containsImages,
            documentWidth: documentWidth,
            documentHeight: documentHeight,
            url: url,
            selection: (isSelected !== null),
            selectionIsInFrame: selectionIsInFrame,
            documentLength: document.body.textContent.length,
            articleBoundingClientRect: articleBoundingClientRect,
            article: (article != null),
            recommendationText: getRecommendationText(),
            favIconUrl: getFavIconUrl(),
            documentIsFrameset: documentIsFrameset
        };
        sendResponse(response);
    }

    function getInfoRequestHandler(request, sender, sendResponse) {
        findArticle(function(data){_getInfoRequestHandler(data, request, sender, respondWithInfo)});
    }

    // Public API:
    this.getDefaultArticle = getDefaultArticle;
    this.getSelection = getSelection;
    this.getSelectionFrame = getSelectionFrame;
    this.getFavIconUrl = getFavIconUrl;
    this.getBiggestImage = getBiggestImage;
    this.getUrl = getUrl;
}