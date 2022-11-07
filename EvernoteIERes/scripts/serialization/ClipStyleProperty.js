Evernote.ClipStyleProperty = function ClipStyleProperty( name, value, isImportant ) {
    this.initialize( name, value, isImportant );
};

Evernote.ClipStyleProperty.prototype.initialize = function( name, value, isImportant ) {
    if ( typeof name == "string" && typeof value == "string" ) {
        this._name = name;
        this._value = value;
    }

    this._isImportant = (isImportant) ? true : false;
};

Evernote.ClipStyleProperty.prototype._name = null;
Evernote.ClipStyleProperty.prototype._value = null;
Evernote.ClipStyleProperty.prototype._isImportant = null;

Evernote.ClipStyleProperty.prototype.name = function() {
    return this._name;
};

Evernote.ClipStyleProperty.prototype.value = function() {
    return this._value;
};

Evernote.ClipStyleProperty.prototype.isImportant = function() {
    return this._isImportant;
};