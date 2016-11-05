import * as p2 from "p2";
import { MovementState } from "./MovementState";
import { WorldP2, ContactPair } from "./WorldP2";

export class JumpControllerP2 {
    private readonly JUMP_FORCE = 16000;
    private nextJumpAllowed: number = 0;
    private onJumpEnd: () => void;

    private body: p2.Body;
    private world: WorldP2;

    constructor(world: WorldP2, body: p2.Body, onJumpEndHandler?: () => void) {
        this.world = world;
        this.body = body;
        this.world.addContactWatch(this.body);
        this.onJumpEnd = onJumpEndHandler;
    }

    public get isJumping(): boolean{
        return Math.abs(this.body.velocity[1]) > 0.001 && this.bodyContacts.length === 0;
    }

    public get canJump():boolean {
        return !this.isJumping && this.nextJumpAllowed < performance.now();
    }

    public startJump(direction: MovementState.JumpLeft | MovementState.JumpRight | MovementState.JumpUp):void {
        var forceVector: Array<number>;

        if (direction === MovementState.JumpUp) {
            forceVector = [0, this.JUMP_FORCE];
        } else if (direction === MovementState.JumpLeft) {
            forceVector = [-this.JUMP_FORCE * 0.15, this.JUMP_FORCE];
        } else if (direction === MovementState.JumpRight) {
            forceVector = [this.JUMP_FORCE * 0.15, this.JUMP_FORCE];
        }
        this.body.applyImpulse(forceVector);
        this.nextJumpAllowed = performance.now() + 450;
        this.world.clearContactsForBody(this.body);
    }

    private bodyContacts: Array<ContactPair>= [];
    public onUpdate = (dt: number) => {
        this.bodyContacts = this.world.getContactsForBody(this.body);
    };
}