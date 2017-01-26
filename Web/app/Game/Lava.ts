import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";

export class Lava extends AnimatedSprite {
    private readonly FRAME_SIZE_X: number = 64;
    private readonly FRAME_SIZE_Y: number = 128;

    constructor(textureName: string) {
        super();

        this.addAnimations(new AnimationSequence("lava", textureName, [0, 1, 2, 3], this.FRAME_SIZE_X, this.FRAME_SIZE_Y));
        this.Anchor = new PIXI.Point(0.5, 0.30);
        this.PlayAnimation("lava", 3);
    }
}