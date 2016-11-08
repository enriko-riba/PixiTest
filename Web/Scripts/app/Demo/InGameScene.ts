import { Scene } from "app/_engine/Scene";
import { Parallax } from "app/_engine/Parallax";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import { Button } from "app/_engine/Button";

import * as Global from "./Global";
import { WorldP2 } from "./WorldP2";
import { MovementController } from "./MovementController";
import { LevelLoader, ILevelMap, IBodyDefinition, IMapEntity, IDisplayObjectDefinition } from "./LevelLoader";
import { Bumper } from "./Bumper";

import * as TWEEN from "tween";


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

    private wp2: WorldP2;
    private entities = [];


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

        //-------------------------------------------
        //  update hero & world container position
        //-------------------------------------------
        this.hero.x = this.heroPosition.x;
        this.hero.y = this.heroPosition.y;
        this.worldContainer.x = -this.hero.x + this.SCENE_HALF_WIDTH;
        this.worldContainer.y = Global.SCENE_HEIGHT - 70;

        //-------------------------------------------
        //  update parallax
        //-------------------------------------------
        for (var i = 0; i < this.parallaxBackgrounds.length; i++) {
            this.parallaxBackgrounds[i].SetViewPortX(this.heroPosition.x);
        }

        //-------------------------------------------
        //  update entities position
        //-------------------------------------------
        this.entities.forEach((body, idx, arr) => {
            var displayObject: PIXI.DisplayObject = body.DisplayObject as PIXI.DisplayObject;
            displayObject.position.set(body.interpolatedPosition[0], body.interpolatedPosition[1]);
            displayObject.rotation = body.interpolatedAngle;
        });

        //-------------------------------------------
        //  collisions with collectible items
        //-------------------------------------------
        if (this.wp2.playerContacts.length > 0) {
            this.wp2.playerContacts.forEach((body: any, idx, arr) => {
                if (body.DisplayObject && body.DisplayObject.collectibleType) {
                    this.handleCollectibleCollision(body);                    
                }
            });
        }

        //-------------------------------------------
        //  invoke update on each updateable
        //-------------------------------------------
        this.worldContainer.children.forEach((child: any) => {
            if (child.onUpdate) {
                child.onUpdate(dt);
            }
        });

        //-------------------------------------------
        //  finally update the hud
        //-------------------------------------------
        this.hud.heroPosition = this.heroPosition;
        this.hud.onUpdate(dt);
    };

    /**
     * Handles player collision with collectibles.
     * @param body
     */
    private handleCollectibleCollision(body: any) {
        var bodyIdx = this.entities.indexOf(body);
        this.entities.splice(bodyIdx, 1);
        this.wp2.removeBody(body);

        var dispObj: PIXI.DisplayObject = body.DisplayObject as PIXI.DisplayObject;
        body.DisplayObject = null;

        //  TODO: start collectible pickup animation
        //  TODO: update stats/inventory whatever
        switch (dispObj.collectibleType) {
            case 1:
                this.hud.coins += 1;
                this.addCollectibleTween(dispObj);
                break;
            case 2:
                this.hud.coins += 10;
                this.addCollectibleTween(dispObj);
                break;
        }
    }

    /**
     * Starts an animation tween and removes the display object from scene.
     * @param dispObj
     */
    private addCollectibleTween(dispObj: PIXI.DisplayObject) {
        var upX = dispObj.position.x + 45;
        var upY = dispObj.position.y + 160;

        var endX = dispObj.position.x - Global.SCENE_WIDTH / 2;
        var endY = Global.SCENE_HEIGHT;

        var moveUp = new TWEEN.Tween(dispObj.position)
            .to({ x: upX, y: upY }, 150);

        var scale = new TWEEN.Tween(dispObj.scale)
            .to({ x: 1.6, y: 1.6 }, 500)
            .easing(TWEEN.Easing.Linear.None);

        var moveAway = new TWEEN.Tween(dispObj.position)
            .to({ x: endX, y: endY }, 2000)
            .easing(TWEEN.Easing.Back.In)
            .onComplete(() => this.worldContainer.removeChild(dispObj));

        moveUp.chain(scale, moveAway).start();
    }

    private setup(): void {
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
        this.hero.Anchor = new PIXI.Point(0.5, 0.45);
        this.worldContainer.addChild(this.hero);
        this.hero.PlayAnimation("idle");

        //--------------------------------------
        //  setup physics subsystem
        //--------------------------------------
        this.heroPosition.set(-250, 36);
        this.wp2 = new WorldP2(this.heroPosition);
        this.movementCtrl = new MovementController(this.wp2, this.hero);

        //--------------------------------------
        //  load level from json (under construction)
        //--------------------------------------
        var levelLoader = new LevelLoader("assets/levels/levels.json");
        var lvl = levelLoader.BuildLevel("Intro");
        this.entities = lvl.entities;

        //  add all object pairs to renderer and physics world
        lvl.entities.forEach((body, idx, arr) => {
            this.worldContainer.addChild(body.DisplayObject);
            this.wp2.addBody(body);
        });

        //  add parallax backgrounds
        this.parallaxBackgrounds = lvl.parallax;
        lvl.parallax.forEach((plx: Parallax, idx, arr) => {
            this.worldContainer.addChildAt(plx, idx);
            //  TODO: there is a bug not initially calculating all viewport visible parallax textures so just move it in both directions to recalc all textures
            plx.SetViewPortX(0);
            plx.SetViewPortX(this.heroPosition.x + 1);
        });
    }

    /**
     * Saves the current level and dumps to console.
     */
    public saveLevel(): void {
        var map: ILevelMap = {
            templates:[],
            entities: [],
            NPC:[]
        };

        var fnDumpDispObjProps = (dispObj: PIXI.Sprite) => {
            return {
                type: "Sprite",
                texture: dispObj.texture.baseTexture.imageUrl,
                rotation: dispObj.rotation,
                xy: [dispObj.x, dispObj.y],
                scale: [dispObj.scale.x, dispObj.scale.y]
            }
        }

        this.entities.forEach((body: p2.Body, idx, arr) => {
            /*
            var displayObject: PIXI.DisplayObject = (body as any).DisplayObject as PIXI.DisplayObject;
            var entity: IMapEntity = {
                displayObject: null,
                body: null
            };
            var newBody: IBodyDefinition = {
                shape: "Box",
                type: body.type,
                xy: body.interpolatedPosition,
                mass: body.mass,
                angle: body.interpolatedAngle,

                //  TODO: handle for other disp objects not inheriting from sprites
                size: [(displayObject as PIXI.Sprite).width, (displayObject as PIXI.Sprite).height]
            };

            //  save display object
            var dispObj: IDisplayObjectDefinition = fnDumpDispObjProps(displayObject as PIXI.Sprite);
            if (displayObject instanceof Bumper) {
                dispObj.type = "Bumper";
            }
            //  TODO: other display object types

            entity.body = newBody;
            entity.displayObject = dispObj;
            map.entities.push(entity);
            */
        });
        console.log(JSON.stringify(map.entities));
    }
}


class Hud extends PIXI.Container {
    constructor() {
        super();
        this.setup();
    }

    public heroLevel: string = "1";
    public heroPosition: PIXI.Point;
    public coins: number = 0;

    private txtPosition: PIXI.Text;
    private txtLevel: PIXI.Text;
    private txtCoins: PIXI.Text;

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
        var pnl = new PIXI.Sprite(PIXI.loader.resources["assets/images/Gui/Panel_256x128.png"].texture);
        pnl.position.set(5, 5);
        this.addChild(pnl);

        this.txtLevel = new PIXI.Text("Level: 1", Global.TXT_STYLE);
        this.txtLevel.resolution = window.devicePixelRatio;
        this.txtLevel.position.set(20, 15);
        pnl.addChild(this.txtLevel);

        this.txtPosition = new PIXI.Text("Position: 0, 0", Global.TXT_STYLE);
        this.txtPosition.resolution = window.devicePixelRatio;
        this.txtPosition.position.set(20, 85);
        pnl.addChild(this.txtPosition);

        this.txtCoins = new PIXI.Text("Coins: 0", Global.TXT_STYLE);
        this.txtCoins.resolution = window.devicePixelRatio;
        this.txtCoins.position.set(20, 50);
        pnl.addChild(this.txtCoins);
    }

    public onUpdate(dt: number) {
        this.txtLevel.text = `Level:  ${this.heroLevel}`;
        this.txtPosition.text = `Position:  ${this.heroPosition.x.toFixed(0)}, ${this.heroPosition.y.toFixed(0)}`;
        this.txtCoins.text = `Coins:  ${this.coins}`;
    }
}

