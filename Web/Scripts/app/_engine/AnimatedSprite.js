var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./Dictionary"], function (require, exports, Dictionary_1) {
    "use strict";
    var AnimatedSprite = (function (_super) {
        __extends(AnimatedSprite, _super);
        function AnimatedSprite() {
            var _this = this;
            _super.call(this);
            this.fps = 0;
            this.animations = new Dictionary_1.Dictionary();
            this.isPlaying = false;
            this.frame = 0;
            this.update = function (deltaMilliseconds) {
                if (_this.isPlaying && _this.currentSequence) {
                    //  add elapsed
                    _this.currentElapsed += deltaMilliseconds;
                    if (_this.currentElapsed > _this.frameTime) {
                        _this.currentElapsed -= _this.frameTime;
                        //  advance frames
                        if (++_this.frame >= _this.currentSequence.FrameCount) {
                            _this.frame = 0;
                        }
                        _this.updateFrameTexture();
                    }
                }
            };
            this.Fps = 12;
            this.sprite = new PIXI.Sprite();
            this.sprite.anchor.set(0.5);
            this.addChild(this.sprite);
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
        AnimatedSprite.prototype.PlayAnimation = function (name) {
            if (!this.currentSequence || this.currentSequence.Name !== name) {
                this.currentSequence = this.animations.get(name);
                this.resetAnimation();
            }
        };
        AnimatedSprite.prototype.Stop = function () {
            this.isPlaying = false;
        };
        Object.defineProperty(AnimatedSprite.prototype, "Fps", {
            get: function () {
                return this.fps;
            },
            set: function (fps) {
                this.fps = fps;
                this.frameTime = 1000 / fps;
            },
            enumerable: true,
            configurable: true
        });
        AnimatedSprite.prototype.updateFrameTexture = function () {
            var atlasTexture = PIXI.loader.resources[this.textureName].texture;
            var xFrames = Math.floor(atlasTexture.baseTexture.width / this.frameWidth);
            var yFrames = Math.floor(atlasTexture.baseTexture.height / this.frameHeight);
            var animationFrame = this.currentSequence.frames[this.frame];
            var y = Math.floor(animationFrame / yFrames);
            var x = animationFrame % xFrames;
            var rect = new PIXI.Rectangle(x * this.frameWidth, y * this.frameHeight, this.frameWidth, this.frameHeight);
            this.sprite = new PIXI.Sprite(atlasTexture);
            this.sprite.anchor.set(0.5);
            this.removeChildren();
            this.addChild(this.sprite);
            this.sprite.texture.frame = rect;
        };
        AnimatedSprite.prototype.resetAnimation = function () {
            this.frame = 0;
            this.currentElapsed = 0;
            this.isPlaying = true;
            this.updateFrameTexture();
        };
        return AnimatedSprite;
    }(PIXI.Container));
    exports.AnimatedSprite = AnimatedSprite;
    var AnimationSequence = (function () {
        function AnimationSequence(Name, frames) {
            if (frames === void 0) { frames = []; }
            this.Name = Name;
            this.frames = frames;
        }
        Object.defineProperty(AnimationSequence.prototype, "FrameCount", {
            get: function () {
                return this.frames.length;
            },
            enumerable: true,
            configurable: true
        });
        return AnimationSequence;
    }());
    exports.AnimationSequence = AnimationSequence;
});
//# sourceMappingURL=AnimatedSprite.js.map