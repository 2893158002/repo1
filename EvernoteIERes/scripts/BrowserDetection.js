Evernote.BrowserDetection = {
    isIE11 : function() {				
        return navigator.userAgent.indexOf("Trident/7.0") != -1       
    },
	
	isIE10 : function() {
        return navigator.userAgent.indexOf("MSIE 10") != -1;
    },

    isIE7 : function() {
        return navigator.userAgent.indexOf("MSIE 7.0") != -1 && navigator.userAgent.indexOf("Trident/7.0") == -1;
    },

    isIE8 : function() {
        return navigator.userAgent.indexOf("MSIE 8.0") != -1 && navigator.userAgent.indexOf("Trident/7.0") == -1;
    },

    isIE9 : function() {
        return navigator.userAgent.indexOf("MSIE 9.0") != -1 && navigator.userAgent.indexOf("Trident/7.0") == -1;
    },

    isLessThanIE9 : function() {
        return Evernote.BrowserDetection.isIE7() || Evernote.BrowserDetection.isIE8()
    },
	
	isIE10orGreater : function() {
		return Evernote.BrowserDetection.isIE10() || Evernote.BrowserDetection.isIE11()
	}
};