/**
 * Serializes DOM element into an img pointing to the thumbnail of the video
 *
 * Video ids are used for obtaining thumbnails via
 * https://i2.ytimg.com/vi/cAcxHQalWOw/hqdefault.jpg. These ids can be
 * obtained from:
 *
 * <pre>
 *   - the URL of the document containing EMBED
 *   - iframe's src attribute that embeds the video via an iframe
 *   - src attribute of the embed object (though on actualy youtube.com it's not possible)
 * </pre>
 *
 * Sample URLs are:
 *
 * <pre>
 * http: //www.youtube.com/embed/IWJJBwKhvp4?wmode=opaque&amp;rel=0
 * http: //www.youtube.com/v/YZEbBZ2IrXE?version=3&amp;rel=1&amp;fs=1&amp;showsearch=0&amp;showinfo=1&amp;iv_load_policy=1
 * http: //www.youtube.com/v/J3mjFSTsKiM&amp;hl=en&amp;fs=1
 * http://www.youtube.com/watch?v=cAcxHQalWOw
 * http://www.youtube.com/user/IFiDieApp?v=sdzCELofGgE&feature=pyv
 * </pre>
 */

Evernote.YoutubeElementSerializer = function YoutubeElementSerializer( doc, node, nodeStyle ) {
    this.initialize( doc, node, nodeStyle );
};

Evernote.inherit( Evernote.YoutubeElementSerializer, Evernote.AbstractElementSerializer, true );

Evernote.YoutubeElementSerializer.WATCH_URL_REGEX = /^https?:\/\/www\.youtube\.com\/watch\?.*v=([^&]+)/i;
Evernote.YoutubeElementSerializer.USER_CHANNEL_URL_REGEX = /^https?:\/\/www\.youtube\.com\/user\/([a-zA-Z0-9]+)\?v=([^&]+)/i;
Evernote.YoutubeElementSerializer.EMBED_URL_REGEX = /^https?:\/\/www\.youtube\.com\/embed\/([^\/\?&]+)/i;
Evernote.YoutubeElementSerializer.VIDEO_URL_REGEX = /^https?:\/\/www\.youtube\.com\/v\/([^\/\?&]+)/i;
Evernote.YoutubeElementSerializer.POSSIBLE_CONTAINER_NODES = [ "OBJECT" ];
Evernote.YoutubeElementSerializer.VIDEO_NODES = [ "EMBED", "IFRAME" ];
Evernote.YoutubeElementSerializer.WATCH_URL = "http://www.youtube.com/watch?v=$videoId$";
Evernote.YoutubeElementSerializer.USER_CHANNEL_URL = "http://www.youtube.com/user/$userId$?v=$videoId$";
Evernote.YoutubeElementSerializer.DEFAULT_THUMB_URL = "https://i2.ytimg.com/vi/$videoId$/default.jpg";
Evernote.YoutubeElementSerializer.HQ_THUMB_URL = "https://i2.ytimg.com/vi/$videoId$/hqdefault.jpg";
Evernote.YoutubeElementSerializer.DEFAULT_THUMB_WIDTH = 120;
Evernote.YoutubeElementSerializer.DEFAULT_THUMB_HEIGHT = 90;

Evernote.YoutubeElementSerializer.isResponsibleFor = function( node ) {
    var params = this.extractVideoParamsFromNode( node );
    return (params) ? true : false;
};

Evernote.YoutubeElementSerializer.extractVideoParamsFromNode = function( node ) {
    Evernote.Logger.debug( "YoutubeElementSerializer.extractVideoIdFromNode()" );
    try {
        if ( node && node.nodeType == Evernote.Node.ELEMENT_NODE ) {
            var view = window;
            try {
                view = node.ownerDocument.defaultView;
            }
            catch ( e ) {
            }

            var matches = null;
            if ( view && (node.nodeName.toLowerCase() == "embed" || node.nodeName.toLowerCase() == "object") && view.location ) {
                if ( (matches = view.location.href.match( this.WATCH_URL_REGEX )) && matches[ 1 ] ) {
                    return matches[ 1 ];
                }
                else if ( (matches = view.location.href.match( this.USER_CHANNEL_URL_REGEX )) && matches[ 1 ] && matches[ 2 ] ) {
                    return [ matches[ 1 ], matches[ 2 ] ];
                }
            }
            else {
                var videoNode = this.findVideoNode( node );
                if ( videoNode ) {
                    var src = videoNode.getAttribute( "src" );
                    if ( src && (matches = src.match( this.EMBED_URL_REGEX )) && matches[ 1 ] ) {
                        return matches[ 1 ];
                    }
                    else if ( src && (matches = src.match( this.VIDEO_URL_REGEX )) && matches[ 1 ] ) {
                        return matches[ 1 ];
                    }
                }
            }
        }
    } catch(e) {
        Evernote.Logger.error("failed to YoutubeElementSerializer.extractVideoParamsFromNode due to error " + e);
    }

    return null;
};

Evernote.YoutubeElementSerializer.findVideoNode = function( node ) {
    Evernote.Logger.debug( "YoutubeElementSerializer.findVideoNode()" );

    if ( node && node.nodeType == Evernote.Node.ELEMENT_NODE ) {
        if ( Evernote.ArrayExtension.indexOf(this.VIDEO_NODES,  node.nodeName.toUpperCase() ) >= 0 ) {
            return node;
        }
        else if ( Evernote.ArrayExtension.indexOf(this.POSSIBLE_CONTAINER_NODES, node.nodeName.toUpperCase() ) >= 0 ) {
            try {
                var it = node.ownerDocument.createNodeIterator( node, NodeFilter.SHOW_ELEMENT, null, false );
                var next = null;

                while ( next = it.nextNode() ) {
                    if ( Evernote.ArrayExtension.indexOf(this.VIDEO_NODES, next.nodeName.toUpperCase() ) >= 0 ) {
                        return next;
                    }
                }
            } catch(e) {
                //We ignore exception here, because if node iterator is not supported, than we could skip old pages (not Youtube).
                return null;
            }
        }
    }

    return null;
};

Evernote.YoutubeElementSerializer.prototype._imageUrl = "";

Evernote.YoutubeElementSerializer.prototype.serialize = function( /*docBase*/ ) {
    Evernote.Logger.debug( "YoutubeElementSerializer.serialize()" );

    try {
        var userId = null;
        var videoId = null;
        var params = this.constructor.extractVideoParamsFromNode( this._node );
        if ( params instanceof Array ) {
            userId = params[ 0 ];
            videoId = params[ 1 ];
        }
        else if ( typeof params == "string" ) {
            videoId = params;
        }

        if ( videoId ) {
            var thumbUrl = null;
            var w = 0;
            var h = 0;

            if ( this._nodeStyle ) {

                var view = window;
                try {
                    view = this._node.ownerDocument.defaultView;
                }
                catch ( e ) {
                }

                var computedStyles = Evernote.ElementExtension.getComputedStyle( this._node, null, view );

                w = parseInt( Evernote.StyleElementExtension.getPropertyValue(computedStyles, "width" ) );
                w = (isNaN( w )) ? 0 : w;

                h = parseInt( Evernote.StyleElementExtension.getPropertyValue(computedStyles, "height" ) );
                h = (isNaN( h )) ? 0 : h;


                if ( w < this.constructor.DEFAULT_THUMB_WIDTH || h < this.constructor.DEFAULT_THUMB_HEIGHT ) {
                    thumbUrl = this.getDefaultThumbnailUrl( videoId );
                }
                else {
                    thumbUrl = this.getHQThumbnailUrl( videoId );
                }
            }
            else {
                thumbUrl = this.getDefaultThumbnailUrl( videoId );
            }

            if ( thumbUrl ) {
                var styleStr = (this._nodeStyle instanceof Evernote.ClipStyle) ? ("style=\"" + this._nodeStyle.toString() + "\"") : "";
                var attrs = this._node.attributes;
                var attrStr = "";

                for ( var i = 0; i < attrs.length; ++i ) {
                    var attr = attrs[ i ];
                    if(Evernote.ClipRules.KEEP_NODE_ATTRIBUTES["a"][attr.name]) {
                        attrStr += attr.name;
                        if ( attr.value ) {
                            attrStr += "=" + attr.value;
                        }
                        attrStr += " ";
                    }
                }

                var href = ( userId ) ? this.getUserChannelUrl( userId, videoId ) : this.getWatchUrl( videoId );
                var imgAttrStr = "";

                if ( w && h ) {
                    var k = w / h;
                    // scale by height
                    if ( k > this.constructor.DEFAULT_THUMB_WIDTH / this.constructor.DEFAULT_THUMB_HEIGHT ) {
                        imgAttrStr += "height=\"" + h + "\"";
                    }
                    else { // scale by width
                        imgAttrStr += "width=\"" + w + "\"";
                    }
                }

                this._imageUrl = thumbUrl;
                return "<a " + styleStr + " " + attrStr + " href=\"" + href + "\"><img src=\"" + thumbUrl + "\" " + imgAttrStr + "/></a>";
            }
        }
    }
    catch ( e ) {
        Evernote.Logger.error( "YoutubeElementSerializer.serialize() failed: error = " + e );
    }

    return "";
};

Evernote.YoutubeElementSerializer.prototype.getDefaultThumbnailUrl = function( videoId ) {
    return this.constructor.DEFAULT_THUMB_URL.replace( /\$videoId\$/, videoId );
};

Evernote.YoutubeElementSerializer.prototype.getHQThumbnailUrl = function( videoId ) {
    return this.constructor.HQ_THUMB_URL.replace( /\$videoId\$/, videoId );
};

Evernote.YoutubeElementSerializer.prototype.getWatchUrl = function( videoId ) {
    return this.constructor.WATCH_URL.replace( /\$videoId\$/, videoId );
};

Evernote.YoutubeElementSerializer.prototype.getUserChannelUrl = function( userId, videoId ) {
    return this.constructor.USER_CHANNEL_URL.replace( /\$userId\$/, userId ).replace( /\$videoId\$/, videoId );
};

Evernote.YoutubeElementSerializer.prototype.getImageUrl = function() {
    return this._imageUrl;
};