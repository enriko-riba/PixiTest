var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "app/Demo/Global"], function (require, exports, Global) {
    "use strict";
    /**
    *   Represents a parallax background with textures that tile inside the viewport.
    */
    var Parallax = (function (_super) {
        __extends(Parallax, _super);
        /**
        *   Creates a new ParalaxSprite instance.
        *   @param texture the texture to use.
        */
        function Parallax(textures) {
            var _this = this;
            _super.call(this);
            this.totalTextureWidth = 0;
            this.totalTextureHeight = 0;
            this.recalculatePosition = function () {
                console.log("recalculating parallax viewport... ");
                _this.calcHorizontalTextures();
                //  calculate how many textures to take 
                if (_this.viewPortSize.x <= _this.totalTextureWidth) {
                }
            };
            this.calcHorizontalTextures = function () {
                _this.removeChildren();
                //  recalculate texture set size
                _this.totalTextureWidth = 0;
                _this.textures.forEach(function (texture) {
                    _this.totalTextureWidth += (texture.width * Global.sceneMngr.CurrentScene.scale.x);
                });
                //  offset from 0 
                var startX = -(_this.ViewPort.x % _this.totalTextureWidth);
                //  add tiles until viewport is filled
                var textureX = startX;
                var idx = 0;
                while ((textureX * Global.sceneMngr.CurrentScene.scale.x) <= _this.ViewPortSize.x) {
                    var spr = new PIXI.Sprite(_this.textures[idx]);
                    spr.position.x = textureX;
                    _this.addChild(spr);
                    textureX += _this.textures[idx].width;
                    if (++idx >= _this.textures.length) {
                        idx = 0;
                    }
                }
            };
            this.textures = textures;
            this.viewPort = new PIXI.Point();
            this.viewPortSize = new PIXI.Point(textures[0].width, textures[0].height);
            this.calcHorizontalTextures();
        }
        Object.defineProperty(Parallax.prototype, "ViewPort", {
            get: function () {
                return this.viewPort;
            },
            set: function (point) {
                this.viewPort = point;
                this.recalculatePosition();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Parallax.prototype, "ViewPortSize", {
            get: function () {
                return this.viewPortSize;
            },
            set: function (point) {
                this.viewPortSize = point;
                this.calcHorizontalTextures();
            },
            enumerable: true,
            configurable: true
        });
        return Parallax;
    }(PIXI.Container));
    exports.Parallax = Parallax;
});
//# sourceMappingURL=Parallax.js.map