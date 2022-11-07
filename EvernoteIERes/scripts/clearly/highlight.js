/*!
 *  ClearlyComponent__highlight
 *  Evernote Clearly's highlighting algorithm/functionality as an embeddable component.
 *  Copyright 2013, Evernote Corporation
 *
 *  Usage:
 *  ======
 *
 *      // define
 *      window.ClearlyComponent__highlight = {
 *          'callbacks': {
 *              'highlightAdded': someFunction(),
 *              'highlightDeleted': someFunction(),
 *              'arbitraryRangeExclusion': someFunction()
 *          },
 *          'settings': {
 *              'imgPath': 'string',
 *              'onInsertCSSUseThisId': 'string',
 *              'highlightingEnabledCSSClass': 'string',
 *              'highlightElementCSSClass': 'string',
 *              'highlightElementIdAttribute': 'string',
 *              'highlightElementFirstCSSClass': 'string',
 *              'highlightElementLastCSSClass': 'string',
 *              'highlightElementDeleteCSSClass': 'string',
 *              'highlightElementDeleteIdPrefix': 'string',
 *              'highlightCleanHTMLElementStart': 'string',
 *              'highlightCleanHTMLElementEnd': 'string',
 *              'elementWhichMustContainAllHighlights': _dom_element,
 *              'elementsToAttachMouseHandlersTo': [
 *                  _dom_element
 *              ]
 *          },
 *          'window': window,
 *          'document': document,
 *          'jQuery': window.jQuery
 *      };
 *
 *      // init -- will return false, if something goes wrong
 *      window.ClearlyComponent__highlight = initClearlyComponent__highlight(window.ClearlyComponent__highlight);
 *
 *      //  setup
 *      window.ClearlyComponent__highlight.insertCSS();
 *      window.ClearlyComponent__highlight.addMouseHandlers();
 *
 *      //  enable
 *      window.ClearlyComponent__highlight.enable();
 *
 *      // publcly available/overridable
 *      window.ClearlyComponent__highlight.debug
 *
 */

/*
    changes:
    ========
        $R => $H
        $R.highlight => $H.enabled
        
    to do:
    ======
*/

function initClearlyComponent__highlight(_paramInstance)
{
    //  global instance reference {
    //  ===========================

        //  null; return
        if (_paramInstance); else { return false; }
        
        //  shorthand
        $H = _paramInstance;

    //  global instance reference }


    //  required vars {
    //  ===============
    
        //  the component instance object must already be created,
        //  when the init function is called. it must have these vars set:

        switch (true)
        {
            case (!($H.settings)):
            case (!($H.settings.imgPath)):
            
            case (!($H.window)):
            case (!($H.document)):
            case (!($H.document.body)):
            
            case (!($H.jQuery)):

                if ($H.debug)
                {
                    console.log(!($H.settings));
                    console.log(!($H.settings.imgPath));
                    
                    console.log(!($H.window));
                    console.log(!($H.document));
                    console.log(!($H.document.body));
            
                    console.log(!($H.jQuery));
                }
                
                //  something's wrong
                return false;
        }
        
    //  required vars }


    //  missing settings {
    //  ==================
    
        //  restrictions
        if ($H.settings.elementWhichMustContainAllHighlights); else { $H.settings.elementWhichMustContainAllHighlights = $H.document.body; }
        if ($H.settings.elementsToAttachMouseHandlersTo); else { $H.settings.elementsToAttachMouseHandlersTo = [$H.document.body]; }

        //  names for stuff
        /* css id */            if ($H.settings.onInsertCSSUseThisId); else             { $H.settings.onInsertCSSUseThisId =            'clearly_highlighting_css'; }
        /* enabled */           if ($H.settings.highlightingEnabledCSSClass); else      { $H.settings.highlightingEnabledCSSClass =     'clearly_highlighting_enabled'; }
        /* element id */        if ($H.settings.highlightElementIdAttribute); else      { $H.settings.highlightElementIdAttribute =     'clearly_highlight_id'; }
        /* element class */     if ($H.settings.highlightElementCSSClass); else         { $H.settings.highlightElementCSSClass =        'clearly_highlight_element'; }
        /* element (first) */   if ($H.settings.highlightElementFirstCSSClass); else    { $H.settings.highlightElementFirstCSSClass =   'clearly_highlight_first'; }
        /* element (first) */   if ($H.settings.highlightElementLastCSSClass); else     { $H.settings.highlightElementLastCSSClass =    'clearly_highlight_last'; }
        /* delete class */      if ($H.settings.highlightElementDeleteCSSClass); else   { $H.settings.highlightElementDeleteCSSClass =  'clearly_highlight_delete_element'; }
        /* delete id prefix */  if ($H.settings.highlightElementDeleteIdPrefix); else   { $H.settings.highlightElementDeleteIdPrefix =  'clearly_highlight_delete__'; }
        /* clean html start */  if ($H.settings.highlightCleanHTMLElementStart); else   { $H.settings.highlightCleanHTMLElementStart =  '<span style="-evernote-highlighted:true; background-color:#f6ee96">'; }
        /* clean html end */    if ($H.settings.highlightCleanHTMLElementEnd); else     { $H.settings.highlightCleanHTMLElementEnd =    '</span>'; }
        
    //  missing settings }


    //  global vars {
    //  =============
    
        $CJ = $H.jQuery;
    
        $H.$window = $CJ($H.window);
        $H.$document = $CJ($H.document);
        $H.$html = $H.$document.find('html');
        $H.$elementWhichMustContainAllHighlights = $CJ($H.settings.elementWhichMustContainAllHighlights);
        
        $H.enabled = false;
        
    //  global vars }


    //  parse options {
    //  ===============   
    
		$H.parseOptions =
		{
			'_elements_ignore': 			        '|button|input|select|textarea|optgroup|command|datalist|--|frame|frameset|noframes|--|style|link|script|noscript|--|canvas|applet|map|--|marquee|area|base|',
			'_elements_ignore_tag': 		        '|form|fieldset|details|dir|--|center|font|span|',
			
			'_elements_container': 			        '|body|--|article|section|--|div|--|td|--|li|--|dd|dt|',
            '_elements_self_closing': 		        '|br|hr|--|img|--|col|--|source|--|embed|param|--|iframe|',

            '_elements_highlight_protect':          '|video|audio|source|--|object|param|embed|',
            
            '_elements_keep_attributes':
			{
				'a': 		['href', 'title', 'name'],
				'img': 		['src', 'width', 'height', 'alt', 'title'],

				'video': 	['src', 'width', 'height', 'poster', 'audio', 'preload', 'autoplay', 'loop', 'controls'],
				'audio': 	['src', 'preload', 'autoplay', 'loop', 'controls'],		 
				'source': 	['src', 'type'],
					 
				'object': 	['data', 'type', 'width', 'height', 'classid', 'codebase', 'codetype'],						
				'param': 	['name', 'value'],
				'embed': 	['src', 'type', 'width', 'height', 'flashvars', 'allowscriptaccess', 'allowfullscreen', 'bgcolor'],
					
				'iframe':	['src', 'width', 'height', 'frameborder', 'scrolling'],
					
				'td':		['colspan', 'rowspan'],			
				'th':		['colspan', 'rowspan']
			}
			
		};

    //  parse options }


    //  debug {
    //  =======
        
        $H.debug = ($H.debug || false);
		
		if ($H.debug)
		{
		    //  writeLog
		    //  ========
				switch (true)
				{
					case (!(!($H.window.console && $H.window.console.log))):    $H.writeLog = function (msg) { $H.window.console.log(msg); };       break;
					case (!(!($H.window.opera && $H.window.opera.postError))):  $H.writeLog = function (msg) { $H.window.opera.postError(msg); };   break;
					default:                                                    $H.writeLog = function (msg) {};                                    break;
				}

            //  log
            //  ===
                $H.log = function ()
                {
                    if ($H.debug); else { return; }
                    for (var i=0, il=arguments.length; i<il ; i++) { $H.writeLog(arguments[i]); }
                    $H.writeLog('-----------------------------------------');
                };
		}
		else
		{
            $H.writeLog 		= function () { return false; };
            $H.log 				= function () { return false; };
        }

    //  debug }

    
    //  insert css {
    //  ============
    
        $H.insertCSS = function ()
        {
            var _cssText = ''
            +   '/* selection */ '
            +   'html.'+$H.settings.highlightingEnabledCSSClass+' ::-moz-selection { background: rgba(246, 238, 150, 0.99); } '
            +   'html.'+$H.settings.highlightingEnabledCSSClass+' ::selection { background: rgba(246, 238, 150, 0.99); } '

            +   '/* cursor */ '
            +   'html.'+$H.settings.highlightingEnabledCSSClass+' { '
            +   '   /* cursor and hot-spot position -- requires a default cursor, after the URL one */ '
            +   '} '

            +   '/* highlight tag */ '
            +   'em.'+$H.settings.highlightElementCSSClass+' { '
            +   '   font-style: inherit !important; font-weight: inherit !important; '
            +   '   background-repeat: repeat-x; background-position: top left; background-size: 100% 100%; '
            +   '} '
            +   '/* the delete-buttons are positioned relative to this */ '
            +   'em.'+$H.settings.highlightElementCSSClass+'.'+$H.settings.highlightElementFirstCSSClass+' { position: relative; } '
    
            +   '/* delete buttons */ '
            +   'em.'+$H.settings.highlightElementCSSClass+' a.'+$H.settings.highlightElementDeleteCSSClass+' { '
            +   '   display: none; cursor: pointer; '
            +   '   padding: 0; margin: 0; line-height: 0; '
            +   '   position: absolute; width: 34px; height: 34px; left: -17px; top: -17px; '
            +   '} '
            +   'em.'+$H.settings.highlightElementCSSClass+' a.'+$H.settings.highlightElementDeleteCSSClass+':hover { background-position: -34px 0px; } '
            ;

            //  create
            var _cssElement = $H.document.createElement('style');
            _cssElement.setAttribute('id', $H.settings.onInsertCSSUseThisId);
            _cssElement.setAttribute('type', 'text/css');
            if (_cssElement.styleSheet) { _cssElement.styleSheet.cssText = _cssText; }
                else { _cssElement.appendChild($H.document.createTextNode(_cssText)); }
            
            //  append
            $H.$document.find('head').append(_cssElement);
        };
            
    //  insert css }

    //  selection {
    //  ===========
    
        $H.sel = {};

        $H.sel.getWindowFromDocument = function (theDocument)
        {
            if (theDocument); else { return null; }
            
            if ('defaultView' in theDocument) {
                arguments.calee = function (theDocument) {
                    if (theDocument); else { return null; }
                    return theDocument.defaultView;
                };
            }
            else if ('parentWindow' in theDocument) {
                arguments.calee = function (theDocument) {
                    if (theDocument); else { return null; }
                    return theDocument.parentWindow;
                };
            }
            else {
                arguments.calee = function (theDocument) {
                    return null;
                };
            }
            
            return arguments.calee(theDocument);
        };

        $H.sel.getSelection = function (theWindow)
        {
            if (theWindow); else { return null; }
        
            if ('getSelection' in theWindow) {
                arguments.calee = function (theWindow) {
                    if (theWindow); else { return null; }
                    return theWindow.getSelection();
                };
            }
            else if ('selection' in theWindow.document) {
                arguments.calee = function (theWindow) {
                    if (theWindow); else { return null; }
                    return theWindow.document.selection;
                };
            }
            else {
                arguments.calee = function (theWindow) {
                    return null;
                };
            }
            
            return arguments.calee(theWindow);
        };
        
        $H.sel.getRange = function (selection)
        {
            if (selection); else { return null; }
        
            if ('getRangeAt' in selection) {
                arguments.calee = function (selection) {
                    if (selection); else { return null; }
                    if (selection.rangeCount > 0) { return selection.getRangeAt(0); }
                    else { return null; }
                    //	doesn't work in old versions of safari 
                    //	... I don't care
                };
            }
            else if ('createRange' in selection) {
                arguments.calee = function (selection) {
                    if (selection); else { return null; }
                    return selection.createRange();
                };
            }
            else {
                arguments.calee = function (selection) {
                    return null;
                };
            }
            
            return arguments.calee(selection);
        };

        $H.sel.getRangeHTML = function (range)
        {
            if (range); else { return null; }
            
            if ('htmlText' in range) {
                arguments.calee = function (range) {
                    if (range); else { return null; }
                    return range.htmlText;
                };
            }
            else if ('surroundContents' in range) {
                arguments.calee = function (range) {
                    
                    if (range); else { return null; }
                    if (range.commonAncestorContainer && range.commonAncestorContainer.ownerDocument); else { return null; }
                    
                    var dummy = range.commonAncestorContainer.ownerDocument.createElement("div");
                    dummy.appendChild(range.cloneContents());
                    return dummy.innerHTML;
                };
            }
            else {
                arguments.calee = function (range) {
                    return null;
                };
            }
            
            return arguments.calee(range);
        };

        $H.sel.getRangeText = function (range)
        {
            if (range); else { return null; }
        
            if ('text' in range) {
                arguments.calee = function (range) {
                    if (range); else { return null; }
                    return range.text;
                };
            }
            else if ('surroundContents' in range) {
                arguments.calee = function (range) {

                    if (range); else { return null; }
                    if (range.commonAncestorContainer && range.commonAncestorContainer.ownerDocument); else { return null; }

                    var dummy = range.commonAncestorContainer.ownerDocument.createElement("div");
                    dummy.appendChild(range.cloneContents());
                    return dummy.textContent;
                };
            }
            else {
                arguments.calee = function (range) {
                    return null;
                };
            }
        
            return arguments.calee(range);
        };
    
    //  selection }


    //  helpers {
    //  =========

        $H.rand = function (_min, _max)
        {
            return (Math.floor(Math.random() * (_max - _min + 1)) + _min);
        };

        $H.highlight__deleteSpansFromParents = function (_parents)
        {
            var _done = [], _this_done = false, _inner = '';
        
            //  main loop
            for (var i=0, _i=_parents.length; i<_i; i++)
            {
                //  init
                _this_done = false;
            
                //  check
                for (var ii=0, _ii=_done.length; ii<_ii; ii++)
                {
                    if (_done[ii] == _parents[i])
                    {
                        _this_done = true;
                        break;
                    }
                }    
             
                //  skip
                if (_this_done) { continue; }
            
            
                //  actually do
                //  ===========
            
                    //  add
                    _done.push(_parents[i]);
            
                    //  get
                    _inner = _parents[i].innerHTML;
            
                    //  check
                    if (_inner.indexOf('<span') > -1); else { continue; }
                
                    //  replace
                    _inner = _inner.replace(/<span([^>]*?)>/gi, '');
                    _inner = _inner.replace(/<\/span>/gi, '');
                    _parents[i].innerHTML = _inner;
            }
        };

        $H.highlight__getDeepestTextNode = function (_node)
        {
            var _n = _node;
        
            while (true)
            {
                switch (true)
                {
                    //  text
                    case (_n.nodeType && _n.nodeType == 3): return _n;
                
                    //  single child
                    case (_n.nodeType && _n.nodeType == 1 && _n.childNodes.length > 0): _n = _n.childNodes[0]; break;
                
                    //  no children but has sibling
                    case (_n.nodeType && _n.nodeType == 1 && _n.childNodes.length == 0 && _n.nextSibling): _n = _n.nextSibling; break;
                
                    //  default
                    default: return _node;
                }
            }
        };
    
        $H.highlight__getCommonAncestorContainerForNodes = function (_node1, _node2, _fallback)
        {
            var _parent1 = _node1, _parent2 = _node2;
        
            while (true)
            {
                //  next
                _parent1 = _parent1.parentNode;
                _parent2 = _parent2.parentNode;

                //  break
                switch (true)
                {
                    case (!(_parent1)):
                    case (!(_parent2)):
                    case (_parent1 == _fallback):
                    case (_parent2 == _fallback):
                        return _fallback;
                }
            
                //  maybe
                switch (true)
                {
                    case (_parent1 == _parent2): return _parent1;

                    case ($CJ.contains(_parent1, _node2)): return _parent1;
                    case ($CJ.contains(_parent2, _node1)): return _parent2;
                
                    case ($CJ.contains(_parent1, _parent2)): return _parent1;
                    case ($CJ.contains(_parent2, _parent1)): return _parent2;
                }
            }
        };
    
        $H.highlight__getParentElementOfNode = function (_thisNode)
        {
            var _element = _thisNode;
            while (true) {
                //  correct
                if (_element.nodeType == 1) { break; }
            
                //  continue
                _element = _element.parentNode;
            }
            return _element;
        };
            
        $H.highlight__getParentElementOfNodeWithThisParent = function (_thisNode, _thisParent)
        {
            //  impossible
            switch (true)
            {
                case (_thisNode == _thisParent):
                    return _thisNode;
                
                case (!($CJ.contains(_thisParent, _thisNode))):  // always false in IE
                    //return _thisNode;
            }
        
            //  do
            var _element = _thisNode;
            while (true) {
                //  correct
                if (_element.parentNode == _thisParent) { break; }
            
                //  continue
                _element = _element.parentNode;
            }
            return _element;
        };
    
    //  helpers }


    //  build html for element with selected range {
    //  ============================================
    
        $H.highlight__buildHTMLForElementWithSelectedRange = function (_elementToBuildHTMLFor, _modeToBuildHTMLIn, _rangeToBuildHTMLWith)
        {
            var 
                _global__element_index = 0,
                _global__the_html = '',
                _global__highlight_on = ((_modeToBuildHTMLIn == 'boundry-end') ? true : false)
            ;

            //	recursive function
            //	==================
                var _recursive = function (_node)
                {
                    //	increment index -- starts with 1
                    //	===============
                        _global__element_index++;

                    //	vars
                    //	====
                        var 
                            _explored = false,
                            _tag_name = (_node.nodeType === 3 ? '#text' : ((_node.nodeType === 1 && _node.tagName && _node.tagName > '') ? _node.tagName.toLowerCase() : '#invalid')),
                            _tag_is_ignored = ($H.parseOptions._elements_ignore_tag.indexOf('|'+_tag_name+'|') > -1),
                            _tag_is_ignored = (_tag_is_ignored ? ((_tag_name == 'span') ? false : true) : false),
                            _pos__start__before = 0,
                            _pos__start__after = 0,
                            _pos__end__before = 0,
                            _pos__end__after = 0,
                            _to_write = '',
                            _selection_starts_here = false,
                            _selection_ends_here = false
                        ;

                    //	fast return
                    //	===========
                        switch (true)
                        {
                            case ((_tag_name == '#invalid')):
                            case (($H.parseOptions._elements_ignore.indexOf('|'+_tag_name+'|') > -1)):
                                return;
                        
                            case (_tag_name == '#text'):
                                //  get value
                                //  =========
                                    _to_write = _node.nodeValue.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');

                                //  mode?
                                //  =====
                                    switch (true)
                                    {
                                        case (_modeToBuildHTMLIn == 'nothing'):
                                            break;
                                    
                                        case (_modeToBuildHTMLIn == 'everything'):
                                            _to_write = ''
                                                + '<highlight>' 
                                                +   _to_write 
                                                + '</highlight>'
                                            ;
                                            break;
                                    
                                        case (_modeToBuildHTMLIn == 'boundry-start'):
                                        case (_modeToBuildHTMLIn == 'boundry-end'):
                                        case (_modeToBuildHTMLIn == 'boundry-both'):
                                    
                                            //  end of range?
                                            //  =============
                                                if (_node == _rangeToBuildHTMLWith.endContainer)
                                                {
                                                    _to_write = ''
                                                        + '<highlight>'
                                                        +   _to_write.substr(0, _rangeToBuildHTMLWith.endOffset)
                                                        + '</highlight>'
                                                        + _to_write.substr(_rangeToBuildHTMLWith.endOffset)
                                                    ;
                                            
                                                    _global__highlight_on = false;
                                                    _selection_ends_here = true;
                                                }
                                    
                                            //  start of range?
                                            //  ===============
                                                if (_node == _rangeToBuildHTMLWith.startContainer)
                                                {
                                                    _to_write = ''
                                                        + _to_write.substr(0, _rangeToBuildHTMLWith.startOffset)
                                                        + '<highlight>'
                                                        +   _to_write.substr(_rangeToBuildHTMLWith.startOffset)
                                                        + '</highlight>'  
                                                    ;
                                            
                                                    _global__highlight_on = true;
                                                    _selection_starts_here = true;
                                                }
                                        
                                            //  correction
                                            //  ==========
                                                if (_selection_starts_here && _selection_ends_here)
                                                {
                                                    _to_write = _node.nodeValue.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
                                                    _to_write = ''
                                                        + _to_write.substr(0, _rangeToBuildHTMLWith.startOffset)
                                                        + '<highlight>'
                                                        +   _to_write.substr(_rangeToBuildHTMLWith.startOffset, (_rangeToBuildHTMLWith.endOffset - _rangeToBuildHTMLWith.startOffset))
                                                        + '</highlight>'
                                                        + _to_write.substr(_rangeToBuildHTMLWith.endOffset)
                                                    ;

                                                    _global__highlight_on = false;
                                                }
                                        
                                            //  snap-to
                                            //  =======
                                                if (_selection_starts_here && (_rangeToBuildHTMLWith.startOffset > 0))
                                                {
                                                    //  before
                                                    _to_write = _to_write.replace(/([ .,;?!])([a-z0-9]{1,2})<highlight>/gi, '$1<highlight>$2');
                                            
                                                    //  space at begining
                                                    _to_write = _to_write.replace(/<highlight>([\s])([^\s])/gi, '$1<highlight>$2');

                                                    //  too much
                                                    _to_write = _to_write.replace(/<highlight>([a-z0-9])([ ])([a-z0-9])/gi, '$1$2<highlight>$3');
                                                }
                                        
                                                if (_selection_ends_here && (_rangeToBuildHTMLWith.endOffset > 0))
                                                {
                                                    var _do_end = true;
                                            
                                                    if (_rangeToBuildHTMLWith.endContainer && _rangeToBuildHTMLWith.endContainer.nodeValue && _rangeToBuildHTMLWith.endContainer.nodeValue.length)
                                                        { _do_end = (_rangeToBuildHTMLWith.endOffset < _rangeToBuildHTMLWith.endContainer.nodeValue.length); }
                                        
                                                    if (_do_end)
                                                    {
                                                        //  after
                                                        _to_write = _to_write.replace(/<\/highlight>([a-z0-9]{0,2})([ .,;?!])/gi, '$1$2</highlight>');

                                                        //  space at end
                                                        _to_write = _to_write.replace(/([^\s])([\s])<\/highlight>/gi, '$1</highlight>$2');

                                                        //  too much
                                                        _to_write = _to_write.replace(/([ ])([a-z0-9])<\/highlight>([a-z0-9])/gi, '</highlight>$1$2$3');
                                                    }
                                                }
                                        
                                            //  other
                                            //  =====
                                                if (!(_selection_starts_here) && !(_selection_ends_here))
                                                {
                                                    _to_write = _node.nodeValue.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
                                                    if (_global__highlight_on)
                                                    {
                                                        _to_write = ''
                                                            + '<highlight>' 
                                                            +   _to_write 
                                                            + '</highlight>'
                                                        ;
                                                    }
                                                }
                                
                                            break;
                                    }
                            
                                //  write value
                                //  ===========
                                    _global__the_html += _to_write;
                        
                                return;
                        }
            
                    //  range anchors are elements instead of text-nodes
                    //  ================================================
            
                        //  end of range?
                        if ((_rangeToBuildHTMLWith.endContainer.nodeType == 1) && (_node == _rangeToBuildHTMLWith.endContainer)) {
                            _global__highlight_on = false;
                            _selection_ends_here = true;
                        }
                
                        //  start of range?
                        if ((_rangeToBuildHTMLWith.startContainer.nodeType == 1) && (_node == _rangeToBuildHTMLWith.startContainer)) {
                            _global__highlight_on = true;
                            _selection_starts_here = true;
                        }
            
                        //  correction
                        if (_selection_starts_here && _selection_ends_here) {
                            _global__highlight_on = false;
                        }
                
                    //	start tag
                    //	=========
                        if (_tag_is_ignored); else
                        {
                            /* mark */	_pos__start__before = _global__the_html.length;
                            /* add */	_global__the_html += '<'+_tag_name;
                    
                            //	attributes
                            //	==========

                                //	allowed attributes
                                if (_tag_name in $H.parseOptions._elements_keep_attributes)
                                {
                                    for (var i=0, _i=$H.parseOptions._elements_keep_attributes[_tag_name].length; i<_i; i++)
                                    {
                                        var 
                                            _attribute_name = $H.parseOptions._elements_keep_attributes[_tag_name][i],
                                            _attribute_value = _node.getAttribute(_attribute_name)
                                        ;
            
                                        //	if present
                                        if (_attribute_value > '')
                                            { _global__the_html += ' '+_attribute_name+'="'+(_attribute_value)+'"'; }
                                    }
                                }
    
                                //	keep ID for all elements
                                var _id_attribute = _node.getAttribute('id');
                                if (_id_attribute > '')
                                    { _global__the_html += ' id="'+_id_attribute+'"'; }

                                //	links target NEW
                                if (_tag_name == 'a')
                                    { _global__the_html += ' target="_blank"'; }
                            
                            //  add class name
                            //  ==============
                                var _class_attribute = _node.getAttribute('class');
                                if (_class_attribute > '')
                                    { _global__the_html += ' class="'+_class_attribute+'"'; }

                            //  add highlight id -- for EMs that are outside the global highlight
                            //  ================
                                if (_tag_name == 'em' && _modeToBuildHTMLIn != 'everything')
                                {
                                    //  with a fix for when an em is the first thing inside a parent element
                            
                                    switch (true)
                                    {
                                        case (_global__highlight_on):
                                        case ((_rangeToBuildHTMLWith.startOffset == 0) && (_node.firstChild) && (_node.firstChild == _rangeToBuildHTMLWith.startContainer)):
                                            break;
                                    
                                        default:
                                            var _highlight_id_attribute = _node.getAttribute($H.settings.highlightElementIdAttribute);
                                            if (_highlight_id_attribute > '')
                                                { _global__the_html += ' '+$H.settings.highlightElementIdAttribute+'="'+_highlight_id_attribute+'"'; }
                                            break;
                                    }
                                }
                            
                            //	close start
                            //	===========
                                if ($H.parseOptions._elements_self_closing.indexOf('|'+_tag_name+'|') > -1) { _global__the_html += ' />'; }
                                else { _global__the_html += '>';}
                    
                            /* mark */ _pos__start__after = _global__the_html.length;
                        }
            
                    //	child nodes
                    //	===========
                        if ($H.parseOptions._elements_self_closing.indexOf('|'+_tag_name+'|') > -1); else
                        {
                            for (var i=0, _i=_node.childNodes.length; i<_i; i++)
                                { _recursive(_node.childNodes[i]); }
                        }
                
                    //	end tag
                    //	=======
                        switch (true)
                        {
                            case (_tag_is_ignored):
                                return;
                        
                            case (($H.parseOptions._elements_self_closing.indexOf('|'+_tag_name+'|') > -1)):
                                /* mark */ 	_pos__end__before = _global__the_html.length;
                                /* mark */ 	_pos__end__after = _global__the_html.length;
                                break;
                        
                            default:
                                /* mark */ 	_pos__end__before = _global__the_html.length;
                                /* end */ 	_global__the_html += '</'+_tag_name+'>';
                                /* mark */ 	_pos__end__after = _global__the_html.length;
                                break;
                        }
                
                    //  protected elements
                    //  ==================
                        switch (true)
                        {
                            //  some elemnts are protected from highlighting
                            case (($H.parseOptions._elements_highlight_protect.indexOf('|'+_tag_name+'|') > -1)):
                            case ((_tag_name == 'em') && $CJ(_node).hasClass($H.settings.highlightElementCSSClass)):
                    
                                //  so, if highlights are inside an already highlighted element --or an unhighlightable one-- remove
                    
                                _global__the_html = ''
                                    + _global__the_html.substr(0, _pos__start__after)
                                    +   _global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after))
                                            .replace(/<highlight>/gi, '')
                                            .replace(/<\/highlight>/gi, '')
                                    + _global__the_html.substr(_pos__end__before)
                                ;
                        
                                break;
                        
                            //  some elements are invalid completely
                            case ((_tag_name == 'a') && (_node.className == 'deleteHighlight')):

                                _global__the_html = ''
                                    + _global__the_html.substr(0, _pos__start__before)
                                    + _global__the_html.substr(_pos__end__after)
                                ;
                        
                                break;
                        
                            //  some elements need to have their tags ignored
                            /*case (_tag_name == 'span'):

                                _global__the_html = ''
                                    + _global__the_html.substr(0, _pos__start__before)
                                    + _global__the_html.substr(_pos__start__after, (_pos__end__before - _pos__start__after))
                                    + _global__the_html.substr(_pos__end__after)
                                ;
                        
                                break;*/
                        }
                
                    //	return
                        return;
                };
        
            //	actually do it
            _recursive(_elementToBuildHTMLFor);
        
            //  use em, instead of highlight
            _global__the_html = _global__the_html
                .replace(/<highlight>/gi, '<em class="'+$H.settings.highlightElementCSSClass+'">')
                .replace(/<\/highlight>/gi, '</em>')
            ;
        
            //	return
            return _global__the_html;
        };    

    //  build html for element with selected range }


    //  do range {
    //  ==========

        $H.highlight__doRange = function (_range_to_highlight)
        {
            //  get referrence elements
            var
                _commonAncestorElement = $H.highlight__getParentElementOfNode(_range_to_highlight.commonAncestorContainer),
                _startElement = $H.highlight__getParentElementOfNodeWithThisParent(_range_to_highlight.startContainer, _commonAncestorElement),
                _endElement = $H.highlight__getParentElementOfNodeWithThisParent(_range_to_highlight.endContainer, _commonAncestorElement)
            ;
            
            //  range not in container element
            if (true
                && (_commonAncestorElement.tagName) 
                && !($CJ.contains($H.settings.elementWhichMustContainAllHighlights, _commonAncestorElement))
            ) {
                return false;
            }
            
            //  arbitrary range exclusion
            if ($H.callbacks.arbitraryRangeExclusion) {
                if ($H.callbacks.arbitraryRangeExclusion(_range_to_highlight, _commonAncestorElement, _startElement, _endElement) === false) {
                    return false;
                }
            }
            
            /* $H.log(
                _range.startContainer, _range.endContainer, _range.startOffset, _range.endOffset, 
                _range_to_highlight, 
                _commonAncestorElement, _startElement, _endElement
            ); */
            
            //  selection id
            var _selection_id = $H.rand(1, 1000);
            while (true)
            {
                //  nothing found
                if ($H.$elementWhichMustContainAllHighlights.find('em.'+$H.settings.highlightElementCSSClass+'['+$H.settings.highlightElementIdAttribute+'="'+_selection_id+'"]').length > 0); else { break; }
            
                //  new id
                _selection_id = $H.rand(1, 1000);
            }
        
            //  chainging elements
            //  ==================

                var _chaingingElements = [], _currElement = _startElement, _currChainging = false;
            
                while (true)
                {
                    //  object
                    _currChainging = {
                        '_element': _currElement,
                        '_tagName': (_currElement.nodeType === 3 ? '#text' : ((_currElement.nodeType === 1 && _currElement.tagName && _currElement.tagName > '') ? _currElement.tagName.toLowerCase() : '#invalid'))
                    };
                
                    //  add
                    _chaingingElements.push(_currChainging);

                    //  break
                    if (_currElement == _endElement) { break; }
                
                    //  next
                    _currElement = _currElement.nextSibling;
                
                    //  error?
                    if (_currElement); else { break; }
                }

            
            //  rewrite elements
            //  ================
                var _parents_to_clean = [];
                for (var i=0, _i=_chaingingElements.length, _currElement=false; i<_i; i++)
                {
                    var 
                        _currElement = _chaingingElements[i],
                        _currNode = _currElement._element,
                        _currTag = _currElement._tagName,
                        _boundry_mode = '',
                        _currBuiltHTML = false,
                        _resNode = false
                    ;

                    //  get html / mode
                    //  ===============
                        switch (true)
                        {
                            case ((_i == 1) && (i == 0)):       _boundry_mode = 'boundry-both';     break;
                            case ((_i > 1) && (i == 0)):        _boundry_mode = 'boundry-start';    break;
                            case ((_i > 1) && (i == (_i-1))):   _boundry_mode = 'boundry-end';      break;
                            default:                            _boundry_mode = 'everything';       break;
                        }

                    //  get html
                    //  ========
                        _currBuiltHTML = $H.highlight__buildHTMLForElementWithSelectedRange(_currNode, _boundry_mode, _range_to_highlight);

                
                    //  write
                    //  =====
                        switch (true)
                        {
                            case ((_currTag == '#text')):
                        
                                //  resulting html might be something like "<em>something</em> something else"
                                //  so we create a dummy span tag to eomcompass it, and then repalce the old text node with that
                        
                                //  create
                                var _newElement = $H.document.createElement('span');
                                    _newElement.innerHTML = _currBuiltHTML;

                                //  result
                                _resNode = _newElement;


                               /* with (Evernote.evernotePopup) {
                                    console.log(' ~~~ highlight.js gadit before |'  + docSelection + "|");
                                    console.log(' ~~~ from ' +docSelection.startOffset + ' to  ' + docSelection.endOffset);
                                }*/

                                Evernote.Utils.sendMessageToPopup('highlightDomChangesStart');
                                //  replace
                                _currNode.parentNode.replaceChild(_resNode, _currNode);

                                Evernote.Utils.sendMessageToPopup('highlightDomChangesEnd');
/*
                                with (Evernote.evernotePopup) {
                                    console.log(' ~~~ highlight.js nagadil |'  + docSelection + "|");
                                    console.log(' ~~~ from ' +docSelection.startOffset + ' to  ' + docSelection.endOffset);
                                }*/

                                break;
                            
                            case (($H.parseOptions._elements_self_closing.indexOf('|'+_currTag+'|') > -1)):
                            
                                //  result
                                _resNode = _currNode;

                                /* nothing */ /*
                                    var _newElement = $H.document.createElement('em');
                                        _newElement.className = $H.settings.highlightElementCSSClass;
                                        _newElement.innerHTML = _currBuiltHTML;
                                    _currNode.parentNode.replaceChild(_newElement, _currNode);
                                */
                            
                                break;

                            
                            default:
                            
                                //  result
                                _resNode = _currNode;

                                //  innerHTML
                                _currBuiltHTML = _currBuiltHTML.substr((_currBuiltHTML.indexOf('>')+1));
                                _currBuiltHTML = _currBuiltHTML.substr(0, _currBuiltHTML.lastIndexOf('<'));
                            
                                //  highlighted anything?
                                if (_currBuiltHTML.indexOf('<em class="'+$H.settings.highlightElementCSSClass+'">') > - 1); else { break; }
                            
                                //  do it
                                _currNode.innerHTML = _currBuiltHTML;
                                break;
                        }
                    
                    //  set highlight class 
                    //  ===================
                    
                        //  inside node
                        $CJ(_resNode).find('em.'+$H.settings.highlightElementCSSClass+':not(['+$H.settings.highlightElementIdAttribute+'])').attr($H.settings.highlightElementIdAttribute, _selection_id);
                    
                        //  on node
                        if ((_currTag == 'em') && $CJ(_resNode).hasClass($H.settings.highlightElementCSSClass))
                            { $CJ(_resNode).attr($H.settings.highlightElementIdAttribute, _selection_id); }
                        
                        //  clean::add
                        _parents_to_clean.push(_resNode.parentNode);
                }

                //  clean::do
                $H.highlight__deleteSpansFromParents(_parents_to_clean);
        };
    
    //  do range }


    //  do current selection {
    //  ======================

        $H.highlight__doCurentSelection = function ()
        {
            //  vars
            //  ====
                var 
                    _selection = $H.sel.getSelection($H.window),
                    _range = $H.sel.getRange(_selection),
                    _text = $H.sel.getRangeText(_range),
                
                    _good_range = (_range ? {
                        'commonAncestorContainer':  _range.commonAncestorContainer,
                        'startContainer':           _range.startContainer,
                        'endContainer':             _range.endContainer,
                        'startOffset':              _range.startOffset,
                        'endOffset':                _range.endOffset
                    } : false)
                ;
        
            //  some exception rules
            //  ====================
                switch (true)
                {
                    case (!(_text)):
                    case (!(_text.length > 0)):
                    case (!(_good_range)):
                        return false;
                }
        
            //  some corrections
            //  ================
        
                //  Firefox fucks up -- https://developer.mozilla.org/en/DOM/range.startOffset
                //  Offsets mean two differet things

                //  start container
                if (_good_range.startContainer.nodeType == 1)
                {
                    if (_good_range.startContainer.childNodes[_good_range.startOffset])
                    {
                        _good_range.startContainer = _good_range.startContainer.childNodes[_good_range.startOffset];
                        _good_range.startOffset = 0;
                    }
                }
            
                //  end container
                if (_good_range.endContainer.nodeType == 1)
                {
                    if (_good_range.endContainer.childNodes[_good_range.endOffset])
                    {
                        _good_range.endContainer = _good_range.endContainer.childNodes[_good_range.endOffset];
                        _good_range.endOffset = 0;
                    }
                }

            //  highlight range
            //  ===============
                var _highlighted_range = $H.highlight__doRange(_good_range);
                if (_highlighted_range === false) { return false; }
            
            //  clear selection
            //  ===============
                try { _selection.removeAllRanges(); } catch (e) {}

            //  correct double highlights
            //  =========================
                var _parents_double_to_clean = [];
                $H.$elementWhichMustContainAllHighlights.find('em.'+$H.settings.highlightElementCSSClass+' em.'+$H.settings.highlightElementCSSClass).each(function (_i, _e)
                {
                    //  remove inner button
                        $CJ(_e).find('a.'+$H.settings.highlightElementDeleteCSSClass).remove();
            
                    //  create
                    var _newElement = $H.document.createElement('span');
                        _newElement.innerHTML = _e.innerHTML;

                    //  repalce
                    _e.parentNode.replaceChild(_newElement, _e);
                
                    //  add
                    _parents_double_to_clean.push(_newElement.parentNode);
                });
            
                //  clean
                $H.highlight__deleteSpansFromParents(_parents_double_to_clean);
            
            //  remove buttons and classes
            //  ==========================
                //  delete buttons
                $H.$elementWhichMustContainAllHighlights.find('em.'+$H.settings.highlightElementCSSClass+' a.'+$H.settings.highlightElementDeleteCSSClass).remove();
            
                //  first, last
                $H.$elementWhichMustContainAllHighlights.find('em.'+$H.settings.highlightElementCSSClass+'.'+$H.settings.highlightElementFirstCSSClass).removeClass($H.settings.highlightElementFirstCSSClass);
                $H.$elementWhichMustContainAllHighlights.find('em.'+$H.settings.highlightElementCSSClass+'.'+$H.settings.highlightElementLastCSSClass).removeClass($H.settings.highlightElementLastCSSClass);

            
            //  add buttons and classes
            //  =======================
                var 
                    _highlights_collection = $H.$elementWhichMustContainAllHighlights.find('em.'+$H.settings.highlightElementCSSClass),
                    _highlights_collection_ids = [],
                    _curr_delete_button = false
                ;
            
                //  get all ids
                _highlights_collection.each(function (_i, _e) {
                    _highlights_collection_ids.push($CJ(_e).attr($H.settings.highlightElementIdAttribute));
                });
            
                //  add button, classes
                _highlights_collection.each(function (_i, _e)
                {
                    var
                        _isFirst = (_highlights_collection_ids[(_i-1)] ? (_highlights_collection_ids[_i] != _highlights_collection_ids[(_i-1)]) : true),
                        _isLast = (_highlights_collection_ids[(_i+1)] ? (_highlights_collection_ids[_i] != _highlights_collection_ids[(_i+1)]) : true)
                    ;

                    if (_isFirst)
                    {
                        //  class
                        $CJ(_e).addClass($H.settings.highlightElementFirstCSSClass);
                    
                        //  create button
                        _curr_delete_button = $H.document.createElement('a');
                        _curr_delete_button.className = $H.settings.highlightElementDeleteCSSClass;
                        _curr_delete_button.id = $H.settings.highlightElementDeleteIdPrefix + _highlights_collection_ids[_i];
                    
                        //  add button
                        _e.insertBefore(_curr_delete_button, _e.firstChild);
                    }
                
                    if (_isLast)
                    {
                        //  class
                        $CJ(_e).addClass($H.settings.highlightElementLastCSSClass);
                    }
                });
        };
    
    //  do current selection }


    //  delete highlight {
    //  ==================

        $H.highlight__deleteAllHighlights = function ()
        {
            $H.highlight__deleteHighlight('all');
        };
    
        $H.highlight__deleteHighlight = function (_highlight_id)
        {
            var 
                _expression = 'em.' + $H.settings.highlightElementCSSClass + (_highlight_id == 'all' ? '' : '['+$H.settings.highlightElementIdAttribute+'="'+_highlight_id+'"]'),
                _parents_to_clean = []
            ;
            
            //  collection
            $H.$elementWhichMustContainAllHighlights.find(_expression).each(function (_index, _e)
            {
                //  create
                var _s = $H.document.createElement('span');
                    _s.innerHTML = _e.innerHTML;
                    
                //  do
                _e.parentNode.replaceChild(_s, _e);

                //  parents
                _parents_to_clean.push(_s.parentNode);
            });
            
            //  delete spans
            $H.highlight__deleteSpansFromParents(_parents_to_clean);
        };
    
    //  delete highlight }


    //  enable / disable {
    //  ==================

        $H.enable = function ()
        {
            if ($H.enabled) { return; }
            $H.enabled = true;
            $H.$html.addClass($H.settings.highlightingEnabledCSSClass);
        };

        $H.disable = function ()
        {
            if ($H.enabled); else { return; }
            $H.enabled = false;
            $H.$html.removeClass($H.settings.highlightingEnabledCSSClass);
        };

    //  enable / disable }
        
        
    //  add mouse handlers {
    //  ====================
    
        //  globals
        $H.highlight__mouseUp_timeout = false;
        $H.highlight__deleteButton__byId__mouseEnter_timeout = {};
        $H.highlight__deleteButton__byId__mouseLeave_timeout = {};

        //  containers mouse up
        $H.highlight__mouseUp = function ()
        {
            //  not in highlight mode
            if ($H.enabled); else { return; }
            
            //  timeout
            $H.highlight__mouseUp_timeout = $H.window.setTimeout
            (
                function ()
                {
                    //  try
                    $H.highlight__mouseUp_timeout = false;
                    var _didSelection = $H.highlight__doCurentSelection();
                    
                    //  callback
                    if (_didSelection === false); else {
                        if ($H.callbacks.highlightAdded) {
                            $H.callbacks.highlightAdded();
                        }
                    }
                }, 
                250
            );
        };

        //  containers mouse down
        $H.highlight__mouseDown = function ()
        {
            //  not in highlight mode
            if ($H.enabled); else { return; }
            
            //  timeout
            $H.window.clearTimeout($H.highlight__mouseUp_timeout);
        };
        
        //  delete buttons show/hide
        $H.highlight__deleteButton__show = function (_highlight_id) { $H.$elementWhichMustContainAllHighlights.find('#' + $H.settings.highlightElementDeleteIdPrefix + _highlight_id).fadeIn(250); };
        $H.highlight__deleteButton__hide = function (_highlight_id) { $H.$elementWhichMustContainAllHighlights.find('#' + $H.settings.highlightElementDeleteIdPrefix + _highlight_id).fadeOut(250); };
        
        //  add mouse handlers
        $H.addMouseHandlers = function ()
        {
            //  mouse up/down
            for (var i=0, _i=$H.settings.elementsToAttachMouseHandlersTo.length; i<_i; i++)
            {
                $CJ($H.settings.elementsToAttachMouseHandlersTo[i])
                    .mouseup($H.highlight__mouseUp)
                    .mousedown($H.highlight__mouseDown)
                ;
            }
            
            //  highlight mouse enter
            $H.$elementWhichMustContainAllHighlights.on('mouseenter', 'em.'+$H.settings.highlightElementCSSClass, function ()
            {
                var _highlight_id = $CJ(this).attr($H.settings.highlightElementIdAttribute);
            
                $H.window.clearTimeout($H.highlight__deleteButton__byId__mouseLeave_timeout[_highlight_id]);
            
                $H.highlight__deleteButton__byId__mouseEnter_timeout[_highlight_id] = $H.window.setTimeout(
                    function ()
                    {
                        $H.highlight__deleteButton__byId__mouseEnter_timeout[_highlight_id] = false;
                        $H.highlight__deleteButton__show(_highlight_id);
                    },
                    250
                );
            });

            //  highlight mouse leave
            $H.$elementWhichMustContainAllHighlights.on('mouseleave', 'em.'+$H.settings.highlightElementCSSClass, function ()
            {
                var _highlight_id = $CJ(this).attr($H.settings.highlightElementIdAttribute);

                $H.window.clearTimeout($H.highlight__deleteButton__byId__mouseEnter_timeout[_highlight_id]);

                $H.highlight__deleteButton__byId__mouseLeave_timeout[_highlight_id] = $H.window.setTimeout(
                    function ()
                    {
                        $H.highlight__deleteButton__byId__mouseLeave_timeout[_highlight_id] = false;
                        $H.highlight__deleteButton__hide(_highlight_id);
                    },
                    250
                );
            });

            //  highlight delete click        
            $H.$elementWhichMustContainAllHighlights.on('click', 'em.'+$H.settings.highlightElementCSSClass+' a.'+$H.settings.highlightElementDeleteCSSClass, function ()
            {
                //  get id
                var _id = $CJ(this.parentNode).attr($H.settings.highlightElementIdAttribute);
            
                //  remove self
                $CJ(this).remove();
            
                //  delete
                $H.highlight__deleteHighlight(_id);
            
                //  callback
                if ($H.callbacks.highlightDeleted) {
                    $H.callbacks.highlightDeleted();
                }
            });
        };
    
    //  add mouse handlers }


    //  get clean html {
    //  ================
    
        $H.getCleanHTML = function (_rawHTML)
        {
            //  html
            var _html = _rawHTML;
            
            //  remove all spans -- spans hold deleted highlights, or useless helper elements
            _html = _html.replace(/<span([^>]*?)>/gi, '');
            _html = _html.replace(/<\/span>/gi, '');
        
            //  remove highlight-delete buttons
            var _highlight_delete_reg = new RegExp('<a ([^>]*?)'+$H.settings.highlightElementDeleteCSSClass+'([^>]*?)></a>', 'gi');
            _html = _html.replace(_highlight_delete_reg, '');
    
            //  highlight element
            var _highlight_element_reg = new RegExp('<em ([^>]*?)'+$H.settings.highlightElementCSSClass+'([^>]*?)>([^>]+?)</em>', 'gi');
            _html = _html.replace(_highlight_element_reg, '<highlight>$3</highlight>');

            //  double EMs
            var _two_highlights_reg = new RegExp('<highlight>([\\s\\S]*?)</highlight>([ \\n\\r\\t]*?)<highlight>([\\s\\S]*?)</highlight>', 'gi');
            while (true && _html.match(_two_highlights_reg)) {
                _html = _html.replace(_two_highlights_reg, '<highlight>$1$3</highlight>');
            }

            //  replace EMs
            var _highlight_reg = new RegExp('<highlight>([\\s\\S]*?)</highlight>', 'gi');
            _html = _html.replace(_highlight_reg, $H.settings.highlightCleanHTMLElementStart+'$1'+$H.settings.highlightCleanHTMLElementEnd);
            
            return _html;
        };
    
    //  get clean html }		


    //  return self
    //  ===========
        return $H;
}