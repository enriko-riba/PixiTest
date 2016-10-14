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
        //this.calcHorizontalTextures();
    }

    public SetViewPortX(x: number) {
        var distance = this.viewPort.x - x;
        this.viewPort.x = x;
        this.recalculatePosition(distance);
    }

    public get ViewPortSize() {
        return this.viewPortSize;
    }
    public set ViewPortSize(point: PIXI.Point) {
        this.viewPortSize = point;
        this.calcHorizontalTextures();
    }

    private recalculatePosition = (distance: number) => {
        //console.log("recalculating parallax viewport... ");

        //  update sprite positions       
        this.spritePool.forEach((sprite, index) => {
            sprite.position.x += distance;
        });

        //  if parallax is moving left
        if (distance < 0) {

            //  if right sprite ends before edge than ROL
            var rightEdge = this.viewPort.x + this.viewPortSize.x;
            var lastRightSpriteEdge = this.lastVisible.position.x + this.lastVisible.width;
            if (lastRightSpriteEdge < rightEdge) {
                //  perform ROL
                this.firstVisible.position.x = this.lastVisible.position.x + this.lastVisible.width;
                this.firstVisible = (this.firstVisible as any).next;
                this.lastVisible = (this.lastVisible as any).next;
            }
        }
        else {  //  if parallax is moving right

        }

    }

    private firstVisible: PIXI.Sprite;
    private lastVisible: PIXI.Sprite;

    private spritePool: Array<PIXI.Sprite> = [];
    private addSpritesToPool = (): number => {
        var totalWidth = 0;
        var previous = null;
        this.textures.forEach((texture, index) => {
            var spr = new PIXI.Sprite(texture);
            spr.position.x = this.totalTextureWidth;
            if (previous) {
                (spr as any).previous = previous;
                (previous as any).next = spr;
            }
            previous = spr;
            this.spritePool.push(spr);
            totalWidth += texture.width;
        });
        (this.spritePool[0] as any).previous = previous;
        (previous as any).next = this.spritePool[0];
        return totalWidth;
    }

    private calcHorizontalTextures = () => {
        this.removeChildren();
        this.totalTextureWidth = 0;

        //-------------------------------------------------------
        //  create sprites from textures and add them to sprite pool
        //-------------------------------------------------------
        while (this.totalTextureWidth <= this.ViewPortSize.x) {
            this.totalTextureWidth += this.addSpritesToPool();
        }

        //-------------------------------------------------------
        //  find sprite index of last and first sprite visible 
        //-------------------------------------------------------
        var totalWidth = 0;
        var rightEdge = this.viewPort.x + this.viewPortSize.x;
        for (var i = 0; i < this.spritePool.length; i++) {
            var spr = this.spritePool[i];
            totalWidth += spr.width;
            this.addChild(spr);
            if (spr.position.x <= this.viewPort.x && spr.position.x + spr.width > this.viewPort.x) {
                this.firstVisible = spr;
            }
            var sprRightEdge = spr.position.x + spr.width;
            if (spr.position.x > this.viewPort.x && spr.position.x < rightEdge && sprRightEdge >= rightEdge) {
                this.lastVisible = spr;
            }
        }
        console.log('Sprites in pool: ' + this.spritePool.length + ', first sprite: ' + this.firstVisible.position.x + ', last sprite: ' + this.lastVisible.position.x);
    }
}
