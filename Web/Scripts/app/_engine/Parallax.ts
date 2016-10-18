import * as Global from "app/Demo/Global";
import { LinkedListNode, LinkedList } from "./LinkedList";

/**
*   Represents a parallax background with textures that tile inside the viewport. 
*/
export class Parallax extends PIXI.Container {

    private viewPortSize: PIXI.Point;
    private textureLoader: IParallaxTextureLoader;
    private worldPositionX: number;

    /**
    *   Creates a new ParalaxSprite instance.
    */
    constructor(textureLoader: IParallaxTextureLoader) {
        super();

        this.textureLoader = textureLoader;
        this.viewPortSize = new PIXI.Point(100, 100);
        this.worldPositionX = 0;
    }

    public SetViewPortX(x: number) {
        x = ~~x;
        var distance = this.worldPositionX - x;
        this.worldPositionX = x;
        this.updatePosition(distance);
    }

    public get ViewPortSize() {
        return this.viewPortSize;
    }
    public set ViewPortSize(point: PIXI.Point) {
        this.viewPortSize = point;
    }

    private updatePosition = (distance: number) => {

        if (this.children.length == 0)
            this.calcHorizontalTextures();

        //  update sprite positions       
        this.children.forEach((spr:PIXI.Sprite) => {
            spr.position.x += distance;

            if (distance < 0) {

                //  check removal
                if (spr.position.x + spr.width < 0) {
                    this.removeChild(spr);
                }
            } else {

                //  check removal
                if (spr.position.x > this.ViewPortSize.x) {
                    this.removeChild(spr);
                }
            }
        });
    }


    private addSprite(texture: PIXI.Texture, positionX: number) {
        var spr = new PIXI.Sprite(texture);
        spr.position.x = positionX;
        this.addChild(spr);
        console.log('added sprite at: ' + positionX);
    }


    public calcHorizontalTextures = () => {

        this.removeChildren();
        var currentPositionX = 0;

        //-------------------------------------------------------
        //  create sprites from textures
        //-------------------------------------------------------
        while (currentPositionX <= this.ViewPortSize.x) {
            var texture = this.textureLoader.GetTextureFor(this.worldPositionX + currentPositionX);
            this.addSprite(texture, currentPositionX);
            currentPositionX += texture.width;
        }
    }
}

export interface IParallaxTextureLoader {
    GetTextureFor(worldPosition: number): PIXI.Texture;
}

export class CyclicTextureLoader implements IParallaxTextureLoader {

    private textures: Array<PIXI.Texture>;
    private totalWidth: number = 0;

    constructor(textures: Array<PIXI.Texture>) {
        this.textures = textures;
        textures.forEach((tx) => {
            this.totalWidth += tx.width;
        });
    }


    public GetTextureFor(worldPosition: number): PIXI.Texture {
        var searchX = worldPosition % this.totalWidth;
        var width: number = 0;

        while (searchX < 0) {
            searchX += this.totalWidth;
        }
        console.log('GetTextureFor( ' + worldPosition + ' )' + ', searchX: ' + searchX);
        var tx: PIXI.Texture;
        for (var i: number = 0; i < this.textures.length; i++) {
            tx = this.textures[i];
            width += tx.width;
            if (width > searchX) break;;
        }

        console.log('Found texture: ' + tx.baseTexture.imageUrl);
        return tx;
    }
}
