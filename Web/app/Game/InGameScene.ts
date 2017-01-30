import * as Global from "./Global";
import * as TWEEN from "tween";
import * as ko from "knockout";

import { Scene } from "app/_engine/Scene";
import { Parallax } from "app/_engine/Parallax";
import { WorldP2 } from "./WorldP2";
import { Hud } from "./Hud";
import { LevelLoader, ILevel, ILevelMap, IMapEntity } from "./LevelLoader";
import { DPS_TOPIC, IDpsChangeEvent, StatType, PlayerStats } from "./PlayerStats";
import { HeroCharacter, BURN_TOPIC, IBurnEvent } from "./HeroCharacter";
import { QuestManager, QuestState } from "./QuestManager";
import { MovementState } from "./MovementState";
import { MOVE_TOPIC, IMoveEvent } from "./MovementController";
import { SoundMan } from "./SoundMan";
import { CutScene } from "./CutScene";


import "../../Scripts/pixi-particles";

export function createParticleEmitter(container: PIXI.Container, textures: PIXI.Texture[], config?: PIXI.particles.EmitterConfig): PIXI.particles.Emitter {
    "use strict";
    var cfg: PIXI.particles.EmitterConfig = {
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
        };
    if (config) {
        cfg = $.extend(cfg, config);
    }

    var emitter = new PIXI.particles.Emitter(
        // the PIXI.Container to put the emitter in
        // if using blend modes, it's important to put this
        // on top of a bitmap, and not use the root stage Container
        container,
        textures,
        cfg
    );
    return emitter;
}

/**
 *   Load in game scene.
 */
export class InGameScene extends Scene {

    private readonly HERO_FRAME_SIZE: number = 64;
    private readonly SCENE_HALF_WIDTH: number = Global.SCENE_WIDTH / 2;

    public worldContainer: PIXI.Container;
    public hud = new Hud();
    public snd = new SoundMan();

    private parallaxBackgrounds: Array<Parallax> = [];
    private wp2: WorldP2;
    private hero: HeroCharacter;

    private levelLoader = new LevelLoader();
    private currentLevel: ILevel;
    private questMngr: QuestManager;

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
        this.hud.position.set(5, 25);
        this.setup();
    }

    public onActivate = () => {
        this.hud.visible = true;
    };

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
            let body = bodies[i] as any;
            let displayObject: PIXI.DisplayObject = (body as any).DisplayObject as PIXI.DisplayObject;
            if (displayObject && body.type !== p2.Body.STATIC) {
                displayObject.position.set(Math.floor(body.interpolatedPosition[0]), Math.floor(body.interpolatedPosition[1]));
                displayObject.rotation = body.interpolatedAngle;
            }

            this.questMngr.checkTriggerCondition(body);
        }

        //-------------------------------------------
        //  collisions with collectible items
        //-------------------------------------------
        for (var i = 0, len = this.wp2.playerContacts.length; i < len; i++) {
            let body: any = this.wp2.playerContacts[i];
            if (body.DisplayObject && body.DisplayObject.interactionType) {
                this.handleInteractiveCollision(body);
            }

            if (body.Trigger && body.Trigger.type === "collision") {
                this.questMngr.handleTriggerEvent(body);
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

    public get PlayerStats(): PlayerStats {
        return this.hero.PlayerStats;
    }

    public set IsHeroInteractive(value: boolean) {
        if (this.hero.IsInteractive !== value) {
            this.hero.IsInteractive = value;
            if (!this.hero.IsInteractive) {
                this.hero.PlayAnimation("idle");
                this.snd.idle();
            }
        }
    }

    /**
     * Handles player collision with interactive objects.
     * @param body
     */
    private handleInteractiveCollision(body: any): void {
        var playerStats = this.hero.PlayerStats;
        var dispObj: PIXI.DisplayObject = body.DisplayObject as PIXI.DisplayObject;
        let now = Date.now() / 1000;

        switch (dispObj.interactionType) {
            case 1: //  small coin
                playerStats.increaseStat(StatType.Coins, 1);
                this.addCollectibleTween(dispObj);
                this.addInfoMessage(dispObj.position, "+1 coin");
                this.removeEntity(body);
                this.snd.coin();
                break;

            case 2: //  coin
                playerStats.increaseStat(StatType.Coins, 10);
                this.addCollectibleTween(dispObj);
                this.addInfoMessage(dispObj.position, "+10 coins");
                this.removeEntity(body);
                this.snd.coin();
                break;

            case 3: //  blue gem
                playerStats.increaseStat(StatType.Coins, 100);
                this.addCollectibleTween(dispObj);
                this.addInfoMessage(dispObj.position, "+100 coins");
                this.removeEntity(body);
                this.snd.gem();
                break;

            case 1000:  //  border lava   
                if (!playerStats.buffs[1000] || playerStats.buffs[1000] < now) {
                    this.addInfoMessage(dispObj.position, "Burn", Global.WARN_STYLE);
                }
                playerStats.buffs[1000] = this.secondsFromNow(1);
                break;

            case 1001:  //  lava
                if (!playerStats.buffs[1001] || playerStats.buffs[1001] < now) {
                    this.addInfoMessage(dispObj.position, "Burn", Global.WARN_STYLE);
                }
                playerStats.buffs[1001] = this.secondsFromNow(3);
                break;

            case 201:  //  kendo knowledge
                this.addInfoMessage(dispObj.position, "Kendo knowledge acquired!");
                this.addCollectibleTween(dispObj);
                this.removeEntity(body);
                this.snd.questItem();
                this.questMngr.setQuestState(201, QuestState.Completed);
                break;
        }
    }

    /**
     * Removes an entity from the stage.
     * @param body
     */
    public removeEntity(body: any): void {
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

        var upY = position.y + 250;
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
     * Adds a balloon call-out message.
     * @param position the start position of the message
     * @param message the message to be added
     * @param style PIXI.ITextStyle
     * @param fadeSeconds optional number of milliseconds the message should linger
     */
    public addTriggerMessage(position: PIXI.Point, message: string, style: PIXI.ITextStyleStyle, fadeSeconds: number = 8000): PIXI.Sprite {
        var container = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/callout.png"].texture);
        container.position.set(position.x, position.y);
        container.scale.set(1, -1);   //  scale invert since everything is upside down due to coordinate system
        this.worldContainer.addChild(container);

        var txtInfo = new PIXI.Text(message, style);
        txtInfo.position.set(50, 80);
        container.addChild(txtInfo);

        if (fadeSeconds > 0 ) {
            var fade = new TWEEN.Tween(container)
                .to({ alpha: 0 }, fadeSeconds)
                .onComplete(() => {
                    this.worldContainer.removeChild(container);
                });
            fade.start();
        }
        container.name = "TriggerMessage";
        return container;
    }

    /**
     * Sets up the scene.
     */
    private setup(): void {

        this.BackGroundColor = 0x684123;
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

        //-----------------------------
        //  setup hero
        //-----------------------------      
        this.hero = new HeroCharacter(this.worldContainer);
        this.hero.name = "hero";
        var playerStats = this.hero.PlayerStats;
        playerStats.setStat(StatType.Coins, Global.UserInfo.gold);
        playerStats.setStat(StatType.Dust, Global.UserInfo.dust);
        playerStats.setStat(StatType.MaxHP, 150);
        playerStats.setStat(StatType.HP, 120);
        playerStats.setStat(StatType.MaxDust, 1000);

        ko.postbox.subscribe<IDpsChangeEvent>(DPS_TOPIC, this.handleDpsChange);
        ko.postbox.subscribe<IMoveEvent>(MOVE_TOPIC, this.handleMoveChange);
        ko.postbox.subscribe<IBurnEvent>(BURN_TOPIC, this.handleBurnChange);

        var cutScene = new CutScene();
        Global.sceneMngr.AddScene(cutScene);        

        //--------------------------------------
        //  setup physics subsystem
        //--------------------------------------
        this.wp2 = new WorldP2(new PIXI.Point(0, 0));
        this.hero.SetWorldP2(this.wp2);
        this.worldContainer.addChild(this.hero);
        this.questMngr = new QuestManager(this, this.wp2, this.hero);
    };

    private handleDpsChange = (event: IDpsChangeEvent) => {
        this.addInfoMessage(this.hero.position, `${event.Amount} HP`);
    };

    private handleMoveChange = (event: IMoveEvent) => {
        const ANIMATION_FPS = 10;

        //  adjust animation FPS based on jump/idle/isrunning flags
        var animationFPS: number = (event.newState === MovementState.Idle || event.isJumping) ? ANIMATION_FPS / 3 : (event.isRunning ? 2 : 1) * ANIMATION_FPS;
        this.hero.Fps = animationFPS;

        switch (event.newState) {
            case MovementState.Idle:
                this.hero.PlayAnimation("idle");
                this.snd.idle();
                break;

            case MovementState.Left:
                this.hero.PlayAnimation("left");
                if (!this.hero.isJumping) {
                    this.snd.walk(event.isRunning);
                }
                break;

            case MovementState.Right:
                this.hero.PlayAnimation("right");
                if (!this.hero.isJumping) {
                    this.snd.walk(event.isRunning);
                }
                break;

            case MovementState.JumpLeft:
                this.hero.PlayAnimation("jumpleft");
                this.snd.jump();
                break;

            case MovementState.JumpRight:
                this.hero.PlayAnimation("jumpright");
                this.snd.jump();
                break;

            case MovementState.JumpUp:
                this.hero.PlayAnimation("jumpup");
                this.snd.jump();
                break;
        }

    };

    private handleBurnChange = (event: IBurnEvent) => {
        if (event.isBurning) {
            this.snd.burn();
        } else {
            this.snd.burnStop();
        }
    };

    /**
     * Helper that returns time tick value with the given seconds added.
     * @param seconds
     */
    private secondsFromNow(seconds: number): number {
        var now = Date.now() / 1000;
        now += seconds;
        return now;
    };

    /**
     *  Invokes the level loading.
     */
    public StartLevel(levelId: number) {
        console.log("loading level " + levelId);
        var lvl = this.levelLoader.BuildLevel(levelId);

        if (!lvl) {
            console.log("No more levels!!!");
            return;
        } else {
            this.snd.playTrack(lvl.audioTrack||0);
            this.LoadLevel(lvl);
            this.currentLevel = lvl;
        }
    };

    /**
     * Loads the level and adds all objects to the scene.
     * @param id
     */
    public LoadLevel(lvl: ILevel) {

        //--------------------------------------
        //  remove all entities except hero
        //--------------------------------------
        if (this.currentLevel) {
            this.currentLevel.parallax.forEach((plx: Parallax, idx: number) => {
                this.worldContainer.removeChild(plx);
            });
            this.currentLevel.entities.forEach((body: any) => {
                if (body !== this.wp2.playerBody) {
                    this.worldContainer.removeChild(body.DisplayObject);
                    this.wp2.removeBody(body);
                    body.DisplayObject = null;
                }
            });

            //  now remove display objects without bodies
            var all = this.worldContainer.children.filter((c: PIXI.DisplayObject) => c.name !== "hero");
            all.forEach((child: PIXI.DisplayObject) => {
                this.worldContainer.removeChild(child);
            });
        }

        //--------------------------------------
        //  add all objects from level to scene
        //--------------------------------------
        lvl.entities.forEach((body: any) => {
            this.worldContainer.addChild(body.DisplayObject);
            this.wp2.addBody(body);
        });

        //  add parallax backgrounds
        this.parallaxBackgrounds = lvl.parallax;
        lvl.parallax.forEach((plx: Parallax, idx: number) => {
            this.worldContainer.addChildAt(plx, idx);
            //  TODO: there is a bug not initially calculating all viewport  
            //        visible parallax textures. So just move it in both 
            //        directions to trigger textures recalculation
            plx.SetViewPortX(lvl.start[0]-10);
            plx.SetViewPortX(lvl.start[0] + 10);
            plx.SetViewPortX(lvl.start[0]);
        });

        //  set start for player
        this.wp2.playerBody.position = lvl.start;
    }

    /**
     * Saves the current level and dumps to console.
     */
    public saveLevel(): void {
        var map: ILevelMap = {
            start:[],
            templates:[],
            entities: [],
            NPC:[]
        };

        this.wp2.bodies.forEach((body: any) => {
            var displayObject: PIXI.DisplayObject = body.DisplayObject as PIXI.DisplayObject;
            if (displayObject) {
                var entity: IMapEntity = {
                    template: (displayObject as any).templateName,
                    xy: [displayObject.x, displayObject.y],
                    rotation: displayObject.rotation,
                    scale: [displayObject.scale.x, displayObject.scale.y],
                    interactionType: displayObject.interactionType
                };
                map.entities.push(entity);
            }
        });
        console.log(JSON.stringify(map.entities));
    }
}