import { Scene } from "app/_engine/Scene";
import { State } from "app/_engine/SceneManager";
import { Parallax } from "app/_engine/Parallax";
import { KeyboardAction } from "app/_engine/KeyboardMapper";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import * as Global from "app/Demo/Global";

/**
*   Load in game scene.
*/
export class InGameScene extends Scene {

    private backgroundNear : Parallax;
    private backgroundFar : Parallax;
    private hero: AnimatedSprite;//PIXI.Sprite;
    private entities: Array<PIXI.Sprite> = [];

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
        //var hud = new Hud();
        //this.HudOverlay = hud;

        var resources = PIXI.loader.resources;

        //-----------------------------
        //  setup backgrounds
        //-----------------------------
        var t = resources["assets/images/background/Canyon.png"].texture;
        this.backgroundFar = new Parallax([t]);
        this.addChild(this.backgroundFar);

        var nearTextures : Array<PIXI.Texture> = [];        
        for (var i :number = 0; i < 5; i++) {
            var name = `assets/images/background/trees0${i + 1}.png`;
            nearTextures.push(resources[name].texture);
        }    
        this.backgroundNear = new Parallax(nearTextures); 
        this.backgroundNear.position.y = Global.SCENE_HEIGHT - this.backgroundNear.height-5;  
        this.addChild(this.backgroundNear);

        //-----------------------------
        //  setup hero
        //-----------------------------
        this.hero = new AnimatedSprite("assets/images/hero.png", 32, 32);//new PIXI.Sprite(resources["assets/images/hero.png"].texture);
        this.hero.addAnimations(new AnimationSequence("right", [12, 13, 14, 15, 16, 17]));
        this.hero.addAnimations(new AnimationSequence("left", [6, 7, 8, 9, 10, 11]));
        this.hero.addAnimations(new AnimationSequence("idle", [1, 7, 10, 9, 6, 3]));
        //this.hero.anchor.set(0.5);
        this.hero.position.set(Global.sceneMngr.Renderer.width / 2, Global.sceneMngr.Renderer.height - 120);
        this.addChild(this.hero);
        this.hero.PlayAnimation("idle");
    }

    private MoveLeft = () => {
        this.backgroundFar.ViewPort.x += 1.0;
        this.backgroundNear.ViewPort.x += 1.85;
        this.hero.PlayAnimation("left");
    }

    private MoveRight = () => {
        this.backgroundFar.ViewPort.x -= 1.0;
        this.backgroundNear.ViewPort.x -= 1.85;
        this.hero.PlayAnimation("right");
    }

    public onResize = () => {
        this.hero.position.set(Global.sceneMngr.Renderer.width / 2, Global.SCENE_HEIGHT - 100);
        var vps = new PIXI.Point(Global.sceneMngr.Renderer.width, Global.sceneMngr.Renderer.height);
        this.backgroundNear.ViewPortSize = vps;
        this.backgroundFar.ViewPortSize = vps;
    }

    public onUpdate = () => {
        Global.kbd.update(State.IN_GAME);
        this.hero.update(16.7);
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
