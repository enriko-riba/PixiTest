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
    var ParalaxSprite = (function (_super) {
        __extends(ParalaxSprite, _super);
        /**
        *   Creates a new ParalaxSprite instance.
        *   @param texture the texture to use.
        */
        function ParalaxSprite(texture) {
            _super.call(this, texture);
        }
        return ParalaxSprite;
    }(PIXI.Sprite));
    exports.ParalaxSprite = ParalaxSprite;
});
//# sourceMappingURL=ParalaxSprite.js.map