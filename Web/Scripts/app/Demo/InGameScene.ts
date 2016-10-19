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
    private readonly VELOCITY = 860;
    private readonly ANIMATION_FPS = 10;

    /**
    *   Creates a new scene instance.
    */
    constructor() {
        super("InGame");
        this.setup();
    }

    private setup() {
        this.BackGroundColor = 0x1099bb;
        Global.kbd.AddKeyboardActionHandler(new KeyboardAction(65, 'Move left', () => this.MoveLeft(), false), State.IN_GAME);
        Global.kbd.AddKeyboardActionHandler(new KeyboardAction(68, 'Move right', () => this.MoveRight(), false), State.IN_GAME);
        Global.kbd.AddKeyboardActionHandler(new KeyboardAction(83, 'Stop', () => this.MoveIdle(), false), State.IN_GAME);

        //-----------------------------
        //  setup hero
        //-----------------------------
        PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
        const FRAME_SIZE = 64;
        this.hero = new AnimatedSprite();
        this.hero.addAnimations(new AnimationSequence("right", "assets/images/hero_64x64.png", [12, 13, 14, 15, 16, 17], FRAME_SIZE, FRAME_SIZE, this.ANIMATION_FPS));
        this.hero.addAnimations(new AnimationSequence("left", "assets/images/hero_64x64.png", [6, 7, 8, 9, 10, 11], FRAME_SIZE, FRAME_SIZE, this.ANIMATION_FPS));
        this.hero.addAnimations(new AnimationSequence("idle", "assets/images/hero_64x64.png", [25, 24, 40, 19, 19, 18, 19, 22, 30, 31, 1, 1, 1], FRAME_SIZE, FRAME_SIZE, this.ANIMATION_FPS/3));
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
        this.backgroundGround.y = Global.SCENE_HEIGHT - this.backgroundGround.height + 35;

        this.setParallaxPositions();       
    }

    private MoveLeft = () => {
        if (this.movementState != MovementState.Left) {
            this.hero.PlayAnimation("left");
            this.movementState = MovementState.Left;
            //var filter = new PIXI.filters.BlurXFilter();
            //filter.quality = 1;
            //filter.strength = 1.5;
            //this.backgroundGround.filters = [filter];
        }
    }
    private MoveRight = () => {
        if (this.movementState != MovementState.Right) {
            this.hero.PlayAnimation("right");
            this.movementState = MovementState.Right;

            //var filter = new PIXI.filters.BlurXFilter();
            //filter.quality = 1;
            //filter.strength = 1.5;
            //this.backgroundGround.filters = [filter];
        }
    }
    private MoveIdle = () => {
        if (this.movementState != MovementState.Idle) {
            this.hero.PlayAnimation("idle");
            this.movementState = MovementState.Idle;
            //this.backgroundGround.filters = null;
        }
    }

    public onUpdate = (dt: number) => {
        //console.log('onUpdate(' + dt + ')');
        Global.kbd.update(State.IN_GAME);

        var move = 0;
        if (this.movementState === MovementState.Left) {
            move = -dt / 1000;
        } else if (this.movementState === MovementState.Right) {
            move = dt / 1000;
        }

        if (move !== 0) {
            this.movementPosition.x += (move * this.VELOCITY);
            this.setParallaxPositions();
        }
    }

    private setParallaxPositions() {
        this.backgroundGround.SetViewPortX(this.movementPosition.x);
        this.backgroundNear.SetViewPortX(this.movementPosition.x * 0.7);
        this.backgroundFar.SetViewPortX(this.movementPosition.x * 0.5); 
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
