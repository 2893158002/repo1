Evernote.StyleElementExtension = {
    getPropertyValue : function(styleObj, propertyName) {
        var props = propertyName;
        if(!(props instanceof Array)) {
            props = [propertyName];
        }
        Evernote.Logger.debug("Evernote.StyleElementExtension.getPropertyValue: number of properties to check " + props.length);
        for(var i = 0; i < props.length; i++) {
            var propName = props[i];
            Evernote.Logger.debug("Evernote.StyleElementExtension.getPropertyValue: property name is " + propName);
            var val;
            if(styleObj.getPropertyValue) {
                val = styleObj.getPropertyValue(propName);
                Evernote.Logger.debug("Evernote.StyleElementExtension.getPropertyValue: value from getPropertyValue is " + val);
                if(val)
                    return val;
            }
            val = styleObj[propName];
            Evernote.Logger.debug("Evernote.StyleElementExtension.getPropertyValue: value from styleObj " + val);
            if(val)
                return val;
        }
    }
};
