// todo: border-radius

function EvernoteCustomScroll (container, list) {

    var MOUSE_MOVE_LAG = 15;
    var SCROLL_LAG = 25;


    var isDragged = false;
    var mouseMoveTimer = 0;

    var bar = document.createElement('div');
    bar.className = "evn-custom-scrollbar";
    bar.onselectstart = "return false";
    container.append(bar);

    bar = Evernote.JQuery(bar);
    var doc = Evernote.JQuery(document);


    var shiftPercent;
    var clickPoint, barTopPositionOnClick;
    var maxListDrift, currentDrift, listFullHeight, listVisibleHeight, barH, maxBarDrift;


    function clipValue( minBound, value, maxBound ) {
        // Check, if value fits bounds. Otherwise, returns closest bound
        if (value < minBound) {
          return minBound;
        } else {
          return Math.min(maxBound, value);
        }
    }

    function throttle(ms, callback) {
        var lastCall=0;

        return function() {
            var now = new Date().getTime(),
                diff = now - lastCall;
            if (diff >= ms) {
                lastCall = now;
                callback.apply(this, arguments);
            }
        };
    }

    function mouseMove(e){
        var now = new Date().getTime();
        var diff = now - mouseMoveTimer;

        if (diff >= MOUSE_MOVE_LAG) {
            mouseMoveTimer = now;
            var mouseShift  = e.clientY - clickPoint;
            var newPos = clipValue(0, mouseShift + barTopPositionOnClick, maxBarDrift);

            shiftPercent  = (newPos / (maxBarDrift / 100)).toFixed();

            bar.css({top: newPos});

            moveContent();
        }
    }


    function barMouseDown(e){
        isDragged = true;

        clickPoint = e.clientY;
        barTopPositionOnClick = parseInt(bar.css('top'));

        e.returnValue = false;

        document.attachEvent('onmousemove',mouseMove);
    }

    function barMouseUp(){
        if (isDragged); else return;
        isDragged = false;

        document.detachEvent('onmousemove',mouseMove);
    }

    function moveContent(){
        var topOff = maxListDrift * (shiftPercent  / 100);
        topOff = topOff.toFixed();

        list.scrollTop(topOff);
    }

    function moveBar() {
        var topOff = maxBarDrift * (shiftPercent  / 100);
        topOff = topOff.toFixed();

        bar.css({top: topOff + 'px'});
    }

    function resizeBar() {
        if (listFullHeight <= listVisibleHeight) {
            bar.hide();
            return;
        }

        bar.height(barH);
        var marginIfNeeded = list.prop('offsetTop');

        if (marginIfNeeded > 0)
        bar.css('margin-top', marginIfNeeded);
        bar.show();
    }

    function scrollToEl( el ) {
        var elem = Evernote.JQuery(el).get(0);
        try {
            elem.scrollIntoView();
        } catch (e) {
        }
    }

    function syncBarAndList() {
        update();
        resizeBar();
        moveBar();
    }

    function update(){
        listFullHeight = list.prop('scrollHeight');
        listVisibleHeight = list.height();
        maxListDrift = listFullHeight - listVisibleHeight;
        currentDrift = list.scrollTop();
        barH = (listVisibleHeight * listVisibleHeight / listFullHeight).toFixed();
        maxBarDrift = listVisibleHeight - barH;

        shiftPercent  = (currentDrift / (maxListDrift / 100)).toFixed();
    }

    function init() {
        bar.mousedown(barMouseDown);
        doc.mouseup(barMouseUp);
        list.scroll(throttle( SCROLL_LAG, syncBarAndList));
        syncBarAndList();
    }

    init();

    this.updateScrollbar = syncBarAndList;
    this.scrollToEl = scrollToEl;
}