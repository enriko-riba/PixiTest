﻿export class Button extends PIXI.Sprite {

    private textureUp: PIXI.Texture;
    private textureHighlight: PIXI.Texture;
    private textureDown: PIXI.Texture;

    private _isPressed: boolean;
    private isClickStarted: boolean;
    private _text: PIXI.Text;
    private requestedWidth: number = undefined;
    private requestedHeight: number = undefined;

    constructor(texturePath: string, x?: number, y?: number, width?: number, height?: number) {
        super();
        this.position.set(x || 0, y || 0);
        this.requestedHeight = height;
        this.requestedWidth = width;

        //  setup button textures
        this.setTexture(texturePath);

        this.buttonMode = true;
        this.interactive = true;

        // set the mousedown and touchstart callback...
        this.on('mousedown', this.onButtonDown)
        this.on('touchstart', this.onButtonDown)

        // set the mouseup and touchend callback...
        this.on('mouseup', this.onButtonUp)
        this.on('touchend', this.onButtonUp)

        this.on('mouseupoutside', this.onButtonUpOutside)
        this.on('touchendoutside', this.onButtonUpOutside)

        // set the mouseover callback...
        this.on('mouseover', this.onButtonOver)

        // set the mouseout callback...
        this.on('mouseout', this.onButtonOut)

        this.isPressed = false;
        this.applyTexture();
    }

    public get isPressed() {
        return this._isPressed;
    }
    public set isPressed(state: boolean) {
        this._isPressed = state;
        this.applyTexture();
    }

    public get text() {
        return this._text;
    }
    public set text(text: PIXI.Text) {
        if (this._text) {
            this.removeChild(this._text);
        }
        this._text = text;
        if (this._text) {
            this._text.anchor.set(0.5, 0.5);
            var x = (this.width / this.scale.x) / 2;
            var y = (this.height / this.scale.y) / 2;
            this._text.position.set(x, y);
            this.addChild(this._text);
        }
    }


    public onClick = () => {
        console.log("onClick");
    }

    private onButtonDown = () => {
        this.isClickStarted = true;
        this.texture = this.textureDown;
    }

    private onButtonUp = () => {
        if (this.isClickStarted) {
            this.isClickStarted = false;
            this.onClick();
        }
        this.applyTexture();
    }

    private onButtonUpOutside = () => {
        this.applyTexture();
        this.isClickStarted = false;
    }

    private onButtonOver = () => {
        this.texture = this.textureHighlight;
    }

    private onButtonOut = () => {
        this.isClickStarted = false;
        this.applyTexture();
    }


    private applyTexture() {
        this.texture = this._isPressed ? this.textureDown : this.textureUp;
    }

    public setTexture(textureAtlasName: string) {
        var atlasTexture = PIXI.loader.resources[textureAtlasName].texture;
        var btnHeight = atlasTexture.height / 3;
        var btnWidth = atlasTexture.width;
        this.textureUp = new PIXI.Texture(atlasTexture.baseTexture, new PIXI.Rectangle(0, 0 * btnHeight, btnWidth, btnHeight));
        this.textureHighlight = new PIXI.Texture(atlasTexture.baseTexture, new PIXI.Rectangle(0, 1 * btnHeight, btnWidth, btnHeight));
        this.textureDown = new PIXI.Texture(atlasTexture.baseTexture, new PIXI.Rectangle(0, 2 * btnHeight, btnWidth, btnHeight));

        //  calc the scale based on desired height/width
        var scaleW = (this.requestedWidth || btnWidth ) / btnWidth;
        var scaleH = (this.requestedHeight || btnHeight) / btnHeight;
        this.scale.set(scaleW, scaleH);

        this.applyTexture();
    }
}
