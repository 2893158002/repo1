Evernote.ConsoleLogger = {
    debug : function(message) {
        if(this.level >= Evernote.LoggerConfigurator.DEBUG) {
            try {
                console.info(message);
            } catch(e) {
                if(this._next) {
                    this._next.debug(message);
                }
            }
        }
    },

    info : function(message) {
        if(this.level >= Evernote.LoggerConfigurator.INFO) {
            try {
                console.info(message);
            } catch(e) {
                if(this._next) {
                    this._next.info(message);
                }
            }
        }
    },

    warn : function(message) {
        if(this.level >= Evernote.LoggerConfigurator.WARN) {
            try {
                console.warn(message);
            } catch(e) {
                if(this._next) {
                    this._next.warn(message);
                }
            }
        }
    },

    error : function(message) {
        if(this.level >= Evernote.LoggerConfigurator.ERROR) {
            try {
                console.error(message);
            } catch(e) {
                if(this._next) {
                    this._next.error(message);
                }
            }
        }
    },

    setNext : function(logger) {
        this._next = logger;
    },

    setLevel : function(level) {
        this.level = level;
    }
};