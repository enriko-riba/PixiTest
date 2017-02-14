import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import { Bullet } from "../Objects/Bullet";
import { SoundMan } from "../SoundMan";
import * as Global from "../Global";
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
    private emitBullet: (textureName: string, position: PIXI.Point, damage: number)=> Bullet;    

    constructor(private textureName: string) {
        super();

        this.addAnimations(new AnimationSequence("left", textureName, [0, 1, 2], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("right", textureName, [3, 4, 5], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("latk", textureName, [6, 7, 8], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("ratk", textureName, [9, 10, 11], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("lsquish", textureName, [12, 13, 14, 15, 16, 17], FRAME_SIZE, FRAME_SIZE));
        this.addAnimations(new AnimationSequence("rsquish", textureName, [18, 19, 20, 21, 22, 23], FRAME_SIZE, FRAME_SIZE));
        this.PlayAnimation("left");   
        this.direction = DirectionH.Left;  

        //  borrow bullet emitter from in game scene
        var igs = Global.sceneMngr.GetScene("InGame") as any;
        this.emitBullet = igs.emitBullet;        
    }

    public IsDead: boolean = false;

    /**
     * texture used for attacks emitted by the mob.
     */
    public AtkTexture: string | string[];

    /**
     *  This is to prevent the regular interactionType handler to trigger on mob collisions.
     *  We want the mob to interact only under certain circumstances (e.g. players jump attack )
     */
    public ShouldInteract: boolean = false;

    public Squish() {     
        this.IsDead = true;   
        var aname = (this.direction == DirectionH.Left ? "lsquish" : "rsquish");
        this.PlayAnimation(aname, 12, false);
    }

    public get Direction(): DirectionH {
        return this.direction;
    }
    public set Direction(dir: DirectionH) {
        if (this.direction != dir) {
            this.direction = dir;
            if (dir === DirectionH.Left) {
                this.PlayAnimation("left");
            } else {
                this.PlayAnimation("right");
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
        Global.snd.atkMagic1();
        if (this.direction == DirectionH.Left) {
            this.PlayAnimation("latk", 10, false);
        } else {
            this.PlayAnimation("ratk", 10, false);
        }

        this.OnComplete = (seq: AnimationSequence) => {
            this.OnComplete = null;
            this.fireBullet();
            this.PlayAnimation(currentSeq.sequenceName, currentFps);
        };
    }

    private fireBullet() {
        if (this.AtkTexture.constructor === Array) {
            //  TODO: animated sprite
        } else {
            //  sprite
            this.emitBullet(this.AtkTexture as string, this.position, this.attributes[AtrType.Atk]);
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

    public onUpdate(dt: number) {
        super.onUpdate(dt);

        if (!this.IsDead) {
            this.ai.onUpdate(dt);
        }
    }
}