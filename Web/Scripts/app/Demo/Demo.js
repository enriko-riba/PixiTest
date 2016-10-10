define(["require", "exports", "app/_engine/SceneManager", "app/Demo/LoaderScene", "app/Demo/Global"], function (require, exports, SceneManager_1, LoaderScene_1, Global) {
    "use strict";
    var DemoVM = (function () {
        function DemoVM() {
            this.customResizer = function () {
                var HEADER_HEIGHT = 50;
                var FOOTER_HEIGHT = 50;
                var w = window.innerWidth;
                var h = window.innerHeight - HEADER_HEIGHT;
                var ratio = Math.min(w / Global.SCENE_WIDTH, h / Global.SCENE_HEIGHT);
                Global.sceneMngr.CurrentScene.scale.set(ratio);
                // Update the renderer dimensions
                Global.sceneMngr.Renderer.resize(w, Math.ceil(Global.SCENE_HEIGHT * ratio));
            };
            if (Global.sceneMngr) {
                Global.sceneMngr.Renderer.destroy();
            }
            //  prepare canvas and scene manager
            var canvas = document.getElementById("stage");
            var renderOptions = {
                view: canvas,
                backgroundColor: 0xff99bb,
                antialias: true,
                transparent: false,
                resolution: window.devicePixelRatio
            };
            Global.sceneMngr = new SceneManager_1.SceneManager(Global.SCENE_WIDTH, Global.SCENE_HEIGHT, renderOptions, this.customResizer);
            Global.sceneMngr.AddScene(new LoaderScene_1.LoaderScene());
            Global.sceneMngr.ActivateScene("Loader");
        }
        return DemoVM;
    }());
    return DemoVM;
});
//# sourceMappingURL=Demo.js.map