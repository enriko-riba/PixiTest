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
    private value: number = 0;

    /**
     * 
     * @param textureAtlas slider texture, two columns (outline, handle) and three rows (normal, highlight, pressed).
     * @param sliderFrameWidth width of the second column holding the slider handle
     * @param x
     * @param y
     * @param width
     * @param height
     */
    constructor(textureAtlas: string, sliderFrameWidth: number, x?: number, y?: number, width?: number, height?: number) {
        super();
        this.position.set(x || 0, y || 0);
        this.requestedHeight = height;
        this.requestedWidth = width;

        this.handle = new PIXI.Sprite();
        this.handle.anchor.set(0.5);
        this.addChild(this.handle);


        //  setup slider textures
        this.SetTexture(textureAtlas, sliderFrameWidth);

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

        this.Value = 0.1;
    }
    public get Value() {
        return this.value;
    }
    public set Value(value: number) {
        if (this.value !== value) {
            this.value = value;
            let outlineSize = this.width - (this.handle.width * 2);
            this.handle.position.x = this.handle.width + outlineSize * value;
        }        
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

    public SetTexture(textureName: string, handleWidth: number) {
        //  outline
        this.textureOutline = new PIXI.Texture(PIXI.loader.resources[textureName].texture.baseTexture);
        this.textureOutline.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        var btnHeight = this.textureOutline.height / 3;
        var btnWidth = this.textureOutline.width - handleWidth;
        this.frameUp = new PIXI.Rectangle(0, 0 * btnHeight, btnWidth, btnHeight);
        this.frameHighlight = new PIXI.Rectangle(0, 1 * btnHeight, btnWidth, btnHeight);
        this.frameDown = new PIXI.Rectangle(0, 2 * btnHeight, btnWidth, btnHeight);
        this.texture = this.textureOutline;

        //  calc the scale based on desired height/width
        var scaleW = (this.requestedWidth || btnWidth) / btnWidth;
        var scaleH = (this.requestedHeight || btnHeight) / btnHeight;
        this.scale.set(scaleW, scaleH);


        // handle
        this.textureHandle = new PIXI.Texture(PIXI.loader.resources[textureName].texture.baseTexture);
        this.textureHandle.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        this.handle.texture = this.textureHandle;

        //this.handle.scale.set(1 / scaleW, 1 / scaleH);
        
        this.frameUpHandle = new PIXI.Rectangle(btnWidth, 0 * btnHeight, handleWidth, btnHeight);
        this.frameHighlightHandle = new PIXI.Rectangle(btnWidth, 1 * btnHeight, handleWidth, btnHeight);
        this.frameDownHandle = new PIXI.Rectangle(btnWidth, 2 * btnHeight, handleWidth, btnHeight);

    }
}
