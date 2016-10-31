﻿
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import { KeyboardMapper } from "app/_engine/KeyboardMapper";

import { MovementState } from "./MovementState";
import { WorldP2 } from "./WorldP2";
import { JumpControllerP2 } from "./JumpControllerP2";


export class MovementController {

    private readonly ANIMATION_FPS = 10;
    private readonly VELOCITY = 10;

    private world: WorldP2;
    private hero: AnimatedSprite;
    private movementState: MovementState = -1;
    private kbd = new KeyboardMapper();

    private isRunning = false;

    /**
     * holds current jump information.
    */
    private jumpCtrl: JumpControllerP2;

    constructor(world: WorldP2, hero: AnimatedSprite) {
        this.world = world;
        this.jumpCtrl = new JumpControllerP2(world, world.player);
        this.hero = hero;
    }

    public get IsJumping() {
        return this.jumpCtrl.isJumping;
    }

    public get IsRunning() {
        return this.isRunning;
    }

    public get MovementState() {
        return this.movementState;
    }

    public MovementVelocity() : number {
        var direction = 0;
        if (this.movementState === MovementState.Left || this.movementState === MovementState.JumpLeft) {
            direction = -1;
        } else if (this.movementState === MovementState.Right || this.movementState === MovementState.JumpRight) {
            direction = 1;
        }

        var velocity = direction * this.VELOCITY * (this.IsRunning ? 2 : 1.0);
        return velocity;
    }

    public update(dt: number) {
    
        const KEY_A: number = 65;
        const KEY_D: number = 68;
        const KEY_W: number = 87;
        const KEY_SHIFT: number = 16;
        const KEY_LEFT: number = 37;
        const KEY_RIGHT: number = 39;
        const KEY_UP: number = 38;
        const SPACE: number = 32;

        //  give the ctrl a chance to do stuff
        this.jumpCtrl.onUpdate(dt);
        

        if (this.jumpCtrl.isJumping) {
            //  no movement while jumping
            return;
        } else {

            //  add a small force in movement direction if jumping
            //this.wp2.player.applyImpulse([v / 50, 0]);

            //  calculate the horizontal velocity
            var v = this.MovementVelocity();
            this.world.player.velocity[0] = v;
        }

        var newState: MovementState = MovementState.Idle;
        var newIsJumping: boolean = false;
        var newIsRunning = this.kbd.IsKeyDown(KEY_SHIFT);

        if (this.kbd.IsKeyDown(KEY_A) || this.kbd.IsKeyDown(KEY_LEFT)) {
            newState = MovementState.Left;
        } else if (this.kbd.IsKeyDown(KEY_D) || this.kbd.IsKeyDown(KEY_RIGHT)) {
            newState = MovementState.Right;
        }

        //  check if jump is pressed
        if ((this.kbd.IsKeyDown(KEY_W) || this.kbd.IsKeyDown(KEY_UP) || this.kbd.IsKeyDown(SPACE)) && this.jumpCtrl.canJump) {
            if (this.movementState === MovementState.Left) {
                newState = MovementState.JumpLeft;
                newIsRunning = false;
            }
            else if (this.movementState === MovementState.Right) {
                newState = MovementState.JumpRight;
                newIsRunning = false;
            }
            else if (this.movementState === MovementState.Idle) {
                newState = MovementState.JumpUp;
                newIsRunning = false;
            }
            //console.log('new state: ' + MovementState[newState]);
        }

        //  has state changed
        if (newState !== this.movementState) {
            console.log('state change: ' + MovementState[this.movementState] + ' -> ' + MovementState[newState]);

            switch (newState) {
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
                    this.jumpCtrl.startJump(MovementState.JumpLeft);
                    break;
                case MovementState.JumpRight:
                    newIsJumping = true;
                    this.hero.PlayAnimation("jumpright");
                    this.jumpCtrl.startJump(MovementState.JumpRight);
                    break;
                case MovementState.JumpUp:
                    newIsJumping = true;
                    this.hero.PlayAnimation("jumpup");
                    this.jumpCtrl.startJump(MovementState.JumpUp);
                    break;
            }
        }

        //  adjust animation FPS based on jump/idle/isrunning flags
        var animationFPS = (newState === MovementState.Idle || newIsJumping) ? this.ANIMATION_FPS / 2 : (newIsRunning ? 2 : 1) * this.ANIMATION_FPS;
        this.hero.Fps = animationFPS;

        //  update new states
        this.movementState = newState;
        this.isRunning = newIsRunning;
    }
}