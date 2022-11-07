/**
 * Represents page context (have permissions to access and modify DOM objects)
 */

try {

    PageContext = {
        url: (location && location.href) ? location.href : document.location.href,
        title: document.title,

        META: "evernote-webclipper-extension",

        getFavIconUrl : function() {
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
            //Try to get it from google web site
            var re = new RegExp( "^[^:]+:\/+([^\/" + ":" + "]+).*$" );
            var domain = PageContext.url.replace( re, "$1" );
            return "http://www.google.com/s2/favicons?domain=" + domain.toLowerCase();
        },

        injectAdditionalTags : function() {
            var url = document.location.href;
            if ( url.match( /^https?:\/\/[a-z0-9-+\.]*(evernote|yinxiang)\.com\//i ) ) {
                try {
                    var metas = document.getElementsByTagName( "meta" );
                    for ( var i = 0; i < metas.length; ++i ) {
                        if ( metas[i].name == PageContext.META ) {
                            return;
                        }
                    }

                    var meta = document.createElement( "meta" );
                    meta.name = PageContext.META;
                    meta.content = "installed";

                    var head = document.head;
                    if ( head ) {
                        head.appendChild( meta );
                    }

                    if ( document.body ) {
                        document.body.className += ((document.body.className) ? " " : "") + PageContext.META;
                    }
                }
                catch ( e ) {
                    alert( "PageContext.injectAdditionalTags() failed: " + e );
                    throw e;
                }
            }
        }
    };
    if((document.readyState == "complete" || document.readyState == "interactive") && !window.PageContext) {
        PageContext.injectAdditionalTags();
    }
} catch(e) {
    //Just ignore exception here
}