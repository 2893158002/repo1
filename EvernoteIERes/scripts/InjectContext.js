Evernote.InjectContext = {

    start: function(){


        Evernote.docToInject = external.menuArguments.document;
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
            external.menuArguments.EvernoteExternal.Addin = Evernote.AddinCreator.create(Evernote.IEVersion.getVersion());
            var clipAction = Evernote.ArgumentsParser.parse(document.location.href)["clipAction"];
            external.menuArguments.EvernoteExternal.clipOptions = new Evernote.ClipOptions({clipAction: clipAction});
            external.menuArguments.EvernoteExternal.imageElement = external.menuArguments.event.srcElement;
            if(isLocalResource(external.menuArguments.document)) {
                Evernote.Logger.debug("Local resource is not supported");
                alert(Evernote.Addin.getLocalizedMessage(Evernote.Messages.UNSUPPORTED_SCHEMA));
            } else if ( Evernote.docToInject && !Evernote.docToInject.getElementById( Constants.CLIP_DIALOG_ID ) ) {

                if (Evernote.IEVersion.getVersion() >= 10 && Evernote.docToInject.documentMode >= 10)
                {
                    Evernote.Injector.inject({
                        css: this.modern_css,
                        scripts: this.modern_js,
                        html :
                            [
                                {
                                    path: "html/post_clip_popup.html",
                                    containerId: Constants.POST_CLIP_DIALOG_ID
                                }
                            ]
                        ,
                        document: Evernote.docToInject,
                        injectStylesContent : true
                    });
                } else {
                    Evernote.Injector.inject({
                        css:this.old_css,
                        scripts: this.old_js,
                        html :
                            [
                                {
                                    path: "html/post_clip_popup.html",
                                    containerId: Constants.POST_CLIP_DIALOG_ID
                                }
                            ]
                        ,
                        document: Evernote.docToInject
                    });

                }
                Evernote.Logger.debug("Content injected");

            }
            else {
                if ( external.menuArguments.Evernote.Clipper && external.menuArguments.EvernoteExternal.clipOptions ) {
                    Evernote.Injector.inject({
                        scripts:  [
                            "scripts/AlertErrorHandler.js",
                            "scripts/ContextMenuLoader.js"
                        ],
                        document: Evernote.docToInject
                    });
                }
            }
        }

    },

    modern_css: [
        "css/cssreset-context-min.css" ,
        "css/main_popup.css" ,
        "css/contentclipper.css" ,
        "css/post_clip_popup.css" ,
        "css/z-indexes.css"],
    old_css:  [
        "css/cssreset-context-min.css" ,
        "oldclipper/css/old_main_popup.css" ,
        "oldclipper/css/contentclipper.css",
        "oldclipper/css/old_post_clip_popup.css" ,
        "css/z-indexes.css"
    ],

    //Order of injecting is important since some files may execute something when loaded.
    //The rule is Evernote.js and Logger.js should be on top - Evernote defines namespace that used by other classes and Logger provides logging.
    //ContextMenuLoader.js should be the last one since it initializes the clipper.

    modern_js:  [
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
        "scripts/third_party/clearly_component.js",
        "scripts/third_party/json2.js",
        "scripts/third_party/jquery.mCustomScrollbar.concat.min.js",
        "scripts/third_party/html5placeholder.jquery.js",
        "scripts/clearly/detect.js",
        "scripts/clearly/highlight.js",
        "scripts/clearly/next.js",
        "scripts/clearly/reformat.js",
        "scripts/ClearlyController.js",
        "scripts/SelectionFinder.js",
        "scripts/serialization/JSSerializer.js",
        "scripts/JQueryLoader.js",
        "scripts/ClipNotificator.js",
        "scripts/Clipper.js",
        "scripts/ClipOptions.js",
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
        "scripts/BrowserDetection.js",
        "scripts/Node.js",
        "scripts/Share.js",
        "scripts/PostClipPopup.js",
        "scripts/Messages.js",
        "scripts/response/ResponseReceiver.js",
        "scripts/response/ProcessIDResponseParser.js",
        "scripts/response/NotebookResponseParser.js",
        "scripts/response/AddNoteResponseParser.js",
        "scripts/response/ErrorResponseParser.js",
        "scripts/ErrorHandler.js",
        "scripts/response/Response.js",
        "scripts/addin/FS.js",
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
        "scripts/model/Notebook.js",
        "scripts/model/Tag.js",
        "scripts/model/NotebookTypes.js",
        "scripts/ErrorCodes.js",
        "scripts/AuthenticatedException.js",
        "scripts/ContextMenuLoader.js"
    ],
    old_js:  [
        "scripts/Evernote.js",
        "scripts/EnClipper.js",
        "scripts/EvernoteAddin.js",
        "scripts/loggers/FileLogger.js",
        "scripts/loggers/ConsoleLogger.js",
        "scripts/loggers/AlertLogger.js",
        "scripts/loggers/LoggerConfigurator.js",
        "scripts/DocumentLoadedHandler.js",
        "scripts/Constants.js",
        "scripts/third_party/jquery-1.7.2.min.js",
        "scripts/third_party/clearly_component.js",
        "scripts/third_party/json2.js",
        "scripts/third_party/html5placeholder.jquery.js",
        "scripts/clearly/detect.js",
        "scripts/clearly/highlight.js",
        "scripts/clearly/next.js",
        "scripts/clearly/reformat.js",
        "scripts/ClearlyController.js",
        "scripts/SelectionFinder.js",
        "scripts/serialization/JSSerializer.js",
        "scripts/JQueryLoader.js",
        "scripts/ClipNotificator.js",
        "scripts/Clipper.js",
        "scripts/ClipOptions.js",
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
        "scripts/Node.js",
        "scripts/Share.js",
        "scripts/PostClipPopup.js",
        "scripts/Messages.js",
        "scripts/response/ResponseReceiver.js",
        "scripts/response/NotebookResponseParser.js",
        "scripts/response/AddNoteResponseParser.js",
        "scripts/response/ProcessIDResponseParser.js",
        "scripts/response/ErrorResponseParser.js",
        "scripts/ErrorHandler.js",
        "scripts/response/Response.js",
        "scripts/addin/FS.js",
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
        "scripts/model/Notebook.js",
        "scripts/model/Tag.js",
        "scripts/model/NotebookTypes.js",
        "scripts/ErrorCodes.js",
        "scripts/AuthenticatedException.js",
        "scripts/ContextMenuLoader.js"
    ]
};