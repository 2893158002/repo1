/**
 * Created by chizhikov on 11.04.14.
 */

function ScreenshotVeil() {
    var areaEl = document.createElement('div');
    areaEl.id = 'evernoteScreenShotArea';

    var startX, startY = 0;

    var global_tools = Evernote.JQuery('#' + Constants.CLIP_DIALOG_ID);
    var area = Evernote.JQuery(areaEl);
    var selecting = false;

    var startVertLine = document.createElement('div');
    var startHorizLine = document.createElement('div');

    startVertLine.className = 'screenAreaStartVertLine';
    startHorizLine.className = 'screenAreaStartHorizLine';

    var borderDiv = document.createElement('div');
    borderDiv.id = 'screenAreaSelected';

    areaEl.appendChild(startVertLine);
    areaEl.appendChild(startHorizLine);
    areaEl.appendChild(borderDiv);

    function sendMessageToPopup( msg ){
        // send message to global tools

        var zoomModifier = screen.deviceXDPI / screen.logicalXDPI;

        with (borderDiv.style) {
            var topX = pixelLeft * zoomModifier;
            var topY = pixelTop * zoomModifier;
            var bottomX = (area.width() - pixelRight) * zoomModifier;
            var bottomY = (area.height() - pixelBottom) * zoomModifier;
        }

        // If any side of the rectangle that user is drawing is smaller than 16px then we interpret it as a
        // single click and should make a fullscreen capture.

        var rectWidth = Math.abs(topX - bottomX);
        var rectHeight = Math.abs(topY - bottomY);
        if (rectWidth < 16 || rectHeight < 16) {
            topX = 0;
            topY = 0;
            bottomX = area.width();
            bottomY = area.height();
        }

        global_tools.trigger(msg ,[topX,topY , bottomX, bottomY]);
    }

    function drawLines(e) {
        startVertLine.style.pixelLeft = e.clientX;
        startHorizLine.style.pixelTop = e.clientY;

        if (selecting) {
            drawRect(startX, startY, e.clientX, e.clientY);
            // TODO: prevent selection
        }
    }

    function drawRect( startX, startY, mouseX, mouseY) {
        var topX, topY, bottomX, bottomY;

        topX = Math.min(startX, mouseX);
        topY = Math.min(startY, mouseY);
        bottomX = Math.max(startX, mouseX);
        bottomY = Math.max(startY, mouseY);

        borderDiv.style.pixelTop = topY;
        borderDiv.style.pixelLeft = topX;
        borderDiv.style.pixelRight = area.width() - bottomX - 1;
        borderDiv.style.pixelBottom = area.height() - bottomY -1;
    }

    function clearSelectedAreaPosition() {
        borderDiv.style.pixelRight = '';
        borderDiv.style.pixelBottom = '';
        borderDiv.style.pixelTop = '';
        borderDiv.style.pixelLeft = '';
        selecting = false;
    }

    function startSelectArea(e) {
        if (e.button != 0)
            return;
        if (Evernote.JQuery(e.target).closest('#' + Constants.CLIP_DIALOG_NEW_ID).length == 0) {
            selecting = true;
            startX = e.clientX;
            startY = e.clientY;
        }
        e.preventDefault();
    }

    function selectionEnd(e) {
        if (!selecting) return;

        if (Evernote.JQuery(e.target).closest('#cancelButton').length == 0 &&
            Evernote.JQuery(e.target).closest('#closeSidebar').length == 0 ) {
            sendMessageToPopup('readyToScreenshot');
        } else {
            sendMessageToPopup('cancelScreenshot');
        }
        hide();
        clearSelectedAreaPosition();
    }

    function disableContextMenu(e) {
        e.preventDefault();
        return false;
    }

    function show() {
        document.addEventListener('mousemove', drawLines);
        document.addEventListener('mousedown', startSelectArea);
        document.addEventListener('mouseup', selectionEnd);
        document.addEventListener('contextmenu', disableContextMenu);

        // TODO: remove scroll from page
        area.addClass('visible');

        Evernote.JQuery('body').css('overflow','hidden');
    }

    function hide() {
        area.removeClass('visible');
        clearSelectedAreaPosition();
        document.removeEventListener('mousemove', drawLines);
        document.removeEventListener('mousedown', startSelectArea);
        document.removeEventListener('mouseup', selectionEnd);
        document.removeEventListener('contextmenu', disableContextMenu);

        Evernote.JQuery('body').css('overflow','visible');
    }

    document.body.appendChild(areaEl);

    this.show = show;
    this.hide = hide;
}