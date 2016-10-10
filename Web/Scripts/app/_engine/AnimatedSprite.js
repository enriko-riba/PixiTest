var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Dictionary"], function (require, exports, Dictionary_1) {
    "use strict";
    var AnimatedSprite = (function (_super) {
        __extends(AnimatedSprite, _super);
        function AnimatedSprite(texture) {
            _super.call(this, texture);
            this.fps = 12;
            this.animations = new Dictionary_1.Dictionary();
            this.isPlaying = false;
            this.frame = 0;
            this.update = function (deltaMilliseconds) {
            };
        }
        AnimatedSprite.prototype.addAnimations = function () {
            var _this = this;
            var sequences = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                sequences[_i - 0] = arguments[_i];
            }
            sequences.forEach(function (seq, idx, arr) {
                _this.animations.set(seq.Name, seq);
            });
        };
        AnimatedSprite.prototype.Stop = function () {
        };
        Object.defineProperty(AnimatedSprite.prototype, "Fps", {
            get: function () {
                return this.fps;
            },
            set: function (fps) {
                this.fps = fps;
            },
            enumerable: true,
            configurable: true
        });
        return AnimatedSprite;
    }(PIXI.Sprite));
    exports.AnimatedSprite = AnimatedSprite;
    var AnimationSequence = (function () {
        function AnimationSequence() {
            this.frames = [];
        }
        Object.defineProperty(AnimationSequence.prototype, "Length", {
            get: function () {
                return this, frames.length;
            },
            enumerable: true,
            configurable: true
        });
        return AnimationSequence;
    }());
    exports.AnimationSequence = AnimationSequence;
});
//# sourceMappingURL=AnimatedSprite.js.map