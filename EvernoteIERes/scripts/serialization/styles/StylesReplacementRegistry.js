Evernote.StylesReplacementRegistry = {

    registry: [],

    getImplementationFor: function(name) {
        if(name) {
            return this.registry[name];
        }
        return null;
    },

    register: function(name, impl) {
        this.registry[name] = impl;
    }
};