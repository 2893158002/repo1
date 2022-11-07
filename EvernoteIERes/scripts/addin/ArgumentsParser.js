if(typeof Evernote.ArgumentsParser == typeof undefined) {
    Evernote.ArgumentsParser = {
        parse : function(str) {
            var vars = {};
            var parts = str.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
                vars[key] = value;
            });
            return vars;
        }
    }
}