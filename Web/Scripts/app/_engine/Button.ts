//import { SceneManager } from "SceneManager";

export class Button extends PIXI.Sprite {

    private textureUp: PIXI.Texture;
    private textureHighlight: PIXI.Texture;
    private textureDown: PIXI.Texture;

    private isPressed: boolean;
    private isClickStarted: boolean;
    private text: PIXI.Text;

    constructor(texturePath: string, x?: number, y?: number, width?: number, height?: number) {
        super();
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

        this.IsPressed = false;
        this.applyTexture();
    }

    public get IsPressed() {
        return this.isPressed;
    }
    public set IsPressed(state: boolean) {
        this.isPressed = state;
        this.applyTexture();
    }

    public get Text() {
        return this.text;
    }
    public set Text(text: PIXI.Text) {
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
        this.texture = this.isPressed ? this.textureDown : this.textureUp;
    }
}
