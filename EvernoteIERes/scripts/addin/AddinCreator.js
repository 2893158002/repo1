Evernote.AddinCreator = {

    SUPPORTED_ADDINS : ["YinXiangBiJiIE.Addin.2"],

    create : function(version) {
        var addinIndex = this.getAddinIndexForIE(version);
        return new ActiveXObject( this.SUPPORTED_ADDINS[addinIndex] );
    },

    getAddinIndexForIE : function(version) {
        return 0;
    }
};