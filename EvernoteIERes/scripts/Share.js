Evernote.Share = {
    _DEFAULT_WIDTH : 650,
    _DEFAULT_HEIGHT : 650,
    _DEFAULT_TYPE : 'popup',

    _openWindow : function( url, width, height ) {
        var w = width || this._DEFAULT_WIDTH;
        var h = height || this._DEFAULT_HEIGHT;
        var t = this._DEFAULT_TYPE;

        var params = 'width=' + w + ',height=' + h + ',type=' + t + ',left=200,top=200,resizable=yes';

        Evernote.Logger.debug('Open ' + url + ' with params: ' + params);
        window.open(url, null, params);
    },

    toSocial : function ( id, link , title) {
        Evernote.Logger.debug('Evernote.Share.toSocial ' + id + ' and link: ' + link + ', title: ' + title);
        var shareUrl;

        if ( id == 'facebook') {
            shareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(link);
            this._openWindow( shareUrl, 626, 436 );
        } else if (id == 'twitter') {
            shareUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(title)
                + "&url=" + encodeURIComponent(link);
            this._openWindow( shareUrl, 550, 420 );
        } else if (id == 'linkedin') {
            shareUrl = "http://www.linkedin.com/shareArticle?mini=true&url=" + encodeURIComponent(link)
                + "&title=" + encodeURIComponent(title);
            this._openWindow( shareUrl, 900, 570 );
        } else if (id == 'weibo') {
            shareUrl = "http://service.weibo.com/share/share.php?url=" + encodeURIComponent(link)
                + "&title=" + encodeURIComponent(title);
            this._openWindow( shareUrl, 650, 650 );
        }
    }
};