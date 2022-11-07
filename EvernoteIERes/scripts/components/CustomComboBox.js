function CustomCombobox(data, options) {
    this.options = {
        openByTitleClick: true,
        openElement : null,
        alignTo: null,
        onShow: null,
        onSelect: null,
        markSelected: false,
        widthByAlign: false,
        append: function(parent, content) {
            Evernote.JQuery(parent).append(content);
        }
    };
    if(data) {
        this.data = data;
    }
    if(options) {
        this.options = Evernote.JQuery.extend(this.options, options);
    }
    this.element = null;
    this.groups = {};
}

CustomCombobox.prototype.setSelected = function(selectedId) {
    Evernote.Logger.debug("CustomCombobox:setSelected");
    if(this.selectorFloatPanel) {
        this.selectItem({currentTarget: this.selectorFloatPanel.find("div[data-id='" + selectedId + "']")});
    }
    Evernote.Logger.debug("CustomCombobox:setSelected:end");
};

CustomCombobox.prototype.updateData = function(data) {
    if(data) {
        this.data = data;
    }
};

CustomCombobox.prototype.addData = function(data) {
    Evernote.Logger.debug("CustomCombobox:addData");
    if(!this.data)
        this.data = data;
    else {
        this.data.concat(data);
    }
};

CustomCombobox.prototype.addGroupData = function( title ,data) {
    Evernote.Logger.debug("CustomCombobox:addGroupData");
    if(this.groups[title])
        this.groups[title].concat(data);
    else {
        this.groups[title] = data;
    }
};

CustomCombobox.prototype.append = function(parent) {
    this.options.append(parent, this.buildDOM());
};

CustomCombobox.prototype.refresh = function() {
    var parent = Evernote.JQuery(this.element).parent();
    Evernote.JQuery(this.element).remove();
    this.options.append(parent, this.buildDOM());
};

CustomCombobox.prototype.buildList = function(parent, data) {
    for(var i in data) {
        if(data.hasOwnProperty(i) && !data[i].hidden) {

            var notebook = Evernote.GlobalUtils.escapeXML(data[i].name);
            var owner = (data[i].author)? data[i].author : "";

            if (owner.indexOf("_business_") == 0)
                owner = owner.substr(10);

            var result = Evernote.Utils.mergeCustomComboBoxStrings(notebook, owner,
                                                                   this.options.ownedByLocalizedString,
                                                                   this.options.maxStringLength);

            var item = Evernote.JQuery(Evernote.Utils.format("<div class='selector-item' data-id='{0}' title='{1}'>{2}</div>", data[i].uid, result.title, result.note));
            if (result.own.length)
                item.append(Evernote.Utils.format("<span class='description-item' title='{0}'>{1}</span>",result.title, result.own));

            item.click(Evernote.JQuery.proxy(this.selectItem, this));
            if(Evernote.Utils.isQuirkMode()) {
                item.hover(this.hoverSelectableElement, this.hoverOutSelectableElement);
            }
            Evernote.JQuery(parent).append(item);
        }
    }
};

CustomCombobox.prototype.buildDOM = function() {
    var result = Evernote.JQuery("<div class='custom-selector'/>");
    var selectedElement = this.data.length > 0 ? this.data[0] : {uid: "-1", name: ""};
    var formattedName = Evernote.Utils.mergeCustomComboBoxStrings(selectedElement.name, "",
        this.options.ownedByLocalizedString,
        this.options.maxStringLength);
    selectedElement.name = formattedName.note;
    this.selectedItemPanel = Evernote.JQuery(Evernote.Utils.format("<div class='selected-item-panel' data-id='{0}'>{1}</div>", selectedElement.uid, selectedElement.name));
    var showSelectorFn = Evernote.JQuery.proxy(this.showFloatPanel, this);
    if(this.options.openByTitleClick) {
        this.selectedItemPanel.click(showSelectorFn);
        Evernote.GlobalUtils.absolutizeImages(this.selectedItemPanel.get(0), "images/icon_down_padded.png");
    }
    if(this.options.openElement) {
        this.options.openElement.click(showSelectorFn);
    }
    result.append(this.selectedItemPanel);
    var floatPanelClass = "evernote-selector-float-panel";
    if(this.options.floatPanelAdditionalClass) {
        floatPanelClass += " " + this.options.floatPanelAdditionalClass;
    }
    this.selectorFloatPanel = Evernote.JQuery("<div class='" + floatPanelClass + "'/>");

    var alignElement = this.options.alignTo || this.selectedItemPanel;

    Evernote.Utils.fixedPosition(window, this.selectorFloatPanel, function() {
        return alignElement.offset().top + alignElement.outerHeight();
    });

    this.animatedPanel = Evernote.JQuery("<div class='animated-panel'/>");
    this.buildList(this.animatedPanel, this.data);

    if(this.groups.length != 0) {
        for(var groupTitle in this.groups) {
            if(this.groups[groupTitle].length != 0) {
                var groupItem = Evernote.JQuery(Evernote.Utils.format("<div class='group-item'><div class='group-title'>{0}</div></div>", groupTitle));
                this.buildList(groupItem, this.groups[groupTitle]);
                this.animatedPanel.append(groupItem);
            }
        }
    }
    this.selectorFloatPanel.append(this.animatedPanel);
    if(Evernote.Utils.isQuirkMode()) {
        this.selectorFloatPanel.addClass("evernote-selector-float-panel-quirk-mode");
    }
    Evernote.JQuery("body").append(this.selectorFloatPanel);
    this.element = result;
    return result;
};

CustomCombobox.prototype.hoverOutSelectableElement = function() {
    Evernote.JQuery(this).removeClass("evernote-hover");
};

CustomCombobox.prototype.hoverSelectableElement = function() {
    Evernote.JQuery(this).addClass("evernote-hover");
};

CustomCombobox.prototype.getSelectedId = function() {
    if(this.selectedItemPanel) {
        return this.selectedItemPanel.attr("data-id");
    }
};

CustomCombobox.prototype.showFloatPanel = function(e) {
    Evernote.Logger.debug("CustomCombobox:showFloatPanel");
    if(this.selectorFloatPanel) {
        e.stopPropagation();
        if(!this.selectorFloatPanel.is(":visible")) {
            var alignElement = this.options.alignTo || this.selectedItemPanel;
            this.selectorFloatPanel.show();
            if(this.options.onShow) {
                this.options.onShow();
            }
            if(this.options.widthByAlign) {
                this.selectorFloatPanel.width(alignElement.width());
            }
            this.hideOnClick = Evernote.JQuery.proxy(this.hideFloatPanel, this);

            if (document.attachEvent)
                document.attachEvent("onclick", this.hideOnClick);
            else if (document.addEventListener)
                document.addEventListener("click", this.hideOnClick, false);
            else
                Evernote.Logger.error( "CustomCombobox.showFloatPanel() can't attachEvent" );

            var self = this;
            if(!this.alreadySetStyle) {
                this.alreadySetStyle = true;
                setTimeout(function() {
                    var topPosition = alignElement.offset().top + alignElement.outerHeight();
                    var leftPosition = alignElement.offset().left + parseInt(alignElement.css("padding-left"));
                    if(!Evernote.Utils.isQuirkMode()) {
                        topPosition -= Evernote.Utils.scrollTop();
                        leftPosition -= Evernote.Utils.scrollLeft();
                    }
                    self.selectorFloatPanel.offset({
                        top: topPosition,
                        left: leftPosition
                    });
                }, 0);
            }
            if(Evernote.Utils.isQuirkMode()) {
                this.selectorFloatPanel.css("position", "absolute");
            }
        } else {
            this.hideFloatPanel();
        }
    }
    Evernote.Logger.debug("CustomCombobox:showFloatPanel end");
};

CustomCombobox.prototype.hideFloatPanel = function() {
    Evernote.Logger.debug("CustomCombobox: hideFloatPanel start");
    if(this.selectorFloatPanel && this.selectorFloatPanel.is(":visible")) {
        Evernote.Logger.debug("CustomCombobox: hideFloatPanel: panel is visible: hide it");
        this.selectorFloatPanel.hide();
        if(this.hideOnClick) {
            if (document.attachEvent)
                document.detachEvent("onclick", this.hideOnClick);
            else if (document.addEventListener)
                document.removeEventListener ("click", this.hideOnClick, false);
            this.hideOnClick = undefined;
        }
    }
    Evernote.Logger.debug("CustomCombobox: hideFloatPanel: end");
};

CustomCombobox.prototype.selectItem = function(e) {
    Evernote.Logger.debug("CustomCombobox: selectItem start");
    var target;
    if(e && e.currentTarget) {
        target = Evernote.JQuery(e.currentTarget);
    }

    if(target && this.selectedItemPanel) {
        var selectedId = target.attr("data-id");
        //We should not allow to select disabled action, just ignore this call.
        if(target.hasClass("evernote-action-disabled"))
        {
            if(e.stopPropagation)
                e.stopPropagation();
            if(e.preventDefault)
                e.preventDefault();
            return;
        }
        if(selectedId) {
            if(this.options.markSelected) {
                Evernote.JQuery(".selector-item", this.selectorFloatPanel).removeClass("selected");
                Evernote.JQuery(".selector-item", this.selectorFloatPanel).css("background-image","none");
                target.addClass("selected");
                Evernote.GlobalUtils.absolutizeImages(Evernote.JQuery(e.currentTarget).get(0),"images/check_mark.png");
            }

            var title = target.attr("title");
            this.selectedItemPanel.text(target.text());
            this.selectedItemPanel.attr("title", title? title : "");
            this.selectedItemPanel.attr("data-id", selectedId);
            if(e && e.stopPropagation) {
                e.stopPropagation();
            }
            this.hideFloatPanel();
            if(this.options.onSelect) {
                this.options.onSelect(selectedId);
            }
        }
    }
    Evernote.Logger.debug("CustomCombobox: selectItem end");
};

CustomCombobox.prototype.disableItem = function(itemId) {
    Evernote.Logger.debug("CustomCombobox: disableItem start");
    if(this.selectorFloatPanel) {
        this.selectorFloatPanel.find("div[data-id='" + itemId + "']").addClass("evernote-action-disabled");
    }
    Evernote.Logger.debug("CustomCombobox: disableItem end");
};

CustomCombobox.prototype.enableItem = function(itemId) {
    Evernote.Logger.debug("CustomCombobox: enableItem start");
    if(this.selectorFloatPanel) {
        this.selectorFloatPanel.find("div[data-id='" + itemId + "']").removeClass("evernote-action-disabled");
    }
    Evernote.Logger.debug("CustomCombobox: enableItem end");
};

CustomCombobox.prototype.hideItem = function(itemId) {
    Evernote.Logger.debug("CustomCombobox: hideItem start");
    if(this.selectorFloatPanel) {
        this.selectorFloatPanel.find("div[data-id='" + itemId + "']").hide();
    }
    Evernote.Logger.debug("CustomCombobox: hideItem end");
};

CustomCombobox.prototype.showItem = function(itemId) {
    Evernote.Logger.debug("CustomCombobox: showItem start");
    if(this.selectorFloatPanel) {
        this.selectorFloatPanel.find("div[data-id='" + itemId + "']").show();
    }
    Evernote.Logger.debug("CustomCombobox: showItem end");
};