var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "app/_engine/Scene", "app/_engine/Button", "app/Demo/Global"], function (require, exports, Scene_1, Button_1, Global) {
    "use strict";
    /**
    *   Load menu.
    */
    var LoadMenuScene = (function (_super) {
        __extends(LoadMenuScene, _super);
        /**
        *   Creates a new scene instance.
        */
        function LoadMenuScene() {
            var _this = this;
            _super.call(this, "LoadMenu");
            this.setup = function () {
                //  new, load, quit buttons
                var btnLoad = new Button_1.Button("Assets/Images/Gui/Button1.png", 10, 30 + 0 * Global.BTN_HEIGHT, Global.BTN_WIDTH * 2, Global.BTN_HEIGHT);
                btnLoad.Text = new PIXI.Text("Load", Global.BTN_STYLE);
                _this.addChild(btnLoad);
                var btnBack = new Button_1.Button("Assets/Images/Gui/Button1.png", 10, 35 + 1 * Global.BTN_HEIGHT, Global.BTN_WIDTH * 2, Global.BTN_HEIGHT);
                btnBack.Text = new PIXI.Text("Back", Global.BTN_STYLE);
                _this.addChild(btnBack);
                btnBack.onClick = function () { return Global.sceneMngr.ActivateScene("MainMenu"); };
            };
            this.setup();
        }
        return LoadMenuScene;
    }(Scene_1.Scene));
    exports.LoadMenuScene = LoadMenuScene;
});
//# sourceMappingURL=LoadMenuScene.js.map