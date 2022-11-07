Evernote.PostClipPopup = function(doc) {

    var elem = Evernote.JQuery('#' + Constants.POST_CLIP_DIALOG_ID);
    var clipboard_container = elem.find('#' + 'evn-clipboardCopy-container');

    var titleField = elem.find('.noteTitle');
    var link = Evernote.pageInfo.getUrl();
    var shareTitle = 'error';

    // subscribe to response from addin
    Evernote.ResponseReceiver.subscribe(this);

    var _title = '';
    var _notebook = '';
    var clipping_message = Evernote.Addin.getLocalizedMessage(Evernote.Messages.CLIPPING);
    var clipped_message = Evernote.Addin.getLocalizedMessage(Evernote.Messages.CLIPPED);

    var message = elem.find('.clippedMessage');
    var closeButton = elem.find('.closeCross');
    var openButton  = elem.find('#openButton');
    var shareButton  = elem.find('#shareButton');
    var shareIcons = elem.find('.shareButton');

    var cbInput = elem.find('.evn-pcp-clipboard-input');
    var cbMessage = elem.find('.evn-pcp-clipboard-message');
    var cbButton = elem.find('.evn-pcp-clipboard-button');

    var errorLink = elem.find('#evn-show-logs');
    var errorMsg = elem.find('.evn-error-desc');


    function showLogs() {
        var logFile = Evernote.Addin.getPath("logfile");
        Evernote.Addin.openLocalFile(logFile, BrowserNavConstants.NAVOPENNEWTAB);
    }

    function modifyToCurrentIE() {
        if (document.documentMode == '9') {
            elem.addClass('evn-iexplorer9');
        } else if (document.documentMode == '7' || Evernote.BrowserDetection.isIE7()) {
            elem.addClass('evn-iexplorer7');
        }
    }

    function finishPostClip () {
        endProcessingAndClose();
//        if (Evernote.Options.postClip.show == true) {
//            endProcessing();
//        } else {
//            endProcessingAndClose();
//        }
    }

    function localize() {
        Evernote.GlobalUtils.localize(elem.get(0));
    }

    function copyToClipboard(){
        var clipSucceed = window.clipboardData.setData('Text', link);

        var isAllowed = window.clipboardData.getData('Text');
        if (isAllowed == "") { // Could be empty, or failed
            // Verify failure
            if (!window.clipboardData.setData('Text', 'test_string'))
                isAllowed = null;
        }

        if (clipSucceed && isAllowed) {
            clipboard_container.addClass('evn-success');
            cbMessage.text(Evernote.Addin.getLocalizedMessage(Evernote.Messages.URL_COPIED));
        } else {
            clipboard_container.addClass('evn-failed');
            cbMessage.text(Evernote.Addin.getLocalizedMessage(Evernote.Messages.DISABLED));
        }

    }

    function handleShareIconClick ( evt ) {
        var id = evt.srcElement.id || Evernote.JQuery(evt.target).closest('table').attr('id');

        if (id == 'clipboard') {
            elem.addClass('evn-clipboard-mode');
        } else {
            Evernote.Share.toSocial( id , link, shareTitle);
        }
    }

    function fillOutPopup(title, notebook) {
        _title = title;
        _notebook = notebook;

        titleField.html(title);
        cbInput.val(link);
        shareTitle = title;
    }

    function renderErrorMessage( error ) {

        if (error.code == Evernote.ErrorCodes.AUTHENTICATION_ERROR) {
            errorMsg.html(error.message);
        }

        elem.removeClass('processing');
        elem.addClass('evn-error-mode');
    }

    function processError(error) {
        renderErrorMessage(error);
        elem.show();
        return true;
    }

    function endProcessing() {
        elem.removeClass('processing');
        Evernote.ClearlyController.removeHighlighted();
        message.html(clipped_message + ' ' + _notebook);
    }

    function endProcessingAndClose() {
        elem.removeClass('processing').addClass('withoutShare');
        Evernote.ClearlyController.removeHighlighted();
        message.html(clipped_message + ' ' + _notebook);

        setTimeout(function(){
            hide();
        }, 1000);
    }

    function setProcessing() {
        elem.addClass('processing');
        message.html('<span class="evn-processing-status">' + clipping_message + '</span>' + _title);
    }

    function show() {
        setProcessing();
        addListeners();
        elem.show();
        elem.addClass('visible');
    }

    function hide() {
        removeListeners();
        elem.hide();
        elem.removeClass('visible');
        elem.removeClass('evn-error-mode');
        elem.removeClass('withoutShare');
        elem.removeClass('evn-clipboard-mode');
        clipboard_container.removeClass();
        cbMessage.text(Evernote.Addin.getLocalizedMessage(Evernote.Messages.SOURCE_LINK));
    }

    function onClickOutside(e) {
        if (Evernote.JQuery(e.target).closest('#' + Constants.POST_CLIP_DIALOG_ID).length == 0) {
            hide();
        }
    }

    function onKeyPressed(e) {
        if (e.keyCode == 27) {
            hide();
        }
    }

    function onDataReceived(response) {
        if (response.type == 'clipped') {
            finishPostClip();
        }
    }

    function addListeners() {
        Evernote.JQuery(document).on('click', onClickOutside);
        Evernote.JQuery(document).on('keydown',onKeyPressed);
    }

    function removeListeners() {
        Evernote.JQuery(document).off('click',onClickOutside);
        Evernote.JQuery(document).off('keydown',onKeyPressed);
    }

    closeButton.click(hide);
    shareIcons.click(handleShareIconClick);
    cbButton.click(copyToClipboard);

    errorLink.click(showLogs);

    elem.on('errorShown', hide);

    localize();
    modifyToCurrentIE();

    this.fillOutPopup = fillOutPopup;
    this.endProcessing = endProcessing;
    this.endProcessingAndClose = endProcessingAndClose;
    this.show = show;
    this.hide = hide;

    this.processError = processError;
    this.onDataReceived = onDataReceived;
};