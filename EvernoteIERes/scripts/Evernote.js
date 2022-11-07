if ( typeof Evernote == 'undefined' ) {
    /**
     * Represents global evernote context (namespace).
     * All objects should be a part of this namespace.
     * @type {Object}
     */
    Evernote = {};
}
Evernote.inherit = function( childConstructor, parentClassOrObject, includeConstructorDefs ) {
    if ( parentClassOrObject.constructor == Function ) {
        // Normal Inheritance
        childConstructor.prototype = new parentClassOrObject;
        childConstructor.prototype.constructor = childConstructor;
        childConstructor.prototype.parent = parentClassOrObject.prototype;
        childConstructor.constructor.parent = parentClassOrObject;
    }
    else {
        // Pure Virtual Inheritance
        childConstructor.prototype = parentClassOrObject;
        childConstructor.prototype.constructor = childConstructor;
        childConstructor.prototype.parent = parentClassOrObject;
        childConstructor.constructor.parent = parentClassOrObject;
    }

    if ( includeConstructorDefs ) {
        for ( var i in parentClassOrObject.prototype.constructor ) {
            if ( i != "parent" && i != "prototype" && parentClassOrObject.constructor[i] != parentClassOrObject.prototype.constructor[ i ]
                && typeof childConstructor.prototype.constructor[ i ] == 'undefined' ) {
                childConstructor.prototype.constructor[ i ] = parentClassOrObject.prototype.constructor[ i ];
            }
        }
    }

    if ( typeof childConstructor.handleInheritance == 'function' ) {
        childConstructor.handleInheritance.apply( childConstructor, arguments );
    }

    if ( typeof childConstructor.prototype.handleInheritance == 'function' ) {
        childConstructor.prototype.handleInheritance.apply( childConstructor, arguments );
    }

    return childConstructor;
};