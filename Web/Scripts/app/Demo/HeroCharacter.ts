import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import { WorldP2 } from "./WorldP2";
import { MovementController } from "./MovementController";
import { MovementState } from "./MovementState";
import { createParticleEmitter } from "./InGameScene";
import { Stats, StatType } from "./Stats";

export class HeroCharacter extends AnimatedSprite {
    private readonly HERO_FRAME_SIZE: number = 64;
    private readonly playerStats = new Stats();

    private emitter: PIXI.particles.Emitter;
    private movementCtrl: MovementController;
    private wp2: WorldP2;
    private worldContainer: PIXI.Container;

    constructor(wp2: WorldP2, container : PIXI.Container) {
        super();
        this.worldContainer = container;
        this.wp2 = wp2;
        this.movementCtrl = new MovementController(this.wp2, this);
        this.emitter = createParticleEmitter(container);

        this.wp2.on("playerContact", this.onPlayerContact, this);
    }

    /**
     * Returns the player statistics object.
     */
    public get PlayerStats():Stats {
        return this.playerStats;
    }

    /**
     * Returns if the player attributes allow running.
     */
    public get CanRun(): boolean {
        return this.playerStats.getStat(StatType.Dust) > 1;
    }

    /**
     * Checks if the player jumped on something with a higher velocity and adds some smoke.
     * @param dt elapsed time in milliseconds
     */
    public update = (dt: number) => {
        this.position.x = this.wp2.playerX;
        this.position.y = this.wp2.playerY;

        this.movementCtrl.update(dt);

        switch (this.movementCtrl.MovementState) {
            case MovementState.Idle:
                this.emitter.emit = false;
                break;
            case MovementState.Left:
            case MovementState.JumpLeft:
                this.emitter.emit = this.movementCtrl.IsRunning;
                this.emitter.minStartRotation = -25;
                this.emitter.maxStartRotation = 25;
                break;
            case MovementState.Right:
            case MovementState.JumpRight:
                this.emitter.emit = this.movementCtrl.IsRunning;
                this.emitter.minStartRotation = 155;
                this.emitter.maxStartRotation = 205;
                break;

            case MovementState.JumpUp:
                this.emitter.emit = this.movementCtrl.IsRunning;
                this.emitter.minStartRotation = 245;
                this.emitter.maxStartRotation = 295;
                break;
        }

        this.emitter.update(dt * 0.001);
        this.emitter.ownerPos = this.position;

        //  use pixi dust
        if (this.movementCtrl.IsRunning && this.movementCtrl.MovementState != MovementState.Idle) {
            this.playerStats.increaseStat(StatType.Dust, -dt * 0.005);   //  5/sec
        }
    };

    /**
     * Checks if the player jumped on something with a high velocity and adds some smoke.
     * @param event
     */
    private onPlayerContact(event: any): void {
        const SMOKE_VELOCITY: number = 425;

        if (Math.abs(event.velocity[1]) > SMOKE_VELOCITY) {
            var smoke:AnimatedSprite = new AnimatedSprite();
            smoke.addAnimations(new AnimationSequence("smoke", "assets/images/effects/jump_smoke.png",
                [0, 1, 2, 3, 4, 5],
                this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
            smoke.Anchor = new PIXI.Point(0.5, 0.5);
            smoke.x = this.x;
            smoke.y = this.y - this.HERO_FRAME_SIZE / 2;
            smoke.Loop = false;
            smoke.OnComplete = () => this.worldContainer.removeChild(smoke);
            smoke.alpha = 0.7;
            smoke.rotation = Math.random() * Math.PI;
            this.worldContainer.addChild(smoke);
            smoke.PlayAnimation("smoke", 5);
        }
    }
}