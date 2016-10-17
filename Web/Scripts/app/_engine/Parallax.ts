import * as Global from "app/Demo/Global";
import { LinkedListNode, LinkedList } from "./LinkedList";

/**
*   Represents a parallax background with textures that tile inside the viewport. 
*/
export class Parallax extends PIXI.Container {

    private viewPortSize: PIXI.Point;
    private textureLoader: IParallaxTextureLoader;
    private rightEdge: number;
    private leftEdge: number;

    /**
    *   Creates a new ParalaxSprite instance.
    */
    constructor(textureLoader: IParallaxTextureLoader) {
        super();

        this.textureLoader = textureLoader;
        this.viewPortSize = new PIXI.Point(100, 100);
        this.leftEdge = 0;
        this.rightEdge = 100;
    }

    public SetViewPortX(x: number) {
        var newPosition = x - (this.viewPortSize.x / 2);
        var distance = this.leftEdge - newPosition;
        this.leftEdge = newPosition;
        this.rightEdge = newPosition + this.viewPortSize.x;
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

        if (this.children.length == 0)
            this.calcHorizontalTextures();

        //  update sprite positions       
        this.children.forEach((spr:PIXI.Sprite) => {
            spr.position.x += distance;

            if (distance < 0) {

                //  check removal
                if (spr.position.x < (this.leftEdge - spr.width)) {
                    this.removeChild(spr);
                }
            } else {

                //  check removal
                if (spr.position.x > this.rightEdge) {
                    this.removeChild(spr);
                }
            }
        });
    }


    private addSprite(texture: PIXI.Texture, positionX: number) {
        var spr = new PIXI.Sprite(texture);
        spr.position.x = positionX;
        this.addChild(spr);
    }


    private calcHorizontalTextures = () => {

        this.removeChildren();
        var totalTextureWidth = 0;

        //-------------------------------------------------------
        //  create sprites from textures
        //-------------------------------------------------------
        while (totalTextureWidth <= this.ViewPortSize.x) {
            var texture = this.textureLoader.GetTextureFor(this.leftEdge + totalTextureWidth);
            this.addSprite(texture, totalTextureWidth);
            totalTextureWidth += texture.width;
        }
    }
}

export interface IParallaxTextureLoader {
    GetTextureFor(position: number): PIXI.Texture;
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


    public GetTextureFor(position: number): PIXI.Texture {
        var searchX = position % this.totalWidth;
        var width: number = 0;

        while (searchX < 0) {
            searchX += this.totalWidth;
        }
        for (var i: number = 0; i < this.textures.length; i++) {
            var tx = this.textures[i];
            width += tx.width;
            if (width > searchX) return tx;
        }
    }
}
