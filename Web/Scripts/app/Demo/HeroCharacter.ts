import { AnimatedSprite } from "app/_engine/AnimatedSprite";
import { WorldP2 } from "./WorldP2";
import { MovementController } from "./MovementController";
import { MovementState } from "./MovementState";
import { createParticleEmitter } from "./InGameScene";

export class HeroCharacter extends AnimatedSprite {

    private emitter: PIXI.particles.Emitter;
    private movementCtrl: MovementController;
    private wp2: WorldP2;

    constructor(wp2: WorldP2, container : PIXI.Container) {
        super();

        this.wp2 = wp2;
        this.movementCtrl = new MovementController(this.wp2, this);
        this.emitter = createParticleEmitter(container);
    }

    /**
     *  Updates the hero
     */
    public onUpdate = (dt: number) => {
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
    };
}