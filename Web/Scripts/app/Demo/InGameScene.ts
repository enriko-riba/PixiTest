﻿import { Scene } from "app/_engine/Scene";
import { State } from "app/_engine/SceneManager";
import { Parallax } from "app/_engine/Parallax";
import { KeyboardAction } from "app/_engine/KeyboardMapper";
import * as Global from "app/Demo/Global";

/**
*   Load in game scene.
*/
export class InGameScene extends Scene {

    private backgroundNear : Parallax;
    private backgroundFar : Parallax;
    private hero: PIXI.Sprite;
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
        var t = resources["assets/images/background/Mountains.png"].texture;
        this.backgroundFar = new Parallax([t]);
        this.addChild(this.backgroundFar);

        var nearTextures : Array<PIXI.Texture> = [];        
        for (var i :number = 0; i < 5; i++) {
            var name = `assets/images/background/trees0${i + 1}.png`;
            nearTextures.push(resources[name].texture);
        }    
        this.backgroundNear = new Parallax(nearTextures); 
        this.backgroundNear.position.y = 10;  
        this.addChild(this.backgroundNear);

        //-----------------------------
        //  setup hero
        //-----------------------------
        this.hero = new PIXI.Sprite(resources["assets/images/hero.png"].texture);
        this.hero.anchor.set(0.5);
        this.hero.position.set(Global.sceneMngr.Renderer.width / 2, Global.sceneMngr.Renderer.height - 50);
        this.addChild(this.hero);
    }

    private MoveLeft = () => {
        this.backgroundFar.position.x += 1.0;
        this.backgroundNear.position.x += 1.85;
    }

    private MoveRight = () => {
        this.backgroundFar.position.x -= 1.0;
        this.backgroundNear.position.x -= 1.85;
    }

    public onResize = () => {
        this.hero.position.set(Global.sceneMngr.Renderer.width / 2, Global.sceneMngr.Renderer.height - this.hero.height - 10);
        var vps = new PIXI.Point(Global.sceneMngr.Renderer.width, Global.sceneMngr.Renderer.height);
        this.backgroundNear.ViewPortSize = vps;
        this.backgroundFar.ViewPortSize = vps;
    }

    public onUpdate = () => {
        Global.kbd.update(State.IN_GAME);
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
