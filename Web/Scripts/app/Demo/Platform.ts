import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";

export class Platform extends PIXI.Container {


    /**
     * 
     * @param textureNameMid
     * @param tiles
     * @param textureNameBorderLeft
     * @param textureNameBorderRight
     */
    constructor(textureNameMid: string, tiles:number = 1, textureNameBorderLeft?: string,  textureNameBorderRight?: string) {
        super();

        this.scale.set(1, -1);   //  scale invert since everything is upside down due to coordinate system
        
        var spr: PIXI.Sprite;
        let x = 0;

        //--------------------------
        //  left border
        //--------------------------
        if (textureNameBorderLeft) {
            texture = PIXI.loader.resources[textureNameBorderLeft].texture;
            spr = new PIXI.Sprite(texture);
            spr.position.set(x, 0);
            x += spr.width;
            this.addChild(spr);
        }

        //--------------------------
        //  mid tiles
        //--------------------------
        var texture = PIXI.loader.resources[textureNameMid].texture;
        if (tiles > 1) {
            let w = texture.width * tiles;
            let h = texture.height;
            spr = new PIXI.extras.TilingSprite(texture, w, h);
            spr.position.set(x, 0);
            x += w;
        } else {
            spr = new PIXI.Sprite(texture);
            x += spr.width;
        }
        this.addChild(spr);

        //--------------------------
        //  right border
        //--------------------------
        if (textureNameBorderRight) {
            texture = PIXI.loader.resources[textureNameBorderRight].texture;
            spr = new PIXI.Sprite(texture);
            spr.position.set(x, 0);
            x += spr.width;
            this.addChild(spr);
        }
    }
}