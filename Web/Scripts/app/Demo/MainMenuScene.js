var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "app/_engine/Scene", "app/_engine/Button", "app/Demo/LoadMenuScene", "app/Demo/InGameScene", "app/Demo/Global"], function (require, exports, Scene_1, Button_1, LoadMenuScene_1, InGameScene_1, Global) {
    "use strict";
    /**
    *   Main menu GUI.
    */
    var MainMenuScene = (function (_super) {
        __extends(MainMenuScene, _super);
        /**
        *   Creates a new scene instance.
        */
        function MainMenuScene() {
            var _this = this;
            _super.call(this, "MainMenu");
            this.setup = function () {
                var loadScene = new LoadMenuScene_1.LoadMenuScene();
                var inGame = new InGameScene_1.InGameScene();
                Global.sceneMngr.AddScene(loadScene);
                Global.sceneMngr.AddScene(inGame);
                var x = (Global.SCENE_WIDTH - Global.BTN_WIDTH) / 2;
                //  new, load, quit buttons
                //var btnNew = new Button("Assets/Images/Gui/Button1.png", x, 130 + 0 * Global.BTN_HEIGHT, Global.BTN_WIDTH * 2, Global.BTN_HEIGHT);
                //btnNew.anchor.set(0.5, 0);
                //btnNew.Text = new PIXI.Text("New", Global.BTN_STYLE);
                //btnNew.onClick = () => { Global.sceneMngr.ActivateScene(newScene); }
                //this.addChild(btnNew);
                var btnLoad = new Button_1.Button("Assets/Images/Gui/Button1.png", x, 145 + 1 * Global.BTN_HEIGHT, Global.BTN_WIDTH * 2, Global.BTN_HEIGHT);
                //btnLoad.anchor.set(0.5, 0);
                btnLoad.Text = new PIXI.Text("Start", Global.BTN_STYLE);
                btnLoad.onClick = function () { Global.sceneMngr.ActivateScene(inGame); };
                _this.addChild(btnLoad);
                var btnQuit = new Button_1.Button("Assets/Images/Gui/Button1.png", x, 160 + 2 * Global.BTN_HEIGHT, Global.BTN_WIDTH * 2, Global.BTN_HEIGHT);
                //btnQuit.anchor.set(0.5, 0);
                btnQuit.Text = new PIXI.Text("Quit", Global.BTN_STYLE);
                btnQuit.onClick = function () { return window.location.href = "#home"; };
                _this.addChild(btnQuit);
            };
            this.setup();
        }
        return MainMenuScene;
    }(Scene_1.Scene));
    exports.MainMenuScene = MainMenuScene;
});
//# sourceMappingURL=MainMenuScene.js.map