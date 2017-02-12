let COLUMN_PADDING = 1;

export class Slider extends PIXI.Sprite {
    private textureHandle: PIXI.Texture;

    private frameUp: PIXI.Rectangle;
    private frameHighlight: PIXI.Rectangle;
    private frameDown: PIXI.Rectangle;

    private frameUpHandle: PIXI.Rectangle;
    private frameHighlightHandle: PIXI.Rectangle;
    private frameDownHandle: PIXI.Rectangle;

    private isPressed: boolean;
    private text: PIXI.Text;
    private requestedWidth: number = undefined;
    private requestedHeight: number = undefined;

    private handle: PIXI.Sprite;
    private handleWidth: number;
    private value: number = 0;

    private maxX: number;
    private minX: number;

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

        this.handleWidth = sliderFrameWidth;
        this.handle = new PIXI.Sprite();
        this.handle.anchor.set(0);
        this.addChild(this.handle);
        this.handle.interactive = true;
        this.handle.buttonMode = true;
        this.handle
            .on('pointerdown', this.onDragStart)
            .on('pointerup', this.onDragEnd)
            .on('pointerupoutside', this.onDragEnd)
            .on('pointermove', this.onDragMove);
           

        //  setup slider textures
        this.SetTexture(textureAtlas, sliderFrameWidth);

        this.buttonMode = true;
        this.interactive = true;
        
        this
            .on('pointerdown', this.onButtonDown)
            .on('pointerup', this.onButtonUp)
            .on('pointertap', this.onClick)
            .on('pointerupoutside', this.onButtonUpOutside)
            .on('mouseover', this.onButtonOver)
            .on('mouseout', this.onButtonOut);

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
            this.handle.position.x = this.maxX * value;
            this.emit('valueChange', value);
            this.emit('valueChanged', value);
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


    public onClick = (e) => {
        this.setSliderFromeEvent(e);
        this.Value = this.getCalculatedValue();
        return false;
    }

    private dragOffsetX: number;
    private isDragging: boolean = false;

    private getCalculatedValue() {
        var position = this.handle.x - this.minX;
        var pct = position / this.maxX;
        return this.precise_round(pct, 2);
    }

    private onDragStart = (e) => {
        this.isDragging = true;
        var pos = e.data.getLocalPosition(this.handle);
        this.dragOffsetX = pos.x;
    }
    private onDragEnd = (e) => {
        this.isDragging = false;
        this.Value = this.getCalculatedValue();
        e.stopped = true;
    }

    private onDragMove = (e:Event) => {
        if (this.isDragging) {
            this.setSliderFromeEvent(e);
            return false;
        }
    }

    private setSliderFromeEvent(e) {
        var newPosition = e.data.getLocalPosition(this.handle.parent);
        if (this.isDragging && this.dragOffsetX) {
            newPosition.x -= this.dragOffsetX;
        }
        this.handle.x = Math.min(this.maxX, Math.max(this.minX, newPosition.x));
        this.emit('valueChange', this.getCalculatedValue());
    }
    private precise_round(num, decimals): number {
        var t = Math.pow(10, decimals);
        var result = (Math.round((num * t) + (decimals > 0 ? 1 : 0) * ((Math as any).sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);
        return parseFloat(result);
    }

    private onButtonDown = () => {
        this.texture.frame = this.frameDown;
        this.textureHandle.frame = this.frameDownHandle;
    };

    private onButtonUp = (e) => {
        this.applyTexture();
    };

    private onButtonUpOutside = () => {
        this.applyTexture();
    };

    private onButtonOver = () => {
        this.texture.frame = this.frameHighlight;
        this.textureHandle.frame = this.frameHighlightHandle;
    };

    private onButtonOut = () => {
        this.applyTexture();
    };


    private applyTexture() {
        this.texture.frame = this.isPressed ? this.frameDown : this.frameUp;
        this.textureHandle.frame = this.isPressed ? this.frameDownHandle : this.frameUpHandle;
    }

    public SetTexture(textureName: string, handleWidth: number) {
        //  outline
        this.texture = new PIXI.Texture(PIXI.loader.resources[textureName].texture.baseTexture);
        this.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        
        var frameHeight = this.texture.height / 3;
        var frameWidth = this.texture.width - handleWidth - 1;
        this.frameUp = new PIXI.Rectangle(0, 0 * frameHeight, frameWidth, frameHeight);
        this.frameHighlight = new PIXI.Rectangle(0, 1 * frameHeight, frameWidth, frameHeight);
        this.frameDown = new PIXI.Rectangle(0, 2 * frameHeight, frameWidth, frameHeight);

        //  calc the scale based on desired height/width
        var scaleW = (this.requestedWidth || frameWidth) / frameWidth;
        var scaleH = (this.requestedHeight || frameHeight) / frameHeight;
        this.scale.set(scaleW, scaleH);


        // handle
        this.textureHandle = new PIXI.Texture(PIXI.loader.resources[textureName].texture.baseTexture);
        this.textureHandle.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        this.handle.texture = this.textureHandle;

        var x = frameWidth + COLUMN_PADDING; //  texture elements are separated by padding pixels
        this.frameUpHandle = new PIXI.Rectangle(x, 0 * frameHeight, handleWidth, frameHeight);
        this.frameHighlightHandle = new PIXI.Rectangle(x, 1 * frameHeight, handleWidth, frameHeight);
        this.frameDownHandle = new PIXI.Rectangle(x, 2 * frameHeight, handleWidth, frameHeight);


        this.maxX = (this.texture.width - this.handleWidth - this.handleWidth - COLUMN_PADDING - COLUMN_PADDING);
        this.minX = 0;//COLUMN_PADDING;
    }
}
