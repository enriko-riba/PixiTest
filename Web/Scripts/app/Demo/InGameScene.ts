import { Scene } from "app/_engine/Scene";
import { State } from "app/_engine/SceneManager";
import { Parallax, CyclicTextureLoader } from "app/_engine/Parallax";
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
        this.hero = new AnimatedSprite();//new PIXI.Sprite(resources["assets/images/hero.png"].texture);
        this.hero.addAnimations(new AnimationSequence("right", "assets/images/hero_64x64.png", [12, 13, 14, 15, 16, 17], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("left", "assets/images/hero_64x64.png", [6, 7, 8, 9, 10, 11], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("idle", "assets/images/hero_64x64.png", [25, 24, 40, 19, 19, 18, 19, 22, 30, 31, 1, 1, 1], FRAME_SIZE, FRAME_SIZE, 3));
        this.hero.pivot.set(0.5, 1);
        this.hero.scale.set(1.2);
        this.hero.position.set((Global.SCENE_WIDTH / 2) - (this.hero.width / 2), Global.SCENE_HEIGHT - 150);
        this.addChild(this.hero);
        this.hero.PlayAnimation("idle");

        //-----------------------------
        //  setup backgrounds
        //-----------------------------
        var resources = PIXI.loader.resources;
        var vps = new PIXI.Point(Global.SCENE_WIDTH, Global.SCENE_HEIGHT);

        //  far parallax
        var t = resources["assets/images/background/Canyon.png"].texture;
        this.backgroundFar = new Parallax(new CyclicTextureLoader([t]));
        //this.backgroundFar.ViewPortSize = vps;
        //this.addChildAt(this.backgroundFar, 0);

        //  near parallax
        var nearTextures: Array<PIXI.Texture> = [];
        for (var i: number = 0; i < 5; i++) {
            var name = `assets/images/background/trees0${i + 1}.png`;
            nearTextures.push(resources[name].texture);
        }
        this.backgroundNear = new Parallax(new CyclicTextureLoader(nearTextures));
        this.backgroundNear.ViewPortSize = vps;
        this.backgroundNear.position.y = Global.SCENE_HEIGHT - this.backgroundNear.height;
        this.addChildAt(this.backgroundNear, 0);

        //  bottom (nearest) parallax
        t = resources["assets/images/background/ground.png"].texture;
        this.backgroundGround = new Parallax(new CyclicTextureLoader([t]));
        //this.backgroundGround.ViewPortSize = vps;
        //this.backgroundGround.position.y = Global.SCENE_HEIGHT - this.backgroundGround.height + 35;
        //this.addChildAt(this.backgroundGround, 2); 

        this.setParallaxPositions();       
    }

    private MoveLeft = () => {
        if (this.movementState != MovementState.Left) {
            this.hero.PlayAnimation("left");
            this.movementState = MovementState.Left;
            var filter = new PIXI.filters.BlurXFilter();
            filter.quality = 1;
            filter.strength = 1.5;
            this.backgroundGround.filters = [filter];
        }
    }
    private MoveRight = () => {
        if (this.movementState != MovementState.Right) {
            this.hero.PlayAnimation("right");
            this.movementState = MovementState.Right;

            var filter = new PIXI.filters.BlurXFilter();
            filter.quality = 1;
            filter.strength = 1.5;
            this.backgroundGround.filters = [filter];
        }
    }
    private MoveIdle = () => {
        if (this.movementState != MovementState.Idle) {
            this.hero.PlayAnimation("idle");
            this.movementState = MovementState.Idle;
            this.backgroundGround.filters = null;
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
            const VELOCITY = 60;
            this.movementPosition.x += (move * VELOCITY);
            this.setParallaxPositions();
        }
    }

    private setParallaxPositions() {
        this.backgroundGround.SetViewPortX(this.movementPosition.x);// = new PIXI.Point(this.movementPosition.x, 0);
        this.backgroundNear.SetViewPortX(this.movementPosition.x * 0.7);//= new PIXI.Point(this.movementPosition.x * 0.7, 0);
        this.backgroundFar.SetViewPortX(this.movementPosition.x * 0.5); //new PIXI.Point(this.movementPosition.x * 0.55, 0);
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
