import * as Global from "app/Demo/Global";
import { LinkedListNode, LinkedList } from "./LinkedList";

/**
*   Represents a parallax background with textures that tile inside the viewport. 
*/
export class Parallax extends PIXI.Container {

    private viewPortSize: PIXI.Point;
    private worldPosition: number = 0;
    private halfSizeX: number;
    private parallaxFactor: number;

    private startIDX: number;
    private endIDX: number;
    private spriteBuffer: Array<PIXI.Sprite> = [];

    /**
     *   Creates a new ParalaxSprite instance.
     */
    constructor(size?: PIXI.Point, parallaxFactor?:number, private textureScale?:number) {
        super();
        this.ViewPortSize = size || new PIXI.Point(100, 100);
        this.parallaxFactor = parallaxFactor || 1;
        this.textureScale = this.textureScale || 1;
    }

    public SetViewPortX(newPositionX: number) {

        if (this.worldPosition !== newPositionX) {            
            this.recalculatePosition(newPositionX);
        }
    }

    public get ViewPortSize() {
        return this.viewPortSize;
    }
    public set ViewPortSize(point: PIXI.Point) {
        this.viewPortSize = point;
        this.halfSizeX = this.viewPortSize.x / 2;
    }
    public get ParallaxFactor() {
        return this.parallaxFactor;
    }
    public set ParallaxFactor(factor: number) {
        this.parallaxFactor = factor;
    }

    public setTextures(textures: Array<string | PIXI.Texture>) {
        this.startIDX = 0;
        this.endIDX = 0;

        var totalWidth = 0;
        var index = 0;
        while (totalWidth <= this.viewPortSize.x || this.spriteBuffer.length < 3) {
            for (var i: number = 0; i < textures.length; i++) {
                var t: PIXI.Texture;
                if (typeof textures[i] === "string") {
                    t = PIXI.loader.resources[textures[i] as string].texture;
                } else {
                    t = textures[i] as PIXI.Texture;
                }
                t.rotate = 8;
                var spr = new PIXI.Sprite(t);
                spr.x = totalWidth;
                spr.scale.set(this.textureScale, this.textureScale);
                this.spriteBuffer.push(spr);
                this.addChild(spr);

                //  if sprite is inside VP add & update last index
                if (spr.x < this.viewPortSize.x) {
                    this.endIDX = index;
                }
                totalWidth += t.width;
                index++;
            }
        }
    }

    private recalculatePosition = (newPositionX: number) => {
        var firstSpr: PIXI.Sprite = this.spriteBuffer[this.startIDX];
        var lastSpr: PIXI.Sprite = this.spriteBuffer[this.endIDX];

        var delta = this.worldPosition - newPositionX;
        var parallaxDistance = delta * (1-this.parallaxFactor);

        //  update sprite positions       
        this.children.forEach((spr: PIXI.Sprite) => {
            spr.x -= parallaxDistance;
        });

        //-------------------------------------
        //  remove sprites outside viewport
        //-------------------------------------
        if (delta < 0) {
            //  check for removals from left side
            if (firstSpr.x + firstSpr.width < ( this.worldPosition - this.halfSizeX)) {
                firstSpr.visible = false;
                this.startIDX++;
                if (this.startIDX >= this.spriteBuffer.length) {
                    this.startIDX = 0;
                }
            }
        } else {
            //  check for removals from right side
            if (lastSpr.x > (this.worldPosition + this.halfSizeX)) {
                lastSpr.visible = false;
                this.endIDX--;
                if (this.endIDX < 0) {
                    this.endIDX = this.spriteBuffer.length - 1;
                }
            }
        }

        this.worldPosition = newPositionX;

        if (delta < 0) {
            //  check for removals from left side
            if (firstSpr.x + firstSpr.width < (this.worldPosition - this.halfSizeX)) {
                firstSpr.visible = false;
                this.startIDX++;
                if (this.startIDX >= this.spriteBuffer.length) {
                    this.startIDX = 0;
                }
            }

            //  check for new sprites from right side
            if (lastSpr.x + lastSpr.width <= this.worldPosition + this.halfSizeX) {
                this.endIDX++;
                if (this.endIDX >= this.spriteBuffer.length) {
                    this.endIDX = 0;
                }
                var newSpr = this.spriteBuffer[this.endIDX];
                newSpr.x = lastSpr.x + lastSpr.width;
                newSpr.visible = true;
            }

        } else {
            //  check for removals from right side
            if (lastSpr.x > (this.worldPosition + this.halfSizeX)) {
                lastSpr.visible = false;
                this.endIDX--;
                if (this.endIDX < 0) {
                    this.endIDX = this.spriteBuffer.length - 1;
                }
            }

            //  check for new sprites from left side
            if (firstSpr.x >= (this.worldPosition - this.halfSizeX)) {
                this.startIDX--;
                if (this.startIDX < 0) {
                    this.startIDX = this.spriteBuffer.length - 1;
                }
                var newSpr = this.spriteBuffer[this.startIDX];
                newSpr.x = firstSpr.x - newSpr.width;
                newSpr.visible = true;
            }
        }
    }
}

