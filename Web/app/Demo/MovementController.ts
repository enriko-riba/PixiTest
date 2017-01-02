﻿import { KeyboardMapper } from "app/_engine/KeyboardMapper";
import { MovementState } from "./MovementState";
import { WorldP2 } from "./WorldP2";
import { HeroCharacter } from "./HeroCharacter";

export class MovementController {

    private readonly ANIMATION_FPS = 10;
    private readonly VELOCITY = 150;
    private readonly JUMP_FORCE = 16500;
    private nextJumpAllowed: number = 0;

    private world: WorldP2;
    private hero: HeroCharacter;
    private movementState: MovementState = -1;
    private kbd = new KeyboardMapper();

    private isRunning = false;
    private isJumping = false;
    private newState: MovementState = MovementState.Idle;

    constructor(world: WorldP2, hero: HeroCharacter) {
        this.world = world;
        this.hero = hero;
    }

    public MoveLeft() {
        this.newState = MovementState.Left;
    }
    public MoveRight() {
        this.newState = MovementState.Right;
    }

    public get IsJumping():boolean {
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
            forceVector = [-this.JUMP_FORCE * 0.125, this.JUMP_FORCE];
        } else if (direction === MovementState.JumpRight) {
            forceVector = [this.JUMP_FORCE * 0.125, this.JUMP_FORCE];
        }
        this.world.playerBody.applyImpulse(forceVector);
        this.nextJumpAllowed = performance.now() + 450;
        this.world.clearContactsForBody(this.world.playerBody);
    }

    public update(dt: number):void {

        const KEY_A: number = 65;
        const KEY_D: number = 68;
        const KEY_W: number = 87;
        const KEY_SHIFT: number = 16;
        const KEY_LEFT: number = 37;
        const KEY_RIGHT: number = 39;
        const KEY_UP: number = 38;
        const SPACE: number = 32;

        this.isJumping = Math.abs(this.world.playerBody.velocity[1]) > 0.01 && this.world.playerContacts.length === 0;

        //  no movement while jumping
        if (this.isJumping) {
            return;
        } else {
            //  calculate the horizontal velocity
            var v : number = this.calcMovementVelocity();
            this.world.playerBody.velocity[0] = v;
        }

        
        var newIsJumping: boolean = false;
        var newIsRunning: boolean = this.kbd.IsKeyDown(KEY_SHIFT) && this.hero.CanRun;

        if (this.kbd.IsKeyDown(KEY_A) || this.kbd.IsKeyDown(KEY_LEFT)) {
            this.newState = MovementState.Left;
        } else if (this.kbd.IsKeyDown(KEY_D) || this.kbd.IsKeyDown(KEY_RIGHT)) {
            this.newState = MovementState.Right;
        }

        //  check if jump is pressed
        if ((this.kbd.IsKeyDown(KEY_W) || this.kbd.IsKeyDown(KEY_UP) || this.kbd.IsKeyDown(SPACE)) && this.CanJump) {
            if (this.movementState === MovementState.Left) {
                this.newState = MovementState.JumpLeft;
            }else if (this.movementState === MovementState.Right) {
                this.newState = MovementState.JumpRight;
            }else if (this.movementState === MovementState.Idle) {
                this.newState = MovementState.JumpUp;
                newIsRunning = false;
            }
        }

        //  has state changed
        if (this.newState !== this.movementState) {
            console.log("state change: " + MovementState[this.movementState] + " -> " + MovementState[this.newState]);

            switch (this.newState) {
                case MovementState.Idle:
                    this.hero.PlayAnimation("idle");
                    break;
                case MovementState.Left:
                    this.hero.PlayAnimation("left");
                    break;
                case MovementState.Right:
                    this.hero.PlayAnimation("right");
                    break;
                case MovementState.JumpLeft:
                    newIsJumping = true;
                    this.hero.PlayAnimation("jumpleft");
                    this.StartJump(MovementState.JumpLeft);
                    break;
                case MovementState.JumpRight:
                    newIsJumping = true;
                    this.hero.PlayAnimation("jumpright");
                    this.StartJump(MovementState.JumpRight);
                    break;
                case MovementState.JumpUp:
                    newIsJumping = true;
                    this.hero.PlayAnimation("jumpup");
                    this.StartJump(MovementState.JumpUp);
                    break;
            }
        }

        //  adjust animation FPS based on jump/idle/isrunning flags
        var animationFPS: number = (this.newState === MovementState.Idle || newIsJumping) ? this.ANIMATION_FPS / 3 : (newIsRunning ? 2 : 1) * this.ANIMATION_FPS;
        this.hero.Fps = animationFPS;

        //  update new states
        this.movementState = this.newState;
        this.isRunning = newIsRunning;
        this.newState = MovementState.Idle;
    }

    private calcMovementVelocity(): number {
        var direction:number = 0;
        if (this.movementState === MovementState.Left || this.movementState === MovementState.JumpLeft) {
            direction = -1;
        } else if (this.movementState === MovementState.Right || this.movementState === MovementState.JumpRight) {
            direction = 1;
        }

        var velocity : number = direction * this.VELOCITY * (this.IsRunning ? 2 : 1.0);
        return velocity;
    }
}