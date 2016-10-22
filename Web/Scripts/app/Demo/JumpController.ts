export class JumpController {
    private readonly GRAVITY = 0.0003;
    private readonly DRAG_STR = 0.0001;
    private readonly JUMP_STR = 0.650;
    private readonly JUMP_DELAY_INTERVAL: number = 250;

    private accelerationY: number;
    private velocityX: number;
    private velocityY: number;
    private dragDirection: number;
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
        this.dragDirection = velocityX / Math.abs(velocityX);
        this.velocityY = this.JUMP_STR;
        this.velocityX = Math.abs(velocityX);
        this.accelerationY = 0;
        this.isJump = true;
    }

    public update = (dt: number) => {
        var delta:number = 0;
        if (this.velocityX > 0) {
            delta = (this.velocityX * dt);
            this.velocityX -= (this.DRAG_STR * dt);
            this.position.x += (this.dragDirection * delta);
        }

        delta = (this.velocityY * dt);
        this.accelerationY += (this.GRAVITY * dt);
        this.accelerationY = Math.min(this.accelerationY, 10);
        this.velocityY -= this.accelerationY;
        this.position.y += delta;

        if (this.position.y <= 0) {
            this.position.y = 0;
            this.isJump = false;
            this.nextJumpAllowed = performance.now() + this.JUMP_DELAY_INTERVAL;
        }   
    }
}