var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
    *   Represents a parallax background.
    *   Only one scene at a time is rendered.
    */
    var ParallaxSprite = (function (_super) {
        __extends(ParallaxSprite, _super);
        /**
        *   Creates a new ParalaxSprite instance.
        *   @param texture the texture to use.
        */
        function ParallaxSprite(texture) {
            _super.call(this, texture);
        }
        return ParallaxSprite;
    }(PIXI.Sprite));
    exports.ParallaxSprite = ParallaxSprite;
});
//# sourceMappingURL=ParallaxSprite.js.map