import * as Global from "app/Demo/Global";
/**
*   Represents a parallax background with textures that tile inside the viewport. 
*/
export class Parallax extends PIXI.Container {
   
    private textures: Array<PIXI.Texture>;
    private viewPort: PIXI.Point;
    private viewPortSize: PIXI.Point;

    private totalTextureWidth = 0;
    private totalTextureHeight = 0;

    /**
    *   Creates a new ParalaxSprite instance.
    *   @param texture the texture to use.
    */
    constructor(textures: Array<PIXI.Texture>) {
        super();

        this.textures = textures; 
        this.viewPort = new PIXI.Point();
        this.viewPortSize = new PIXI.Point(textures[0].width, textures[0].height);
        this.calcHorizontalTextures();
    }

    public get ViewPort() {
        return this.viewPort;
    }
    public set ViewPort(point: PIXI.Point) {
        this.viewPort = point;
        this.recalculatePosition();
    }

    public get ViewPortSize() {
        return this.viewPortSize;
    }
    public set ViewPortSize(point: PIXI.Point) {
        this.viewPortSize = point;
        this.calcHorizontalTextures();
    }


    private recalculatePosition = () => {
        //console.log("recalculating parallax viewport... ");

        //  move sprites
        this.spritePool.forEach((sprite) => {            
            var originalPosition :PIXI.Point = (sprite as any).originalPosition;
            sprite.position.x = originalPosition.x - this.ViewPort.x;
        });
       
    }

    private spritePoolStartIndex: number;
    private spritePoolEndIndex: number;
    private spritePool: Array<PIXI.Sprite> = [];
    private addSpritesToPool = () => {
        this.textures.forEach((texture) => {
            var spr = new PIXI.Sprite(texture);
            spr.position.x = this.totalTextureWidth;
            (spr as any).originalPosition = new PIXI.Point(spr.position.x, spr.position.y);
            this.spritePool.push(spr);
            this.totalTextureWidth += texture.width;   
        });
    }

    private calcHorizontalTextures = () => {
        this.removeChildren();
        this.totalTextureWidth = 0;
        this.spritePoolStartIndex = 0;
        this.spritePoolEndIndex = 0;

        //-------------------------------------------------------
        //  create sprites from textures and add them to sprite pool
        //-------------------------------------------------------
        while (this.totalTextureWidth <= this.ViewPortSize.x) {
            this.addSpritesToPool();
        }

        //-------------------------------------------------------
        //  find sprite index of last sprite visible in viewport
        //-------------------------------------------------------
        var currentSpriteWidth = 0;
        for (var i = 0; i < this.spritePool.length; i++) {
            this.addChild(this.spritePool[i]);
            currentSpriteWidth += this.spritePool[i].width;
            if (currentSpriteWidth > this.viewPortSize.x) {
                this.spritePoolEndIndex = i;
                break;
            }
        }

        console.log('Sprites in pool: ' + this.spritePool.length);
        console.log('First sprite index: ' + this.spritePoolStartIndex);
        console.log('Last sprite index: ' + this.spritePoolEndIndex);
    }
}
