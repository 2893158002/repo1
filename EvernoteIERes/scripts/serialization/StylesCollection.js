//"use strict";

Evernote.StylesCollection = function StylesCollection() {
    this._styles = { };
};

Evernote.StylesCollection.prototype._styles = null;

Evernote.StylesCollection.prototype.addStyle = function( name, value, isImportant ) {
    if ( typeof name == "string" && typeof value == "string" ) {
        Evernote.Logger.debug( "StylesCollection.addStyle(): name = " + name + ", value = " + value + ", isImportant = " + isImportant );
        this._styles[ name ] = new Evernote.ClipStyleProperty( name, value, isImportant);
    }
};

Evernote.StylesCollection.prototype.getStyle = function( name ) {
    if ( typeof name == "string" ) {
        Evernote.Logger.debug( "StylesCollection.getStyle(): name = " + name + " value: " + ((typeof this._styles[ name ] != "undefined") ? this._styles[ name ].value() : null) );
        return (typeof this._styles[ name ] != "undefined") ? this._styles[ name ].value() : null;
    }

    return null;
};

Evernote.StylesCollection.prototype.removeStyle = function( name ) {
    if ( typeof name == "string" ) {
        Evernote.Logger.debug( "StylesCollection.removeStyle(): name = " + name );

        this._styles[ name ] = null;
        delete this._styles[ name ];
    }
};

Evernote.StylesCollection.prototype.isImportant = function( name ) {
    if ( typeof name == "string" ) {
        return (typeof this._styles[ name ] != "undefined") ? this._styles[ name ].isImportant() : false;
    }
};

Evernote.StylesCollection.prototype.getStylesNames = function() {
    Evernote.Logger.debug( "StylesCollection.getStylesNames()" );

    var stylesNames = [ ];
    for ( var key in this._styles ) {
        if ( this._styles[ key ] != null ) {
            stylesNames.push( key );
        }
    }

    return stylesNames;
};

Evernote.StylesCollection.prototype.getStylesNumber = function() {
    Evernote.Logger.debug( "StylesCollection.getStylesNumber()" );

    var num = 0;
    for ( var key in this._styles ) {
        if ( this._styles[ key ] != null ) {
            ++num;
        }
    }

    return num;
};
