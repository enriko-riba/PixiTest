define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    var DemoVM = (function () {
        function DemoVM() {
            var _this = this;
            this.entities = [];
            this.isRunning = true;
            this.GAME_HEIGHT = 600;
            this.GAME_WIDTH = 800;
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
                window.removeEventListener("resize", _this.resizeCanvas);
                window.addEventListener("resize", _this.resizeCanvas);
                var resources = PIXI.loader.resources;
                //  setup background
                _this.backgroundNear = new PIXI.particles.ParticleContainer();
                _this.stage.addChild(_this.backgroundNear);
                var tree = new PIXI.Sprite(resources["trees01"].texture);
                _this.backgroundNear.addChild(tree);
                //  setup sprites
                _this.hero = new PIXI.Sprite(resources["hero"].texture);
                _this.stage.addChild(_this.hero);
                _this.hideOverlay();
            };
            this.loadProgressHandler = function (loader, resource) {
                _this.resourceText("loading: '" + resource.url + "', progress: " + loader.progress + "%");
                console.log("loading: '" + resource.url + "', progress: " + loader.progress + "%");
            };
            this.resizeCanvas = function () {
                var HEADER_HEIGHT = 50;
                var FOOTER_HEIGHT = 50;
                var w = window.innerWidth;
                var h = window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
                //this.renderer.view.style.width = w + "px";
                //this.renderer.view.style.height = h + "px";
                //this.renderer.resize(w, h);
                var ratio = Math.min(w / _this.GAME_WIDTH, h / _this.GAME_HEIGHT);
                // Scale the view appropriately to fill that dimension
                _this.stage.scale.x = _this.stage.scale.y = ratio;
                // Update the renderer dimensions
                _this.renderer.resize(w /*Math.ceil(this.GAME_WIDTH * ratio)*/, Math.ceil(_this.GAME_HEIGHT * ratio));
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
                .add("trees01", "assets/images/trees01.png")
                .add("trees02", "assets/images/trees02.png")
                .add("trees03", "assets/images/trees03.png")
                .add("trees04", "assets/images/trees04.png")
                .add("trees05", "assets/images/trees05.png")
                .load(this.setupStage)
                .on("progress", this.loadProgressHandler);
        }
        return DemoVM;
    }());
    return DemoVM;
});
//# sourceMappingURL=Demo.js.map