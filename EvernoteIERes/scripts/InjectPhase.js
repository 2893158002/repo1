/**
 * Created by chizhikov on 24.04.14.
 */


Evernote.InjectPhase = {

    start: function() {

        Evernote.windowToInject = Evernote.DocumentFinder.findInjectableWindow(external.menuArguments);
        Evernote.docToInject = Evernote.windowToInject.document;

        var evernoteAddin;

        try {
            evernoteAddin = Evernote.AddinCreator.create(Evernote.IEVersion.getVersion());
        } catch(e) {
            alert("We cannot establish connection with Evernote application.\n" /
                "Please restart Internet Explorer.\n" /
                "In case if that doesn't help please reinstall Evernote application.");
        }

        if(evernoteAddin) {
            Evernote.Addin.init(evernoteAddin);
            Evernote.Logger = Evernote.LoggerConfigurator.getLogger();

            Evernote.windowToInject.EvernoteExternal = external.menuArguments.EvernoteExternal;
            Evernote.windowToInject.EvernoteExternal.Addin = Evernote.AddinCreator.create(Evernote.IEVersion.getVersion());
            Evernote.windowToInject.EvernoteExternal.cursorXPosition = Evernote.Addin.getCursorXPosition();

            if ( isLocalResource(external.menuArguments.document) ) {
                Evernote.Logger.debug("Local resource is not supported");
                alert(Evernote.Addin.getLocalizedMessage(Evernote.Messages.UNSUPPORTED_SCHEMA));
            } else {

                if ( Evernote.docToInject && !Evernote.docToInject.getElementById(Constants.CLIP_DIALOG_ID) ) {
                    Evernote.Logger.debug("injecting required files to page");

                    if (Evernote.IEVersion.getVersion() >= 10 && Evernote.docToInject.documentMode >= 10) {

                        Evernote.Injector.inject(
                            {
                                css: this.modern_css,
                                scripts: this.modern_js ,
                                html :
                                    [
                                        {
                                            path: "html/main_popup.html",
                                            containerId: Constants.CLIP_DIALOG_ID
                                        },
                                        {
                                            path: "html/post_clip_popup.html",
                                            containerId: Constants.POST_CLIP_DIALOG_ID
                                        },
                                        {
                                            path: "html/options.html",
                                            containerId: Constants.OPTIONS_DIALOG_ID
                                        }
                                    ]
                                ,
                                document: Evernote.docToInject
                            }
                        );
                    } else {
                        Evernote.Injector.inject(
                            {
                                css: this.old_css,
                                scripts:this.old_js,
                                html :
                                    [
                                        {
                                            path: "oldclipper/html/old_main_popup.html",
                                            containerId: Constants.CLIP_DIALOG_ID
                                        },
                                        {
                                            path: "html/post_clip_popup.html",
                                            containerId: Constants.POST_CLIP_DIALOG_ID
                                        },
                                        {
                                            path: "html/options.html",
                                            containerId: Constants.OPTIONS_DIALOG_ID
                                        }
                                    ]
                                ,
                                document: Evernote.docToInject
                            }
                        );
                    }

                    Evernote.Logger.debug("Content injected");
                    return;
                }

                if ( Evernote.windowToInject.Evernote && Evernote.windowToInject.Evernote.evernotePopup ) {

                    if( !Evernote.windowToInject.Evernote.evernotePopup.isShown ) {
                        Evernote.Logger.debug("Popup is already available. Just show it");

                        Evernote.Injector.inject({
                            scripts:  [ "scripts/PopupViewer.js" ],
                            document: Evernote.docToInject
                        });

                    } else {

                        Evernote.Injector.inject({
                            scripts:  [ "scripts/PopupCloser.js" ],
                            document: Evernote.docToInject
                        });
                    }
                }
            }
        }
    },

    modern_css : [
        "css/cssreset-context-min.css" ,
        "css/contentclipper.css" ,
        "css/contentpreview.css" ,
        "css/clearly.css" ,
        "css/post_clip_popup.css" ,
        "css/main_popup.css" ,
        "css/main_popup_skitch.css" ,
        "css/main_popup_notebooks.css" ,
        "css/main_popup_tags.css" ,
        "css/z-indexes.css" ,
        "css/options.css",
        "css/jquery.mCustomScrollbar.css"
    ],

    old_css : [
        "oldclipper/css/contentclipper.css",
        "oldclipper/css/contentpreview.css",
        "css/cssreset-context-min.css",
        "oldclipper/css/old_post_clip_popup.css" ,
        "oldclipper/css/old_main_popup.css",
        "oldclipper/css/old_main_popup_tags.css",
        "oldclipper/css/old_main_popup_notebooks.css",
        "css/options.css",
        "css/z-indexes.css",
        "css/clearly.css"
    ],

    //Order of injecting is important since some files may execute something when loaded.
    //The rule is Evernote.js and Logger.js should be on top - Evernote defines namespace that used by other classes and Logger provides logging.
    //Loader.js should be the last one since it initializes the popup layer and it is expected that everything is already loaded.

    modern_js : [
        "scripts/Evernote.js",
        "scripts/EnClipper.js",
        "scripts/EvernoteAsyncEngine.js",
        "scripts/EvernoteAddin.js",
        "scripts/loggers/FileLogger.js",
        "scripts/loggers/ConsoleLogger.js",
        "scripts/loggers/AlertLogger.js",
        "scripts/loggers/LoggerConfigurator.js",
        "scripts/DocumentLoadedHandler.js",
        "scripts/Constants.js",
        "scripts/third_party/jquery-1.7.2.min.js",
        "scripts/third_party/jquery.corner.js",
        "scripts/third_party/clearly_component.js",
        "scripts/third_party/json2.js",
        "scripts/third_party/html5placeholder.jquery.js",
        "scripts/third_party/jquery.mCustomScrollbar.concat.min.js",
        "scripts/JQueryLoader.js",
        "scripts/third_party/markup.min.js",
        "scripts/clearly/detect.js",
        "scripts/clearly/highlight.js",
        "scripts/clearly/next.js",
        "scripts/clearly/reformat.js",
        "scripts/ClearlyController.js",
        "scripts/SkitchController.js",
        "scripts/SelectionFinder.js",
        "scripts/serialization/JSSerializer.js",
        "scripts/ClipNotificator.js",
        "scripts/TagsCachedLoader.js",
        "scripts/Clipper.js",
        "scripts/ClipOptions.js",
        "scripts/Popup.js",
        "scripts/PostClipPopup.js",
        "scripts/ContentVeil.js",
        "scripts/ScreenshotVeil.js",
        "scripts/PageInfo.js",
        "scripts/Scroller.js",
        "scripts/ContentPreview.js",
        "scripts/DomElementExtension.js",
        "scripts/ArrayExtension.js",
        "scripts/StyleElementExtension.js",
        "scripts/GlobalUtils.js",
        "scripts/Utils.js",
        "scripts/Options.js",
        "scripts/Notify.js",
        "scripts/BrowserDetection.js",
        "scripts/OptionsDialog.js",
        "scripts/Node.js",
        "scripts/Share.js",
        "scripts/Messages.js",
        "scripts/addin/FS.js",
        "scripts/components/NotebookSelector.js",
        "scripts/components/AutocompleteBox.js",
        "scripts/response/ResponseReceiver.js",
        "scripts/response/NotebookResponseParser.js",
        "scripts/response/TagsResponseParser.js",
        "scripts/response/AddNoteResponseParser.js",
        "scripts/response/VersionResponseParser.js",
        "scripts/response/ProcessIDResponseParser.js",
        "scripts/response/ErrorResponseParser.js",
        "scripts/ErrorHandler.js",
        "scripts/response/Response.js",
        "scripts/model/Notebook.js",
        "scripts/model/Tag.js",
        "scripts/model/NotebookTypes.js",
        "scripts/serialization/AbstractElementSerializer.js",
        "scripts/serialization/ElementSerializerFactory.js",
        "scripts/serialization/ClipStylingStrategy.js",
        "scripts/serialization/ClipFullStylingStrategy.js",
        "scripts/serialization/ClipRules.js",
        "scripts/serialization/ClipStyle.js",
        "scripts/serialization/ClipStyleProperty.js",
        "scripts/serialization/DomParser.js",
        "scripts/serialization/NodeSerializer.js",
        "scripts/serialization/SerializedNode.js",
        "scripts/serialization/StylesCollection.js",
        "scripts/serialization/custom/DataImageSerializer.js",
        "scripts/serialization/custom/VideoElementSerializer.js",
        "scripts/serialization/custom/YoutubeElementSerializer.js",
        "scripts/serialization/IEStylePropertiesMapping.js",
        "scripts/serialization/styles/StylesReplacementRegistry.js",
        "scripts/serialization/styles/FontSizeReplacement.js",
        "scripts/ClipperElementsIdentifiers.js",
        "scripts/NotebooksLoader.js",
        "scripts/ErrorCodes.js",
        "scripts/AuthenticatedException.js",
        "scripts/Loader.js"
    ],

    old_js :   [
        "scripts/Evernote.js",
        "scripts/EnClipper.js",
        "scripts/EvernoteAsyncEngine.js",
        "scripts/EvernoteAddin.js",
        "scripts/loggers/FileLogger.js",
        "scripts/loggers/ConsoleLogger.js",
        "scripts/loggers/AlertLogger.js",
        "scripts/loggers/LoggerConfigurator.js",
        "scripts/DocumentLoadedHandler.js",
        "scripts/Constants.js",
        "scripts/third_party/jquery-1.7.2.min.js",
        "scripts/third_party/jquery.corner.js",
        "scripts/third_party/clearly_component.js",
        "scripts/ClearlyController.js",
        "scripts/clearly/detect.js",
        "scripts/clearly/reformat.js",
        "scripts/third_party/json2.js",
        "scripts/third_party/html5placeholder.jquery.js",
        "scripts/SelectionFinder.js",
        "scripts/Notify.js",
        "scripts/Share.js",
        "scripts/PostClipPopup.js",
        "scripts/serialization/JSSerializer.js",
        "scripts/JQueryLoader.js",
        "scripts/ClipNotificator.js",
        "scripts/TagsCachedLoader.js",
        "scripts/Clipper.js",
        "scripts/ClipOptions.js",
        "oldclipper/scripts/Popup.js",
        "oldclipper/scripts/ContentVeil.js",
        "oldclipper/scripts/PageInfo.js",
        "scripts/Scroller.js",
        "oldclipper/scripts/ContentPreview.js",
        "scripts/DomElementExtension.js",
        "scripts/ArrayExtension.js",
        "scripts/StyleElementExtension.js",
        "scripts/GlobalUtils.js",
        "scripts/Utils.js",
        "scripts/Options.js",
        "scripts/BrowserDetection.js",
        "scripts/OptionsDialog.js",
        "scripts/Node.js",
        "scripts/Messages.js",
        "scripts/addin/FS.js",
        "scripts/components/AutocompleteBox.js",
        "scripts/components/EvernoteCustomScroll.js",
        "scripts/components/Old-IE-NotebookSelector.js",
        "scripts/response/ResponseReceiver.js",
        "scripts/response/NotebookResponseParser.js",
        "scripts/response/AddNoteResponseParser.js",
        "scripts/response/TagsResponseParser.js",
        "scripts/response/VersionResponseParser.js",
        "scripts/response/ProcessIDResponseParser.js",
        "scripts/response/ErrorResponseParser.js",
        "scripts/ErrorHandler.js",
        "scripts/response/Response.js",
        "scripts/model/Notebook.js",
        "scripts/model/Tag.js",
        "scripts/model/NotebookTypes.js",
        "scripts/serialization/AbstractElementSerializer.js",
        "scripts/serialization/ElementSerializerFactory.js",
        "scripts/serialization/ClipStylingStrategy.js",
        "scripts/serialization/ClipFullStylingStrategy.js",
        "scripts/serialization/ClipRules.js",
        "oldclipper/scripts/serialization/ClipStyle.js",
        "scripts/serialization/ClipStyleProperty.js",
        "scripts/serialization/DomParser.js",
        "scripts/serialization/NodeSerializer.js",
        "scripts/serialization/SerializedNode.js",
        "scripts/serialization/StylesCollection.js",
        "scripts/serialization/custom/DataImageSerializer.js",
        "scripts/serialization/custom/VideoElementSerializer.js",
        "scripts/serialization/custom/YoutubeElementSerializer.js",
        "scripts/serialization/IEStylePropertiesMapping.js",
        "scripts/serialization/styles/StylesReplacementRegistry.js",
        "scripts/serialization/styles/FontSizeReplacement.js",
        "scripts/ClipperElementsIdentifiers.js",
        "scripts/NotebooksLoader.js",
        "scripts/ErrorCodes.js",
        "scripts/AuthenticatedException.js",
        "scripts/Loader.js"
    ]

};

