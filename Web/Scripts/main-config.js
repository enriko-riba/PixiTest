require.config({
    paths: {
        "jquery": "jquery-3.1.1.min",
        "knockout": "knockout-3.4.0",
        "postbox": "knockout-postbox.min",
        "text": "text",
        "koBindings": "app/_framework/koBindings",
        "sammy": "sammy-0.7.5.min",
        "bootstrap": "bootstrap.min",
        "koMapping": "knockout.mapping-latest",
        "pixi.js": "pixi.min",
        "stats": "stats.min",
        "tween": "Tween",
    },
    shim: {
        "bootstrap": { "deps": ["jquery"] },
        "koMapping": { "deps": ["knockout"] },
        "p2": { exports: "p2" },
        "tween": { exports: "TWEEN" }
    },
});
require(["knockout", "app/main", "koMapping", "pixi", "stats", "bootstrap", "knockout-amd-helpers", "text", "koBindings", "postbox"], function (ko, mainModule, koMapping, PIXI, stats) {
    ko.bindingHandlers.module.baseDir = "app/_modules";
    ko.amdTemplateEngine.defaultPath = "app/_templates";
    ko.amdTemplateEngine.defaultSuffix = ".html";
    ko.mapping = koMapping;
    ko.applyBindings(mainModule.vm);
    window.stats = new stats();
    $(document).on('click', '.navbar-collapse.in a', function (e) {
        if ($(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle') {
            $('#bs-navbar').removeClass('in');
            $(this).collapse('hide');
        }
    });
    $(document).on('click', '.navbar-collapse li.open a', function (e) {
        if ($(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle') {
            $('.dropdown.active.open').removeClass('open');
        }
    });
});
