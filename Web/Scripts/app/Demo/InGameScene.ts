import { Scene } from "app/_engine/Scene";
import * as Global from "app/Demo/Global";


/**
*   Load in game scene.
*/
export class InGameScene extends Scene {

    private backgroundNear = new PIXI.Container();
    private backgroundFar = new PIXI.Container();
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
        //var hud = new Hud();
        //this.HudOverlay = hud;

        var resources = PIXI.loader.resources;

        //  setup background
        this.addChild(this.backgroundFar);
        var t = resources["assets/images/background/Mountains.png"].texture;
        var tilingSprite = new PIXI.extras.TilingSprite(t, Global.SCENE_WIDTH*10, Global.SCENE_HEIGHT);
        this.backgroundFar.addChild(tilingSprite);

        this.addChild(this.backgroundNear);
        this.backgroundNear.position.y = 30;
        for (var i :number = 0; i < 5; i++) {
            var name = `assets/images/background/trees0${i + 1}.png`;
            let tree = new PIXI.Sprite(resources[name].texture);
            tree.position.x = i * 800;
            this.backgroundNear.addChild(tree);
        }       
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
