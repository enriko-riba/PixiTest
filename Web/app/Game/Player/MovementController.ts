import { KeyboardMapper } from "app/_engine/KeyboardMapper";
import { MovementState } from "./MovementState";
import { WorldP2 } from "../Objects/WorldP2";
import { HeroCharacter } from "../Player//HeroCharacter";
import * as Global from "../Global";
import * as ko from "knockout";

export var MOVE_TOPIC = "move_event";
export interface IMoveEvent {
    newState: MovementState;
    oldState: MovementState;
    isJumping: boolean;
    isRunning: boolean;
}

export class MovementController {
    private readonly VELOCITY = 150;
    private readonly JUMP_FORCE = 17000;
    private readonly JUMP_ATTACK_FORCE = -14000;

    private nextJumpAllowed: number = 0;
    private nextJumpDownAllowed: number = 0;

    private world: WorldP2;
    private hero: HeroCharacter;
    private movementState: MovementState = -1;
    private kbd = new KeyboardMapper();

    private isRunning = false;
    private isJumping = false;
    private newState: MovementState = MovementState.Idle;

    private isTouchLeft: boolean;
    private isTouchRight: boolean;
    private isTouchJump: boolean;

    constructor(world: WorldP2, hero: HeroCharacter) {
        this.world = world;
        this.hero = hero;
    }

    private _isInteractive: boolean = true;

    /**
     * Returns if the player can interact via controls.
     */
    public get isInteractive(): boolean {
        return this._isInteractive;
    }
    /**
     * Sets if the player can interact via controls.
     */
    public set isInteractive(newValue: boolean) {
        this._isInteractive = newValue;
        if (!this._isInteractive) {
            this.isRunning = false;
            this.movementState = MovementState.Idle;
        }
    }

    public get IsJumping(): boolean {
        return this.isJumping;
    }

    public get CanJump(): boolean {
        return !this.isJumping && this.nextJumpAllowed < performance.now();
    }

    public get IsRunning(): boolean {
        return this.isRunning;
    }

    public get MovementState(): MovementState {
        return this.movementState;
    }

    public StartJump(direction: MovementState.JumpLeft | MovementState.JumpRight | MovementState.JumpUp): void {
        var forceVector: Array<number>;

        if (direction === MovementState.JumpUp) {
            forceVector = [0, this.JUMP_FORCE];
        } else if (direction === MovementState.JumpLeft) {
            forceVector = [-this.JUMP_FORCE * 0.120, this.JUMP_FORCE];
        } else if (direction === MovementState.JumpRight) {
            forceVector = [this.JUMP_FORCE * 0.120, this.JUMP_FORCE];
        }
        this.world.playerBody.applyImpulse(forceVector);
        this.nextJumpAllowed = performance.now() + 450;
        this.world.clearContactsForBody(this.world.playerBody);
    }

    public StartJumpDown(): void {
        switch (this.movementState) {
            case MovementState.Left:
            case MovementState.JumpLeft:
                this.newState = MovementState.JumpDownLeft;
                break;

            case MovementState.Right:
            case MovementState.JumpRight:
                this.newState = MovementState.JumpDownRight;
                break;

            default:
                this.newState = MovementState.JumpDown;
                break;
        }
        console.log("state change: " + MovementState[this.movementState] + " -> " + MovementState[this.newState]);
        this.movementState = this.newState;

        var forceVector: number[] = [0, this.JUMP_ATTACK_FORCE];
        this.world.playerBody.setZeroForce();
        this.world.playerBody.applyImpulse(forceVector);
        this.nextJumpDownAllowed = performance.now() + 1000;

        ko.postbox.publish<IMoveEvent>(MOVE_TOPIC, {
            newState: this.newState,
            oldState: this.movementState,
            isJumping: true,
            isRunning: false // makes no difference during jumps
        });
    }

    public update(dt: number): void {

        const KEY_A: number = 65;
        const KEY_D: number = 68;
        const KEY_W: number = 87;
        const KEY_S: number = 83;

        const KEY_SHIFT: number = 16;
        const KEY_LEFT: number = 37;
        const KEY_RIGHT: number = 39;
        const KEY_UP: number = 38;
        const KEY_DOWN: number = 40;
        const SPACE: number = 32;

        var isMovingVerticalyp = Math.abs(this.world.playerBody.velocity[1]) > 0.01;
        if (isMovingVerticalyp) {
            let hasOnlySensorContacts = this.world.playerContacts.every((body, idx) => body.shapes[0].sensor);
            this.isJumping = hasOnlySensorContacts;
        } else {
            this.isJumping = false;
        }

        //  no movement (except jump down) while jumping
        if (this.isJumping && this._isInteractive) {
            if ((this.kbd.IsKeyDown(KEY_S) || this.kbd.IsKeyDown(KEY_DOWN)) && this.hero.CanJumpAttack && this.nextJumpDownAllowed < performance.now()) {
                this.StartJumpDown();
            }
            return;

        } else {
            //  calculate the horizontal velocity
            var v: number = this.calcMovementVelocity();
            this.world.playerBody.velocity[0] = v;
        }

        var newIsJumping: boolean = false;
        var newIsRunning: boolean = this.kbd.IsKeyDown(KEY_SHIFT) && this.hero.CanRun && this._isInteractive;        

        if (this.kbd.IsKeyDown(KEY_A) || this.kbd.IsKeyDown(KEY_LEFT) || this.isTouchLeft) {
            this.newState = MovementState.Left;
        } else if (this.kbd.IsKeyDown(KEY_D) || this.kbd.IsKeyDown(KEY_RIGHT) || this.isTouchRight) {
            this.newState = MovementState.Right;
        }

        //  check if jump is pressed
        if ((this.kbd.IsKeyDown(KEY_W) || this.kbd.IsKeyDown(KEY_UP) || this.kbd.IsKeyDown(SPACE) || this.isTouchJump) && this.CanJump) {
            if (this.movementState === MovementState.Left) {
                this.newState = MovementState.JumpLeft;
            } else if (this.movementState === MovementState.Right) {
                this.newState = MovementState.JumpRight;
            } else if (this.movementState === MovementState.Idle) {
                this.newState = MovementState.JumpUp;
                newIsRunning = false;
            }
        }

        //  has state changed
        if (this.newState !== this.movementState || newIsRunning != this.IsRunning) {
            //console.log("state change: " + MovementState[this.movementState] + " -> " + MovementState[this.newState]);
            switch (this.newState) {
                case MovementState.JumpLeft:
                    newIsJumping = true;
                    this.StartJump(MovementState.JumpLeft);
                    break;
                case MovementState.JumpRight:
                    newIsJumping = true;
                    this.StartJump(MovementState.JumpRight);
                    break;
                case MovementState.JumpUp:
                    newIsJumping = true;
                    this.StartJump(MovementState.JumpUp);
                    break;
            }
            ko.postbox.publish<IMoveEvent>(MOVE_TOPIC, {
                newState: this.newState,
                oldState: this.movementState,
                isJumping: newIsJumping,
                isRunning: newIsRunning
            });
        }

        //  update new states
        this.movementState = this.newState;
        this.isRunning = newIsRunning;
        this.newState = MovementState.Idle;
        this.isTouchJump = false;
    }

    private calcMovementVelocity(): number {
        var direction: number = 0;
        if (this.movementState === MovementState.Left || this.movementState === MovementState.JumpLeft) {
            direction = -1;
        } else if (this.movementState === MovementState.Right || this.movementState === MovementState.JumpRight) {
            direction = 1;
        }

        var velocity: number = direction * this.VELOCITY * (this.IsRunning ? 2 : 1.0);
        return velocity;
    }
}