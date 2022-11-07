if (typeof Evernote.Injector == "undefined") {

    /**
     * Represents DOM elements injector from IE toolbar context (crosses JS security manager).
     */
    Evernote.Injector = {
        /**
         * Injects html content to specified document.
         * @param doc - document, where content should be injected.
         * @param pages - pages configuration in following format:
         *  {
         *      path: <path to the page where content should be injected>
         *      containerId: <id of container that should be created and content is appended there>
         *  }
         * @private
         */
        _injectHTML : function( doc, pages ) {
            var pagesToInject = pages;
            if(!(pagesToInject instanceof Array))
                pagesToInject = [pages];
            for(var j = 0; j < pagesToInject.length; j++) {
                var fileName = pagesToInject[j].path;
                var id = pagesToInject[j].containerId;
                try {
                    var contents = this._loadFiles( fileName );
                    var fullContent = "";

                    for ( var i = 0; i < contents.length; ++i ) {
                        fullContent += contents[ i ];
                    }

                    if ( doc.body ) {
                        var div = doc.createElement( "div" );

                        div.id = id;
                        div.innerHTML = fullContent;

                        doc.body.appendChild( div );
                    }
                }
                catch ( e ) {
                    Evernote.Logger.error( "Injector.injectHTML() failed " + e );
                }
            }
        },

        _replacePathsInCssToLocal : function ( string ) {
            var extensionPath = this._addon.getPath('resources');
            var path = 'file:///' + extensionPath.replace(/\\/g, "/").replace(/\s/g, "%20");

            return string.replace(/extension:\/\//ig, path );
        },

        _isExpressionsAcceptable : function(doc){
            var acceptable = false;
            var testStyle  =  doc.createElement('style');
            var text = this._loadFiles('css/expression-test.css');
            testStyle.type = 'text/css';
            try {
                testStyle.innerHTML = text;
                doc.head.appendChild(testStyle);
                acceptable = true;
            } catch (e) {
                // ignore
            }
            return acceptable;
        },

        _injectCSS : function( fileName, doc ) {
            var namesToInject = fileName;

            if(!(fileName instanceof Array)) {
                namesToInject = [fileName];
            }

            try {
                // inject css as text

                Evernote.Logger.debug("Page is https, injecting stylesheet content");

                var fullContent = '';
                var contents = this._loadFiles( namesToInject );

                for ( var j = 0; j < contents.length; ++j ) {
                    fullContent += contents[ j ] + Constants.NEW_LINE;
                }

                fullContent = this._replacePathsInCssToLocal( fullContent );

                if (Evernote.IEVersion.getVersion() == 11 && doc.documentMode == 11) {
                    // some sites doesn't allow inject js within css and throw exception.
                    fullContent = fullContent.replace(/.*expression\(.*/igm,'');

                    var style = doc.createElement( 'style' );
                    style.type = 'text/css';
                    style.innerHTML = fullContent;
                    try {
                        doc.head.appendChild(style);
                    } catch (e) {
                        doc.getElementsByTagName("body")[0].appendChild( style );
                    }
                }
                else if ( doc.body ) {
                    var style = doc.createElement( "style" );
                    style.type = 'text/css';
                    if ( style.styleSheet ) {
                        style.styleSheet.cssText = fullContent;
                    }
                    else {
                        style.appendChild( document.createTextNode( fullContent ) );
                    }

                    doc.getElementsByTagName("body")[0].appendChild( style );
                }
            }
            catch ( e ) {
                Evernote.Logger.error( "Injector.injectCSS() failed " + e );
            }
        },

        _injectScripts : function( fileNames, doc ) {
            try {
                var contents = this._loadFiles( fileNames );
                for ( var i = 0; i < contents.length; ++i ) {
                    this._addon.injectScript( doc, contents[ i ] );
                }
            }
            catch ( e ) {
                Evernote.Logger.error( "Injector.injectScript() failed " + e );
            }
        },

        _loadFiles : function( fileNames ) {
            if ( !(fileNames instanceof Array) ) {
                fileNames = [ fileNames ];
            }

            var contents = [ ];
            var url = "";
            for ( var i = 0; i < fileNames.length; ++i ) {
                try {
                    url = fileNames[ i ];
                    contents.push( this._addon.loadFile( url ) );
                }
                catch ( e ) {
                    Evernote.Logger.error("Load file failed " + e);
                    throw new Error( e.toString() + " " + url );
                }
            }

            return contents;
        },

        /**
         * Injects dom elements specified in configuration object ot document.
         * Configuration object should have following attributes
         * {
         *    css: <array of paths or single path to css file to inject>
         *    html:
         *      {
         *          [
         *              {
         *                  path : <path to html file to inject>
         *                  containerId : <id of a container where specified content should be injected>
         *              }
         *              ...
         *          ]
         *     }
         *    scripts: <array of paths to files to inject>
         *    document : <document object>,
         *    isHttps : <true if injecting page is https>
         * }
         * @param configuration - configuration object
         */
        inject : function(configuration) {
            if(configuration.css) {
                this._injectCSS(configuration.css, configuration.document);
            }
            if(configuration.html) {
                this._injectHTML( configuration.document, configuration.html);
            }
            if(configuration.scripts) {
                this._injectScripts(configuration.scripts, configuration.document);
            }
        },

        _addon : Evernote.Addin
    };
}