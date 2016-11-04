import { Scene } from "app/_engine/Scene";
import { Parallax } from "app/_engine/Parallax";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import { PhysicsConnector } from "app/_engine/PhysicsConnector";
import { Button } from "app/_engine/Button";

import * as Global from "./Global";
import { WorldP2 } from "./WorldP2";
import { MovementController } from "./MovementController";
import { LevelLoader, ILevelMap, IBody, IEntity , IDisplayObject} from "./LevelLoader";

import { Bumper } from "./Bumper";

/**
 *   Load in game scene.
 */
export class InGameScene extends Scene {

    private readonly HERO_FRAME_SIZE: number = 64;
    private readonly SCENE_HALF_WIDTH: number = Global.SCENE_WIDTH / 2;

    private worldContainer: PIXI.Container;
    private parallaxBackgrounds: Array<Parallax> = [];

    private hero: AnimatedSprite;
    private heroPosition: PIXI.Point = new PIXI.Point();

    private movementCtrl: MovementController;
    private hud = new Hud();

    private p2Connector: PhysicsConnector<p2.Body>;
    private wp2: WorldP2;

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
                Date.now;  /*none found - fallback to browser default */
        })();

        this.worldContainer = new PIXI.Container();
        this.worldContainer.scale.y = -1;
        this.addChild(this.worldContainer);

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
        this.p2Connector.updateDisplayObjects();

        //-------------------------------------------
        //  invoke update on each updateable
        //-------------------------------------------
        this.worldContainer.children.forEach((child: any) => {
            if (child.onUpdate) {
                child.onUpdate(dt);
            }
        });
    };

    private p2postStep() {
    }
    private setup():void {
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

        //--------------------------------------
        //  setup physics subsystem
        //--------------------------------------
        this.wp2 = new WorldP2(this.heroPosition);
        this.wp2.on("", this.p2postStep);
        this.movementCtrl = new MovementController(this.wp2, this.hero);        

        //--------------------------------------
        //  load level from json (under construction)
        //--------------------------------------
        var levelLoader = new LevelLoader("assets/levels/levels.json");
        var lvl = levelLoader.BuildLevel("Intro");
        this.p2Connector = lvl.physicsConnector;
        this.p2Connector.DisplayObjectUpdater = (displayObject: PIXI.DisplayObject, body: p2.Body) => {
            displayObject.position.set(body.interpolatedPosition[0], body.interpolatedPosition[1]);
            displayObject.rotation = body.interpolatedAngle;
        };
        //  add all object pairs to renderer and physics world
        this.p2Connector.forEach((dispObj, body) => {
            this.worldContainer.addChild(dispObj);
            this.wp2.addBody(body);
        });
        //  add parallax backgrounds
        this.parallaxBackgrounds = lvl.parallax;
        lvl.parallax.forEach((plx, idx, arr) => {
            this.worldContainer.addChildAt(plx, idx);
        });

        //  for testing purposes only
        this.addBoxes();
    }
    
    private addBoxes = () => {
        //var textureEven: PIXI.Texture = PIXI.loader.resources["assets/images/objects/box_128_01.png"].texture;
        //textureEven.rotate = 8;

        //for (var x = 0; x < 20; x++) {
        //    var spr: PIXI.Sprite;
        //    var text: PIXI.Texture;
        //    var position: PIXI.Point = new PIXI.Point;
        //    var rotation: number;

        //    if (x % 2 === 0) {
        //        text = textureEven;
        //        position.set(128 + (x * 512), 64);
        //        rotation = x * Math.PI / 2;
        //        spr = new PIXI.Sprite(text);
        //    } else {
        //        position.set(128 + (x * 512), 160);
        //        rotation = x * Math.PI / 4;
        //        spr = new Bumper();
        //    }
        //    spr.position = position;
        //    spr.rotation = rotation;
        //    spr.pivot.set(0.5);
        //    spr.anchor.set(0.5);
        //    this.worldContainer.addChild(spr);

        //    var shape = new p2.Box({ width: 128, height: 128 });
        //    this.wp2.addObject({ angle: spr.rotation, position: [spr.x, spr.y] }, shape);
        //}

        //var texture: PIXI.Texture;
        //texture = PIXI.loader.resources["assets/images/objects/box_64_02.png"].texture;
        //texture.rotate = 8;
        //for (var x = 0; x < 20; x++) {
        //    var spr = new PIXI.Sprite(texture);
        //    spr.position.set(x * 256, 32);
        //    spr.pivot.set(0.5);
        //    spr.anchor.set(0.5);
        //    this.worldContainer.addChild(spr);

        //    var body = new p2.Body({ mass: 100, position: [spr.x, spr.y] });
        //    body.addShape(new p2.Box({ width: 64, height: 64 }));
        //    this.wp2.addBody(body);
        //    this.p2Connector.addObjects(spr, body);
        //}
    };

    public saveLevel():void {
        var map: ILevelMap = {
            entities:[]
        };
        this.p2Connector.forEach((displayObject: PIXI.DisplayObject, body: p2.Body) => {
            var entity: IEntity = {
                displayObject: null,
                body: null
            };
            var newBody: IBody = {
                shape:"Box",
                type: body.type,
                xy: body.interpolatedPosition,
                mass: body.mass,
                angle: body.interpolatedAngle
            };

            //  parse display object
            var dispObj: IDisplayObject;
            if (displayObject instanceof PIXI.Sprite) {
                dispObj = {
                    type: "Sprite",
                    texture: (displayObject as PIXI.Sprite).texture.baseTexture.imageUrl,
                };
            }

            //  TODO: other display objects

            entity.body = newBody;
            entity.displayObject = dispObj;
            map.entities.push(entity);
        });
    }
}


class Hud extends PIXI.Container {
    constructor() {
        super();
        this.setup();
    }

    public txtPosition: PIXI.Text;

    private setup(): void {
        //var bottomBar = new PIXI.Sprite(PIXI.loader.resources["Assets/Images/bottom_bar_full.png"].texture);
        //bottomBar.anchor.set(0.5, 1);
        //bottomBar.position.set(Global.SCENE_WIDTH / 2, Global.SCENE_HEIGHT);
        //this.addChild(bottomBar);

        //--------------------------------
        //  btn for level editor support
        //--------------------------------
        var btnSave = new Button("assets/images/Gui/Button1.png",
            Global.SCENE_WIDTH - Global.BTN_WIDTH - 10, 10,
            Global.BTN_WIDTH, Global.BTN_HEIGHT);
        btnSave.Text = new PIXI.Text("Save", Global.BTN_STYLE);
        btnSave.onClick = () => {
            var igs = Global.sceneMngr.CurrentScene as InGameScene;
            igs.saveLevel();
        };
        this.addChild(btnSave);

        //  debug text
        this.txtPosition = new PIXI.Text("Position: (0, 0)", Global.TXT_STYLE);
        this.txtPosition.resolution = window.devicePixelRatio;
        this.addChild(this.txtPosition);
    }    
}

