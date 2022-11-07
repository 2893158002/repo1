Evernote.ArrayExtension = {
    indexOf : function(element, searchStr) {
        if(!element) {
            return -1;
        }
        if (element.indexOf)
            return element.indexOf(searchStr);
        for(var i = 0; i < element.length; i++) {
            if(element[i] == searchStr)
                return i;
        }
        return -1;
    },

    containsCaseIgnore : function(element, searchStr) {
        if(!element) {
            return false;
        }
        for(var i = 0; i < element.length; i++) {
            if(element[i].toLowerCase() == searchStr.toLowerCase())
                return true;
        }
        return false;
    },

    remove : function(arr, element) {
        var elementPosition = Evernote.ArrayExtension.indexOf(arr, element);
        if(elementPosition != -1) {
            var rest = arr.slice(elementPosition  + 1 || arr.length);
            arr.length = elementPosition;
            return arr.push.apply(arr, rest);
        }
    },

    filter : function(arr, fun) {
        var len = arr.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in arr) {
                var val = arr[i];
                if (fun.call(thisp, val, i, arr))
                {
                    res.push(val);
                }
            }
        }
        return res;
    }
};
