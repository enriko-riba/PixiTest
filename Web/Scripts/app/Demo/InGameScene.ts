import * as Global from "./Global";
import * as TWEEN from "tween";
import * as ko from "knockout";

import { Scene } from "app/_engine/Scene";
import { Parallax } from "app/_engine/Parallax";
import { WorldP2 } from "./WorldP2";
import { Hud } from "./Hud";
import { LevelLoader, ILevelMap, IMapEntity } from "./LevelLoader";
import { DPS_TOPIC, IDpsChangeEvent, IStatChangeEvent, Stats, StatType } from "./Stats";
import { HeroCharacter } from "./HeroCharacter";

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

    private worldContainer: PIXI.Container;
    private parallaxBackgrounds: Array<Parallax> = [];
    private hud = new Hud();
    private wp2: WorldP2;
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
     * Updates physics and handles player collisions.
     * @param dt elapsed time in milliseconds
     */
    public onUpdate = (dt: number) => {
        this.wp2.update(dt);
        this.hero.update(dt);

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
        var bodies = this.wp2.bodies;
        for (var i = 0, len = bodies.length; i < len; i++) {
            let body = bodies[i];
            let displayObject: PIXI.DisplayObject = (body as any).DisplayObject as PIXI.DisplayObject;
            if (displayObject) {
                displayObject.position.set(body.interpolatedPosition[0], body.interpolatedPosition[1]);
                displayObject.rotation = body.interpolatedAngle;
            }
        }

        //-------------------------------------------
        //  collisions with collectible items
        //-------------------------------------------
        for (var i = 0, len = this.wp2.playerContacts.length; i < len; i++) {
            let body: any = this.wp2.playerContacts[i];
            if (body.DisplayObject && body.DisplayObject.interactionType) {
                this.handleInteractiveCollision(body);
            }
        }

        //-------------------------------------------
        //  invoke update on each updateable
        //-------------------------------------------
        for (var i = 0, len = this.worldContainer.children.length; i < len; i++) {
            let child: any = this.worldContainer.children[i];           
            if (child && child.onUpdate) {
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
     * Handles player collision with interactive objects.
     * @param body
     */
    private handleInteractiveCollision(body: any): void {
        var playerStats = this.hero.PlayerStats;
        var dispObj: PIXI.DisplayObject = body.DisplayObject as PIXI.DisplayObject;
        
        switch (dispObj.interactionType) {
            case 1: //  small coin
                playerStats.increaseStat(StatType.Coins, 1);
                this.addCollectibleTween(dispObj);
                this.addInfoMessage(dispObj.position, "+1 coin");
                this.removeEntity(body);
                break;
            case 2: //  coin
                playerStats.increaseStat(StatType.Coins, 10);
                this.addCollectibleTween(dispObj);
                this.addInfoMessage(dispObj.position, "+10 coins");
                this.removeEntity(body);
                break;
            case 3: //  blue gem
                playerStats.increaseStat(StatType.Coins, 100);
                this.addCollectibleTween(dispObj);
                this.addInfoMessage(dispObj.position, "+100 coins");
                this.removeEntity(body);
                break;

            case 1000:  //   border lava                
                playerStats.Buffs[1000] = this.secondsFromNow(1);
                break;

            case 1001:  //  lava
                playerStats.Buffs[1001] = this.secondsFromNow(3);
                break;
        }
    }

    /**
     * Removes an entity from the stage.
     * @param body
     */
    private removeEntity(body: any): void {
        this.wp2.removeBody(body);
        body.DisplayObject = null;
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
     * @param position the start position of the message
     * @param message the message to be added
     * @param style optional PIXI.ITextStyle
     */
    private addInfoMessage(position: PIXI.Point, message: string, style?: PIXI.ITextStyleStyle): void {
        var stl = style || Global.TXT_STYLE;
        var txtInfo = new PIXI.Text(message, stl);
        txtInfo.position.set(position.x, position.y);
        txtInfo.scale.set(1, -1);   //  scale invert since everything is upside down due to coordinate system

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
     * Decreases the HP for the given amount and displays a message with the total integer amount.
     * @param amount the positive amount to decrease the HP
     */
    private decreaseHP(amount: number) {
        var playerStats = this.hero.PlayerStats;
        var oldHP = Math.round(playerStats.getStat(StatType.HP));
        playerStats.increaseStat(StatType.HP, -amount);
        var newHP = Math.round(playerStats.getStat(StatType.HP));
        if (newHP < oldHP) {
            this.addInfoMessage(this.hero.position, `-${oldHP-newHP} HP`);
        }
    }

    /**
     * Sets up the scene.
     */
    private setup(): void {
        this.BackGroundColor = 0x1099bb;
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

        //--------------------------------------
        //  setup physics subsystem
        //--------------------------------------
        var startPosition = new PIXI.Point(-350, 36);
        this.wp2 = new WorldP2(startPosition);
        

        //-----------------------------
        //  setup hero
        //-----------------------------        
        this.hero = new HeroCharacter(this.wp2, this.worldContainer);
        this.hero.position = startPosition;
        this.worldContainer.addChild(this.hero);        
        
        //--------------------------------------
        //  load level from json (under construction)
        //--------------------------------------
        var levelLoader = new LevelLoader("assets/levels/levels.json");
        var lvl = levelLoader.BuildLevel("Intro");

        //  add all object pairs to renderer and physics world
        lvl.entities.forEach((body:any) => {
            this.worldContainer.addChild(body.DisplayObject);
            this.wp2.addBody(body);
        });

        //  add parallax backgrounds
        this.parallaxBackgrounds = lvl.parallax;
        lvl.parallax.forEach((plx: Parallax, idx:number) => {
            this.worldContainer.addChildAt(plx, idx);
            //  TODO: there is a bug not initially calculating all viewport  
            //        visible parallax textures. So just move it in both 
            //        directions to trigger textures recalculation
            plx.SetViewPortX(0);
            plx.SetViewPortX(this.hero.position.x + 1);
        });

        //  TODO: load initial settings
        var playerStats = this.hero.PlayerStats;
        playerStats.setStat(StatType.Coins, 0);
        playerStats.setStat(StatType.MaxHP, 100);
        playerStats.setStat(StatType.HP, 80);
        playerStats.setStat(StatType.MaxDust, 1000);
        playerStats.setStat(StatType.Dust, 100);

        ko.postbox.subscribe<IDpsChangeEvent>(DPS_TOPIC, this.handleDpsChange);
    }

    private handleDpsChange = (event: IDpsChangeEvent) => {
        this.addInfoMessage(this.hero.position, `${event.Amount} HP`);
    }

    /**
     * Returns a date instance with added seconds from now.
     * @param seconds
     */
    private secondsFromNow(seconds: number): number {
        var now = Date.now() / 1000;
        console.log("secondsFromNow()  start:", now);
        now += seconds;
        console.log("secondsFromNow() result:", now);
        return now;
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

        this.wp2.bodies.forEach((body: any) => {
            var displayObject: PIXI.DisplayObject = body.DisplayObject as PIXI.DisplayObject;
            var entity: IMapEntity = {
                template: (displayObject as any).templateName,
                xy: [displayObject.x, displayObject.y],
                rotation: displayObject.rotation,
                scale: [displayObject.scale.x, displayObject.scale.y],
                interactionType: displayObject.interactionType
            };
            map.entities.push(entity);
        });
        console.log(JSON.stringify(map.entities));
    }
}