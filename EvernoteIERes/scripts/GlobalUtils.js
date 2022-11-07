Evernote.GlobalUtils = {};
(function(){
    var urlMatcher = /^(.*?):\/\/((www\.)?(.*?))(:\d+)?(\/.*?)(\?.*)?$/;

    var BAD_FAV_ICON_URLS = {"http://localhost/favicon.ico": true};

    Evernote.GlobalUtils.componentizeUrl = function(url) {
        var data = {
            protocol: null,
            domain: null,
            domainNoWww: null,
            port: null,
            path: null,
            queryString: null
        };
        var matches = urlMatcher.exec(url);
        data.protocol = matches[1];
        data.domain = matches[2];
        data.domainNoWww = matches[4];
        data.port = matches[5];
        data.path = matches[6];
        data.queryString = matches[7];
        return data;
    };

    Evernote.GlobalUtils.getMessageCode = function(messageConst) {
        Evernote.Logger.debug("getMessageCode: " + messageConst);
        return Evernote.Messages[messageConst];
    };

    Evernote.GlobalUtils.absolutizeImages = function(element, path) {
        if(path) {
            Evernote.Utils.changeBackgroundImage(element, Evernote.Addin.getPath("resources") + path);
        }
        else if(element.attributes && element.attributes["background-image"]) {
            // TODO: replace "oldlipper" with universal path
            Evernote.Utils.changeBackgroundImage(element, Evernote.Addin.getPath("resources") + 'oldclipper/' + element.attributes["background-image"].value);
        }
        Evernote.Logger.debug("absolutizeImages: walk through children");
        for (var i = 0; i < element.children.length; i++) {
            Evernote.GlobalUtils.absolutizeImages(element.children[i]);
        }
        Evernote.Logger.debug("absolutizeImages: end");
    };

    Evernote.GlobalUtils.localize = function(element) {
        var node = element.nodeName.toLowerCase();
        if (node == "input" || node == "textarea") {
            var type = element.type;
            if (node == "textarea") type = "textarea";
            switch (element.type) {
                case "text":
                case "textarea":
                case "button":
                case "submit":
                case "search":
                    if (element.attributes && element.attributes["placeholder"]) {
                        var localizedMessage = Evernote.Addin.getLocalizedMessage(Evernote.GlobalUtils.getMessageCode(element.attributes["placeholder"].value));
                        Evernote.Logger.debug("localizedMessage is " + localizedMessage);
                        if (localizedMessage) {
                            try {
                                element.attributes["placeholder"].value = localizedMessage;
                            } catch(e) {
                                var placeHolderAttr = document.createAttribute("placeholder");
                                placeHolderAttr.nodeValue = localizedMessage;
                                element.setAttribute("placeholder", localizedMessage);
                            }
                        }
                    }

                    if (element.attributes && element.attributes["message"]) {
                        var localizedMessage = Evernote.Addin.getLocalizedMessage(Evernote.GlobalUtils.getMessageCode(element.attributes["message"].value));
                        Evernote.Logger.debug("localizedMessage is " + localizedMessage);
                        if (localizedMessage) {
                            element.value = localizedMessage;
                        }
                    }
                    break;

                // unlocalizable.
                case "checkbox":
                case "password":
                case "hidden":
                case "radio":
                    break;

                default:
                    throw new Error("We need to localize the value of input elements.");
            }
        }

        else if (element.attributes && element.attributes["message"]) {
            var localizedMessage = Evernote.Addin.getLocalizedMessage(Evernote.GlobalUtils.getMessageCode(element.attributes["message"].value));
            if (localizedMessage) {
                element.innerHTML = localizedMessage;
            } else {
                element.innerHTML = 'l10n error'; // to spot if something goes wrong
            }
        }

        if (element.title){
            var localizedTitle = Evernote.Addin.getLocalizedMessage(Evernote.GlobalUtils.getMessageCode(element.title));
            if (localizedTitle) {
                element.title = localizedTitle;
            }
        }

        for (var i = 0; i < element.children.length; i++) {
            Evernote.GlobalUtils.localize(element.children[i]);
        }
    };

    Evernote.GlobalUtils.getQueryParams = function(url) {
        var data = Evernote.GlobalUtils.componentizeUrl(url);
        var queryString = data.queryString;
        var params = {};
        if (!queryString) {
            return params;
        };
        queryString = queryString.substr(1); // Don't want the question mark.
        queryString = queryString.split("#")[0]; // Get rid of any fragment identifier.
        var pairs = queryString.split("&");
        var i;
        for (i = 0; i < pairs.length; i++) {
            var item = pairs[i].split("=");
            if (item[1]) {
                item[1] = item[1].replace(/\+/g, " ");
            }
            params[item[0].toLowerCase()] = item[1];
        }
        return params;
    };

    Evernote.GlobalUtils.escapeXML = function(str) {
        var map = {
            "&" : "&amp;",
            "<" : "&lt;",
            ">" : "&gt;",
            "\"" : "&quot;",
            "'" : "&apos;"
        };

        var a = str.split("");
        for (var i = 0; i < a.length; i++) {
            if (map[a[i]]) {
                a[i] = map[a[i]];
            }
        }
        return a.join("");
    };

    Evernote.GlobalUtils.decodeXML = function(str) {
        str = str.replace(/&amp;apos;/g, "&#39;");
        str = str.replace(/&amp;quot;/g, "&#34;");
        str = str.replace(/&amp;lt;/g, "&#60;");
        str = str.replace(/&amp;gt;/g, "&#62;");
        return str;
    };

    Evernote.GlobalUtils.cropImage = function( data ) {
        var img = new Image;
        img.onload = function(){
            var canvas=document.createElement("canvas");
            canvas.width=Math.min(150,data.width);
            canvas.height=Math.min(150,data.height);
            canvas.getContext("2d").drawImage(img ,Math.max(0,(data.width-150)/2),Math.max(0,(data.height-150)/2),canvas.width,canvas.height,0,0,canvas.width,canvas.height);
            return canvas.toDataURL();   // Not working. Cross origin policy forbids toDataUrl() method.
        };
        img.src = data.src;
    };

    Evernote.GlobalUtils.createUrlClipContent = function(title, url, favIcoUrl, snippet) {

        var titleAttr = (title) ? Evernote.GlobalUtils.escapeXML(title) : "";
        var urlStr = Evernote.GlobalUtils.escapeXML(url);
        var snip = snippet;

        if (snip.length > 275) {
            snip = snip.substr(0, 275-3) + '...';
        }

        snip = Evernote.GlobalUtils.escapeXML(snip);

        var contentStyle = 'text-align:left;padding:15px;font-size:12px;font-family:Verdana;max-width:370px;color:black;background-color:white;box-sizing:content-box;display:block;background-repeat:no-repeat;';
        var titleStyle = 'white-space:nowrap;font-size:14px;font-weight:bold;overflow-x:hidden;text-overflow:ellipsis;height:24px;';
        var hrStyle = 'border-top-width:1px;border-top-style:solid;border-top-color:#d8d8d8;height:0;width:100%;';
        var imgStyle = 'position:relative;display:inline-block;float:left;width:150px;height:150px;margin:15px 30px 0 0;overflow:hidden;';
        var contStyle = 'display:inline-block;vertical-align:top;margin:15px 0 0;width:364px;';
        var linkDivStyle = 'padding:0px 0px 11px 0px;';
        var faviconStyle = 'float:left;width:16px; height:16px; margin-right:9px; background-size:16px 16px;background-repeat: no-repeat; background-position:left center;';
        var linkStyle = 'display:inline-block;text-decoration:none;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:rgb(12, 12, 12);width:325px;';
        var snipStyle ='word-wrap:break-word;line-height:normal;text-align:left;font-size:12px';

        var imgDiv = '';
        var titleDiv = '<div id="evernoteBookmarkTitle" style="' + titleStyle + '">' + titleAttr + '</div>';
        var hrDiv = '<div id="evernoteBookmarkDivider" style="' + hrStyle + '">&#160;</div>';

        Evernote.pageInfo.getBiggestImage(function(data) {
            if (data && data.src) {
                var im = '<img src="' + data.src + '" width="150"/>';
                imgDiv =  '<div id="evernoteBookmarkImage" style="'+ imgStyle +'">' + im + '</div>';
                contentStyle = contentStyle.replace('max-width:370px','max-width:562px');
            }
        });

        var link = '<a style="' + linkStyle + '" href="' + urlStr+ '">' + urlStr + '</a>';
        var favicon = '<div style="' + faviconStyle + 'background-image:url('+ favIcoUrl +  ');">&#160;</div>';
        var linkDiv = '<div id="evernoteBookmarkLink" style="' + linkDivStyle + '">' + favicon + link + '</div>' ;
        var snipDiv = '<div id="evernoteBookmarkSnippet" style="' + snipStyle + '">' + snip + '</div>';
        var contDiv = '<div id="evernoteBookmarkContent" style="' + contStyle + '">' + linkDiv + snipDiv + '</div>';
        var clearDiv = '<div style="clear:both"/>'

        var content = '<div id="evernoteBookmarkContainer" style="' + contentStyle + '">' + titleDiv + hrDiv + imgDiv + contDiv + clearDiv + '</div>';
        return content;
    };

    Evernote.GlobalUtils.executeOnDomReady = function(callback) {
        Evernote.JQuery(document).ready(function() {
            callback();
        });
    };

    Evernote.GlobalUtils.isDocumentLoaded = function(doc) {
        return doc.readyState == "complete" || doc.readyState == "interactive";
    };
})();
