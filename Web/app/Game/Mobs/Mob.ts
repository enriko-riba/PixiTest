import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import { AI } from "./AI";
import { BasicStaticAI } from "./BasicStaticAI";

let FRAME_SIZE: number = 48;

export enum AtrType {
    HP,
    Atk,
    AtkCD,
    Def,
}

export enum DirectionH {
    Left,
    Right,
}

/**
 * Represents a monster entity
 */
export class Mob extends AnimatedSprite {

    private attributes: number[];
    private ai: AI;
    private direction: DirectionH;


    constructor(private textureName: string) {
        super();

        this.addAnimations(new AnimationSequence("left", textureName, [0, 1, 2], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("right", textureName, [3, 4, 5], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("latk", textureName, [6, 7, 8], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("ratk", textureName, [9, 10 , 11], FRAME_SIZE, FRAME_SIZE));
        this.PlayAnimation("left", 2);   
        this.direction = DirectionH.Left;     
    }

    public AtkTexture: string | string[];

    public get Direction(): DirectionH {
        return this.direction;
    }
    public set Direction(dir: DirectionH) {
        if (this.direction != dir) {
            this.direction = dir;
            if (dir === DirectionH.Left) {
                this.PlayAnimation("left", 1);
            } else {
                this.PlayAnimation("right", 1);
            }
        }
    }

    public set Attributes(values: number[]) {
        this.attributes = values;
    }
    public get Attributes(): number[] {
        return this.attributes;
    }

    public Attack = ()=> {
        var currentSeq = this.currentSequence;
        var currentFps = this.Fps;
        this.resetAnimation();
        this.OnComplete = () => {
            this.OnComplete = null;
            this.PlayAnimation(currentSeq.sequenceName, currentFps);
        };

        if (this.direction == DirectionH.Left) {
            this.PlayAnimation("latk", 2, false);
        } else {
            this.PlayAnimation("ratk", 2, false);
        }

        //  emit atk 
        if (this.AtkTexture.constructor === Array) {
            //  TODO: animated sprite
        } else {
            //  sprite
        }
    }

    public CreateAI(aiTypeName: string):void {
        switch (aiTypeName.toLowerCase()) {
            case "basic_static":
                this.ai = new BasicStaticAI(this);
                break;

            case "basic":
                break;
        }
    }

    public onUpdate = (dt: number) => {
        this.ai.onUpdate(dt);
    }
}