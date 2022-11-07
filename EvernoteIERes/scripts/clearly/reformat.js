/*!
 *  ClearlyComponent__reformat
 *  Evernote Clearly's display as an embeddable component.
 *  Copyright 2013, Evernote Corporation
 *
 *  Usage:
 *  ======
 *
 *      // define
 *      window.ClearlyComponent__reformat = {
 *          'callbacks': {
 *              'frameCreated': someFunction(),
 *              'pageAdded': someFunction(),
 *          },
 *
 *          'settings': { 
 *              'cssPath': 'string',
 *              'pageLabel': 'string'.
 *              'onCreateFrameUseThisId': 'string',
 *              'onCreateFrameDoNotInsertCSS': true
 *          },
 *
 *          'window': window,
 *          'document': document,
 *          'jQuery': window.jQuery
 *      };
 *
 *      // init -- will return false, if something goes wrong
 *      window.ClearlyComponent__reformat = initClearlyComponent__reformat(window.ClearlyComponent__reformat);
 *
 *      // create frame
 *      window.ClearlyComponent__detect.createFrame();
 *
 *      // apply options
 *      window.ClearlyComponent__detect.applyOptions(_options_object);
 *
 *      // add page
 *      window.ClearlyComponent__detect.addNewPage(_html, _source_url);
 *
 */

/*
    changes:
    ========
        $R => $R
        $R.win => $R.window

    to do:
    ======
*/

function initClearlyComponent__reformat(_paramInstance)
{
    //  global instance reference {
    //  ===========================

        //  null; return
        if (_paramInstance); else { return false; }
        
        //  shorthand
        $R = _paramInstance;

    //  global instance reference }


    //  required vars {
    //  ===============
    
        //  the component instance object must already be created,
        //  when the init function is called. it must have these vars set:

        switch (true)
        {
            case (!($R.settings)):
            case (!($R.settings.cssPath)):

            case (!($R.window)):
            case (!($R.document)):
            case (!($R.document.body)):
            
            case (!($R.jQuery)):

                if ($R.debug)
                {
                    console.log(!($R.settings));
                    console.log(!($R.settings.cssPath));

                    console.log(!($R.window));
                    console.log(!($R.document));
                    console.log(!($R.document.body));
            
                    console.log(!($R.jQuery));
                }
                
                //  something's wrong
                return false;
        }
        
    //  required vars }


    //  missing settings {
    //  ==================
    
        //  names for stuff
        /* frame id */            if ($R.settings.onCreateFrameUseThisId); else             { $R.settings.onCreateFrameUseThisId =            'clearly_frame'; }
        /* insert frame css */    if ($R.settings.onCreateFrameDoNotInsertCSS); else        { $R.settings.onCreateFrameDoNotInsertCSS =       false; }
        /* page label */          if ($R.settings.pageLabel); else                          { $R.settings.pageLabel =                         'Page '; }
        
    //  missing settings }


    //  global vars {
    //  =============
    
        $CJ = $R.jQuery;
    
        $R.$window = $CJ($R.window);
        $R.$document = $CJ($R.document);
        
        $R.pagesCount = 0;
        $R.footnotedLinksCount;
        
        /*
            .iframe, .$iframe
            .iframeWindow, .$iframeWindow
            .iframeDocument, .$iframeDocument
            .$iframeBackground, .$iframeBox, .$iframePages
        */
        
    //  global vars }


    //  debug {
    //  =======
        
        $R.debug = ($R.debug || false);
		$R.debugRemembered = {};
        $R.debugTimers = [];
		
		if ($R.debug)
		{
		    //  writeLog
		    //  ========
				switch (true)
				{
					case (!(!($R.window.console && $R.window.console.log))):    $R.writeLog = function (msg) { $R.window.console.log(msg); };       break;
					case (!(!($R.window.opera && $R.window.opera.postError))):  $R.writeLog = function (msg) { $R.window.opera.postError(msg); };   break;
					default:                                                    $R.writeLog = function (msg) {};                                    break;
				}

            //  log
            //  ===
                $R.log = function ()
                {
                    if ($R.debug); else { return; }
                    for (var i=0, il=arguments.length; i<il ; i++) { $R.writeLog(arguments[i]); }
                    $R.writeLog('-----------------------------------------');
                };
                
            //  remember
            //  ========
                $R.debugRemember = function (_k, _v)
                {
                    $R.debugRemembered[_k] = _v;
                };
		}
		else
		{
            $R.writeLog 		= function () { return false; };
            $R.log 				= function () { return false; };
            $R.debugRemember 	= function () { return false; };
        }

    //  debug }


    //  encode / decode {
    //  =================

		$R.encode = function (_string)
		{
			//	none
			if (_string == '') { return 'none'; }
			
			//	encode
			return encodeURIComponent(_string)
				.replace(/!/g, '%21')
				.replace(/'/g, '%27')
				.replace(/\(/g, '%28')
				.replace(/\)/g, '%29')
				.replace(/\*/g, '%2A')
			;
		};
		
		$R.decode = function (_string)
		{
			//	none
			if (_string == 'none') { return ''; }
			
			//	decode
			return decodeURIComponent(_string);
		};
    
    //  encode / decode }


    //  themes {
    //  ========

        (function ()
        {
            //  themes already set
            if ($R.availableThemes) { return; } 
            
            //  set themes
            $R.availableThemes = {
                'newsprint': {
                    'text_font': 			$R.encode('"PT Serif"'),
                    'text_font_header': 	$R.encode('"PT Serif"'),
                    'text_font_monospace': 	$R.encode('Inconsolata'),
                    'text_size': 			$R.encode('16px'),
                    'text_line_height': 	$R.encode('1.5em'),
                    'box_width': 			$R.encode('36em'),
                    'color_background': 	$R.encode('#f3f2ee'),
                    'color_text': 			$R.encode('#1f0909'),
                    'color_links': 			$R.encode('#065588'),
                    'text_align': 			$R.encode('normal'),
                    'base': 				$R.encode('base__newsprint'),
                    'footnote_links': 		$R.encode('on_print'),
                    'large_graphics': 		$R.encode('do_nothing'),
                    'custom_css': 			$R.encode(''
                                            + '#text #articleHeader { border-color: #c5c5c5; }'
                                            + '#text #relatedNotes { border-color: rgba(197, 197, 197, 0.5); }'
                                            + '#text blockquote { border-color: #bababa; color: #656565; }'
                                            + '#text thead { background-color: #dadada; }'
                                            + '#text tr:nth-child(even) { background: #e8e7e7; }'
                                            + '#text hr { border-color: #c5c5c5; }')
                },
                'notable': {
                    'text_font': 			$R.encode('Helvetica, Arial'),
                    'text_font_header': 	$R.encode('Helvetica, Arial'),
                    'text_font_monospace': 	$R.encode('"Droid Sans Mono"'),
                    'text_size': 			$R.encode('14px'),
                    'text_line_height': 	$R.encode('1.5em'),
                    'box_width': 			$R.encode('42em'),
                    'color_background': 	$R.encode('#fff'),
                    'color_text': 			$R.encode('#333'),
                    'color_links': 			$R.encode('#090'),
                    'text_align': 			$R.encode('normal'),
                    'base': 				$R.encode('base__notable'),
                    'footnote_links': 		$R.encode('on_print'),
                    'large_graphics': 		$R.encode('do_nothing'),
                    'custom_css': 			$R.encode(''
                                            + '#text #articleHeader { border-color: #000; }'
                                            + '#text #relatedNotes { border-color: rgba(0, 0, 0, 0.25); }'
                                            + '#text h1 { color: #000; }'
                                            + '#text h2, #text h3, #text h4, #text h5, #text h6 { color: #444; }'
                                            + '#text blockquote { border-color: #d1d1d1; }'
                                            + '#text thead { background-color: #444; color: #fff; }'
                                            + '#text tr:nth-child(even) { background: #d1d1d1; }'
                                            + '#text hr { border-color: #000; }')
                },
                'night_owl': {
                    'text_font': 			$R.encode('"PT Serif"'),
                    'text_font_header': 	$R.encode('"PT Serif"'),
                    'text_font_monospace': 	$R.encode('Inconsolata'),
                    'text_size': 			$R.encode('16px'),
                    'text_line_height': 	$R.encode('1.5em'),
                    'box_width': 			$R.encode('36em'),
                    'color_background': 	$R.encode('#2d2d2d'),
                    'color_text': 			$R.encode('#e3e3e3'),
                    'color_links': 			$R.encode('#e3e3e3'),
                    'text_align': 			$R.encode('normal'),
                    'base': 				$R.encode('base__night_owl'),
                    'footnote_links': 		$R.encode('on_print'),
                    'large_graphics': 		$R.encode('do_nothing'),
                    'custom_css': 			$R.encode(''
                                            + '#text #articleHeader { border-color: #c5c5c5; }'
                                            + '#text #relatedNotes { border-color: rgba(197, 197, 197, 0.5); }'
                                            + '#text a:link { -webkit-transition: all 0.3s ease; -moz-transition: all 0.3s ease; -o-transition: all 0.3s ease; }'
                                            + '#text #relatedNotes a { -webkit-transition-duration: 0s; -moz-transition-duration: 0s; -o-transition-duration: 0s; }'
                                            + '#text a:hover, #text a:active {	color: #44bde8; }'
                                            + '#text blockquote { color: #c1bfbf; border-color: #c1bfbf; }'
                                            + '#text thead { background-color: #4f4f4f; }'
                                            + '#text tr:nth-child(even) { background: #404040; }'
                                            + '#text hr { border-color: #c5c5c5; }')
                }
            };
        })();

    //  themes }


    //  font sizes {
    //  ============
    
        (function ()
        {
            //  font sizes already set
            if ($R.availableFontSizes) { return; } 
            
            //  set font sizes
            $R.availableFontSizes = {
                'small':    { 'newsprint': '12px', 'notable': '12px', 'night_owl': '12px' },
                'medium':   { 'newsprint': '16px', 'notable': '16px', 'night_owl': '16px' },
                'large':    { 'newsprint': '20px', 'notable': '20px', 'night_owl': '20px' }
            };
        })();
    
    //  font sizes }


    //  google fonts {
    //  ==============
    
        (function ()
        {
            //  google fonts already set
            if ($R.availableGoogleFonts) { return; }
            
            //  set google fonts to these
            var __google_fonts_array = [
                /* serif */ 'Arvo', 'Bentham', 'Cardo', 'Copse', 'Corben', 'Crimson Text', 'Droid Serif', 'Goudy Bookletter 1911', 'Gruppo', 'IM Fell', 'Josefin Slab', 'Kreon', 'Meddon', 'Merriweather', 'Neuton', 'OFL Sorts Mill Goudy TT', 'Old Standard TT', 'Philosopher', 'PT Serif', 'Radley', 'Tinos', 'Vollkorn',
                /* sans  */ 'Allerta', 'Anton', 'Arimo', 'Bevan', 'Buda', 'Cabin', 'Cantarell', 'Coda', 'Cuprum', 'Droid Sans', 'Geo', 'Josefin Sans', 'Lato', 'Lekton', 'Molengo', 'Nobile', 'Orbitron', 'PT Sans', 'Puritan', 'Raleway', 'Syncopate', 'Ubuntu', 'Yanone Kaffeesatz',
                /* fixed */ 'Anonymous Pro', 'Cousine', 'Droid Sans Mono', 'Inconsolata'
            ];
            
            //  set
            $R.availableGoogleFonts = {};
            for (var i=0, ii=__google_fonts_array.length; i<ii; i++){
                $R.availableGoogleFonts[__google_fonts_array[i]] = 1;
            }
        })();
    
    //  google fonts }
  
  
    //  default options {
    //  =================

        $R.defaultOptions = 
        {
            'text_font': 			$R.encode('"PT Serif"'),
            'text_font_header': 	$R.encode('"PT Serif"'),
            'text_font_monospace': 	$R.encode('Inconsolata'),
            'text_size': 			$R.encode('16px'),
            'text_line_height': 	$R.encode('1.5em'),
            'box_width': 			$R.encode('36em'),
            'color_background': 	$R.encode('#f3f2ee'),
            'color_text': 			$R.encode('#1f0909'),
            'color_links': 			$R.encode('#065588'),
            'text_align': 			$R.encode('normal'),            /* normal, justified */
            'base': 				$R.encode('base__newsprint'),   /* base__ newsprint, notable, night_owl */
            'footnote_links': 		$R.encode('on_print'),          /* on_print, always, never */
            'large_graphics': 		$R.encode('do_nothing'),        /* do_nothing, hide_on_print, hide_always */
            'custom_css': 			('')
        };
        
    
    //  default options }


    //  get css from options {
    //  ======================

        $R.getCSSFromOptions = function (_options)
        {
            var _cssText = (''
            +	'#body { '
            +		'font-family: [=text_font]; '
            +		'font-size: [=text_size]; '
            +		'line-height: [=text_line_height]; '
            +		'color: [=color_text]; '
            +		'text-align: '+(_options['text_align'] == 'justified' ? 'justify' : 'left')+'; '
            +	'} '
        
            +	'#background { background-color: [=color_background]; } '
        
            +	'.setTextColorAsBackgroundColor { background-color: [=color_text]; } '
            +	'.setBackgroundColorAsTextColor { color: [=color_background]; } '
        
            +	'#box, .setBoxWidth { width: [=box_width]; } '
        
            +	'a { color: [=color_links]; } '
            +	'a:visited { color: [=color_text]; } '
        
            +	'@media print { body.footnote_links__on_print a, body.footnote_links__on_print a:hover { color: [=color_text] !important; text-decoration: none !important; } } '
            +	'body.footnote_links__always a, body.footnote_links__always a:hover { color: [=color_text] !important; text-decoration: none !important; } '
        
            +	'img { border-color: [=color_text]; } '
            +	'a img { border-color: [=color_links]; } '
            +	'a:visited img { border-color: [=color_text]; } '

            +	'h1 a, h2 a, a h1, a h2 { color: [=color_text]; } '
            +	'h1, h2, h3, h4, h5, h6 { font-family: [=text_font_header]; } '

            +	'pre { background-color: [=color_background]; } '
            +	'pre, code { font-family: [=text_font_monospace]; } '
            +	'hr { border-color: [=color_text]; } '

            +	'html.rtl #body #text { text-align: ' + (_options['text_align'] == 'justified' ? 'justify' : 'right')+' !important; } '
            +	'h1, h2, h3, h4, h5, h6 { text-align: left; } '
            +	'html.rtl h1, html.rtl h2, html.rtl h3, html.rtl h4, html.rtl h5, html.rtl h6 { text-align: right !important; } '

            +	'[=custom_css] '
            ).replace(
                /\[=([a-z_]+?)\]/gi,
                function (_match, _key) { return _options[_key]; }
            );
        
            return _cssText;
        }
    
    //  get css from options }


    //  apply options {
    //  ===============
    
        //	var
        //	===

            //  _encodedOptions and _decodeOptions hold the options to be applied
            //	$R.appliedOptions holds the options currently applied (encoded)
            //	$R.loadedGoogleFonts holds the  currently loaded Google fonts URLs

            $R.appliedOptions = {};
            $R.loadedGoogleFonts = {};
        
        //	apply options
        //	=============
            $R.applyOptions = function (_encodedOptions)
            {
                //  possible options
                //  =================
                    var _possible_options = $R.defaultOptions;
                    
                //  our themes        
                //  ==========
                    var _ourOwnThemes = '|theme-1|theme-2|theme-3|';
                
                //	null
                //	====
                    if (_encodedOptions); else { _encodedOptions = {}; }
                
                //  blank, invalid
                //  ==============
                    for (var _option in _possible_options)
                    {
                        switch (true)
                        {
                            case (!(_option in _encodedOptions)):
                            case (!(_encodedOptions[_option] > '')):
                                //  either current, or default
                                _encodedOptions[_option] = ($R.appliedOptions[_option] ? $R.appliedOptions[_option] : _possible_options[_option]);
                                break;
                        }
                    }
            
                //	what to do
                //	==========
            
                    var 
                        _resetBase = false,
                        _resetOptions = false, 
                        _decodedOptions = {}
                    ;

                //  set stuff
                //  =========
                
                    //	_resetBase
                    switch (true)
                    {
                        case (!('base' in  $R.appliedOptions)):
                        case (!(_encodedOptions['base'] == $R.appliedOptions['base'])):
                            _resetBase = true;
                            break;
                    }

                    //	_resetOptions
                    for (var _option in _possible_options)
                    {
                        switch (true)
                        {
                            case (!(_option in $R.appliedOptions)):
                            case (!(_encodedOptions[_option] == $R.appliedOptions[_option])):
                                _resetOptions = true;
                                break;
                        }
                    
                        //	stop
                        if (_resetOptions) { break; }
                    }	

                    //	appliedOptions and optionsToApply
                    for (var _option in _possible_options)
                    {
                        $R.appliedOptions[_option] = _encodedOptions[_option];
                        _decodedOptions[_option] = $R.decode(_encodedOptions[_option]);
                    }

                
                //	apply stuff
                //	===========
            
                    //  base
                    if (_resetBase)
                    {
                        //	remove old
                        $R.$iframeDocument.find('#baseCSS').remove();
                    
                        //	add new
                        if (_decodedOptions['base'] > '')
                        {
                            $R.$iframeDocument.find('head').append(''
                                + '<link id="baseCSS" href="'
                                + $R.settings.cssPath + _decodedOptions['base']+'.css'
                                + '" rel="stylesheet" type="text/css" />'
                            );
                        }
                    }
                
                    //	options
                    if (_resetOptions)
                    {
                        var _cssText = $R.getCSSFromOptions(_decodedOptions);
                
                        //	remove old
                        //	==========
                            $R.$iframeDocument.find('#optionsCSS').remove();
                    
                        //	new
                        //	===
                            var _cssElement = document.createElement('style');
                                _cssElement.setAttribute('type', 'text/css');
                                _cssElement.setAttribute('id', 'optionsCSS');
                            
                            if (_cssElement.styleSheet) { _cssElement.styleSheet.cssText = _cssText; }
                                else { _cssElement.appendChild(document.createTextNode(_cssText)); }
                    
                            $R.$iframeDocument.find('head').append(_cssElement);
                        
                        //	body classes
                        //	============
                            $R.$iframeDocument.find('body')
                                .removeClass('footnote_links__on_print footnote_links__always footnote_links__never')
                                .removeClass('large_graphics__do_nothing large_graphics__hide_on_print large_graphics__hide_always')
                                .addClass('footnote_links__'+_decodedOptions['footnote_links'])
                                .addClass('large_graphics__'+_decodedOptions['large_graphics'])
                            ;
                    }	
            };
    
    //  apply options }


    //  apply google fonts  {
    //  =====================
    
        $R.getGoogleFontsFromOptions = function (_options)
        {
            var 
                _fonts = {},
                _fonts_urls = [],
                _check_font = function (_match, _font) {
                    if (_font in $R.availableGoogleFonts) { _fonts[_font] = 1; }
                }
            ;
        
            //	body
            //	====
                _options['text_font'].replace(/"([^",]+)"/gi, _check_font);
                _options['text_font'].replace(/([^",\s]+)/gi, _check_font);				
        
            //	headers
            //	=======
                _options['text_font_header'].replace(/"([^",]+)"/gi, _check_font);
                _options['text_font_header'].replace(/([^",\s]+)/gi, _check_font);				
        
            //	monospace
            //	=========
                _options['text_font_monospace'].replace(/"([^",]+)"/gi, _check_font);
                _options['text_font_monospace'].replace(/([^",\s]+)/gi, _check_font);				

            //	custom css
            //	==========
                _options['custom_css'].replace(/font-family: "([^",]+)"/gi, _check_font);
                _options['custom_css'].replace(/font-family: ([^",\s]+)/gi, _check_font);
    
            //	return
            //	======
        
                //	transform to array
                for (var _font in _fonts)
                {
                    _fonts_urls.push(''
                        + 'http://fonts.googleapis.com/css?family='
                        + _font.replace(/\s+/g, '+')
                        + ':regular,bold,italic'
                    );
                }
        
                //	return
                return _fonts_urls;
        };
    
        $R.loadGoogleFontsRequiredByAppliedOptions = function ()
        {
            //  decode options
            var _decodedOptions = {};
            for (var _option in $R.appliedOptions)
                { _decodedOptions[_option] = $R.decode($R.appliedOptions[_option]); }
        
            //	get
            var _fonts_urls = $R.getGoogleFontsFromOptions(_decodedOptions);

            //	apply
            for (var i=0,_i=_fonts_urls.length; i<_i; i++) {
                /* loaded */    if ($R.loadedGoogleFonts[_fonts_urls[i]]) { continue; }
                /* load */      $R.$iframeDocument.find('head').append('<link href="'+_fonts_urls[i]+'" rel="stylesheet" type="text/css" />');
                /* mark */      $R.loadedGoogleFonts[_fonts_urls[i]] = 1;
            }
        };
    
    //  apply google fonts }


    //  create frame {
    //  ==============
    
        $R.createFrame = function ()
        {
            //  default id
            //  ==========
                _frame_id = $R.settings.onCreateFrameUseThisId;

            //	iframe
            //	======
                var
                    _iframeElement = $R.document.createElement('div'),
                    _iframeHTML = ''
                    +	'<div id="html">'
                    +	    '<div id="body">'
                    +	    	'<div id="bodyContent">'

                    +	            '<div id="box">'
                    +	    	        '<div id="box_inner">'
                    +	    		        '<div id="text">'
                    +	    			        '<div id="pages"></div>'
                    +	    			        '<ol id="footnotedLinks"></ol>'
                    +	    		        '</div>'
                    +	    	        '</div>'
                    +	            '</div>'
                    +	            '<div id="background"></div>'
                    +           '</div>'
                    +	    '</div>'
                    +	'</div>'
                ;
                _iframeElement.setAttribute('id', _frame_id);

            //	css
            //	===
                
                if ($R.settings.onCreateFrameDoNotInsertCSS); else
                {
                    var 
                        _cssElement = $R.document.createElement('style'),
                        _cssText = ''
                        +	'#'+_frame_id+' { '
                        +		'margin: 0; padding: 0; border: none; '
                        +		'position: absolute; '
                        +		'width: 10px; height: 10px; '
                        +		'top: -100px; left: -100px; '
                        +	'} '
                    ;
                    _cssElement.setAttribute('id', _frame_id + '__css');
                    _cssElement.setAttribute('type', 'text/css');
                    if (_cssElement.styleSheet) { _cssElement.styleSheet.cssText = _cssText; }
                        else { _cssElement.appendChild($R.document.createTextNode(_cssText)); }
                }
        
            //	write
            //	=====

                var _body = $R.document.getElementsByTagName('body')[0];
                    /* css */   if (_cssElement) { _body.appendChild(_cssElement); }
                    /* frame */ _body.appendChild(_iframeElement);

                var _iframe = $R.document.getElementById(_frame_id);
                var _doc;
                _iframe.innerHTML = _iframeHTML;


            //  callback & variables
            //  ====================
                var _check_interval = false;
                var _check = function ()
                {
                    //  iframe
                        var _iframe = $R.document.getElementById(_frame_id);
                        if (_iframe); else { return; }

                    //  body
                        var _body = $CJ(_iframe).find('#bodyContent')[0];

                        if (_body); else { return; }
                        
                    //  clear interval
                        $R.window.clearInterval(_check_interval);
                        
                    //  global vars
                        $R.iframe = _iframe;
                        $R.$iframe = $CJ($R.iframe);

                        $R.iframeDocument = _iframe;
                        $R.$iframeDocument = $CJ($R.iframeDocument);

                        $R.iframeWindow = _iframe;
                        $R.$iframeWindow = $CJ($R.iframeWindow);

                        $R.$iframeBox = $R.$iframeDocument.find('#box');
                        $R.$iframePages = $R.$iframeDocument.find('#pages');
                        $R.$iframeBackground = $R.$iframeDocument.find('#background');
                        $R.$iframeFootnotedLinks = $R.$iframeDocument.find('#footnotedLinks');
                    
                    //  callback
                        if ($R.callbacks.frameCreated) { $R.callbacks.frameCreated(); }
                };
                
                //  set interval
                _check_interval = $R.window.setInterval(_check, 250);
        };

    //  create frame }
    
    
    //  add page {
    //  ==========
    
        $R.addNewPage = function (_pageHTML, _pageURL)
        {
            //  update page count
            //  =================
                var _pageNr = $R.pagesCount + 1;
                $R.pagesCount++;
        
            //	separator
            //	=========
                if (_pageNr > 1)
                {
                    $R.$iframePages.append(''
                        + '<div class="pageSeparator">'
                        +	'<div class="pageSeparatorLine setTextColorAsBackgroundColor"></div>'
                        + 	'<div class="pageSeparatorLabel"><em>'+$R.settings.pageLabel+_pageNr+'</em></div>'
                        + '</div>'
                    );
                }
            
            //	append page
            //	===========
                $R.$iframePages.append(''
                    + '<div class="page" id="page'+_pageNr+'">'
                    +     '<div class="page_content">'
                    + 	      _pageHTML
                    +     '</div>'
                    + '</div>'
                );
            
            //  this new page
            //  =============
            
                //  cache
                var _$page = $R.$iframeDocument.find('#page'+_pageNr);

                //	links as footnotes
                _$page.find('a').each(function (_index, _element)
                {
                    //	check
                    var _href = _element.href;
                    if (_href > ''); else { return; }
                    if (_href.indexOf); else { return; }
                    if (_href.indexOf('#') > -1) { return; }
                
                    //	count
                    var _nr = ++$R.footnotedLinksCount;
                
                    //	add
                    $CJ(_element).append(' <sup class="readableLinkFootnote">['+_nr+']</sup>');
                    $R.$iframeFootnotedLinks.append('<li>'+_href+'</li>');
                });
        };
    
    //  add page }


    //  clear all pages {
    //  =================
    
        $R.clearAllPages = function ()
        {
            //  reset pages count
            $R.pagesCount = 0;
            
            //  delete all pages
            $R.$iframePages.get(0).innerHTML = '';
            
            //  reset footnote count
            $R.footnotedLinksCount = 0;
            
            //  delete all footnotes
            $R.$iframeFootnotedLinks.get(0).innerHTML = '';
        };
    
    //  clear all pages }


    //  return self
    //  ===========
        return $R;
}