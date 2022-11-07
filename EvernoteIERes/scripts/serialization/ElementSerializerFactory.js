//"use strict";

Evernote.ElementSerializerFactory = {
    getImplementationFor : function( node ) {
        for ( var i = 0; i < this.ClassRegistry.length; ++i ) {
            if ( this.ClassRegistry[ i ].isResponsibleFor( node ) ) {
                return this.ClassRegistry[ i ];
            }
        }

        return null;
    }
};

Evernote.ElementSerializerFactory.ClassRegistry = [ ];