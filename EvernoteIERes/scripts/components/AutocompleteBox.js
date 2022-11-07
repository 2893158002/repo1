Evernote.AutoCompleteBox = function(data, component, callbacks, modern) { // [{name, id},{name, id}...] of tags, input element, {} with callbacks
    this.callbacks = {
        onSelect: null,
        onRemoveLastTag: null
    };
    if(callbacks) {
        this.callbacks = Evernote.JQuery.extend(this.callbacks, callbacks);
    }
    this.data = [];
    if(data) {
        for(var i in data) {
            if(data.hasOwnProperty(i)) {
                this.data[data[i].uid] = data[i];
            }
        }
    }
    this._disableBlur = false;
    this.modern = modern;
    this.showedData = [];
    this.selectedTags = [];
    this.component = component;
    this.init();
    //Define list of char codes that will trigger new tag adding
    this.STOP_CODES = [13 /* ENTER KEY */];
    this.TAG_SEPARATOR = ",";
};

Evernote.AutoCompleteBox.prototype.init = function() {
    Evernote.JQuery("#evernote-popup-container").append(this.buildDom());
    this.component = Evernote.JQuery(this.component);
    this.component.keyup(Evernote.JQuery.proxy(this.onKeyPress, this));
    this.component.keydown(Evernote.JQuery.proxy(this.onKeyDown, this));
    this.component.on('click',Evernote.JQuery.proxy(this.hide,this));
    this.component.blur(Evernote.JQuery.proxy(this.onBlur, this));
};

/**
 * Completely reloads data for current autocomplete control with new passed data.
 * @param data
 */
Evernote.AutoCompleteBox.prototype.updateData = function(data) {
    if(data) {
        this.data = [];
        for(var i in data) {
            if(data.hasOwnProperty(i)) {
                this.data[data[i].uid] = data[i];
            }
        }

        this.data.sort( function(a, b)
        {
            var str1 = a.name.toString().toLowerCase();
            var str2 = b.name.toString().toLowerCase();
            if (str1 < str2) return -1;
            if (str1 > str2) return 1;
            return 0;
        });
    }
};

Evernote.AutoCompleteBox.prototype.buildDom = function() {
    this.panel = Evernote.JQuery("<div class='evernote-autocomplete-panel'/>");
    this.container = Evernote.JQuery("<div class='evernote-autocomplete-container'/>");
    this.list = Evernote.JQuery("<div class='evernote-autocomplete-list'/>");
    var self = this;

    Evernote.Utils.fixedPosition(window, this.panel, function() {
        return self.component.offset().top + self.component.outerHeight();
    });

    this.panel.mouseleave(Evernote.JQuery.proxy(this.enableSelfClose, this));
    this.panel.mouseenter(Evernote.JQuery.proxy(this.disableSelfClose, this));


    this.container.css('max-height','120px');
    this.container.append(this.list);

    if (this.modern) {
        this.container.mCustomScrollbar({
            theme: 'evernote',
            scrollInertia:400
        });
    } else {
        this.sc = new EvernoteCustomScroll( this.container, this.list);
    }

    this.panel.append(this.container);

    return this.panel;
};

Evernote.AutoCompleteBox.prototype.disableSelfClose = function(){
    this._disableBlur = true;
};

Evernote.AutoCompleteBox.prototype.enableSelfClose = function(){
    this._disableBlur = false;
    this.component.focus();
};

Evernote.AutoCompleteBox.prototype.onKeyDown = function(e) {
    if( (this.isArrowDown(e.keyCode) || this.isArrowUp(e.keyCode) ) && this.panel.is(":visible")) {
        var currentHoverElement = this.panel.find(".evernote-hover");
        var nextHoverElement = currentHoverElement.next();
        if(this.isArrowUp(e.keyCode)) {
            nextHoverElement = currentHoverElement.prev();
        }
        if(currentHoverElement.length == 0) {
            currentHoverElement = this.panel.find(".autocomplete-item:first");
            nextHoverElement = currentHoverElement;
        }
        if(nextHoverElement.length == 0) {
            nextHoverElement = currentHoverElement;
        }
        currentHoverElement.removeClass("evernote-hover");
        nextHoverElement.addClass("evernote-hover");
        e.stopPropagation();
    } else if(this.isEnter(e.keyCode) || this.isTab(e.keyCode)) {
        if(this.panel.is(":visible")) {
            var currentHoverElement = this.panel.find(".evernote-hover");
            if(currentHoverElement.length == 1) {
                this.selectItem({target: currentHoverElement});
                e.stopPropagation();
                return false;
            }
        }
        this.onBlur();
        e.stopPropagation();
        return false;
    } else if(this.isBackspace(e.keyCode) && this.component.val().length == 0) {
        if(this.callbacks.onRemoveLastTag) {
            this.callbacks.onRemoveLastTag();
            e.stopPropagation();
        }
    } else if(this.isStopCode(e.keyCode)) {
        this.onBlur();
        e.stopPropagation();
        return false;
    }
    e.stopPropagation();
};

Evernote.AutoCompleteBox.prototype.isArrowUp = function(code) {
    return code == 38;
};

Evernote.AutoCompleteBox.prototype.isArrowDown = function(code) {
    return code == 40;
};

Evernote.AutoCompleteBox.prototype.isEnter = function(code) {
    return code == 13;
};

Evernote.AutoCompleteBox.prototype.isTab = function(code) {
    return code == 9;
};

Evernote.AutoCompleteBox.prototype.isBackspace = function(code) {
    return code == 8;
};

Evernote.AutoCompleteBox.prototype.isStopCode = function(code) {
    return Evernote.ArrayExtension.indexOf(this.STOP_CODES, code) >= 0;
};

Evernote.AutoCompleteBox.prototype.onKeyPress = function(e) {
    this.filter();
    this.showData();
};

Evernote.AutoCompleteBox.prototype.filter = function() {
    this.showedData = [];
    var currentValue = this.component.val();
    if(currentValue) {
        var tags = currentValue.split(this.TAG_SEPARATOR);
        if(tags.length > 1) {
            this.hide();
            for(var j = 0; j < tags.length - 1; j++) {
                this.selectItemByName(tags[j]);
            }
            currentValue = tags[tags.length-1];
            this.component.val(currentValue);
        }
        if(currentValue.length > 0) {
            for(var i in this.data) {
                if(this.data.hasOwnProperty(i)) {
                    if(this.canAddTag(this.data[i], currentValue)) {
                        this.showedData[i] = this.data[i].name;
                    }
                }
            }
        }
    }
};

Evernote.AutoCompleteBox.prototype.canAddTag = function(tag, startingPart) {
    return tag && tag.name.toLowerCase().indexOf(startingPart.toLowerCase()) == 0 && Evernote.ArrayExtension.indexOf(this.selectedTags, tag.name.toLowerCase()) == -1
};

Evernote.AutoCompleteBox.prototype.showData = function() {

    var currentlyShownElements = this.panel.find(Evernote.Utils.format("div[data-id]"));
    for(var i = 0; i < currentlyShownElements.length; i++) {
        var elem = Evernote.JQuery(currentlyShownElements[i]);
        var id = parseInt(elem.attr("data-id"));
        if(!this.showedData[id]) {
            elem.remove();
        } else {
            delete this.showedData[id];
        }
    }

    var tempData = [];
    for(var i in this.showedData) {
        if(this.showedData[i] && this.showedData.hasOwnProperty(i)) {
            var el = {
                name: this.showedData[i],
                id: i
            };
            tempData.push(el);
        }
    }

    tempData.sort( function(a, b)
    {
        var str1 = a.name.toString().toLowerCase();
        var str2 = b.name.toString().toLowerCase();
        if (str1 < str2) return -1;
        if (str1 > str2) return 1;
        return 0;
    });

    for(var j = 0; j < tempData.length; j++) {
        this.addEntry(tempData[j].id, tempData[j].name);
    }

    setTimeout(Evernote.JQuery.proxy(this.showIfNeeded, this),0);
};

Evernote.AutoCompleteBox.prototype.showIfNeeded = function() {
    if(this.panel.find('.autocomplete-item').length > 0) {
        this.panel.show();
        this.list.find("div:not(:first)").addClass("descendant-item");

        this.panel.offset({
//            left: this.component.offset().left,
            top: this.component.offset().top + this.component.outerHeight() + 10
        });

        if (this.modern) {
            this.container.mCustomScrollbar('update');
            this.container.mCustomScrollbar('scrollTo','.evernote-hover');
        } else {
            this.sc.updateScrollbar();
            this.sc.scrollToEl('.evernote-hover');
        }
    }
    else {
        this.panel.hide();
    }
};

Evernote.AutoCompleteBox.prototype.addEntry = function(id, value) {
    var elem = Evernote.JQuery(Evernote.Utils.format("<div class='autocomplete-item' title='{1}' data-id='{0}' data-name='{1}' >{2}</div>", id, value, Evernote.GlobalUtils.escapeXML(Evernote.Utils.cutToLength(value, 25))));
    this.list.append(elem);
    elem.bind("mousedown", Evernote.JQuery.proxy(this.selectItem, this));
    elem.hover(this.onHoverEntry, this.onUnHoverEntry);
};

Evernote.AutoCompleteBox.prototype.onHoverEntry = function() {
    Evernote.JQuery(this).addClass("evernote-hover");
};

Evernote.AutoCompleteBox.prototype.onUnHoverEntry = function() {
    Evernote.JQuery(this).removeClass("evernote-hover");
};

Evernote.AutoCompleteBox.prototype.onBlur = function() {
    if (this._disableBlur) return;
    this.hide();
    this.selectCurrentItem();
};

Evernote.AutoCompleteBox.prototype.hide = function() {
    this.panel.hide();
};

Evernote.AutoCompleteBox.prototype.isEmptyTag = function(tagName) {
    return Evernote.JQuery.trim(tagName).length == 0;
};

Evernote.AutoCompleteBox.prototype.isExistingTag = function(tagName) {
    return Evernote.ArrayExtension.indexOf(this.selectedTags, tagName.toLowerCase()) != -1;
};

Evernote.AutoCompleteBox.prototype.selectItemByName = function(tagName) {
    if(!this.isEmptyTag(tagName)) {
        tagName = Evernote.JQuery.trim(tagName);
        if(this.isExistingTag(tagName)) {
            this.component.val("");
            this.hide();
        } else {
            this.selectedTags.push(tagName.toLowerCase());
            if(this.callbacks.onSelect) {
                this.callbacks.onSelect(tagName);
            }
        }
    }
};

Evernote.AutoCompleteBox.prototype.selectCurrentItem = function() {
    this.selectItemByName(this.component.val());
};

Evernote.AutoCompleteBox.prototype.clearSelectedTags = function() {
    this.selectedTags = [];
};

Evernote.AutoCompleteBox.prototype.removeTagFromSelection = function(tagName) {
    Evernote.ArrayExtension.remove(this.selectedTags, tagName.toLowerCase());
};

Evernote.AutoCompleteBox.prototype.selectItem = function(e) {
    Evernote.Logger.debug("AutoCompleteBox: selectItem");
    var target;
    if(e && e.target) {
        target = Evernote.JQuery(e.target);
    }
    this.hide();
    if(target) {
        var tagName = target.attr("data-name");
        this.selectItemByName(tagName);
    }

};