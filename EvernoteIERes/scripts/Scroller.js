Evernote.Scroller = function Scroller( tab ) {
    this.initialize( tab );
};

Evernote.Scroller.prototype._tab = null;

Evernote.Scroller.prototype.initialize = function ( tab ) {
    this._tab = tab;
    var scrollX = (this._tab.pageXOffset !== undefined) ? this._tab.pageXOffset : (this._tab.document.documentElement || this._tab.document.body.parentNode ||this._tab.document.body).scrollLeft;
    var scrollY = (this._tab.pageYOffset !== undefined) ? this._tab.pageYOffset : (this._tab.document.documentElement || this._tab.document.body.parentNode || this._tab.document.body).scrollTop;
    this.initialPoint = {
        x: scrollX,
        y: scrollY
    };
};

Evernote.Scroller.prototype.scrollTo = function ( endPoint, time, resolution ) {
    this.abort();

    this.endPoint = endPoint;
    this.step = 0;
    this.calculatePath( time, resolution );
    var self = this;
    this.proc = setInterval( function () {
            if ( !self.doScroll() ) {
                self.abort();
            }
        },
        resolution );
};

Evernote.Scroller.prototype.calculatePath = function ( time, resolution ) {
    this.path = [];
    var sx = this.initialPoint.x;
    var sy = this.initialPoint.y;
    var ex = this.endPoint.x;
    var ey = this.endPoint.y;
    var k = (Math.PI * resolution) / time;
    for ( var i = -(Math.PI / 2); i < (Math.PI / 2); i += k ) {
        var c = ((1 + Math.sin( i )) / 2);
        this.path.push( {
            x:(sx + c * (ex - sx)),
            y:(sy + c * (ey - sy))
        } );
    }
};

Evernote.Scroller.prototype.doScroll = function () {
    var s = this.path[++this.step];
    if ( !s ) {
        return false;
    }
    var view = this._tab.document.defaultView || this._tab;
    view.scrollTo( s.x, s.y );
    return true;
};

Evernote.Scroller.prototype.abort = function () {
    if ( this.proc ) {
        clearInterval( this.proc );
        this.proc = null;
    }
};