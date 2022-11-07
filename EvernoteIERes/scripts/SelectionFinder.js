/**
 * SelectionFinder provides mechanism for finding selection on the page via
 * find(). It is able to traverse frames in order to find a selection. It will
 * report whether there's a selection via hasSelection(). After doing find(),
 * the selection is stored in the selection property, and the document property
 * will contain the document in which the selection was found. Find method will
 * only recurse documents if it was invoked as find(true), specifying to do
 * recursive search. You can use reset() to undo find().
 */
Evernote.SelectionFinder = function SelectionFinder( doc ) {
    this._document = doc;
};

Evernote.SelectionFinder.prototype._document = null;
Evernote.SelectionFinder.prototype._selection = null;

Evernote.SelectionFinder.prototype.hasSelection = function() {
    Evernote.Logger.debug( "SelectionFinder.hasSelection()" );

    var range = Evernote.Utils.fixIERangeObject(this.getRange());
    return range && (range.startContainer != range.endContainer
        || (range.startContainer == range.endContainer && range.startOffset != range.endOffset));
};

Evernote.SelectionFinder.prototype.find = function( deep ) {
    Evernote.Logger.debug( "SelectionFinder.find()" );
    var result = this.findSelectionInDocument( this._document, deep );
    this._document = result.document;
    this._selection = result.selection;
};

Evernote.SelectionFinder.prototype.getRange = function() {
    Evernote.Logger.debug( "SelectionFinder.getRange()" );
    if ( !this._selection || this._selection.rangeCount == 0 ) {
        return null;
    }

    if ( typeof this._selection.getRangeAt == 'function' ) {
        return this._selection.getRangeAt( 0 );
    }

    if ( (window.Range && this._selection instanceof window.Range) || !this._selection.anchorNode ) {
        return this._selection;
    }
    var range = this._document.createRange();
    range.setStart( this._selection.anchorNode, this._selection.anchorOffset );
    range.setEnd( this._selection.focusNode, this._selection.focusOffset );

    return range;
};

Evernote.SelectionFinder.prototype.findSelectionInDocument = function( doc, deep ) {
    try {
        Evernote.Logger.debug( "SelectionFinder.findSelectionInDocument()" );

        var sel = null;
        var hasSelection = false;
        var win = null;

        try {
            win = (doc.defaultView) ? doc.defaultView : window;
        }
        catch ( e ) {
            win = window;
        }
        if ( typeof win.getSelection == 'function' ) {
            sel = win.getSelection();
            if ( sel && typeof sel.rangeCount != 'undefined' && sel.rangeCount > 0 ) {
                Evernote.Logger.debug("Found selection by win.getSelection()");
                hasSelection = true;
            }
        }
        else if ( win.selection && typeof win.selection.createRange == 'function' ) {
            sel = win.selection.createRange();
            if ( win.selection.type == 'Text' && typeof sel.htmlText == 'string' && sel.htmlText.length > 0 ) {
                Evernote.Logger.debug("Found selection by win.selection");
                hasSelection = true;
            }
        }
        else if ( doc.selection && (typeof doc.selection.createRange == 'function' || typeof doc.selection.createRange == 'object') ) {
            sel = doc.selection.createRange();
            if(doc.selection.type == "None")
                sel = undefined;
            if ( (doc.selection.type == 'Text') && (typeof sel.htmlText == 'string') && (sel.htmlText.length > 0) ) {
                Evernote.Logger.debug("Found selection by doc.selection");
                hasSelection = true;
            }
        }

        if ( sel && !hasSelection && deep ) {
            var nestedDocs = Evernote.Utils.getNestedDocuments( doc );
            for ( var i = 0; i < nestedDocs.length; ++i ) {
                if ( nestedDocs[ i ] ) {
                    var framedSel = this.findSelectionInDocument( nestedDocs[ i ], deep );
                    if ( framedSel && framedSel.selection && framedSel.selection.rangeCount > 0 ) {
                        return framedSel;
                    }
                }
            }
        }

        //if do not find any selection in document, try to find selection in HTMLTextArea|Input.
        //Get Selection object for TextArea, and set selection as a Range object
        if(doc.activeElement)
            Evernote.Logger.debug( "Check selection in INPUT TEXT area (input, textarea), for active element :" + doc.activeElement.nodeName );

        var activeEl = doc.activeElement && false; // disabled, because no need to search selections in this elements.
        if ( activeEl && ( (window.HTMLInputElement && (activeEl instanceof window.HTMLInputElement && activeEl.type == "text")) || ( window.HTMLTextAreaElement && (activeEl instanceof window.HTMLTextAreaElement)) ) ) {
            if ( activeEl.selectionStart != activeEl.selectionEnd ) {
                var range = doc.createRange();
                var textNode = doc.createTextNode( activeEl.value );

                range.setStart( textNode, activeEl.selectionStart );
                range.setEnd( textNode, activeEl.selectionEnd );
                sel = range;
            }
        }

        return {
            document : doc,
            selection : sel
        };
    } catch(e) {
        Evernote.Logger.error("Failed to find selection on the page due to error " + e);
        //Do not throw exception here, it is better to not show error to user and allow to clip article or something else.
    }
    return {
        document: doc,
        selection: null
    }
};