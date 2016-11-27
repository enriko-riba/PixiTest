import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";

export class Lava extends AnimatedSprite {
    private readonly FRAME_SIZE: number = 64;

    constructor() {
        super();

        this.addAnimations(new AnimationSequence("lava", "assets/images/objects/lava.png", [0, 1, 2, 3], this.FRAME_SIZE, this.FRAME_SIZE));
        this.scale.set(1, 2);
        this.Anchor = new PIXI.Point(0.5, 0.25);
        this.PlayAnimation("lava", 4);
    }
}