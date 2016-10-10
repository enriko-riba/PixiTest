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
        console.log("recalculating parallax viewport... ");

        //  offset from 0 
        var startX = -(this.viewPort.x % this.totalTextureWidth);

        if (this.viewPortSize.x <= this.totalTextureWidth) {
        }
    }

    private calcHorizontalTextures = () => {
        this.removeChildren();

        //  recalculate texture set size
        this.totalTextureWidth = 0;
        this.textures.forEach((texture) => {
            this.totalTextureWidth += (texture.width * Global.sceneMngr.CurrentScene.scale.x);
        });

        //  offset from 0 
        var startX = -(this.ViewPort.x % this.totalTextureWidth);

        //  add tiles until viewport is filled
        var textureX = startX;
        var idx = 0;
        while ( (textureX * Global.sceneMngr.CurrentScene.scale.x) <= this.ViewPortSize.x) {
            var spr = new PIXI.Sprite(this.textures[idx]);
            spr.position.x = textureX;
            this.addChild(spr);
            textureX += this.textures[idx].width ;
            if (++idx >= this.textures.length) {
                idx = 0;
            }
        }
    }
}
