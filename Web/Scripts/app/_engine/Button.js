//import { SceneManager } from "SceneManager";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(texturePath, x, y, width, height) {
            var _this = this;
            _super.call(this);
            this.onClick = function () {
                console.log("onClick");
            };
            this.onButtonDown = function () {
                _this.isClickStarted = true;
                _this.texture = _this.textureDown;
            };
            this.onButtonUp = function () {
                if (_this.isClickStarted) {
                    _this.isClickStarted = false;
                    _this.onClick();
                }
                _this.applyTexture();
            };
            this.onButtonUpOutside = function () {
                _this.applyTexture();
                _this.isClickStarted = false;
            };
            this.onButtonOver = function () {
                _this.texture = _this.textureHighlight;
            };
            this.onButtonOut = function () {
                _this.isClickStarted = false;
                _this.applyTexture();
            };
            this.position.set(x || 0, y || 0);
            //  setup button textures
            var atlasTexture = PIXI.loader.resources[texturePath].texture;
            var btnHeight = atlasTexture.height / 3;
            var btnWidth = atlasTexture.width;
            this.textureUp = new PIXI.Texture(atlasTexture.baseTexture, new PIXI.Rectangle(0, 0 * btnHeight, btnWidth, btnHeight));
            this.textureHighlight = new PIXI.Texture(atlasTexture.baseTexture, new PIXI.Rectangle(0, 1 * btnHeight, btnWidth, btnHeight));
            this.textureDown = new PIXI.Texture(atlasTexture.baseTexture, new PIXI.Rectangle(0, 2 * btnHeight, btnWidth, btnHeight));
            this.textureUp.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            this.textureHighlight.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            this.textureDown.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            //  calc the scale based on desired height/width
            var scaleW = (width || btnWidth) / btnWidth;
            var scaleH = (height || btnHeight) / btnHeight;
            this.scale.set(scaleW, scaleH);
            this.buttonMode = true;
            this.interactive = true;
            // set the mousedown and touchstart callback...
            this.on('mousedown', this.onButtonDown);
            this.on('touchstart', this.onButtonDown);
            // set the mouseup and touchend callback...
            this.on('mouseup', this.onButtonUp);
            this.on('touchend', this.onButtonUp);
            this.on('mouseupoutside', this.onButtonUpOutside);
            this.on('touchendoutside', this.onButtonUpOutside);
            // set the mouseover callback...
            this.on('mouseover', this.onButtonOver);
            // set the mouseout callback...
            this.on('mouseout', this.onButtonOut);
            this.IsPressed = false;
            this.applyTexture();
        }
        Object.defineProperty(Button.prototype, "IsPressed", {
            get: function () {
                return this.isPressed;
            },
            set: function (state) {
                this.isPressed = state;
                this.applyTexture();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "Text", {
            get: function () {
                return this.text;
            },
            set: function (text) {
                if (this.text) {
                    this.removeChild(this.text);
                }
                this.text = text;
                if (this.text) {
                    this.text.anchor.set(0.5, 0.5);
                    var x = (this.width / this.scale.x) / 2;
                    var y = (this.height / this.scale.y) / 2;
                    this.text.position.set(x, y);
                    this.addChild(this.text);
                }
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.applyTexture = function () {
            this.texture = this.isPressed ? this.textureDown : this.textureUp;
        };
        return Button;
    }(PIXI.Sprite));
    exports.Button = Button;
});
//# sourceMappingURL=Button.js.map