import * as Global from "app/Demo/Global";
import { LinkedListNode, LinkedList } from "./LinkedList";

/**
*   Represents a parallax background with textures that tile inside the viewport. 
*/
export class Parallax extends PIXI.Container {

    private textures: Array<PIXI.Texture>;
    private viewPort: PIXI.Point;
    private viewPortSize: PIXI.Point;

    private totalTextureWidth = 0;

    /**
    *   Creates a new ParalaxSprite instance.
    *   @param texture the texture to use.
    */
    constructor(textures: Array<PIXI.Texture>) {
        super();

        this.textures = textures;
        this.viewPort = new PIXI.Point();
        this.viewPortSize = new PIXI.Point(textures[0].width, textures[0].height);
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

        //  update sprite positions       
        this.spriteList.forEach((node) => {
            node.data.position.x += distance;
        });

        //  if parallax is moving left
        if (distance < 0) {

            //  if right sprite ends before edge than ROL
            var rightEdge = this.viewPort.x + this.viewPortSize.x;
            var lastRightSpriteEdge = this.lastVisible.data.position.x + this.lastVisible.data.width;
            if (lastRightSpriteEdge < rightEdge) {
                //  perform ROL
                var last = this.spriteList.Last;
                this.firstVisible.data.position.x = last.data.position.x + last.data.width;
                this.spriteList.RollLeft();
                this.firstVisible = this.firstVisible.next;
                this.lastVisible = this.lastVisible.next;
            }
        }
        else {  //  if parallax is moving right

        }

    }

    private firstVisible: LinkedListNode<PIXI.Sprite>;
    private lastVisible: LinkedListNode<PIXI.Sprite>;
    private spriteList: LinkedList<PIXI.Sprite> = new LinkedList<PIXI.Sprite>();

    private addSpritesToPool = (): number => {
        var totalWidth = this.totalTextureWidth;
        var previous = null;
        this.textures.forEach((texture, index) => {
            var spr = new PIXI.Sprite(texture);
            spr.position.x = totalWidth;            
            totalWidth += texture.width;
            this.spriteList.AddNode(spr);
        });        
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
        //  find first and last sprite visible 
        //-------------------------------------------------------
        var totalWidth = 0;
        var rightEdge = this.viewPort.x + this.viewPortSize.x;
        this.spriteList.forEach((node) => {
            var spr = node.data;
            totalWidth += spr.width;
            this.addChild(spr);
            if (spr.position.x <= this.viewPort.x && spr.position.x + spr.width > this.viewPort.x) {
                this.firstVisible = node;
            }
            var sprRightEdge = spr.position.x + spr.width;
            if (spr.position.x >= this.viewPort.x && spr.position.x < rightEdge && sprRightEdge >= rightEdge) {
                this.lastVisible = node;
            }
        });
        console.log('Sprites in pool: ' + this.spriteList.Length + ', first sprite: ' + this.firstVisible.data.position.x + ', last sprite: ' + this.lastVisible.data.position.x);
    }
}
