import { Scene } from "app/_engine/Scene";
import { Parallax } from "app/_engine/Parallax";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";

import * as Global from "./Global";
import { WorldP2 } from "./WorldP2";
import { LevelLoader, ILevelMap, IMapEntity } from "./LevelLoader";

import { Hud } from "./Hud";
import { Stats, StatType } from "./Stats";
import { HeroCharacter } from "./HeroCharacter";

import * as TWEEN from "tween";
import "pixi-particles";

export function createParticleEmitter(container: PIXI.Container): PIXI.particles.Emitter {
    "use strict";
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
                "end": 0.03
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
                "end": 3,
                "minimumSpeedMultiplier": 1
            },
            "acceleration": new PIXI.Point(),
            "startRotation": {
                "min": 0,
                "max": 360
            },
            "rotationSpeed": {
                "min": 5,
                "max": 20
            },
            "lifetime": {
                "min": 0.4,
                "max": 1.0
            },
            "blendMode": "add",
            "frequency": 0.01,
            "emitterLifetime": -1,
            "maxParticles": 200,
            "pos": new PIXI.Point(0, -24),
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
 *   Load in game scene.
 */
export class InGameScene extends Scene {

    private readonly HERO_FRAME_SIZE: number = 64;
    private readonly SCENE_HALF_WIDTH: number = Global.SCENE_WIDTH / 2;

    private readonly playerStats = new Stats();

    private worldContainer: PIXI.Container;
    private parallaxBackgrounds: Array<Parallax> = [];

    private hud = new Hud();

    private wp2: WorldP2;
    private entities = [];
    private hero: HeroCharacter;

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
        this.wp2.update(dt);
        this.hero.onUpdate(dt);
        this.playerStats.onUpdate(dt);

        //-------------------------------------------
        //  update world container position
        //-------------------------------------------        
        this.worldContainer.x = -this.hero.x + this.SCENE_HALF_WIDTH;
        this.worldContainer.y = Global.SCENE_HEIGHT - 70;

        //-------------------------------------------
        //  update parallax
        //-------------------------------------------
        for (var i = 0; i < this.parallaxBackgrounds.length; i++) {
            this.parallaxBackgrounds[i].SetViewPortX(this.hero.x);
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
            let child: any = this.worldContainer.children[i];
           
            if (child &&child.onUpdate) {
                child.onUpdate(dt);
            }
        };

        //-------------------------------------------
        //  finally update the hud
        //-------------------------------------------
        this.hud.heroPosition = this.hero.position;
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
                this.playerStats.increaseStat(StatType.Coins, 1);
                this.addCollectibleTween(dispObj);
                this.addCollectibleInfo(dispObj.position, "+1 coin");
                break;
            case 2:
                this.playerStats.increaseStat(StatType.Coins, 10);
                this.addCollectibleTween(dispObj);
                this.addCollectibleInfo(dispObj.position, "+10 coins");
                break;
            case 3:
                this.playerStats.increaseStat(StatType.Coins, 100);
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

        //--------------------------------------
        //  setup physics subsystem
        //--------------------------------------
        var startPosition = new PIXI.Point(-350, 36);
        this.wp2 = new WorldP2(startPosition);
        this.wp2.on("playerContact", this.onPlayerContact, this);

        //-----------------------------
        //  setup hero
        //-----------------------------        
        this.hero = new HeroCharacter(this.wp2, this.worldContainer);
        this.hero.position = startPosition;
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
            plx.SetViewPortX(this.hero.position.x + 1);
        });

        //  TODO: load initial settings
        this.playerStats.setStat(StatType.Coins, 0);
        this.playerStats.setStat(StatType.MaxHP, 100);
        this.playerStats.setStat(StatType.HP, 80);
        this.playerStats.setStat(StatType.MaxDust, 1000);
        this.playerStats.setStat(StatType.Dust, 100);
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
            smoke.x = this.hero.x;
            smoke.y = this.hero.y - this.HERO_FRAME_SIZE/2;
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