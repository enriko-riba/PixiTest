export class Slider extends PIXI.Sprite {
    private textureOutline: PIXI.Texture;
    private textureHandle: PIXI.Texture;

    private frameUp: PIXI.Rectangle;
    private frameHighlight: PIXI.Rectangle;
    private frameDown: PIXI.Rectangle;

    private frameUpHandle: PIXI.Rectangle;
    private frameHighlightHandle: PIXI.Rectangle;
    private frameDownHandle: PIXI.Rectangle;

    private isPressed: boolean;
    private isClickStarted: boolean;
    private text: PIXI.Text;
    private requestedWidth: number = undefined;
    private requestedHeight: number = undefined;

    private handle: PIXI.Sprite;

    /**
     * 
     * @param textures array of two textures: slider outline, slider handle
     * @param x
     * @param y
     * @param width
     * @param height
     */
    constructor(textures: string[], x?: number, y?: number, width?: number, height?: number) {
        super();
        this.position.set(x || 0, y || 0);
        this.requestedHeight = height;
        this.requestedWidth = width;

        this.handle = new PIXI.Sprite();
        this.addChild(this.handle);


        //  setup slider textures
        this.SetTexture(textures);

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
        this.textureOutline.frame = this.frameDown;
        this.textureHandle.frame = this.frameDownHandle;
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
        this.textureOutline.frame = this.frameHighlight;
        this.textureHandle.frame = this.frameHighlightHandle;
    }

    private onButtonOut = () => {
        this.isClickStarted = false;
        this.applyTexture();
    }


    private applyTexture() {
        this.textureOutline.frame = this.isPressed ? this.frameDown : this.frameUp;
        this.textureHandle.frame = this.isPressed ? this.frameDownHandle : this.frameUpHandle;
    }

    public SetTexture(textureNames: string[]) {
        //  outline
        this.textureOutline = new PIXI.Texture(PIXI.loader.resources[textureNames[0]].texture.baseTexture);
        this.textureOutline.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        var btnHeight = this.textureOutline.height / 3;
        var btnWidth = this.textureOutline.width;
        this.frameUp = new PIXI.Rectangle(0, 0 * btnHeight, btnWidth, btnHeight);
        this.frameHighlight = new PIXI.Rectangle(0, 1 * btnHeight, btnWidth, btnHeight);
        this.frameDown = new PIXI.Rectangle(0, 2 * btnHeight, btnWidth, btnHeight);
        this.texture = this.textureOutline;

        

        // handle
        this.textureHandle = new PIXI.Texture(PIXI.loader.resources[textureNames[1]].texture.baseTexture);
        this.textureHandle.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        this.handle.texture = this.textureHandle;

        //  calc the scale based on desired height/width
        var scaleW = (this.requestedWidth || btnWidth) / btnWidth;
        var scaleH = (this.requestedHeight || btnHeight) / btnHeight;
        this.scale.set(scaleW, scaleH);

        this.handle.scale.set(1 / scaleW, 1 / scaleH);
        btnHeight = this.textureHandle.height / 3;
        btnWidth = this.handle.width;
        this.frameUpHandle = new PIXI.Rectangle(0, 0 * btnHeight, btnWidth, btnHeight);
        this.frameHighlightHandle = new PIXI.Rectangle(0, 1 * btnHeight, btnWidth, btnHeight);
        this.frameDownHandle = new PIXI.Rectangle(0, 2 * btnHeight, btnWidth, btnHeight);

    }
}
