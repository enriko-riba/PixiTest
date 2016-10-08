var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
    *   Represents a scene.
    *   Only one scene at a time is rendered.
    */
    var Scene = (function (_super) {
        __extends(Scene, _super);
        /**
        *   Creates a new scene instance.
        *   @param name the scene name.
        */
        function Scene(name) {
            _super.call(this);
            this.paused = false;
            this.backgroundColor = 0x0;
            this.Name = name;
        }
        Object.defineProperty(Scene.prototype, "BackGroundColor", {
            get: function () {
                return this.backgroundColor;
            },
            set: function (color) {
                this.backgroundColor = color;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "HudOverlay", {
            get: function () {
                return this.hudScene;
            },
            set: function (hud) {
                if (this.hudScene) {
                    this.removeChild(this.hudScene);
                }
                this.hudScene = hud;
                if (hud) {
                    var maxIndex = this.children.length;
                    this.addChildAt(this.hudScene, maxIndex);
                }
            },
            enumerable: true,
            configurable: true
        });
        Scene.prototype.addChild = function (child) {
            var dispObj = _super.prototype.addChild.call(this, child);
            if (this.hudScene) {
                var maxIndex = this.children.length - 1;
                this.setChildIndex(this.hudScene, maxIndex);
            }
            return dispObj;
        };
        Scene.prototype.addChildAt = function (child, index) {
            var dispObj = _super.prototype.addChildAt.call(this, child, index);
            if (this.hudScene) {
                var maxIndex = this.children.length - 1;
                this.setChildIndex(this.hudScene, maxIndex);
            }
            return dispObj;
        };
        Scene.prototype.pause = function () {
            this.paused = true;
        };
        Scene.prototype.resume = function () {
            this.paused = false;
        };
        Scene.prototype.isPaused = function () {
            return this.paused;
        };
        return Scene;
    }(PIXI.Container));
    exports.Scene = Scene;
});
//# sourceMappingURL=Scene.js.map