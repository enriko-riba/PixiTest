import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";

let FRAME_SIZE: number = 48;

export enum AtrType {
    HP,
    Atk,
    Def,
}

/**
 * Represents a monster entity
 */
export class Mob extends AnimatedSprite {

    private attributes: number[];

    constructor(private textureName: string) {
        super();

        this.addAnimations(new AnimationSequence("left", textureName, [0, 1, 2], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("right", textureName, [3, 4, 5], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("latk", textureName, [6, 7, 8], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("ratk", textureName, [9, 10 , 11], FRAME_SIZE, FRAME_SIZE));
        this.PlayAnimation("left", 2);
    }


    public set Attributes(values: number[]) {
        this.attributes = values;
    }
    public get Attributes(): number[] {
        return this.attributes;
    }

    public update = (dt: number) => {
    }
}