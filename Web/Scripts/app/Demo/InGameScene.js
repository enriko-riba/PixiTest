var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "app/_engine/Scene", "app/_engine/SceneManager", "app/_engine/Parallax", "app/_engine/KeyboardMapper", "app/_engine/AnimatedSprite", "app/Demo/Global"], function (require, exports, Scene_1, SceneManager_1, Parallax_1, KeyboardMapper_1, AnimatedSprite_1, Global) {
    "use strict";
    /**
    *   Load in game scene.
    */
    var InGameScene = (function (_super) {
        __extends(InGameScene, _super);
        /**
        *   Creates a new scene instance.
        */
        function InGameScene() {
            var _this = this;
            _super.call(this, "InGame");
            this.entities = [];
            this.MoveLeft = function () {
                _this.backgroundFar.ViewPort.x += 1.0;
                _this.backgroundNear.ViewPort.x += 1.85;
                _this.hero.PlayAnimation("left");
            };
            this.MoveRight = function () {
                _this.backgroundFar.ViewPort.x -= 1.0;
                _this.backgroundNear.ViewPort.x -= 1.85;
                _this.hero.PlayAnimation("right");
            };
            this.onResize = function () {
                _this.hero.position.set(Global.sceneMngr.Renderer.width / 2, Global.SCENE_HEIGHT - 100);
                var vps = new PIXI.Point(Global.sceneMngr.Renderer.width, Global.sceneMngr.Renderer.height);
                _this.backgroundNear.ViewPortSize = vps;
                _this.backgroundFar.ViewPortSize = vps;
            };
            this.onUpdate = function () {
                Global.kbd.update(SceneManager_1.State.IN_GAME);
                _this.hero.update(16.7);
            };
            this.setup();
        }
        InGameScene.prototype.setup = function () {
            var _this = this;
            this.BackGroundColor = 0x1099bb;
            Global.kbd.AddKeyboardActionHandler(new KeyboardMapper_1.KeyboardAction(65, 'Move left', function () { return _this.MoveLeft(); }, false), SceneManager_1.State.IN_GAME);
            Global.kbd.AddKeyboardActionHandler(new KeyboardMapper_1.KeyboardAction(68, 'Move right', function () { return _this.MoveRight(); }, false), SceneManager_1.State.IN_GAME);
            //var hud = new Hud();
            //this.HudOverlay = hud;
            var resources = PIXI.loader.resources;
            //-----------------------------
            //  setup backgrounds
            //-----------------------------
            var t = resources["assets/images/background/Canyon.png"].texture;
            this.backgroundFar = new Parallax_1.Parallax([t]);
            this.addChild(this.backgroundFar);
            var nearTextures = [];
            for (var i = 0; i < 5; i++) {
                var name = "assets/images/background/trees0" + (i + 1) + ".png";
                nearTextures.push(resources[name].texture);
            }
            this.backgroundNear = new Parallax_1.Parallax(nearTextures);
            this.backgroundNear.position.y = Global.SCENE_HEIGHT - this.backgroundNear.height - 5;
            this.addChild(this.backgroundNear);
            //-----------------------------
            //  setup hero
            //-----------------------------
            this.hero = new AnimatedSprite_1.AnimatedSprite("assets/images/hero.png", 32, 32); //new PIXI.Sprite(resources["assets/images/hero.png"].texture);
            this.hero.addAnimations(new AnimatedSprite_1.AnimationSequence("right", [12, 13, 14, 15, 16, 17]));
            this.hero.addAnimations(new AnimatedSprite_1.AnimationSequence("left", [6, 7, 8, 9, 10, 11]));
            this.hero.addAnimations(new AnimatedSprite_1.AnimationSequence("idle", [1, 7, 10, 9, 6, 3]));
            //this.hero.anchor.set(0.5);
            this.hero.position.set(Global.sceneMngr.Renderer.width / 2, Global.sceneMngr.Renderer.height - 120);
            this.addChild(this.hero);
            this.hero.PlayAnimation("idle");
        };
        return InGameScene;
    }(Scene_1.Scene));
    exports.InGameScene = InGameScene;
});
/*
class Hud extends PIXI.Container {
    constructor() {
        super();
        this.setup();
    }

    private setup() {
        var bottomBar = new PIXI.Sprite(PIXI.loader.resources["Assets/Images/bottom_bar_full.png"].texture);
        bottomBar.anchor.set(0.5, 1);
        bottomBar.position.set(Global.SCENE_WIDTH / 2, Global.SCENE_HEIGHT);
        this.addChild(bottomBar);
    }
}
*/
//# sourceMappingURL=InGameScene.js.map