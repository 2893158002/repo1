Evernote.JSSerializer = {

    _selectionFinder : new Evernote.SelectionFinder(window.document),

    serializeAsync : function( element, fullPage, callback ) {
        try {
            var start = new Date().getTime();
            var root = element || document.body.parentNode || document.body;
            var serializer = new Evernote.NodeSerializer( window, new Evernote.ClipFullStylingStrategy() );
            var parser = new Evernote.DomParser( window, null );

            var resultFunc = function() {
                var images = [];
                var imageUrls = serializer.getImagesUrls();

                for(var i = 0; i < imageUrls.length; i++) {
                    images.push(Evernote.Utils.makeAbsolutePath(serializer.getDocumentBase(), imageUrls[i]).replace(/\s/g, "%20"));
                }
                callback( {
                    content : serializer.getSerializedDom(),
                    imageUrls : images,
                    docBase : serializer.getDocumentBase()
                    });
            };
            parser.parseAsync( root, fullPage ? true: false, serializer, resultFunc);
            var end = new Date().getTime();
            Evernote.Logger.debug( "Clip.clipFullPage(): clipped body in " + (end - start) + " milliseconds" );
        }
        catch ( e ) {
            Evernote.Logger.error( "JSSerializer.serialize() failed: error = " + e );
            throw e;
        }
    },

    serialize : function( element, fullPage ) {
        try {
            var start = new Date().getTime();
            var root = element || document.body.parentNode || document.body;
            var serializer = new Evernote.NodeSerializer( window, new Evernote.ClipFullStylingStrategy() );
            var parser = new Evernote.DomParser( window, null );
            parser.parse( root, fullPage ? true: false, serializer);
            var end = new Date().getTime();
            Evernote.Logger.debug( "Clip.clipFullPage(): clipped body in " + (end - start) + " milliseconds" );
            var images = [];
            var imageUrls = serializer.getImagesUrls();

            for(var i = 0; i < imageUrls.length; i++) {
                images.push(Evernote.Utils.makeAbsolutePath(serializer.getDocumentBase(), imageUrls[i]).replace(/\s/g, "%20"));
            }
            return {
                content : serializer.getSerializedDom(),
                imageUrls : images,
                docBase : serializer.getDocumentBase()
            }
        }
        catch ( e ) {
            Evernote.Logger.error( "JSSerializer.serialize() failed: error = " + e );
            throw e;
        }
    },

    serializeSelectionAsync : function( range, callback ) {

        try {
            if( !range ) {
                if ( !this.hasSelection() ) {
                    Evernote.Logger.warn( "JSSerializer.serializeSelection(): no selection to clip" );
                    callback();
                    return;
                }

                range = Evernote.Utils.fixIERangeObject(this._selectionFinder.getRange());


                if ( !range ) {
                    Evernote.Logger.warn( "JSSerializer.serializeSelection(): no range in selection" );
                    callback();
                    return;
                }
            }

            var start = new Date().getTime();
            var ancestor = (this._styleStrategy && Evernote.Utils.Selection.getCommonAncestorContainer(range).nodeType == Evernote.Node.TEXT_NODE
                && Evernote.Utils.Selection.getCommonAncestorContainer(range).parentNode) ? Evernote.Utils.Selection.getCommonAncestorContainer(range).parentNode : Evernote.Utils.Selection.getCommonAncestorContainer(range);

            while ( typeof Evernote.ClipRules.NON_ANCESTOR_NODES[ ancestor.nodeName.toUpperCase() ] != 'undefined' && ancestor.parentNode ) {
                if ( ancestor.nodeName.toUpperCase() == "BODY" ) {
                    break;
                }
                ancestor = ancestor.parentNode;
            }

            var serializer = new Evernote.NodeSerializer( window, new Evernote.ClipFullStylingStrategy(), null, true );
            var parser = new Evernote.DomParser(window, Evernote.Utils.fixIERangeObject(range));

            var resultFunc = function() {
                var images = [];
                var imageUrls = serializer.getImagesUrls();

                for(var i = 0; i < imageUrls.length; i++) {
                    images.push(Evernote.Utils.makeAbsolutePath(serializer.getDocumentBase(), imageUrls[i]).replace(/\s/g, "%20"));
                }

                callback( {
                    content : serializer.getSerializedDom(),
                    imageUrls : images,
                    docBase : serializer.getDocumentBase()
                } );
            };
            parser.parseAsync( ancestor, false, serializer, resultFunc );
            var end = new Date().getTime();
            Evernote.Logger.debug( "JSSerializer.serializeSelection(): clipped selection in " + (end - start) + " milliseconds" );
        }
        catch ( e ) {
            Evernote.Logger.error( "JSSerializer.serializeSelection() failed: error = " + e );
            throw e;
        }
    },

    serializeSelection : function( range ) {
        try {
            if( !range ) {
                if ( !this.hasSelection() ) {
                    Evernote.Logger.warn( "JSSerializer.serializeSelection(): no selection to clip" );
                    return;
                }

                range = Evernote.Utils.fixIERangeObject(this._selectionFinder.getRange());


                if ( !range ) {
                    Evernote.Logger.warn( "JSSerializer.serializeSelection(): no range in selection" );
                    return;
                }
            }

            var start = new Date().getTime();
            var ancestor = (this._styleStrategy && Evernote.Utils.Selection.getCommonAncestorContainer(range).nodeType == Evernote.Node.TEXT_NODE
                && Evernote.Utils.Selection.getCommonAncestorContainer(range).parentNode) ? Evernote.Utils.Selection.getCommonAncestorContainer(range).parentNode : Evernote.Utils.Selection.getCommonAncestorContainer(range);

            while ( typeof Evernote.ClipRules.NON_ANCESTOR_NODES[ ancestor.nodeName.toUpperCase() ] != 'undefined' && ancestor.parentNode ) {
                if ( ancestor.nodeName.toUpperCase() == "BODY" ) {
                    break;
                }
                ancestor = ancestor.parentNode;
            }

            var serializer = new Evernote.NodeSerializer( window, new Evernote.ClipFullStylingStrategy() );
            var parser = new Evernote.DomParser(window, Evernote.Utils.fixIERangeObject(range));
            parser.parse( ancestor, false, serializer );

            var end = new Date().getTime();
            Evernote.Logger.debug( "JSSerializer.serializeSelection(): clipped selection in " + (end - start) + " milliseconds" );
            var images = [];
            var imageUrls = serializer.getImagesUrls();

            for(var i = 0; i < imageUrls.length; i++) {
                images.push(Evernote.Utils.makeAbsolutePath(serializer.getDocumentBase(), imageUrls[i]).replace(/\s/g, "%20"));
            }

            return {
                content : serializer.getSerializedDom(),
                imageUrls : images,
                docBase : serializer.getDocumentBase()
            }
        }
        catch ( e ) {
            Evernote.Logger.error( "JSSerializer.serializeSelection() failed: error = " + e );
            throw e;
        }
    },

    hasSelection : function() {
        Evernote.Logger.debug( "Clip.hasSelection()" );

        if ( this._selectionFinder.hasSelection() ) {
            return true;
        }
        else {
            this._selectionFinder.find( true );
            return this._selectionFinder.hasSelection();
        }
    }
};