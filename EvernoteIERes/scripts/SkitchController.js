Evernote.SkitchController = {
    _surface : null,
    _usedTools : {},
    _cropOn : false,

    sendMessageToPopup : function( message ){
        Evernote.JQuery("#evernote-content").trigger(message);
    },

    init : function() {
        var self = this;
        window.addEventListener("resize", function() {
            if (self.isSkitching() && self._surface) {
                self.centerSkitch(self._surface.getBox().width);
            }
        });
    },

    clearSkitch : function() {
        if (this._surface) {
            this._surface.getElement().parentNode.removeChild(this._surface.getElement());
            this._surface.destroy();
        }
        this._surface = null;
        this._usedTools = {};
        this._cropOn = false;
        document.body.className = document.body.className.replace(/\s*skitchon/g, "");
        Evernote.JQuery('html').css('overflow', '');
        Evernote.JQuery('body').css('overflow', '');
        Evernote.JQuery('html').css('overflow-x', this._documentOverflowX);
        Evernote.JQuery('html').css('overflow-y', this._documentOverflowY);
        Evernote.JQuery('body').css('overflow-x', this._bodyOverflowX);
        Evernote.JQuery('body').css('overflow-y', this._bodyOverflowY);
    },

    setupSkitch : function(coord, callback, request) {
        if (this._surface) {
            callback();
            return;
        }

        var self = this;
        this._documentOverflowX = Evernote.JQuery('html').css('overflow-x');
        this._documentOverflowY = Evernote.JQuery('html').css('overflow-y');
        this._bodyOverflowX = Evernote.JQuery('body').css('overflow-x');
        this._bodyOverflowY = Evernote.JQuery('body').css('overflow-y');
        if (Evernote.JQuery('body').css('overflow') != "visible" ||
            Evernote.JQuery('body').css('overflow-x') != "visible" ||
            Evernote.JQuery('body').css('overflow-y') != "visible" )
        {
            Evernote.JQuery('body').css('overflow', 'hidden');
            Evernote.JQuery('body').css('overflow-x', 'hidden');
            Evernote.JQuery('body').css('overflow-y', 'hidden');
        }else
        {
            Evernote.JQuery('html').css('overflow', 'hidden');
            Evernote.JQuery('html').css('overflow-x', 'hidden');
            Evernote.JQuery('html').css('overflow-y', 'hidden');
        }

        var base64Image = "data:image/png;base64," + Evernote.Addin.getScreenshotBase64(document, coord);
        self._surface = Evernote.Skitch.createSurface(
                {
                    width: window.innerWidth, height: window.innerHeight,
                    allowZoom: false, url: base64Image, top: 0, left: 0, margin: 0,
                    success: function() {
                        self.sendMessageToPopup('skitchSuccess');
                        document.body.className += " skitchon";

                        self._surface.localize({
                            CROP_APPLY_TEXT: Evernote.Addin.getLocalizedMessage(Evernote.Messages.CROP_APPLY),
                            CROP_CANCEL_TEXT: Evernote.Addin.getLocalizedMessage(Evernote.Messages.CROP_CANCEL),
                            ZOOM_RESET_TEXT: Evernote.Addin.getLocalizedMessage(Evernote.Messages.ZOOM_RESET),
                            ZOOM_TIP_TEXT: Evernote.Addin.getLocalizedMessage(Evernote.Messages.ZOOM_TIP)
                        });

                        self._surface.on("toolStarted", function(tool) {
                            if (!self._usedTools[tool]) {
                                self._usedTools[tool] = 0;
                            }
                            self._usedTools[tool]++;
                            Evernote.evernotePopup.hideSubTools();
                        });
                        self._surface.on("toolStopped", function(tool) {
                            if (tool == "crop") {
                                self._cropOn = false;
                                self.sendMessageToPopup('stopCropping');
                                self.sendMessageToPopup('skitchSuccess');
                            }
                        });
                        var surfaceEvement = self._surface.getElement();
                        if (surfaceEvement && surfaceEvement.addEventListener) {
                            surfaceEvement.addEventListener("mousedown", function(evt) {
                                Evernote.evernotePopup.hideSubTools();
                            }, false);
                        }else if (surfaceEvement && surfaceEvement.attachEvent) {
                            surfaceEvement.attachEvent("onmousedown", function(evt) {
                                Evernote.evernotePopup.hideSubTools();
                            });
                        }
                        document.body.appendChild(self._surface.getElement());
                        self._surface.enableEvents();
                        self._surface.toast(Evernote.Addin.getLocalizedMessage(Evernote.Messages.SCREENSHOT_CAPTURED));
                        callback();
                    }
                }
        );
    },

    zoomIn : function () {
        if (this._surface) {
            this._surface.zoom(1.1, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
            this.centerSkitch(this._surface.getBox().width);
        }
    },

    zoomOut : function () {
        if (this._surface) {
            this._surface.zoom(1/1.1, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
            this.centerSkitch(this._surface.getBox().width);
        }
    },

    useSkitchTool : function (evt) {
        if (this._surface) {
            this._surface.useTool(evt.data.tool);
            if (evt.data.tool == "crop") {
                this._cropOn = true;
                this.sendMessageToPopup('startCropping');
            }
        }
    },

    useSkitchColor : function (evt) {
        if (this._surface) {
            this._surface.updateSelectedElementsColor(evt.data.color);
            this._surface.useColor(evt.data.color);
        }
    },

    disable : function() {
        if (this._surface) this._surface.disable();
    },

    enable : function() {
        if (this._surface) this._surface.enable();
    },

    isSkitching : function() {
        return document.body.className.indexOf("skitchon") != -1;
    },

    getImageBase64 : function(callback) {
        if (!callback)
            return;
        if (this._surface) {
            this._surface.getFileBase64(callback);
        }else {
            callback();
        }
    },

    centerSkitch : function(imgWidth) {
        if (!this._surface) {
            return;
        }
        var leftoverX = window.innerWidth - imgWidth;
        var eltWidth;
        if (leftoverX >= 20) { // partial sidebar doesn't overlap the image
            eltWidth = window.innerWidth - 20;
        } else {
            eltWidth = window.innerWidth;
        }
        this._surface.setSize(eltWidth, window.innerHeight);
        this._surface.center();
    },

    isCropping : function() {
        return this._cropOn;
    },

    cancelCrop : function() {
        if (!this._surface) {
            return;
        }
        this._surface.cancelCrop()
    }
};



