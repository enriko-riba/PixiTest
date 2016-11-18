import { Scene } from "app/_engine/Scene";
import { Parallax } from "app/_engine/Parallax";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import { Button } from "app/_engine/Button";

import * as Global from "./Global";
import { WorldP2 } from "./WorldP2";
import { MovementController } from "./MovementController";
import { MovementState } from "./MovementState";
import { LevelLoader, ILevelMap, IMapEntity } from "./LevelLoader";

import * as TWEEN from "tween";
import "pixi-particles";

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

    private emitter: PIXI.particles.Emitter;

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

        this.emitter.update(dt * 0.001);
        this.emitter.ownerPos = this.heroPosition;
        switch (this.movementCtrl.MovementState) {
            case MovementState.Idle:
                this.emitter.emit = false;
                break;
            case MovementState.Left:
            case MovementState.JumpLeft:
                this.emitter.emit = true;
                this.emitter.minStartRotation = -25;
                this.emitter.maxStartRotation = 25;
                break;
            case MovementState.Right:
            case MovementState.JumpRight:
                this.emitter.emit = true;
                this.emitter.minStartRotation = 155;
                this.emitter.maxStartRotation = 205;
                break;

            case MovementState.JumpUp:
                this.emitter.emit = true;
                this.emitter.minStartRotation = 245;
                this.emitter.maxStartRotation = 295;
                break;
        }

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
        for (var i = 0, len = this.entities.length; i < len; i++) {
            let body = this.entities[i];
            let displayObject: PIXI.DisplayObject = body.DisplayObject as PIXI.DisplayObject;
            displayObject.position.set(body.interpolatedPosition[0], body.interpolatedPosition[1]);
            displayObject.rotation = body.interpolatedAngle;
        }

        //-------------------------------------------
        //  collisions with collectible items
        //-------------------------------------------
        for (var i = 0, len = this.wp2.playerContacts.length; i < len; i++) {
            let body: any = this.wp2.playerContacts[i];
            if (body.DisplayObject && body.DisplayObject.collectibleType) {
                this.handleCollectibleCollision(body);
            }
        }

        //-------------------------------------------
        //  invoke update on each updateable
        //-------------------------------------------
        for (var i = 0, len = this.worldContainer.children.length; i < len; i++) {
            let child:any = this.worldContainer.children[i];
            if (child.onUpdate) {
                child.onUpdate(dt);
            }
        };

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
    private handleCollectibleCollision(body: any): void {
        var bodyIdx = this.entities.indexOf(body);
        this.entities.splice(bodyIdx, 1);
        this.wp2.removeBody(body);

        var dispObj: PIXI.DisplayObject = body.DisplayObject as PIXI.DisplayObject;
        body.DisplayObject = null;

        switch (dispObj.collectibleType) {
            case 1:
                this.hud.coins += 1;
                this.addCollectibleTween(dispObj);
                this.addCollectibleInfo(dispObj.position, "+1 coin");
                break;
            case 2:
                this.hud.coins += 10;
                this.addCollectibleTween(dispObj);
                this.addCollectibleInfo(dispObj.position, "+10 coins");
                break;
            case 3:
                this.hud.coins += 100;
                this.addCollectibleTween(dispObj);
                this.addCollectibleInfo(dispObj.position, "+100 coins");
                break;
        }
    }

    /**
     * Starts an animation tween and removes the display object from scene.
     * @param dispObj
     */
    private addCollectibleTween(dispObj: PIXI.DisplayObject):void {
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

    /**
     * Starts an animation tween with informational text moving upwards from the given position.
     * @param dispObj
     */
    private addCollectibleInfo(position: PIXI.Point, info: string):void {
        var txtInfo = new PIXI.Text(info, Global.TXT_STYLE);
        txtInfo.position.set(position.x, position.y);
        txtInfo.scale.set(1, -1);//  scale invert since everything is upside down due to coordinate system

        this.worldContainer.addChild(txtInfo);

        var upY = position.y + 200;
        var moveUp = new TWEEN.Tween(txtInfo.position)
            .to({ y: upY }, 2000);
        moveUp.start();

        var scale = new TWEEN.Tween(txtInfo.scale)
            .to({ x: 1.6, y: -1.6 }, 2200)
            .easing(TWEEN.Easing.Linear.None);

        var fade = new TWEEN.Tween(txtInfo)
            .to({alpha: 0}, 3000)
            .onComplete(() => this.worldContainer.removeChild(txtInfo));;
        scale.chain(fade).start();
    }

    /**
     * Sets up the scene.
     */
    private setup(): void {
        this.BackGroundColor = 0x1099bb;
        PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;

        //-----------------------------
        //  setup hero
        //-----------------------------
        this.emitter = this.createParticleEmitter(this.worldContainer);
        this.emitter.emit = true;
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
        this.wp2.on("playerContact", this.onPlayerContact, this);
        this.movementCtrl = new MovementController(this.wp2, this.hero);

        //--------------------------------------
        //  load level from json (under construction)
        //--------------------------------------
        var levelLoader = new LevelLoader("assets/levels/levels.json");
        var lvl = levelLoader.BuildLevel("Intro");
        this.entities = lvl.entities;

        //  add all object pairs to renderer and physics world
        lvl.entities.forEach((body:any) => {
            this.worldContainer.addChild(body.DisplayObject);
            this.wp2.addBody(body);
        });

        //  add parallax backgrounds
        this.parallaxBackgrounds = lvl.parallax;
        lvl.parallax.forEach((plx: Parallax, idx:number) => {
            this.worldContainer.addChildAt(plx, idx);
            //  TODO: there is a bug not initially calculating all viewport visible parallax textures so just move it in both directions to recalc all textures
            plx.SetViewPortX(0);
            plx.SetViewPortX(this.heroPosition.x + 1);
        });
    }

    private createParticleEmitter(container: PIXI.Container): PIXI.particles.Emitter {
        var emitter = new PIXI.particles.Emitter(

            // The PIXI.Container to put the emitter in
            // if using blend modes, it's important to put this
            // on top of a bitmap, and not use the root stage Container
            container,

            // The collection of particle images to use
            [PIXI.Texture.fromImage("assets/images/objects/star.png")],

            // Emitter configuration, edit this to change the look
            // of the emitter
            {
                "alpha": {
                    "start": 0.8,
                    "end": 0.05
                },
                "color": {
                    start: "#dcff09",
                    end: "#9f1f1f"
                    },
                "scale": {
                    "start": 0.1,
                    "end": 0.4,
                    "minimumScaleMultiplier": 1
                },
                "speed": {
                    "start": 40,
                    "end": 5,
                    "minimumSpeedMultiplier": 1
                },
                "acceleration": new PIXI.Point(),
                "startRotation": {
                    "min": -25,
                    "max": 25
                },
                "rotationSpeed": {
                    "min": 5,
                    "max":20
                },
                "lifetime": {
                    "min": 0.5,
                    "max": 1.0
                },
                "blendMode": "add",
                "frequency": 0.01,
                "emitterLifetime": -1,
                "maxParticles": 500,
                "pos": new PIXI.Point(0,-24),
                "addAtBack": false,
                "spawnType": "circle",
                "spawnCircle": {
                    "x": 0,
                    "y": 0,
                    "r": 10
                }
            }
        );
        return emitter;
    }

    /**
     * Checks if the player jumped on something with a higher velocity and adds some smoke.
     * @param event
     */
    private onPlayerContact(event: any): void {
        if (Math.abs(event.velocity[1]) > 425) {
            var smoke = new AnimatedSprite();
            smoke.addAnimations(new AnimationSequence("smoke", "assets/images/effects/jump_smoke.png", [0,1,2,3,4,5], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
            smoke.Anchor = new PIXI.Point(0.5, 0.5);
            smoke.x = this.heroPosition.x;
            smoke.y = this.heroPosition.y - this.HERO_FRAME_SIZE/2;
            smoke.Loop = false;
            smoke.OnComplete = () => this.worldContainer.removeChild(smoke);
            smoke.alpha = 0.7;
            smoke.rotation = Math.random() * Math.PI;
            this.worldContainer.addChild(smoke);
            smoke.PlayAnimation("smoke", 5);
        }
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

        this.entities.forEach((body: p2.Body) => {
            var displayObject: PIXI.DisplayObject = (body as any).DisplayObject as PIXI.DisplayObject;
            var entity: IMapEntity = {
                template: (displayObject as any).templateName,
                xy: [displayObject.x, displayObject.y],
                rotation: displayObject.rotation,
                scale: [displayObject.scale.x, displayObject.scale.y],
                collectibleType: displayObject.collectibleType
            };            
            map.entities.push(entity);
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
        var pnl = new PIXI.Sprite(PIXI.loader.resources["assets/images/Gui/TestHUD.png"].texture);
        pnl.position.set(5, 5);
        this.addChild(pnl);

        this.txtLevel = new PIXI.Text("1", Global.TXT_STYLE);
        this.txtLevel.resolution = window.devicePixelRatio;
        this.txtLevel.position.set(70, 20);
        pnl.addChild(this.txtLevel);

        this.txtPosition = new PIXI.Text("", Global.TXT_STYLE);
        this.txtPosition.resolution = window.devicePixelRatio;
        this.txtPosition.position.set(15, 215);
        pnl.addChild(this.txtPosition);

        this.txtCoins = new PIXI.Text("0", Global.TXT_STYLE);
        this.txtCoins.resolution = window.devicePixelRatio;
        this.txtCoins.position.set(70, 125);
        pnl.addChild(this.txtCoins);
    }

    public onUpdate(dt: number): void {
        this.txtLevel.text = this.heroLevel.toString();//`Level:  ${this.heroLevel}`;
        this.txtCoins.text = this.coins.toString();//`Coins:  ${this.coins}`;
        this.txtPosition.text = `${this.heroPosition.x.toFixed(0)}, ${this.heroPosition.y.toFixed(0)}`;
    }
}