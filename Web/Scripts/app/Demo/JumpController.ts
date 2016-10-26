import * as p2 from "p2";
import { MovementState } from "app/Demo/Global";

export class JumpController {
    private readonly GRAVITY = 0.0003;
    private readonly DRAG_STR = 0.00005;
    private readonly JUMP_STR = 0.750;
    private readonly JUMP_DELAY_INTERVAL: number = 250;

    private accelY: number;
    private velocityX: number;
    private velocityY: number;
    private direction: number;
    private isJump = false;   
    private nextJumpAllowed: number = 0;
    private onJumpEnd: () => void;

    public position: PIXI.Point;

    constructor(position: PIXI.Point, onJumpEndHandler: () => void) {
        this.position = position;
        this.onJumpEnd = onJumpEndHandler;        
    }

    public get isJumping() {
        return this.isJump;
    }

    public get canJump() {
        return !this.isJump && this.nextJumpAllowed < performance.now();
    }

    public startJump(velocityX: number) {
        this.direction = velocityX / Math.abs(velocityX);
        this.velocityY = this.JUMP_STR;
        this.velocityX = Math.abs(velocityX);
        this.accelY = 0;
        this.isJump = true;
    }

    public update = (dt: number) => {
        var distance:number = 0;
        if (this.velocityX > 0) {
            distance = (this.velocityX * dt);               //  movement on x axis calculation
            this.position.x += (this.direction * distance); //  move position
            this.velocityX -= (this.DRAG_STR * dt);         //  slow down due to drag
        }

        distance = (this.velocityY * dt);                   //  movement on y axis calculation           
        this.position.y += distance;                        //  move position
        this.accelY += (this.GRAVITY * dt);                 //  acceleration due to gravity
        // this.accelY = Math.min(this.accelY, 10);            //  cap to 10
        this.velocityY -= this.accelY;                      //  update velocity

        if (this.position.y <= 0) {
            this.position.y = 0;
            this.isJump = false;
            this.nextJumpAllowed = performance.now() + this.JUMP_DELAY_INTERVAL;
        }   
    }
}

export class P2JumpController {
    private readonly JUMP_FORCE = 2400;
    private nextJumpAllowed: number = 0;
    private onJumpEnd: () => void;

    public body: p2.Body;

    constructor(body: p2.Body, onJumpEndHandler?: () => void) {
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
}