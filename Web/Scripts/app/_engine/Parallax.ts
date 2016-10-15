import * as Global from "app/Demo/Global";
import { LinkedListNode, LinkedList } from "./LinkedList";

/**
*   Represents a parallax background with textures that tile inside the viewport. 
*/
export class Parallax extends PIXI.Container {

    private viewPort: PIXI.Point;
    private viewPortSize: PIXI.Point;

    private textureLoader: IParallaxTextureLoader;

    /**
    *   Creates a new ParalaxSprite instance.
    */
    constructor(textureLoader: IParallaxTextureLoader) {
        super();

        this.textureLoader = textureLoader;
        this.viewPort = new PIXI.Point();
        this.viewPortSize = new PIXI.Point(100, 100);
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

            //  if right sprite ends before edge than request new sprite
            var rightEdge = this.viewPort.x + this.viewPortSize.x;
            var lastRightSpriteEdge = this.lastVisible.data.position.x + this.lastVisible.data.width;
            if (lastRightSpriteEdge < rightEdge) {
                var texture = this.textureLoader.GetTextureFor(this.viewPort.x);
                this.lastVisible = this.addSpriteToEnd(texture, lastRightSpriteEdge);
            }

            //  if left spite is off viewport than remove it
            var firstLeftSpriteEdge = this.firstVisible.data.position.x + this.firstVisible.data.width;
            if (firstLeftSpriteEdge < 0) {
                var toBeRemoved = this.firstVisible;
                this.firstVisible = toBeRemoved.next;
                this.removeChild(toBeRemoved.data);
                this.spriteList.RemoveNode(toBeRemoved);
            }
        }
        else {  //  if parallax is moving right

        }

    }

    private firstVisible: LinkedListNode<PIXI.Sprite>;
    private lastVisible: LinkedListNode<PIXI.Sprite>;
    private spriteList: LinkedList<PIXI.Sprite> = new LinkedList<PIXI.Sprite>();

    private addSpriteToEnd(texture: PIXI.Texture, positionX : number) : LinkedListNode<PIXI.Sprite> {
        var spr = new PIXI.Sprite(texture);
        spr.position.x = positionX;
        this.addChild(spr);
        return this.spriteList.AddNode(spr); 
    }

    private calcHorizontalTextures = () => {
        this.removeChildren();
        var totalTextureWidth = 0;

        //-------------------------------------------------------
        //  create sprites from textures and add them to sprite pool
        //-------------------------------------------------------
        while (totalTextureWidth <= this.ViewPortSize.x) {
            var texture = this.textureLoader.GetTextureFor(totalTextureWidth);
            this.addSpriteToEnd(texture, totalTextureWidth);
            totalTextureWidth += texture.width;
        }


        //-------------------------------------------------------
        //  find first and last sprite visible 
        //-------------------------------------------------------
        var totalWidth = 0;
        var rightEdge = this.viewPort.x + this.viewPortSize.x;
        this.spriteList.forEach((node) => {
            var spr = node.data;
            totalWidth += spr.width;
            //this.addChild(spr);
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

export interface IParallaxTextureLoader {
    GetTextureFor(position: number): PIXI.Texture;    
}

export class CyclicTextureLoader implements IParallaxTextureLoader{

    private textures: Array<PIXI.Texture>;
    private totalWidth: number = 0 ;

    constructor(textures: Array<PIXI.Texture>) {
        this.textures = textures;
        textures.forEach((tx) => {
            this.totalWidth += tx.width;
        });
    }
    

    public GetTextureFor(position: number): PIXI.Texture {
        var searchX = position % this.totalWidth;
        var width: number = 0;

        if (searchX >= 0) { //search left to right
            for (var i: number = 0; i < this.textures.length; i++) {
                var tx = this.textures[i];
                width += tx.width;
                if (width >= searchX) return tx;
            }
        }
        else {  //search right to left
            width = this.totalWidth;
            for (var i: number = this.textures.length; i >=0; i--) {
                var tx = this.textures[i];
                width -= tx.width;
                if (searchX >= width) return tx;
            }
        }
    }
}
