/**
 * Represents DOM parser that could able to traverse the DOM node tree from specified root.
 * @param tab - current window object
 * @param range - current selection on the page (if any)
 * @constructor
 */
Evernote.DomParser = function DomParser( tab, range ) {
    this.initialize( tab, range );
};

Evernote.DomParser.prototype._tab = null;

/**
 * Update current parser data
 * @param tab - current window object
 * @param range - current selection on the page (if any)
 */
Evernote.DomParser.prototype.initialize = function ( tab, range ) {
    Evernote.Logger.debug( "DomSerializer.initialize()" );

    this._tab = tab;
    this._range = range;
};

/**
 * Determines if passed node should be serialized.
 * Node should not be initialized if one of the following is true:
 *  - node is rejected according to configuration
 *  - there is the selection on the page and this node is out of selection range.
 * @param node - DOM node
 * @return {Boolean}
 */
Evernote.DomParser.prototype.isNodeForSerialize = function ( node ) {
    if ( !node || Evernote.ClipRules.isRejectedNode( node ) || node.id == "evernoteContentClipperWait" ) {
        return false;
    }
    if(Evernote.ClipperElementsIdentifiers.match(node)) {
        Evernote.Logger.debug("Node is rejected because it is clipper information " + node.id);
        return false;
    }
    return (!this._range || this.isNodeInRange( node )) ? true : false;
};

/**
 * Determines whether passed node is inside the selection range. Returns true if it is, false otherwise.
 * @param node - DOM node
 * @return {Boolean}
 */
Evernote.DomParser.prototype.isNodeInRange = function ( node ) {
    Evernote.Logger.debug( "DomParser.isNodeInRange()" );

    var nodeRange, endsAfterNodeStart, startsBeforeNodeEnd;

    if (typeof node.ownerDocument.createRange == 'function') {
        // ie9, ie10, ie11

        if ( node && this._range ) {
            nodeRange = node.ownerDocument.createRange();

            // create new selection from node, or node content
            try {
                nodeRange.selectNode( node );
            }
            catch ( e ) {
                nodeRange.selectNodeContents( node );
            }

            // compare boundary points of selection and current node.
            endsAfterNodeStart = this._range.compareBoundaryPoints( Range.START_TO_END, nodeRange ) == 1;
            startsBeforeNodeEnd = this._range.compareBoundaryPoints( Range.END_TO_START, nodeRange ) == -1;

            return endsAfterNodeStart && startsBeforeNodeEnd;
        }
    } else {
        // ie7 , ie8
        nodeRange = node.ownerDocument.body.createTextRange();

        try {
            nodeRange.moveToElementText(node);
        } catch (e) {
            // [object Text]
            // probably, here should be analog for createRange().selectNodeContents();
            return true;
        }

        endsAfterNodeStart = this._range.compareEndPoints('EndToStart', nodeRange) == 1;
        startsBeforeNodeEnd = this._range.compareEndPoints('StartToEnd', nodeRange) == -1;

        return endsAfterNodeStart && startsBeforeNodeEnd;
    }

    return false; // not found.
};

/**
 * Determines whether passed node is visible on the page.
 * @param node - DOM node.
 * @return {Boolean}
 */
Evernote.DomParser.prototype.isNodeVisible = function ( node ) {
    Evernote.Logger.debug( "DomParser.isNodeVisible()" );

    if ( !node ) {
        return false;
    }

    var compStyles = Evernote.ElementExtension.getComputedStyle( node, null, this._tab );
    return Evernote.StyleElementExtension.getPropertyValue(compStyles, "display" ) != "none";
};

Evernote.DomParser.prototype.parseAsync = function ( root, fullPage, serializer, callback ) {
    var PARSING_TIMEOUT_INTERVAL = 1000; //milliseconds

    if (!callback) {
        this.parse(root, fullPage, serializer);
        return;
    }

    if ( !root ) {
        throw new Error( "No root element for parsing" );
    }

    var node = root;
    var parentNode = null;
    var thizz = this;

    var asyncParser = function()
    {
        var parsingEnd = true;
        var startTimeParsing = new Date().getTime();
        while ( node ) {
            if ( node != root && node.parentNode ) {
                parentNode = node.parentNode.serializedNode;
            }

            if ( thizz.isNodeForSerialize( node ) ) {
                if ( node.nodeType == Evernote.Node.TEXT_NODE ) {
                    serializer.textNode( node, thizz._range );
                }
                else if ( node.nodeType == Evernote.Node.ELEMENT_NODE && thizz.isNodeVisible( node ) ) {
                    node.serializedNode = serializer.startNode( new Evernote.SerializedNode( node, parentNode ), root, fullPage );
                    if ( node.hasChildNodes() ) {
                        node = node.childNodes[ 0 ];
                        continue;
                    }
                    else {
                        serializer.endNode( node.serializedNode );
                        if ( node.serializedNode ) {
                            try {
                                delete node.serializedNode;
                            } catch(e) {
                                //If we are failed to delete the property, than just set it to undefined
                                node.serializedNode = undefined;
                            }
                        }
                    }
                }
            }

            /**
             * Check if there is a next node available and it is not the root
             */
            if ( node.nextSibling && node != root ) {
                node = node.nextSibling;
            }
            else if ( node != root ) {
                while ( node.parentNode && node != root ) {
                    node = node.parentNode;
                    try {
                        serializer.endNode( node.serializedNode );
                    } catch (err) {
                        node.serializedNode = undefined;
                        continue;
                    };
                    try {
                        delete node.serializedNode;
                    } catch (e) {
                        //If we are failed to delete the property, than just set it to undefined
                        node.serializedNode = undefined;
                    }

                    if ( node.nextSibling && node != root ) {
                        node = node.nextSibling;
                        break;
                    }
                }

                if ( node == root ) {
                    break;
                }
            }
            else {
                break;
            }

            var endTimeParsing = new Date().getTime();
            if ( (endTimeParsing - startTimeParsing) >= PARSING_TIMEOUT_INTERVAL ) {
                Evernote.Logger.debug("Parsing interval timeout: " + (endTimeParsing - startTimeParsing));
                parsingEnd = false;
                break;
            }
        }

        if (parsingEnd) {
            Evernote.Logger.debug("Parsing end");
            callback();
        }else {
            Evernote.Logger.debug("Parsing repeat");
            setTimeout(asyncParser, 0);
        }
    };
    setTimeout(asyncParser, 0);
};

/**
 * Starts parsing from specified root.
 * @param root - starting DOM node.
 * @param fullPage - is user selects to serialize the full page
 * @param serializer - current serializer to be used to serialize the DOM node to string
 */
Evernote.DomParser.prototype.parse = function ( root, fullPage, serializer ) {
    Evernote.Logger.debug( "DomParser.parse()" );

    if ( !root ) {
        throw new Error( "No root element for parsing" );
    }

    var node = root;
    var parentNode = null;

    while ( node ) {
        if ( node != root && node.parentNode ) {
            parentNode = node.parentNode.serializedNode;
        }

        if ( this.isNodeForSerialize( node ) ) {
            if ( node.nodeType == Evernote.Node.TEXT_NODE ) {
                serializer.textNode( node, this._range );
            }
            else if ( node.nodeType == Evernote.Node.ELEMENT_NODE && this.isNodeVisible( node ) ) {
                node.serializedNode = serializer.startNode( new Evernote.SerializedNode( node, parentNode ), root, fullPage );
                if ( node.hasChildNodes() ) {
                    node = node.childNodes[ 0 ];
                    continue;
                }
                else {
                    serializer.endNode( node.serializedNode );
                    if ( node.serializedNode ) {
                        try {
                            delete node.serializedNode;
                        } catch(e) {
                            //If we are failed to delete the property, than just set it to undefined
                            node.serializedNode = undefined;
                        }
                    }
                }
            }
        }

        /**
         * Check if there is a next node available and it is not the root
         */
        if ( node.nextSibling && node != root ) {
            node = node.nextSibling;
        }
        else if ( node != root ) {
            while ( node.parentNode && node != root ) {
                node = node.parentNode;
                try {
                    serializer.endNode( node.serializedNode );
                } catch (err) {
                    node.serializedNode = undefined;
                    continue;
                };

                try {
                    delete node.serializedNode;
                } catch (e) {
                    //If we are failed to delete the property, than just set it to undefined
                    node.serializedNode = undefined;
                }

                if ( node.nextSibling && node != root ) {
                    node = node.nextSibling;
                    break;
                }
            }

            if ( node == root ) {
                break;
            }
        }
        else {
            break;
        }
    }
};