var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "app/_engine/Scene", "app/Demo/Global"], function (require, exports, Scene_1, Global) {
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
            _super.call(this, "InGame");
            this.backgroundNear = new PIXI.Container();
            this.backgroundFar = new PIXI.Container();
            this.entities = [];
            this.setup();
        }
        InGameScene.prototype.setup = function () {
            this.BackGroundColor = 0x1099bb;
            //var hud = new Hud();
            //this.HudOverlay = hud;
            var resources = PIXI.loader.resources;
            //  setup background
            this.addChild(this.backgroundFar);
            var t = resources["assets/images/background/Mountains.png"].texture;
            var tilingSprite = new PIXI.extras.TilingSprite(t, Global.SCENE_WIDTH * 10, Global.SCENE_HEIGHT);
            this.backgroundFar.addChild(tilingSprite);
            this.addChild(this.backgroundNear);
            this.backgroundNear.position.y = 30;
            for (var i = 0; i < 5; i++) {
                var name = "assets/images/background/trees0" + (i + 1) + ".png";
                var tree = new PIXI.Sprite(resources[name].texture);
                tree.position.x = i * 800;
                this.backgroundNear.addChild(tree);
            }
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