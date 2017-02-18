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

    private onDeath: () => void;
    private isDead: boolean = false;
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

    public IsLoading: boolean = false;

    public get IsDead() {
        return this.isDead;
    }
    public set IsDead(value: boolean) {
        if (value != this.isDead) {
            this.isDead = value;
            if (this.isDead && this.onDeath) {
                this.onDeath();
            }
        }
    }

    public set OnDeath(cb: () => void) {
        this.onDeath = cb;
    }
    public get OnDeath(): () => void {
        return this.onDeath;
    }


    /**
     * texture used for attacks emitted by the mob.
     */
    public AtkTexture: string | string[];

    /**
     * Kills the mob, plays squish animation and invokes the optional call back
     * @param cb
     */
    public Squish(cb?: () => void) {     
        this.IsDead = true;   
        var aname = (this.direction == DirectionH.Left ? "lsquish" : "rsquish");
        this.OnComplete = cb;
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
            this.PlayAnimation("latk", currentFps, false);
        } else {
            this.PlayAnimation("ratk", currentFps, false);
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

        if (!this.IsDead && !this.IsLoading) {
            this.ai.onUpdate(dt);
        }
    }
}