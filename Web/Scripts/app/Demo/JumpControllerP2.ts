import * as p2 from "p2";
import { MovementState } from "app/Demo/Global";
import { WorldP2 } from "./WorldP2";

export class JumpControllerP2 {
    private readonly JUMP_FORCE = 2400;
    private nextJumpAllowed: number = 0;
    private onJumpEnd: () => void;

    private body: p2.Body;
    private world: WorldP2;

    constructor(world: WorldP2, body: p2.Body, onJumpEndHandler?: () => void) {
        this.world = world;
        this.body = body;


        this.onJumpEnd = onJumpEndHandler;
    }

    public get isJumping() {
        return Math.abs(this.body.velocity[1]) > 0.001;
    }

    public get canJump() {
        return !this.isJumping && this.nextJumpAllowed < performance.now();
    }

    public startJump(direction: MovementState.JumpLeft | MovementState.JumpRight | MovementState.JumpUp) {
        var forceVector: Array<number>;

        if (direction == MovementState.JumpUp) {
            forceVector = [0, this.JUMP_FORCE];
        } else if (direction == MovementState.JumpLeft) {
            forceVector = [-this.JUMP_FORCE/4, this.JUMP_FORCE];
        } else if (direction == MovementState.JumpRight) {
            forceVector = [this.JUMP_FORCE / 4, this.JUMP_FORCE];
        }
        this.body.applyImpulse(forceVector);
    }

    public onUpdate = (dt: number) => {
        var contacts = this.world.getContactsForBody(this.body);
        console.log('found: ' + contacts.length + ' player body contacts');
    }
}