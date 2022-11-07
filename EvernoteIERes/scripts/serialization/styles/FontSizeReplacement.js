Evernote.FontSizeReplacement = {

    SUPPORTED_FONT_SIZES: ["em", "%", "pt", "px"],

    getValue: function(val) {
        if(typeof val != "string")
            return val;
        if(this.isCalculationRequired(val)) {
            return Evernote.Utils.getFontSizeInPixels(val) + "px";
        } else {
            //Do not set browser dependant CSS since it does not supported by Evernote Chromium Viewer.
            return null;
        }
    },

    isCalculationRequired: function(val) {
        for(var i = 0; i < this.SUPPORTED_FONT_SIZES.length; i++) {
            if(val.indexOf(this.SUPPORTED_FONT_SIZES[i]) != -1) {
                return true;
            }
        }
        return false;
    }
};

Evernote.StylesReplacementRegistry.register("font-size", Evernote.FontSizeReplacement);