Evernote.LoggerConfigurator = {

    DEBUG : 0,
    INFO : 1,
    WARN: 2,
    ERROR: 3,

    getLogger : function() {
        var logger = Evernote.FileLogger;
        if(logger) {
            logger.setLevel(this.WARN);
            Evernote.ConsoleLogger.setNext(Evernote.AlertLogger);
            logger.setNext(Evernote.ConsoleLogger);
            return logger;
        }
        return Evernote.ConsoleLogger;
    }
};