var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "app/_engine/Scene", "app/Demo/InGameScene", "app/Demo/Global"], function (require, exports, Scene_1, InGameScene_1, Global) {
    "use strict";
    var LoaderScene = (function (_super) {
        __extends(LoaderScene, _super);
        function LoaderScene() {
            var _this = this;
            _super.call(this, "Loader");
            this.onActivate = function () {
                _this.loadingMessage = new PIXI.Text("Loading", { fontSize: "52px", fontFamily: "Futura", fill: "white", align: "Left", dropShadow: true, stroke: "#44ff44", strokeThickness: 6 });
                _this.loadingMessage.anchor.set(0, 0.5);
                _this.loadingMessage.position.set(550, 350);
                _this.addChild(_this.loadingMessage);
                //------------------------------------------------------
                //  get loading image and define callback on image load
                //------------------------------------------------------
                PIXI.loader.reset();
                PIXI.loader
                    .add('Assets/Images/loading.png')
                    .load(function () {
                    //  once the loading image is downloaded start spinning it and invoke Initialize()
                    var loadingTexture = PIXI.Texture.fromImage('Assets/Images/loading.png');
                    var romb = new PIXI.Sprite(loadingTexture);
                    romb.position.set(500, 350);
                    romb.anchor.set(0.5, 0.5);
                    romb.scale.set(0.5);
                    _this.addChild(romb);
                    _this.onUpdate = function () {
                        romb.rotation += 0.05;
                    };
                    _this.downloadAssets();
                });
            };
            this.onProgress = function (loader, resource) {
                var progress = loader.progress;
                console.log("progress: " + progress.toFixed(2) + "%, asset: " + resource.name);
                _this.loadingMessage.text = "Loading " + progress.toFixed(2) + " %";
            };
            this.onAssetsLoaded = function () {
                console.log("onAssetsLoaded...");
                _this.loadingMessage.text = "Loading 100 %";
                var inGame = new InGameScene_1.InGameScene();
                Global.sceneMngr.AddScene(inGame);
                //  setTimeout is only to make the 100% noticeable
                setTimeout(function () {
                    _this.removeChild(_this.loadingMessage);
                    Global.sceneMngr.ActivateScene(inGame);
                }, 800);
            };
            this.BackGroundColor = 0x1099bb;
        }
        LoaderScene.prototype.downloadAssets = function () {
            console.log("Initializing...");
            PIXI.loader.reset();
            var assets = [
                "assets/images/hero.png",
                "assets/images/Gui/Button1.png",
                "assets/images/Gui/Listitem.png",
                "assets/images/Npcs/bahamut.png",
                "assets/images/Npcs/barrissoffee.png",
                "assets/images/Npcs/ifrit.png",
                "assets/images/Npcs/leviathan.png",
                "assets/images/Npcs/phoenix.png",
                "assets/images/Npcs/tonberry.png",
                "assets/images/background/Canyon.png",
                "assets/images/background/Mountains.png",
                "assets/images/background/trees01.png",
                "assets/images/background/trees02.png",
                "assets/images/background/trees03.png",
                "assets/images/background/trees04.png",
                "assets/images/background/trees05.png",
            ];
            PIXI.loader.add(assets)
                .load(this.onAssetsLoaded)
                .on("progress", this.onProgress);
        };
        return LoaderScene;
    }(Scene_1.Scene));
    exports.LoaderScene = LoaderScene;
});
//# sourceMappingURL=LoaderScene.js.map