define(["require", "exports"], function (require, exports) {
    "use strict";
    (function (State) {
        State[State["GENERAL"] = 0] = "GENERAL";
        State[State["MAIN_MENU"] = 1] = "MAIN_MENU";
    })(exports.State || (exports.State = {}));
    var State = exports.State;
    /**
    *   Handles multiple scenes, scene activation, rendering and updates.
    */
    var SceneManager = (function () {
        /**
        *   Creates a new SceneManager instance.
        *
        *   @param width the width of the scene
        *   @param height the height of the scene
        *   @param resizer custom resize function
        */
        function SceneManager(width, height, options, resizer) {
            var _this = this;
            this.scenes = [];
            this.resizeHandler = function () {
                console.log("resize...");
                //  if there is a custom resizer invoke it and bail out
                if (_this.resizer) {
                    _this.resizer();
                    return;
                }
                var maxWidth, maxHeight;
                var winAspect = window.innerWidth / window.innerHeight;
                maxWidth = _this.designedAspect * window.innerHeight;
                maxHeight = window.innerHeight;
                //if (winAspect >= 1) {
                //    maxWidth = this.designedAspect * window.innerHeight;
                //    maxHeight = window.innerHeight;
                //}
                //else {
                //    maxHeight = window.innerWidth / this.designedAspect;
                //    maxWidth = window.innerWidth;
                //}
                var ratio = Math.min(window.innerWidth / _this.designWidth, window.innerHeight / _this.designHeight);
                _this.renderer.resize(maxWidth, maxHeight);
                if (_this.currentScene) {
                    _this.currentScene.scale.set(maxWidth / _this.designWidth);
                }
            };
            this.render = function () {
                requestAnimationFrame(_this.render);
                //  exit if no scene or paused
                if (!_this.currentScene || _this.currentScene.isPaused())
                    return;
                if (_this.currentScene.onUpdate)
                    _this.currentScene.onUpdate();
                _this.renderer.render(_this.currentScene);
            };
            this.designWidth = width;
            this.designHeight = height;
            this.designedAspect = this.designWidth / this.designHeight;
            this.resizer = resizer;
            if (!options) {
                options = { antialias: true, backgroundColor: 0x012135 };
            }
            this.renderer = PIXI.autoDetectRenderer(width, height, options);
            this.renderer.autoResize = true;
            window.removeEventListener('resize', this.resizeHandler);
            window.addEventListener('resize', this.resizeHandler, true);
            this.render();
        }
        Object.defineProperty(SceneManager.prototype, "Renderer", {
            /**
            *   Returns the renderer instance.
            */
            get: function () {
                return this.renderer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneManager.prototype, "CurrentScene", {
            /**
            *   Returns the current scene instance.
            */
            get: function () {
                return this.currentScene;
            },
            enumerable: true,
            configurable: true
        });
        /**
        *   Adds a scene.
        */
        SceneManager.prototype.AddScene = function (scene) {
            this.scenes.push(scene);
            scene.sceneManager = this;
        };
        /**
        *   Removes a scene.
        */
        SceneManager.prototype.RemoveScene = function (scene) {
            this.scenes = this.scenes.filter(function (item, index, arr) {
                return item !== scene;
            });
            scene.sceneManager = undefined;
        };
        /**
        *   Activates the given scene.
        */
        SceneManager.prototype.ActivateScene = function (sceneOrName) {
            var scene;
            if (typeof (sceneOrName) == "string") {
                var found = this.scenes.filter(function (item) { return item.Name == sceneOrName; });
                if (!found || found.length == 0)
                    throw Error("Scene: '" + sceneOrName + "' not found");
                if (found.length > 1)
                    throw Error("Multiple scenes: '" + sceneOrName + "' found");
                scene = found[0];
            }
            else {
                scene = sceneOrName;
            }
            console.log("ActivateScene " + scene.Name);
            this.currentScene = scene;
            this.renderer.backgroundColor = scene.BackGroundColor;
            this.resizeHandler();
            if (scene.onActivate)
                scene.onActivate();
        };
        return SceneManager;
    }());
    exports.SceneManager = SceneManager;
});
//# sourceMappingURL=SceneManager.js.map