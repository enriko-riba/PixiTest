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

    private arrayRotate = (arr: Array<any>, count: number) => {
        count -= arr.length * Math.floor(count / arr.length)
        arr.push.apply(arr, arr.splice(0, count))
        return arr
    }

    private recalculatePosition = () => {
        //console.log("recalculating parallax viewport... ");

        //  update sprite positions
        this.spritePoolStartIndex = -1;
        this.spritePoolEndIndex = -1;
        var xPosition = 0;
        this.spritePool.forEach((sprite, index) => {
            var localPosition = xPosition;
            xPosition += sprite.width;
            sprite.position.x = localPosition - this.ViewPort.x;

            //  find the starting sprite
            if (this.spritePoolStartIndex === -1) {
                if (sprite.position.x + sprite.width >= this.viewPort.x) {
                    this.spritePoolStartIndex = index;
                }
            }

            //  find the ending sprite
            if (this.spritePoolEndIndex === -1) {
                var end = this.viewPort.x + this.ViewPortSize.x;
                if (sprite.position.x + sprite.width <= end) {
                    this.spritePoolEndIndex = index;
                }
            }
        });

        //-----------------------------------
        //  reorder sprites in array 
        //-----------------------------------
        if (this.spritePoolStartIndex > 0) {
            this.arrayRotate(this.spritePool, this.spritePoolStartIndex);
        }
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
