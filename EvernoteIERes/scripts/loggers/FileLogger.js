Evernote.FileLogger = {
    _addin : Evernote.Addin,

    _log : function(level, message) {
        if(level >= this.level)
            this._addin.log(level, "JS: " + message);
    },

    debug : function(message) {
        try {
            this._log(0, message);
        } catch(e) {
            if(this._next) {
                this._next.debug(message);
            }
        }
    },

    info : function(message) {
        try {
            this._log(1, message);
        } catch(e) {
            if(this._next) {
                this._next.info(message);
            }
        }
    },

    warn : function(message) {
        try {
            this._log(2, message);
        } catch(e) {
            if(this._next) {
                this._next.warn(message);
            }
        }
    },

    error : function(message) {
        try {
            this._log(3, message);
        } catch(e) {
            if(this._next) {
                this._next.error(message);
            }
        }
    },

    setNext : function(logger) {
        this._next = logger;
        this._next.setLevel(this.level);
    },

    setLevel : function(level) {
        this.level = level;
    }
};