function NotebookSelector(search, searchCancel, all, scrollableContainer, callback ) {
  "use strict";

  var jq_all = all;
  var all = all[0];
  var search = search[0];
  var searchCancel = searchCancel[0];



  var userSelectedNotebook = false;
  var smartFilingSuggested = false;

  var currentResults;
  var selected;
  var stacks = {};


  var sc = new EvernoteCustomScroll(scrollableContainer, jq_all);


  searchCancel.attachEvent("onclick", function() {
    search.value = "";
    handleInput();
    search.focus();
  });

  search.attachEvent("onpropertychange", handleInput);
  search.attachEvent("onkeydown", handleKeydown);

  function addNotebookToAll(name, guid, type, owner, shareKey, linkedGuid) {
    var elt = createNotebook(name, guid, type, owner, shareKey, linkedGuid);
    all.appendChild(elt);
    return elt;
  }

  function addNotebookToStack(name, guid, type, owner, shareKey, linkedGuid, stack) {
    var elt = createNotebook(name, guid, type, owner, shareKey, linkedGuid);
    stacks[stack].appendChild(elt);
    return elt;
  }

  function addStackIfNeeded(name) {
    if (!stacks[name]) {
      var elt = createStack(name);
      all.appendChild(elt);
      return elt;
    }
  }

  function changedNotebook() {
    return userSelectedNotebook;
  }

  function createNotebook(name, guid, type, owner, shareKey, linkedGuid) {
    var elt = document.createElement("div");
    var s1 = document.createElement("span");
    var s2 = document.createElement("span");
    var ch3 = document.createElement('div');
    ch3.className = 'evn-notebook-checkmark';

    elt.setAttribute("name", name.toLowerCase());
    if (shareKey) {
      elt.setAttribute("shareKey", shareKey);
    }
    if (linkedGuid) {
      elt.setAttribute("linkedGuid", linkedGuid);
    }
    s1.innerText = name;
    elt.id = guid;
    elt.className = "notebook";
    if (type == "biz" || type == "linked") {
      elt.className += " " + type;
      elt.setAttribute("type", type);
    } else {
      elt.setAttribute("type", "pers");
    }
    if (owner) {
      s2.innerText = " (" + owner + ")";
      s2.className = 'evn-notebook-owner';
    }
    elt.attachEvent("onclick", function() {
      if (selected.guid !== elt.id) {
        select(elt, false);
      }
      userSelectedNotebook = true;
      searchCancel.click();
    });
    elt.attachEvent("onmouseover", function() {
      highlight(elt);
    });
    elt.appendChild(s1);
    elt.appendChild(s2);
    elt.appendChild(ch3);
    elt.title = name;
    if (owner) {
      elt.title += " (" + owner + ")";
    }
    return elt;
  }

  function createStack(name) {
    var elt = document.createElement("div");
    elt.className = "stack";
    var header = document.createElement("div");
    header.className = "stackHeader";
    header.innerText = name;
    elt.appendChild(header);
    stacks[name] = elt;
    return elt;
  }

  function focusEntry() {
    search.focus();
  }

  function getSelected() {
    return selected;
  }

  function handleInput() {
    if (search.value == "") {
      searchCancel.className = searchCancel.className.replace(/\s*visible/g, "");
      // show all the notebooks
      var hidden = jq_all.find(".notebook.hidden");
      for (var i = 0; i < hidden.length; i++) {
        hidden[i].className = hidden[i].className.replace(/\s*hidden/g, "");
      }
      currentResults = jq_all.find(".notebook");
      // uncollapse stacks
      var stacks = jq_all.find(".stack.collapsed");
      for (var i = 0; i < stacks.length; i++) {
        stacks[i].className = stacks[i].className.replace(/\s*collapsed/g, "");
      }
    } else {
      searchCancel.className = searchCancel.className.replace(/\s*visible/g, "");
      searchCancel.className += " visible";
      // show the appropriate notebooks

      var searchText = search.value.toLowerCase();
      searchText = searchText.replace(/\'/g,"\\\'");
      var visibleNonMatching =  jq_all.find(".notebook:not(.hidden):not([name*='" + searchText + "'])");
      for (var i = 0; i < visibleNonMatching.length; i++) {
        visibleNonMatching.get(i).className += " hidden";
      }
      var hiddenMatching =  jq_all.find(".notebook.hidden[name*='" + searchText + "']");
      for (var i = 0; i < hiddenMatching.length; i++) {
        hiddenMatching.get(i).className = hiddenMatching.get(i).className.replace(/\s*hidden/g, "");
      }
      // collapse stacks
      var stacks =  jq_all.find(".stack:not(.collapsed)");
      for (var i = 0; i < stacks.length; i++) {
        stacks.get(i).className += " collapsed";
      }
      currentResults =  jq_all.find(".notebook[name*='" + searchText + "']:not(.hidden)");
      if (currentResults.length > 0) {
        highlight(currentResults.get(0));
      }

    }
    sc.updateScrollbar();

  }

  function updateView(){
    sc.updateScrollbar();
  }

  function handleKeydown(evt) {
    if (evt.keyCode == 38 || evt.keyCode == 40) { // up and down arrow
      if (!currentResults || currentResults.length == 0) {
        currentResults = jq_all.find(".notebook");
      }
      var h = jq_all.find(".notebook.highlighted").get(0);
      if (!h) {
        h = jq_all.find(".notebook.selected").get(0);
      }
      if (h) {
//        var hi = Array.prototype.slice.call(currentResults).indexOf(h);
        var hi = Evernote.ArrayExtension.indexOf(currentResults, h)
        if (evt.keyCode == 38 && hi - 1 > -1 && currentResults[hi - 1]) { // up
          highlight(currentResults[hi - 1]);
          sc.scrollToEl('.highlighted');
        } else if (evt.keyCode == 40 && currentResults[hi + 1]) { // down
          highlight(currentResults[hi + 1]);
          sc.scrollToEl('.highlighted');
        }
        evt.preventDefault ? evt.preventDefault() : (evt.returnValue=false);
      }
    } else if (evt.keyCode == 13 || evt.keyCode == 9) {  // enter or tab
      var h = jq_all.find(".notebook.highlighted").get(0);
      if (h) {
        select(h, false);
        searchCancel.click();
      }
    } else if (evt.keyCode == 8 || evt.keyCode == 46 ) { // backspace or delete
        handleInput()
    }
  }

  function hasNotChangedSmartFiling() {
    return smartFilingSuggested && !userSelectedNotebook;
  }

  function highlight(elt) {
    var hl = jq_all.find(".notebook.highlighted").get(0);
    if (hl) {
      hl.className = hl.className.replace(/\s*highlighted/g, "");
    }
    if (selected.guid !== elt.id) {
      elt.className += " highlighted";
     // elt.scrollIntoViewIfNeeded();
    }
  }

  function getNotebook(guid) {
    return jq_all.find(".notebook[id='" + guid + "']");
  }

  function insertNotebook(index, name, guid, type, owner, shareKey, linkedGuid) {
    var elt = createNotebook(name, guid, type, owner, shareKey, linkedGuid);
    all.insertBefore(elt, all.children[index]);
    return elt;
  }

  function insertNotebookIntoStack(index, name, guid, type, owner, shareKey, linkedGuid, stack) {
    var elt = createNotebook(name, guid, type, owner, shareKey, linkedGuid);
    // need to add 1 to the index to avoid the stack header element
    stacks[stack].insertBefore(elt, stacks[stack].children[index + 1]);
    return elt;
  }

  function insertStackIfNeeded(index, name) {
    if (!stacks[name]) {
      var elt = createStack(name);
      all.insertBefore(elt, all.children[index]);
      return elt;
    }
  }

  function overridable() {
    return !userSelectedNotebook && !smartFilingSuggested;
  }

  function reset() {
    userSelectedNotebook = false;
    smartFilingSuggested = false;
    all.innerHTML = "";
    currentResults = null;
    selected = null;
    stacks = {};
  }

  function select(notebook, smartFiling) {
    if (smartFiling) {
    //   selected.className += " green";
      smartFilingSuggested = true;
    } else {
    //   selected.className = selected.className.replace(/\s*green/g, "");
    }
    selected = {};
    selected.name = notebook.textContent || notebook.innerText;
    selected.guid = notebook.id || notebook.uid;
    var type;
    var linkedGuid;
    var shareKey;
    if (notebook.getAttribute) { // from clicking on something in the list
      type = notebook.getAttribute("type");
      linkedGuid = notebook.getAttribute("linkedGuid");
      shareKey = notebook.getAttribute("shareKey");
    } else { // from programatically setting the notebook
      type = notebook.type;
    }
    selected.type = type;
    selected.linkedGuid = linkedGuid;
    selected.shareKey = shareKey;
    // deselect previously selected notebook
    var sel = jq_all.find(".notebook.selected").get(0);
    if (sel) {
      sel.className = sel.className.replace(/\s*selected/g, "");
    }

    var elt = notebook;
    if (!elt.getAttribute) {
      var id = notebook.id || notebook.uid;
      elt = jq_all.find(".notebook[id='" + id + "']").get(0);
    }
    if (elt) {
      elt.className = elt.className.replace(/\s*highlighted/g, "") + " selected";
     // elt.scrollIntoViewIfNeeded();
    }

    if (callback) {
      callback({
        name: "selectedNotebook",
        notebookName: selected.name,
        notebookGuid: selected.guid,
        smart: smartFiling,
        type: type
      });
    }
  }

  this.addNotebookToAll = addNotebookToAll;
  this.addNotebookToStack = addNotebookToStack;
  this.addStackIfNeeded = addStackIfNeeded;
  this.changedNotebook = changedNotebook;
  this.focusEntry = focusEntry;
  this.getNotebook = getNotebook;
  this.getSelected = getSelected;
  this.hasNotChangedSmartFiling = hasNotChangedSmartFiling;
  this.insertNotebook = insertNotebook;
  this.insertNotebookIntoStack = insertNotebookIntoStack;
  this.insertStackIfNeeded = insertStackIfNeeded;
  this.overridable = overridable;
  this.reset = reset;
  this.select = select;

    this.updateView = updateView;

}