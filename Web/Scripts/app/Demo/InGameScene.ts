import { Scene } from "app/_engine/Scene";
import { State } from "app/_engine/SceneManager";
import { Parallax } from "app/_engine/Parallax";
import { KeyboardAction } from "app/_engine/KeyboardMapper";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import * as Global from "app/Demo/Global";

enum MovementState {
    Left,
    Right,
    Idle,
    JumpLeft,
    JumpRight,
    JumpUp,
}


/**
*   Load in game scene.
*/
export class InGameScene extends Scene {

    private backgroundGround: Parallax;
    private backgroundNear: Parallax;
    private backgroundFar: Parallax;
    private hero: AnimatedSprite;
    private entities: Array<PIXI.Sprite> = [];

    private movementState: MovementState = -1;
    private movementPosition = new PIXI.Point();
    private readonly VELOCITY = 200;
    private readonly ANIMATION_FPS = 10;

    private isRunning = false;
    private isJumping = false;

    private txtPosition: PIXI.Text;

    /**
    *   Creates a new scene instance.
    */
    constructor() {
        super("InGame");

        (window as any).performance = window.performance || {};
        performance.now = (function () {
            return performance.now ||
                (performance as any).mozNow ||
                (performance as any).msNow ||
                (performance as any).oNow ||
                (performance as any).webkitNow ||
                Date.now  /*none found - fallback to browser default */
        })();

        this.setup();
    }

    private setup() {
        this.BackGroundColor = 0x1099bb;

        PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;

        //-----------------------------
        //  setup hero
        //-----------------------------
        const FRAME_SIZE = 64;
        this.hero = new AnimatedSprite();
        this.hero.addAnimations(new AnimationSequence("right", "assets/images/hero_64x64.png", [12, 13, 14, 15, 16, 17], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("left", "assets/images/hero_64x64.png", [6, 7, 8, 9, 10, 11], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("jumpleft", "assets/images/hero_64x64.png", [48, 49, 50, 51, 52, 53], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("jumpright", "assets/images/hero_64x64.png", [54, 55, 56, 57, 58, 59], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("jumpup", "assets/images/hero_64x64.png", [1, 3, 4], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("idle", "assets/images/hero_64x64.png", [25, 24, 40, 19, 19, 18, 19, 22, 30, 31, 1, 1, 1], FRAME_SIZE, FRAME_SIZE));
        this.hero.pivot.set(0.5, 1);
        this.hero.position.set((Global.SCENE_WIDTH / 2) - (this.hero.width / 2), Global.SCENE_HEIGHT - 150);
        this.addChild(this.hero);
        this.hero.PlayAnimation("idle");

        //-----------------------------
        //  setup backgrounds
        //-----------------------------
        var vps = new PIXI.Point(Global.SCENE_WIDTH, Global.SCENE_HEIGHT);

        //  far parallax
        this.backgroundFar = new Parallax(vps);
        this.backgroundFar.setTextures("assets/images/background/Canyon.png");
        this.addChildAt(this.backgroundFar, 0);

        //  near parallax
        this.backgroundNear = new Parallax(vps);
        this.backgroundNear.setTextures("assets/images/background/trees01.png",
            "assets/images/background/trees02.png",
            "assets/images/background/trees03.png",
            "assets/images/background/trees04.png",
            "assets/images/background/trees05.png");
        this.addChildAt(this.backgroundNear, 1);
        this.backgroundNear.y = Global.SCENE_HEIGHT - this.backgroundNear.height;

        //  bottom (nearest) parallax
        this.backgroundGround = new Parallax(vps);
        this.backgroundGround.setTextures("assets/images/background/ground.png");
        this.addChildAt(this.backgroundGround, 2);
        this.backgroundGround.y = Global.SCENE_HEIGHT - this.backgroundGround.height + 10;

        this.setParallaxPositions(this.movementPosition.x);

        //  debug text
        this.txtPosition = new PIXI.Text("Position: (0, 0)", Global.TXT_STYLE);
        this.txtPosition.resolution = window.devicePixelRatio;
        this.addChild(this.txtPosition);
    }


    private handleKeyboard = () => {
        var kbd = Global.kbd;
        var newState: MovementState = this.movementState; 
        var newIsRunning: boolean = kbd.IsKeyDown(16);
        var newIsJumping: boolean = false;

        //  run or normal speed?             
        var animationFPS = this.ANIMATION_FPS * (newIsRunning ? 1.6 : 1);

        //  no movement while jumping
        if (!this.isJumping) {
            newState = MovementState.Idle;

            if (kbd.IsKeyDown(65)) {
                newState = MovementState.Left;
            } else if (kbd.IsKeyDown(68)) {
                newState = MovementState.Right;
            }            

            //  check if jump is pressed
            if (kbd.IsKeyDown(87)) {

                //  check if state is ok
                if (this.movementState == MovementState.Left ||
                    this.movementState == MovementState.Right ||
                    this.movementState == MovementState.Idle) {

                    //  check if jump is allowed
                    if (this.nextJumpAllowed < performance.now()) {
                        if (newState == MovementState.Left)
                            newState = MovementState.JumpLeft;
                        else if (newState == MovementState.Right)
                            newState = MovementState.JumpRight;
                        else if (newState == MovementState.Idle)
                            newState = MovementState.JumpUp;
                    }
                }
            }
        } 


        //  has state changed
        if (newState != this.movementState) {
            switch (newState) {
                case MovementState.Idle:
                    this.hero.PlayAnimation("idle", this.ANIMATION_FPS / 2);
                    break;
                case MovementState.Left:
                    this.hero.PlayAnimation("left", animationFPS);
                    break;
                case MovementState.Right:
                    this.hero.PlayAnimation("right", animationFPS);
                    break;
                case MovementState.JumpLeft:
                    newIsJumping = true;
                    this.hero.PlayAnimation("jumpleft", this.ANIMATION_FPS / 2);
                    break;
                case MovementState.JumpRight:
                    newIsJumping = true;
                    this.hero.PlayAnimation("jumpright", this.ANIMATION_FPS / 2);
                    break;
                case MovementState.JumpUp:
                    newIsJumping = true;
                    this.hero.PlayAnimation("jumpup", this.ANIMATION_FPS / 2);
                    break;
            }
        }

        //  has a jump started
        if (newIsJumping) {
            var velocity = this.getVelocityX();
            this.jumpData = new JumpData(this.movementPosition, velocity);
        }

        this.isRunning = newIsRunning;
        this.movementState = newState;
        this.isJumping = this.isJumping || newIsJumping;
    }
    

    public onUpdate = (dt: number) => {
        this.handleKeyboard();
        if (this.isJumping) 
            this.updateJump(dt);
        else
            this.updateMovement(dt);
    }

    /**
     * holds current jump information.
     */
    private jumpData: JumpData;

    /**
     * holds next allowed jump timestamp.
     */
    private nextJumpAllowed: number = 0;

    /**
     * 
     * @param dt the elapsed time in milliseconds
     */
    private updateJump(dt: number) {        
        this.jumpData.update(dt);
        this.movementPosition.x = this.jumpData.position.x;
        this.movementPosition.y = this.jumpData.position.y;
        this.hero.position.y = Global.SCENE_HEIGHT - 150 - this.movementPosition.y;
        if (this.movementPosition.y < 0) {
            this.isJumping = false;
            this.movementState = MovementState.Idle;
            this.hero.PlayAnimation("idle", this.ANIMATION_FPS / 2);
            const JUMP_DELAY_INTERVAL: number = 100;
            this.nextJumpAllowed = performance.now() + JUMP_DELAY_INTERVAL;
        }
        this.setParallaxPositions(this.movementPosition.x);
    }

    /**
     * Calculates movement based on elapsed time, isRunning flag and direction.
     * @param dt the elapsed time in milliseconds
     */
    private updateMovement(dt: number) {
        var velocity = this.getVelocityX() * dt;
        if (velocity !== 0) {           
            this.movementPosition.x += velocity;
            this.setParallaxPositions(this.movementPosition.x);
        }
        this.txtPosition.text = `Position: (${this.movementPosition.x.toFixed(0)}, ${this.movementPosition.y.toFixed(0)}), velocity: ${velocity.toFixed(1)}`;
    }

    /**
     * Calculates the horizontal velocity
     */
    private getVelocityX() : number {
        var move = 0;
        if (this.movementState === MovementState.Left || this.movementState === MovementState.JumpLeft) {
            move = -1 / 1000;
        } else if (this.movementState === MovementState.Right || this.movementState === MovementState.JumpRight) {
            move = 1 / 1000;
        }
        var velocity = (move * this.VELOCITY) * (this.isRunning ? 2 : 1.0);
        return velocity;
    }

    /**
     * Updates the parallax background components to a new world position.
     * @param movementPositionX
     */
    private setParallaxPositions(movementPositionX: number) {
        this.backgroundGround.SetViewPortX(movementPositionX);
        this.backgroundNear.SetViewPortX(movementPositionX * 0.6);
        this.backgroundFar.SetViewPortX(movementPositionX * 0.4);
    }
}

class JumpData {   
    private accelerationY: number;
    private velocityX: number;
    private velocityY: number;
    private dragDirection: number;

    private readonly GRAVITY =  0.0003;
    private readonly DRAG_STR = 0.00001;
    private readonly JUMP_STR = 0.450;

    constructor(public position: PIXI.Point, velocityX:number) {
        this.dragDirection = velocityX / Math.abs(velocityX);
        
        this.velocityY = this.JUMP_STR;
        this.velocityX = Math.abs(velocityX);
        this.accelerationY = 0;        
    }

    public update(dt: number) {
        var delta = 0;
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
    }

}

/*
class Hud extends PIXI.Container {
    constructor() {
        super();
        this.setup();
    }

    private setup() {
        var bottomBar = new PIXI.Sprite(PIXI.loader.resources["Assets/Images/bottom_bar_full.png"].texture);
        bottomBar.anchor.set(0.5, 1);
        bottomBar.position.set(Global.SCENE_WIDTH / 2, Global.SCENE_HEIGHT);
        this.addChild(bottomBar);
    }
}
*/
