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
        //var hud = new Hud();
        //this.HudOverlay = hud;

        var resources = PIXI.loader.resources;

        //-----------------------------
        //  setup backgrounds
        //-----------------------------
        var t = resources["assets/images/background/Canyon.png"].texture;
        this.backgroundFar = new Parallax([t]);
        this.addChild(this.backgroundFar);

        var nearTextures: Array<PIXI.Texture> = [];
        for (var i: number = 0; i < 5; i++) {
            var name = `assets/images/background/trees0${i + 1}.png`;
            nearTextures.push(resources[name].texture);
        }
        this.backgroundNear = new Parallax(nearTextures);
        this.backgroundNear.position.y = Global.SCENE_HEIGHT - this.backgroundNear.height - 5;
        this.addChild(this.backgroundNear);

        //-----------------------------
        //  setup hero
        //-----------------------------
        const FRAME_SIZE = 64;
        this.hero = new AnimatedSprite();//new PIXI.Sprite(resources["assets/images/hero.png"].texture);
        this.hero.addAnimations(new AnimationSequence("right", "assets/images/hero_64x64.png", [12, 13, 14, 15, 16, 17], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("left", "assets/images/hero_64x64.png", [6, 7, 8, 9, 10, 11], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("idle", "assets/images/hero_64x64.png", [24, 36, 37, 19, 20, 29, 28, 1], FRAME_SIZE, FRAME_SIZE));
        this.hero.pivot.set(0.5, 1);
        this.hero.position.set(Global.SCENE_WIDTH / 2, Global.SCENE_HEIGHT - 150);
        this.addChild(this.hero);
        this.hero.PlayAnimation("idle");
    }

    private MoveLeft = () => {
        if (this.movementState != MovementState.Left) {
            this.hero.PlayAnimation("left");
            this.movementState = MovementState.Left;
        }
    }
    private MoveRight = () => {
        if (this.movementState != MovementState.Right) {
            this.hero.PlayAnimation("right");
            this.movementState = MovementState.Right;
        }
    }
    private MoveIdle = () => {
        if (this.movementState != MovementState.Idle) {
            this.hero.PlayAnimation("idle");
            this.movementState = MovementState.Idle;
        }
    }

    public onResize = () => {
        //this.hero.position.set(Global.sceneMngr.Renderer.width / 2, Global.SCENE_HEIGHT - 100);
        var vps = new PIXI.Point(Global.sceneMngr.Renderer.width, Global.sceneMngr.Renderer.height);
        this.backgroundNear.ViewPortSize = vps;
        this.backgroundFar.ViewPortSize = vps;
    }

    public onUpdate = (dt: number) => {
        //console.log('onUpdate(' + dt + ')');
        Global.kbd.update(State.IN_GAME);

        var move = 0;
        if (this.movementState === MovementState.Left) {
            move = 1000/dt;
        } else if (this.movementState === MovementState.Right) {
            move = -1000/dt;
        }

        this.movementPosition.x += move * 10;
        this.backgroundNear.ViewPort = new PIXI.Point(this.movementPosition.x * 19, 0);
        this.backgroundFar.ViewPort = new PIXI.Point(this.movementPosition.x * 15, 0);
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
