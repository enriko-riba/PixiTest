﻿import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import * as Global from "../Global";
import { WorldP2 } from "../Objects/WorldP2";
import { createParticleEmitter } from "../Scenes/InGameScene";
import { MovementController } from "./MovementController";
import { MovementState } from "./MovementState";
import { StatType } from "./PlayerStats";
import * as ko from "knockout";


export var BURN_TOPIC = "burn_event";
export interface IBurnEvent {
    wasBurning: boolean;
    isBurning: boolean;
}

export class HeroCharacter extends AnimatedSprite {
    private readonly HERO_FRAME_SIZE: number = 64;


    private emitterPixies: PIXI.particles.Emitter;
    private emitterBuffs: PIXI.particles.Emitter;
    private movementCtrl: MovementController;
    private wp2: WorldP2;


    constructor(container: PIXI.Container) {
        super();
        this.emitterPixies = createParticleEmitter(container, [PIXI.Texture.fromImage("assets/_distribute/star.png")]);

        var cfg: PIXI.particles.EmitterConfig = {
            color: { start: "#ff0000", end: "#ff5050" },
            alpha: { start: 1, end: 0.5 },
            speed: {
                start: 1,
                end: 0,
                minimumSpeedMultiplier: 1
            },
            scale: {
                start: 0.3,
                end: 0.05
            },
            maxParticles: 70,
            lifetime: {
                min: 0.3,
                max: 0.6
            },
            spawnType: "circle",
            spawnCircle: {
                x: 0,
                y: 40,
                r: 30
            }
        };
        this.emitterBuffs = createParticleEmitter(container, [PIXI.Texture.fromImage("assets/_distribute/flame.png")], cfg);

        this.addAnimations(new AnimationSequence("right", "assets/_distribute/hero.png",    [18,19,20,21,22,23], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("left", "assets/_distribute/hero.png",     [12,13,14,15,16,17], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpleft", "assets/_distribute/hero.png", [24,25,26,27,28,29], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpright", "assets/_distribute/hero.png",[30,31,32,33,34,35], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpup", "assets/_distribute/hero.png",   [1,3,4,6], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("idle", "assets/_distribute/hero.png",     [1,1,34,5,13,12,6,7,11,18,19,0,1,1], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));

        this.addAnimations(new AnimationSequence("jumpdownleft", "assets/_distribute/hero.png", [36, 37, 38], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpdownright", "assets/_distribute/hero.png", [39, 40, 41], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.addAnimations(new AnimationSequence("jumpdown", "assets/_distribute/hero.png", [42, 43, 44], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.anchor.set(0.5, 0.58);
    }

    /**
     *  Returns the current movement state.
     */
    public get MovementState() {
        return this.movementCtrl.MovementState;
    }

    /**
     * Sets the physics world instance.
     */
    public SetWorldP2(wp2: WorldP2) {
        this.wp2 = wp2;
        this.movementCtrl = new MovementController(this.wp2);
    }

    /**
     * Returns if the player can interact via controls.
     */
    public get IsInteractive(): boolean {
        return this.movementCtrl.isInteractive;
    }

    /**
     * Sets if the player can interact via controls.
     */
    public set IsInteractive(newValue: boolean) {
        this.movementCtrl.isInteractive = newValue;
    }



    /**
     * Checks movementCtrl.MovementState and updates pixi dust emitter and consumption.
     * @param dt elapsed time in milliseconds
     */
    public update = (dt: number) => {
        this.position.x = Global.stats.position.x;
        this.position.y = Global.stats.position.y;

        if (this.IsInteractive) {
            this.movementCtrl.update(dt);
        }

        switch (this.movementCtrl.MovementState) {
            case MovementState.Idle:
                this.emitterPixies.emit = false;
                break;
            case MovementState.Left:
            case MovementState.JumpLeft:
                this.emitterPixies.emit = this.movementCtrl.IsRunning;
                this.emitterPixies.minStartRotation = -25;
                this.emitterPixies.maxStartRotation = 25;
                break;
            case MovementState.Right:
            case MovementState.JumpRight:
                this.emitterPixies.emit = this.movementCtrl.IsRunning;
                this.emitterPixies.minStartRotation = 155;
                this.emitterPixies.maxStartRotation = 205;
                break;

            case MovementState.JumpUp:
                this.emitterPixies.emit = this.movementCtrl.IsRunning;
                this.emitterPixies.minStartRotation = 245;
                this.emitterPixies.maxStartRotation = 295;
                break;
        }

        this.emitterPixies.update(dt * 0.001);
        this.emitterPixies.ownerPos = this.position;
        this.emitterBuffs.update(dt * 0.001);
        this.emitterBuffs.ownerPos = this.position;

        //--------------------------
        //  check if running
        //--------------------------
        if (this.movementCtrl.IsRunning && this.movementCtrl.MovementState !== MovementState.Idle) {
            Global.stats.increaseStat(StatType.Dust, -dt * 0.005);   //  5/sec
            let angle = 8;
            let degree = Math.PI * 2 * angle / 360;
            this.rotation = (this.movementCtrl.MovementState === MovementState.Left) ? degree : -degree;
        } else {
            this.rotation = 0;
        }

        //--------------------------
        //  check if is burning
        //--------------------------
        let wasBurning = this._isBurning;
        let now = performance.now() / 1000;
        this._isBurning = Global.stats.buffs[1000] > now || Global.stats.buffs[1001] > now;
        this.emitterBuffs.emit = this._isBurning;
        this.alpha = (this._isBurning) ? 0.7 : 1;

        if (wasBurning !== this._isBurning) {
            ko.postbox.publish<IBurnEvent>(BURN_TOPIC, {wasBurning: wasBurning, isBurning: this._isBurning});
        }

        Global.stats.onUpdate(dt);
    };

    private _isBurning: boolean = false;

    /**
     * Returns true if the player is taking burn damage.
     */
    public get isBurning() {
        return this._isBurning;
    }

    /**
     * Returns true if the player is jumping.
     */
    public get isJumping() {
        return this.movementCtrl.IsJumping;
    }
}