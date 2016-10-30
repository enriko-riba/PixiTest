import { Scene } from "app/_engine/Scene";
import { Parallax } from "app/_engine/Parallax";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import { PhysicsTuple } from "app/_engine/PhysicsConnector";

import * as Global from "./Global";
import { WorldP2 } from "./WorldP2";
import { MovementState } from "./MovementState";
import { MovementController } from "./MovementController";
import { LevelLoader } from "./LevelLoader";

/**
 *   Load in game scene.
 */
export class InGameScene extends Scene {

    private readonly HERO_FRAME_SIZE: number = 64;
    private readonly SCENE_HALF_WIDTH: number = Global.SCENE_WIDTH / 2;

    private parallaxBackgrounds: Array<Parallax> = [];
    private worldContainer: PIXI.Container;

    private hero: AnimatedSprite;
    private heroPosition: PIXI.Point = new PIXI.Point();
    private entities: Array<PhysicsTuple<p2.Body>> = [];


    private wp2: WorldP2;
    private movementCtrl: MovementController;
    private hud = new Hud();

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

        this.worldContainer = new PIXI.Container();
        this.worldContainer.scale.y = -1;
        this.HudOverlay = this.hud;
        this.setup();

    }

    /**
    *  Updates physics and handles user input
    */
    public onUpdate = (dt: number) => {
        this.movementCtrl.update(dt);
        this.wp2.update(dt);

        //  hero position
        this.hero.x = this.heroPosition.x;
        this.hero.y = this.heroPosition.y;

        this.hud.txtPosition.text = `Position: (${this.heroPosition.x.toFixed(0)}, ${this.heroPosition.y.toFixed(0)})`;

        //  update parallax
        for (var i = 0; i < this.parallaxBackgrounds.length; i++) {
            this.parallaxBackgrounds[i].SetViewPortX(this.heroPosition.x);
        }

        //  world container position
        this.worldContainer.x = -this.hero.x + this.SCENE_HALF_WIDTH;
        this.worldContainer.y = Global.SCENE_HEIGHT - 70;

        //  entities position
        this.entities.forEach((tupple) => {
            tupple.displayObject.position.set(tupple.body.interpolatedPosition[0], tupple.body.interpolatedPosition[1]);
            tupple.displayObject.rotation = tupple.body.interpolatedAngle;
        });
    }

    private setup() {
        this.BackGroundColor = 0x1099bb;
        PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;

        //-----------------------------
        //  setup hero
        //-----------------------------
        this.hero = new AnimatedSprite();
        this.hero.addAnimations(new AnimationSequence("right", "assets/images/hero_64.png", [12, 13, 14, 15, 16, 17], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("left", "assets/images/hero_64.png", [6, 7, 8, 9, 10, 11], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("jumpleft", "assets/images/hero_64.png", [48, 49, 50, 51, 52, 53], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("jumpright", "assets/images/hero_64.png", [54, 55, 56, 57, 58, 59], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("jumpup", "assets/images/hero_64.png", [1, 3, 4], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("idle", "assets/images/hero_64.png", [25, 24, 40, 19, 19, 18, 19, 22, 30, 31, 1, 1, 1], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
        this.hero.Anchor = new PIXI.Point(0.5, 0.1);
        this.heroPosition.set(-170, 5);
        this.worldContainer.addChild(this.hero);
        this.hero.PlayAnimation("idle");

        this.wp2 = new WorldP2(this.heroPosition);
        this.movementCtrl = new MovementController(this.wp2, this.hero);

        var levelLoader = new LevelLoader("assets/levels/levels.json");
        var lvl = levelLoader.BuildLevel("Intro");
        this.parallaxBackgrounds = lvl.parallax;
        for (var i = 0; i < this.parallaxBackgrounds.length; i++) {
            this.worldContainer.addChildAt(this.parallaxBackgrounds[i], i);
        }
        
        this.addChild(this.worldContainer);

        this.addBoxes();
    }
    
    private addBoxes = () => {
        var textureEven: PIXI.Texture;
        var textureOdd: PIXI.Texture;

        textureEven = PIXI.loader.resources["assets/images/objects/box_128_01.png"].texture;
        textureOdd = PIXI.loader.resources["assets/images/objects/bumper_01.png"].texture;
        textureEven.rotate = 8;
        textureOdd.rotate = 8;

        for (var x = 0; x < 20; x++) {
            var spr: PIXI.Sprite;
            var text: PIXI.Texture;
            var position: PIXI.Point = new PIXI.Point;
            var rotation: number;

            if (x % 2 == 0) {
                text = textureEven;
                position.set(128 + (x * 512), 64);
                rotation = x * Math.PI / 2;
            } else {
                text = textureOdd;
                position.set(128 + (x * 512), 160);
                rotation = x * Math.PI / 4;
            }

            spr = new PIXI.Sprite(text);
            spr.position = position;
            spr.rotation = rotation;
            spr.pivot.set(0.5);
            spr.anchor.set(0.5);
            this.worldContainer.addChild(spr);

            var shape = new p2.Box({ width: 128, height: 128 });
            this.wp2.addObject({ angle: spr.rotation, position: [spr.x, spr.y] }, shape);
        }

        var texture: PIXI.Texture;
        texture = PIXI.loader.resources["assets/images/objects/box_64_02.png"].texture;
        texture.rotate = 8;
        for (var x = 0; x < 20; x++) {
            var spr = new PIXI.Sprite(texture);
            spr.position.set(x * 256, 100);
            spr.pivot.set(0.5);
            spr.anchor.set(0.5);
            this.worldContainer.addChild(spr);

            var body = new p2.Body({ mass: 100, position: [spr.x, spr.y] });
            body.addShape(new p2.Box({ width: 64, height: 64 }));
            this.wp2.addBody(body);
            this.entities.push(new PhysicsTuple(spr, body));
        }
    }
}


class Hud extends PIXI.Container {
    constructor() {
        super();
        this.setup();
    }

    public txtPosition: PIXI.Text;

    private setup() {
        //var bottomBar = new PIXI.Sprite(PIXI.loader.resources["Assets/Images/bottom_bar_full.png"].texture);
        //bottomBar.anchor.set(0.5, 1);
        //bottomBar.position.set(Global.SCENE_WIDTH / 2, Global.SCENE_HEIGHT);
        //this.addChild(bottomBar);

        //  debug text
        this.txtPosition = new PIXI.Text("Position: (0, 0)", Global.TXT_STYLE);
        this.txtPosition.resolution = window.devicePixelRatio;
        this.addChild(this.txtPosition);
    }
}

