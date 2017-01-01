﻿declare var gSiteVersion: any;

require.config({
    baseUrl:"../",
    paths: {
        "jquery": "Scripts/jquery-3.1.1.min",
        "knockout": "Scripts/knockout-3.4.0",
        "knockout-amd-helpers": "Scripts/knockout-amd-helpers",
        "postbox": "Scripts/knockout-postbox.min",
        "pixi": "Scripts/pixi",
        "text": "Scripts/text",
        "sammy": "Scripts/sammy-0.7.5.min",
        "koMapping": "Scripts/knockout.mapping-latest",
        "stats": "Scripts/stats.min",
        "koBindings": "app/_framework/koBindings",

        "tween": "../../Scripts/Tween",
        "hammerjs": "../../Scripts/hammer.min",
        "p2":"../../Scripts/p2"
    },

    shim: {
        "koMapping": { "deps": ["knockout"] },
        "p2": { exports: "p2" },
        "tween": { exports: "TWEEN" }
    },
    //  urlArgs: "v=" + gSiteVersion
});

require(["knockout", "app/main", "koMapping", "pixi", "stats", "knockout-amd-helpers", "text", "koBindings", "postbox"], function (ko: KnockoutStatic, mainModule, koMapping, PIXI, stats) {

    //  set default folders and extension
    ko.bindingHandlers.module.baseDir = "app/_modules"; // note: currently not used
    ko.amdTemplateEngine.defaultPath = "app/_templates";
    ko.amdTemplateEngine.defaultSuffix = ".html";
    ko.mapping = koMapping;
    ko.applyBindings(mainModule.vm);

    (window as any).stats = new stats();
});