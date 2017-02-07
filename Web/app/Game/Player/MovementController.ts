import { KeyboardMapper } from "app/_engine/KeyboardMapper";
import * as Global from "../Global";
import { MovementState } from "./MovementState";
import { WorldP2 } from "../Objects/WorldP2";
import { HeroCharacter } from "../Player//HeroCharacter";
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
    private readonly JUMP_FORCE = 16700;
    private nextJumpAllowed: number = 0;

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

        /*
        var myElement = document.getElementById("stage");
        var mc = new Hammer.Manager(myElement);

        mc.add(new Hammer.Pan({ event: 'pan', direction: Hammer.DIRECTION_UP }));
        mc.on("pan", this.touchJump);

        mc.add(new Hammer.Press({ event: 'press', time: 25, interval: 25 }));
        mc.on("press", this.touchMove);
        */
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
        if(!this._isInteractive) {
            this.isRunning = false;
            this.movementState = MovementState.Idle;
        }      
    }

    private touchJump = (ev: any) => {
        if (this._isInteractive) {
            console.log("touchJump event", ev);
            this.isTouchJump = true;
        }
    }

    private touchMove = (ev: any) => {
        if (this._isInteractive) {
            console.log("touch event", ev);

            var pos = this.getLocalCoordinates(ev);
            let newDirection = (pos.x > 0.5) ? MovementState.Right : MovementState.Left;
            let shouldStop = (newDirection === MovementState.Left && this.isTouchRight) ||
                (newDirection === MovementState.Right && this.isTouchLeft);
            if (shouldStop) {
                this.isTouchRight = false;
                this.isTouchLeft = false;
            } else {
                this.isTouchRight = (newDirection === MovementState.Right);
                this.isTouchLeft = (newDirection === MovementState.Left);
            }
        }
    }

    /**
     * Returns the target element x,y normalized coordinates (in [0,1] range) from a touch event.
     *
     * @param ev the hammerjs touch event
     */
    private getLocalCoordinates(ev: any) {
        var bb = ev.target.getBoundingClientRect();
        var pos = {
            x: (ev.center.x - bb.left) / bb.width ,
            y: (ev.center.y - bb.top) / bb.height ,
        }
        return pos;
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

        var nonSensors = this.world.playerContacts.filter((body, idx) => body.shapes[0].sensor !== true);
        this.isJumping = Math.abs(this.world.playerBody.velocity[1]) > 0.01 && nonSensors.length === 0;

        //  no movement while jumping
        if (this.isJumping) {
            return;
        } else {
            //  calculate the horizontal velocity
            var v : number = this.calcMovementVelocity();
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
            }else if (this.movementState === MovementState.Right) {
                this.newState = MovementState.JumpRight;
            }else if (this.movementState === MovementState.Idle) {
                this.newState = MovementState.JumpUp;
                newIsRunning = false;
            }
        }

        //  has state changed
        if (this.newState !== this.movementState || newIsRunning!= this.IsRunning) {
            console.log("state change: " + MovementState[this.movementState] + " -> " + MovementState[this.newState]);
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