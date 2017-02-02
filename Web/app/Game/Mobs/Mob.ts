﻿import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import { AI } from "./AI";
import { BasicStaticAI } from "./BasicStaticAI";
import { Bullet } from "../Bullet";
import * as Global from "../Global";

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
        this.addAnimations(new AnimationSequence("ratk", textureName, [9, 10 , 11], FRAME_SIZE, FRAME_SIZE));
        this.PlayAnimation("left", 2);   
        this.direction = DirectionH.Left;  

        //  borrow bullet emitter from in game scene
        var igs = Global.sceneMngr.GetScene("InGame") as any;
        this.emitBullet = igs.emitBullet;
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

        if (this.direction == DirectionH.Left) {
            console.log("playing animation latk  ", Date.now()/1000);
            this.PlayAnimation("latk", 0.5, false);
        } else {
            console.log("playing animation ratk  ", Date.now()/1000);
            this.PlayAnimation("ratk", 0.5, false);
        }

        this.OnComplete = () => {
            console.log("completed animation " + this.currentSequence.sequenceName, Date.now()/1000);
            this.OnComplete = null;
            this.PlayAnimation(currentSeq.sequenceName, currentFps);
        };

        //  emit atk 
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

    public onUpdate = (dt: number) => {
        this.ai.onUpdate(dt);
    }
}