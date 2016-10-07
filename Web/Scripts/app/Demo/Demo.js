define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var DemoVM = (function () {
        function DemoVM() {
            var _this = this;
            this.entities = [];
            this.isRunning = true;
            this.animate = function () {
                if (_this.isRunning)
                    requestAnimationFrame(_this.animate);
                _this.renderer.render(_this.stage);
            };
            this.setupStage = function () {
                var canvas = document.getElementById("stage");
                var renderOptions = {
                    view: canvas,
                    backgroundColor: 0x1099bb,
                    antialias: true,
                    transparent: false,
                    resolution: window.devicePixelRatio
                };
                _this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, renderOptions);
                _this.renderer.autoResize = true;
                _this.stage = new PIXI.Container();
                _this.resizeCanvas();
                _this.animate();
                window.onresize = function (event) {
                    _this.resizeCanvas();
                };
                //  load sprites
                var resources = PIXI.loader.resources;
                _this.hero = new PIXI.Sprite(resources["hero"].texture);
                _this.stage.addChild(_this.hero);
                _this.hideOverlay();
            };
            this.loadProgressHandler = function (loader, resource) {
                _this.resourceText("loading: '" + resource.url + "', progress: " + loader.progress + "%");
                for (var i = 0; i < 1000; i++) {
                    var j = Math.random();
                    console.log(j);
                }
            };
            this.resizeCanvas = function () {
                var HEADER_HEIGHT = 50;
                var FOOTER_HEIGHT = 50;
                var w = window.innerWidth;
                var h = window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
                _this.renderer.view.style.width = w + "px";
                _this.renderer.view.style.height = h + "px";
                _this.renderer.resize(w, h);
            };
            this.resourceText = ko.observable("");
            this.overlayText = ko.observable("");
            this.showOverlay = function (text) {
                $(".overlay").css("visibility", "visible");
                $(".overlay").css("opacity", "1");
                _this.overlayText(text);
            };
            this.hideOverlay = function () {
                $(".overlay").css("visibility", "hidden");
                $(".overlay").css("opacity", "0");
            };
            this.showOverlay("Loading resources...");
            PIXI.loader.reset();
            PIXI.loader
                .add("coins", "assets/images/coins.png")
                .add("collectibles", "assets/images/collectibles.png")
                .add("hero", "assets/images/Hero.png")
                .load(function () { return setTimeout(_this.setupStage, 1000); })
                .on("progress", this.loadProgressHandler);
        }
        return DemoVM;
    }());
    return DemoVM;
});
//# sourceMappingURL=Demo.js.map