import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";

const TEXTURE_BALLOON = "assets/_distribute/balloon_01.png";
const TEXTURE_BASKET = "assets/_distribute/balloon_basket_01.png";
const FRAME_SIZE = 256;
const ROTATION = Math.PI / 32;
import * as TWEEN from "tween";

export class Balloon extends PIXI.Container {
    private balloon: AnimatedSprite;
    private basket: PIXI.Sprite;
    private rot: number = 0;
    private direction: number = 1;
    private followTarget: PIXI.DisplayObject;

    constructor() {
        super();
        this.balloon = new AnimatedSprite();
        this.balloon.addAnimations(new AnimationSequence("spin", TEXTURE_BALLOON, [0, 1, 2, 3, 4, 5], FRAME_SIZE, FRAME_SIZE));
        this.balloon.Fps = 2;
        this.addChild(this.balloon);

        this.basket = new PIXI.Sprite(PIXI.loader.resources[TEXTURE_BASKET].texture);
        this.basket.scale.set(1, -1);
        this.basket.anchor.set(0.5, 0);
        this.basket.y = -FRAME_SIZE / 2;
        this.addChild(this.basket);

        this.balloon.PlayAnimation("spin");
    }

    public setFollowTarget(followTarget: PIXI.DisplayObject) {
        this.followTarget = followTarget;        
    }

    public onUpdate = (dt: number) => {
        this.balloon.onUpdate(dt);
        this.rot += (dt / 20000) * this.direction;
        if (this.rot > ROTATION) {
            this.direction = -1;
        } else if (this.rot < 0) {
            this.direction = 1;
        }        
        this.basket.rotation = -Math.PI / 64 + this.rot;

        if (this.followTarget) {
            var distance = Math.abs(this.followTarget.x - this.x);
            if (distance > 250) {
                var closer = new TWEEN.Tween(this.position)
                    .to({ x: this.followTarget.x }, 4000).start();
            }           
        }
    };    
}