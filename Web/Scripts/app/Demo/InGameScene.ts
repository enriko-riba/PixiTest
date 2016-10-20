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

        this.setParallaxPositions();

        //  debug text
        this.txtPosition = new PIXI.Text("Position: (0, 0)", Global.TXT_STYLE);
        this.txtPosition.resolution = window.devicePixelRatio;
        this.addChild(this.txtPosition);
    }


    private handleKeyboard = () => {
        var kbd = Global.kbd;
        var newState: MovementState; 
        var newIsRunning: boolean = kbd.IsKeyDown(16);
        var newIsJumping: boolean = false;

        //  run or normal speed?             
        var animationFPS = this.ANIMATION_FPS * (newIsRunning ? 1.6 : 1);

        //  check movement action keys
        if (!this.isJumping) {
            newState = MovementState.Idle;

            if (kbd.IsKeyDown(65)) {
                newState = MovementState.Left;
            } else if (kbd.IsKeyDown(68)) {
                newState = MovementState.Right;
            }
            //else if (kbd.IsKeyDown(83)) {
              //  newState = MovementState.Idle;
            //}

            //  check jump
            if (kbd.IsKeyDown(87)) {
                if (newState == MovementState.Left)
                    newState = MovementState.JumpLeft;
                else if (newState == MovementState.Right)
                    newState = MovementState.JumpRight;
                else if (newState == MovementState.Idle)
                    newState = MovementState.JumpUp;
            }
        } else {
            newState = this.movementState;
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

        //  has running state changed while we have an animation?
        if (newIsRunning != this.isRunning && this.movementState != MovementState.Idle) {
            this.hero.Fps = animationFPS;
        }

        //  has a jump started
        if (newIsJumping) {
            this.jumpStart = new Date().getMilliseconds();
        }


        this.isRunning = newIsRunning;
        this.movementState = newState;
    }

    public onUpdate = (dt: number) => {
        this.handleKeyboard();
        if (this.isJumping) 
            this.updateJump(dt);
        else
            this.updateMovement(dt);

        this.txtPosition.text = `Position: (${this.movementPosition.x.toFixed(0)}, ${this.movementPosition.y.toFixed(0)}), velocity: ${velocity.toFixed(1)}`;
    }

    private jumpStart: number;
    private updateJump(dt) {

    }

    /*
    *   Calculates movement based on ellapsed time, isRunning flag and direction.
    */
    private updateMovement(dt: number) {
        var move = 0;
        if (this.movementState === MovementState.Left) {
            move = -dt / 1000;
        } else if (this.movementState === MovementState.Right) {
            move = dt / 1000;
        }

        if (move !== 0) {
            var velocity = (move * this.VELOCITY) * (this.isRunning ? 2 : 1.0);
            this.movementPosition.x += velocity;
            this.setParallaxPositions();
        }
    }


    private setParallaxPositions() {
        this.backgroundGround.SetViewPortX(this.movementPosition.x);
        this.backgroundNear.SetViewPortX(this.movementPosition.x * 0.6);
        this.backgroundFar.SetViewPortX(this.movementPosition.x * 0.4);
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
