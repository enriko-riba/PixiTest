import * as Global from "app/Demo/Global";
import { LinkedListNode, LinkedList } from "./LinkedList";

/**
*   Represents a parallax background with textures that tile inside the viewport. 
*/
export class Parallax extends PIXI.Container {

    private viewPortSize: PIXI.Point;
    private worldPosition: number = 0;
    private swapQueue: Array<PIXI.Sprite> = [];

    /**
    *   Creates a new ParalaxSprite instance.
    */
    constructor(size?: PIXI.Point) {
        super();

        this.ViewPortSize = size || new PIXI.Point(100, 100);
    }

    public SetViewPortX(x: number) {
        //var newPosition = x - (this.viewPortSize.x / 2);
        var distance = this.worldPosition - x;//newPosition;
        this.worldPosition = x;   //newPosition;     
        this.recalculatePosition(distance);
    }

    public get ViewPortSize() {
        return this.viewPortSize;
    }
    public set ViewPortSize(point: PIXI.Point) {
        this.viewPortSize = point;
    }

    private startIDX: number;
    private endIDX: number;
    private spriteBuffer: Array<PIXI.Sprite> = [];

    public setTextures(...textures: Array<PIXI.Texture>) {

    }
    private recalculatePosition = (distance: number) => {

        //   have an array with all sprites
        //   have an start,end index for sprites in viewport
        //   check if start/end sprites are out of vp, if yes remove them and update start/end index
        //   check if start/end is fully inside vp and a new sprite must be added
        //      if yes calculate new index and check it is inside array bounds
        //          if not inside array bounds ROL/ROR array and index, add new sprite and update start/end

        //  update sprite positions       
        this.children.forEach((spr: PIXI.Sprite) => {
            spr.x += distance;

            if (distance < 0) {
                //  check removal
                if (spr.x + spr.width < 0) {
                    this.removeChild(spr);
                    this.swapQueue.unshift(spr);
                }
            } else {
                //  check removal
                if (spr.x > this.viewPortSize.x) {
                    this.removeChild(spr);
                    this.swapQueue.push(spr);
                }
            }
        });

        if (distance < 0) {
            //  add new sprite at start
            if (this.children[0].x > 0) {
                var sprite = this.swapQueue.splice(0, 1)[0];
                sprite.x = this.children[0].x - sprite.width;
                this.addChild(sprite);
            }
        } else {
            //  add new sprite at end
            var lastSpr: PIXI.Sprite = this.children[this.children.length - 1] as PIXI.Sprite;
            if (lastSpr.x + lastSpr.width < this.viewPortSize.x) {
                var sprite = this.swapQueue.pop();
                sprite.x = lastSpr.x + lastSpr.width;
                this.addChild(sprite);
            }
        }
    }
}

