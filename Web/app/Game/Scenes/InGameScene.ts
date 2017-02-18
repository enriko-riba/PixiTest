﻿import * as Global from "../Global";
import * as TWEEN from "tween";
import * as ko from "knockout";

import { Scene } from "app/_engine/Scene";
import { Parallax } from "app/_engine/Parallax";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import { Mob, AtrType } from "../Mobs/Mob";
import { Hud } from "../Hud";
import { SoundMan } from "../SoundMan";
import { LevelLoader, ILevel, ILevelMap, IMapEntity } from "../LevelLoader";
import { QuestManager } from "../QuestSystem/QuestManager";
import { QuestState } from "../QuestSystem/QuestState";
import { WorldP2 } from "../Objects/WorldP2";
import { Bullet } from "../Objects/Bullet";
import { OptionsScene } from "./OptionsScene";
import { DPS_TOPIC, IDpsChangeEvent, StatType, PlayerStats } from "../Player/PlayerStats";
import { HeroCharacter, BURN_TOPIC, IBurnEvent } from "../Player/HeroCharacter";
import { MovementState } from "../Player/MovementState";
import { MOVE_TOPIC, IMoveEvent } from "../Player/MovementController";
import { CutScene } from "./CutScene";

import "../../../Scripts/pixi-particles";

let ANIMATION_FPS_NORMAL = 9;
let ANIMATION_FPS_SLOW = 4;

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
    public wp2: WorldP2;
    public hero: HeroCharacter;

    private parallaxBackgrounds: Array<Parallax> = [];

    private levelLoader = new LevelLoader();
    private currentLevel: ILevel;
    private questMngr: QuestManager;

    /**
     *   Creates a new scene instance.
     */
    constructor() {
        super("InGame");

        this.BackGroundColor = Global.BACK_COLOR;

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

    public onActivate = () => {
        this.hud.visible = true;

        //  special setup logic for tutorial
        if (Global.UserInfo.gamelevel === 1) {
            var balloon = this.worldContainer.getChildByName("balloon") as any;
            balloon.setFollowTarget(this.hero);
        }
    };

    /**
     * Updates physics and handles player collisions.
     * @param dt elapsed time in milliseconds
     */
    public onUpdate(dt: number) {
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
            if (displayObject && displayObject.visible && body.type !== p2.Body.STATIC) {
                displayObject.position.set(Math.floor(body.interpolatedPosition[0]), Math.floor(body.interpolatedPosition[1]));
                displayObject.rotation = body.interpolatedAngle;
            }

            if (body.Trigger && body.Trigger.type === "distance") {
                if (this.questMngr.canActivateTrigger(body.Trigger)) {
                    let x = this.hero.position.x - body.position[0];
                    let y = this.hero.position.y - body.position[1];
                    let distance = Math.sqrt(x * x + y * y);
                    if (body.Trigger.distance >= distance) {
                        this.questMngr.handleTriggerEvent(body);
                    }
                }
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
        //  Spawn points
        //-------------------------------------------
        for (var i = 0, len = this.currentLevel.spawnPoints.length; i < len; i++) {
            this.currentLevel.spawnPoints[i].onUpdate(dt);
        }


        //-------------------------------------------
        //  finally update the hud
        //-------------------------------------------
        this.hud.heroPosition = this.hero.position;
        this.hud.onUpdate(dt);

        //-------------------------------------------
        //  check if player is dead
        //-------------------------------------------
        if (this.hero.PlayerStats.getStat(StatType.HP) <= 0) {
            this.IsHeroInteractive = false;
            this.hero.visible = false;

            var cutScene = Global.sceneMngr.GetScene("CutScene") as CutScene;
            var backGroundTexture = Global.sceneMngr.CaptureScene();
            cutScene.SetBackGround(backGroundTexture, this.scale);
            cutScene.DeathScene = true;
            Global.sceneMngr.ActivateScene(cutScene);
        }
    };

    public set IsHeroInteractive(value: boolean) {
        if (this.hero.IsInteractive !== value) {
            this.hero.IsInteractive = value;
            if (!this.hero.IsInteractive) {
                this.hero.PlayAnimation("idle", ANIMATION_FPS_SLOW);
                Global.snd.idle();
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


        switch (dispObj.interactionType) {
            case 1: //  small coin
                playerStats.increaseStat(StatType.Coins, 1);
                this.addCollectibleTween(dispObj);
                this.addInfoMessage(dispObj.position, "+1 coin");
                this.removeEntity(body);
                Global.snd.coin();
                break;

            case 2: //  coin
                playerStats.increaseStat(StatType.Coins, 10);
                this.addCollectibleTween(dispObj);
                this.addInfoMessage(dispObj.position, "+10 coins");
                this.removeEntity(body);
                Global.snd.coin();
                break;

            case 3: //  blue gem
                playerStats.increaseStat(StatType.Coins, 100);
                this.addCollectibleTween(dispObj);
                this.addInfoMessage(dispObj.position, "+100 coins");
                this.removeEntity(body);
                Global.snd.gem();
                break;

            //------------------------------------
            //  QUEST ITEMS 200-999
            //------------------------------------

            case 201:  //  kendo knowledge
                this.addInfoMessage(dispObj.position, "Kendo knowledge acquired!");
                this.addCollectibleTween(dispObj);
                this.removeEntity(body);
                Global.snd.questItem();
                this.questMngr.acquireItem(201);
                break;

            case 202:  //  KI
                this.addInfoMessage(dispObj.position, "1 Ki acquired!");
                this.addCollectibleTween(dispObj);
                this.removeEntity(body);
                Global.snd.questItem();
                this.questMngr.acquireItem(202);
                //  TODO: quest manager
                break;

            //------------------------------------
            //  OBJECTS DOING DAMAGE 1000-1999
            //------------------------------------

            case 1000:  //  border lava   
                {
                    let now = performance.now() / 1000;
                    if (!playerStats.buffs[1000] || playerStats.buffs[1000] < now) {
                        this.addInfoMessage(dispObj.position, "Burn", Global.WARN_STYLE);
                    }
                    playerStats.buffs[1000] = this.secondsFromNow(1);
                }
                break;

            case 1001:  //  lava
                {
                    let now = performance.now() / 1000;
                    if (!playerStats.buffs[1001] || playerStats.buffs[1001] < now) {
                        this.addInfoMessage(dispObj.position, "Burn", Global.WARN_STYLE);
                    }
                    playerStats.buffs[1001] = this.secondsFromNow(3);
                }
                break;


            default:
            //----------------------------------------------------------
            //  MOBS 2000 - 2999
            //  Note: mobs don't interact on collision because only 
            //  some contacts are important (jump etc). Therefore
            //  handleInteractiveCollision() is called manually and
            //  the callee must set the mob.ShouldInteract to exclude
            //  standard collision logic.
            //----------------------------------------------------------
            //if (dispObj.interactionType >= 2000 && dispObj.interactionType < 3000) {
            //    var mob: Mob = body.DisplayObject as Mob;
            //    if (mob.ShouldInteract) {
            //        this.handleMobInteraction(mob, dispObj.interactionType, body);
            //    }                    
            //}
        }
    }

    /**
     * Handles interaction with mobs (mob kill).
     * @param mob
     * @param body
     */
    private handleMobInteraction(mob: Mob, body: p2.Body) {
        let dispObj = (body as any).DisplayObject as PIXI.DisplayObject;

        //  generate drop
        if (dispObj.drop) {
            let isDropping = Math.random() <= dispObj.drop.chance;
            if (isDropping) {
                var dropItemBody = LevelLoader.createEntity(this.currentLevel.templates, dispObj.drop.entity);
                this.addDropItem(mob, dropItemBody);
            }
        }

        this.removeEntity(body);
        mob.Squish(() => this.worldContainer.removeChild(dispObj));
        Global.snd.mobSquish();

        //  add exp
        var playerStats = this.hero.PlayerStats;
        var exp = mob.Attributes[AtrType.HP] / 2;
        playerStats.increaseStat(StatType.Exp, exp);
        this.addInfoMessage(mob.position, `+${exp} exp`, Global.INFO2_STYLE);
    }

    /**
     * Removes an entity from the p2 world and sets its DisplayObject to null.
     * If the removeDisplayObject is true the display object will be also removed from the worldContainer
     *
     * @param body
     * @param removeDisplayObject
     */
    public removeEntity(body: p2.Body, removeDisplayObject: boolean = false): void {
        this.wp2.removeBody(body);
        if (removeDisplayObject) {
            this.worldContainer.removeChild((body as any).DisplayObject);
        }
        (body as any).DisplayObject = null;
    }


    private bullets: Bullet[] = [];
    public emitBullet = (textureName: string, position: PIXI.Point, damage: number): Bullet => {
        let bullet = this.findDeadBullet();
        if (!bullet) {

            //  create new bullet
            bullet = new Bullet(PIXI.loader.resources[textureName].texture, 200, 5, damage);
            bullet.anchor.set(0.5);
            bullet.scale.set(0.5);
            this.bullets.push(bullet);
            this.worldContainer.addChild(bullet);

            //-----------------------------
            //  create body (sensor shape)
            //-----------------------------
            let shape = new p2.Circle({ radius: bullet.width / 2 });
            shape.collisionGroup = WorldP2.COL_GRP_BULLET;
            shape.collisionMask = WorldP2.COL_GRP_PLAYER | WorldP2.COL_GRP_SCENE | WorldP2.COL_GRP_GROUND;
            shape.sensor = true;
            var options: p2.BodyOptions = {
                mass: 0,
                position: [position.x, position.y],
                angle: 0,
                fixedRotation: false,
                angularDamping: 0,
                damping: 0
            };
            let body = new p2.Body(options);
            body.addShape(shape);
            body.setDensity(0.0);
            body.gravityScale = 0;
            body.angularVelocity = 2;
            body.collisionResponse = false;
            body.type = p2.Body.DYNAMIC;
            (body as any).DisplayObject = bullet;
            bullet.body = body;
            this.wp2.addBody(body);
            // console.log("creating new bullet, body.id: " + body.id);
        } else {
            // console.log("recycling bullet, body.id: " + bullet.body.id);
        }

        bullet.position = position;
        bullet.Direction = new PIXI.Point(Global.UserInfo.position.x - position.x, Global.UserInfo.position.y - position.y);
        bullet.damage = damage;
        bullet.IsDead = false;
        bullet.body.velocity[0] = bullet.Direction.x * bullet.velocity;
        bullet.body.velocity[1] = bullet.Direction.y * bullet.velocity;

        return bullet;
    };

    private findDeadBullet = (): Bullet => {
        for (var i = 0, len = this.bullets.length; i < len; i++) {
            let blt = this.bullets[i];
            if (blt.IsDead) {
                return blt;
            }
        }
        return null;
    }


    /**
     * Adds an drop item to the scene with a tween animation.
     * @param dispObj
     */
    private addDropItem(mob: Mob, itemBody: p2.Body): void {
        let dispObj = (itemBody as any).DisplayObject as PIXI.DisplayObject;
        dispObj.x = mob.x;
        dispObj.y = mob.y + 40;        
        this.worldContainer.addChild(dispObj);

        //  tween from mob position to random position near hero
        var upX = dispObj.position.x + 75;
        var upY = dispObj.position.y + 200;

        

        var moveUp = new TWEEN.Tween(dispObj.position)
            .to({ x: upX, y: upY }, 400)
            .onComplete(() => {
                itemBody.position = [dispObj.position.x, dispObj.position.y];
                this.wp2.addBody(itemBody)
            });


        var orgScaleX = dispObj.scale.x;
        var orgScaleY = dispObj.scale.y;
        var scale = new TWEEN.Tween(dispObj.scale)
            .to({ x: orgScaleX + 0.3, y: orgScaleX + 0.3 }, 350)
            .easing(TWEEN.Easing.Linear.None);

        var endX = this.hero.x;
        var endY = this.hero.y + 10;
        var moveAway = new TWEEN.Tween(dispObj.position)
            .to({ x: endX, y: endY }, 350)
            .easing(TWEEN.Easing.Back.In)
            .onUpdate((pos: PIXI.Point) => {
                itemBody.position = [dispObj.position.x, dispObj.position.y];
            })
            .onComplete(() => dispObj.scale.set(orgScaleX, orgScaleY));

        moveUp.chain(scale, moveAway).start();
    }

    /**
     * Starts an animation tween and removes the display object from scene.
     * @param dispObj
     */
    private addCollectibleTween(dispObj: PIXI.DisplayObject): void {
        var orgScaleX = dispObj.scale.x;
        var orgScaleY = dispObj.scale.y;
        var upX = dispObj.position.x + 45;
        var upY = dispObj.position.y + 160;

        var endX = dispObj.position.x - Global.SCENE_WIDTH / 2;
        var endY = Global.SCENE_HEIGHT;

        var moveUp = new TWEEN.Tween(dispObj.position)
            .to({ x: upX, y: upY }, 150);

        var scale = new TWEEN.Tween(dispObj.scale)
            .to({ x: orgScaleX + 0.5, y: orgScaleX + 0.5 }, 500)
            .easing(TWEEN.Easing.Linear.None);

        var moveAway = new TWEEN.Tween(dispObj.position)
            .to({ x: endX, y: endY }, 2000)
            .easing(TWEEN.Easing.Back.In)
            .onComplete(() => this.worldContainer.removeChild(dispObj));

        moveUp.chain(scale, moveAway).start();
    }

    /**
     * Ads text message about acquired quest items.
     * @param message the message to be added
     * @param style optional PIXI.ITextStyle
     */
    public addQuestItemMessage(message: string, style?: PIXI.ITextStyleStyle): void {
        var stl = style || Global.QUEST_ITEM_STYLE;
        var txtInfo = new PIXI.Text(message, stl);
        txtInfo.anchor.set(0.5, 0.5);
        txtInfo.position.set(this.hero.x, Global.SCENE_HEIGHT - 150);
        txtInfo.scale.set(1, -1);   //  scale invert since everything is upside down due to coordinate system

        this.worldContainer.addChild(txtInfo);

        var scale = new TWEEN.Tween(txtInfo.scale)
            .to({ x: 1.8, y: -1.8 }, 2200)
            .easing(TWEEN.Easing.Linear.None);

        var fade = new TWEEN.Tween(txtInfo)
            .to({ alpha: 0 }, 3000)
            .onComplete(() => this.worldContainer.removeChild(txtInfo));
        scale.chain(fade).start();
    }


    /**
     * Starts an animation tween with informational text moving upwards from the given position.
     * @param position the start position of the message
     * @param message the message to be added
     * @param style optional PIXI.ITextStyle
     */
    public addInfoMessage(position: PIXI.Point, message: string, style?: PIXI.ITextStyleStyle): void {
        var stl = style || Global.INFO_STYLE;
        var txtInfo = new PIXI.Text(message, stl);
        txtInfo.position.set(position.x, position.y);
        txtInfo.scale.set(1, -1);   //  scale invert since everything is upside down due to coordinate system

        this.worldContainer.addChild(txtInfo);

        var dy = (position.y > Global.SCENE_HEIGHT / 2) ? - 250 : +250;
        var upY = position.y + dy;
        var moveUp = new TWEEN.Tween(txtInfo.position)
            .to({ y: upY }, 2000);
        moveUp.start();

        var scale = new TWEEN.Tween(txtInfo.scale)
            .to({ x: 1.6, y: -1.6 }, 2200)
            .easing(TWEEN.Easing.Linear.None);

        var fade = new TWEEN.Tween(txtInfo)
            .to({ alpha: 0 }, 3000)
            .onComplete(() => this.worldContainer.removeChild(txtInfo));
        scale.chain(fade).start();
    }

    /**
     * Sets up the scene.
     */
    private setup(): void {
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

        //-----------------------------
        //  setup hero
        //-----------------------------      
        this.hero = new HeroCharacter(this.worldContainer);
        this.hero.name = "hero";

        ko.postbox.subscribe<IDpsChangeEvent>(DPS_TOPIC, this.handleDpsChange);
        ko.postbox.subscribe<IMoveEvent>(MOVE_TOPIC, this.handleMoveChange);
        ko.postbox.subscribe<IBurnEvent>(BURN_TOPIC, this.handleBurnChange);

        //--------------------------------------
        //  setup physics subsystem
        //--------------------------------------
        this.wp2 = new WorldP2();
        this.hero.SetWorldP2(this.wp2);
        this.worldContainer.addChild(this.hero);
        this.questMngr = new QuestManager(this);
        this.wp2.on("playerContact", this.onPlayerContact, this);
        this.wp2.on("bulletContact", this.onBulletContact, this);

        Global.sceneMngr.AddScene(new OptionsScene());
        Global.sceneMngr.AddScene(new CutScene());

        this.resetPlayerStats();
    };

    private handleDpsChange = (event: IDpsChangeEvent) => {
        this.addInfoMessage(this.hero.position, `${event.Amount} HP`);
    };

    private handleMoveChange = (event: IMoveEvent) => {

        //  adjust animation FPS based on jump/idle/isrunning flags
        var animationFPS: number = (event.isRunning ? 2 : 1) * ANIMATION_FPS_NORMAL;

        switch (event.newState) {
            case MovementState.Idle:
                this.hero.PlayAnimation("idle", ANIMATION_FPS_SLOW);
                Global.snd.idle();
                break;

            case MovementState.Left:
                this.hero.PlayAnimation("left", animationFPS);
                if (!this.hero.isJumping) {
                    Global.snd.walk(event.isRunning);
                }
                break;

            case MovementState.Right:
                this.hero.PlayAnimation("right", animationFPS);
                if (!this.hero.isJumping) {
                    Global.snd.walk(event.isRunning);
                }
                break;

            case MovementState.JumpLeft:
                this.hero.PlayAnimation("jumpleft", ANIMATION_FPS_SLOW);
                Global.snd.jump();
                break;

            case MovementState.JumpRight:
                this.hero.PlayAnimation("jumpright", ANIMATION_FPS_SLOW);
                Global.snd.jump();
                break;

            case MovementState.JumpUp:
                this.hero.PlayAnimation("jumpup", ANIMATION_FPS_SLOW);
                Global.snd.jump();
                break;

            //  TODO: jmpdown sound should be a kiai or banzai like sound - not a hit sound
            case MovementState.JumpDownRight:
                this.hero.PlayAnimation("jumpdownright", ANIMATION_FPS_NORMAL);
                Global.snd.jumpAttack();
                break;

            case MovementState.JumpDownLeft:
                this.hero.PlayAnimation("jumpdownleft", ANIMATION_FPS_NORMAL);
                Global.snd.jumpAttack();
                break;

            case MovementState.JumpDown:
                this.hero.PlayAnimation("jumpdown", ANIMATION_FPS_NORMAL);
                Global.snd.jumpAttack();
                break;
        }

    };

    private handleBurnChange = (event: IBurnEvent) => {
        if (event.isBurning) {
            Global.snd.burn();
        } else {
            Global.snd.burnStop();
        }
    };

    /**
     * Helper that returns time tick value with the given seconds added.
     * @param seconds
     */
    private secondsFromNow(seconds: number): number {
        var now = performance.now() / 1000;
        now += seconds;
        return now;
    };

    /**
    * Assigns default player stats.
    */
    public resetPlayerStats() {
        var playerStats = this.hero.PlayerStats;
        playerStats.setStat(StatType.Coins, Global.UserInfo.gold);
        playerStats.setStat(StatType.Dust, Global.UserInfo.dust);
        playerStats.setStat(StatType.Exp, Global.UserInfo.exp);
        playerStats.setStat(StatType.MaxHP, 150);
        playerStats.setStat(StatType.HP, 120);
        playerStats.setStat(StatType.MaxDust, 1000);

        this.questMngr.reset();
    }

    /**
     *  Invokes the level loading.
     */
    public StartLevel(levelId: number) {
        console.log("loading level " + levelId);
        var lvl = this.levelLoader.buildLevel(levelId);

        if (!lvl) {
            console.log("No more levels!!!");
            return;
        } else {
            Global.snd.playTrack(lvl.audioTrack || 0);
            this.loadLevel(lvl);
            this.currentLevel = lvl;
        }
    };

    /**
     * Loads the level and adds all objects to the scene.
     * @param id
     */
    private loadLevel(lvl: ILevel) {

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

            //  now remove all other display objects except hero
            var all = this.worldContainer.children.filter((c: PIXI.DisplayObject) => c.name !== "hero");
            all.forEach((child: any) => {
                this.worldContainer.removeChild(child);
                if (child.body) {
                    this.wp2.removeBody(child.body);
                }
            });
            this.bullets = [];
        }

        //--------------------------------------
        //  add all objects from level to scene
        //--------------------------------------
        lvl.entities.forEach((body: any) => {
            this.worldContainer.addChild(body.DisplayObject);

            //  if entity is a simple sprite it has a "fake" body  
            //  without any shapes, so no need to add it to world
            if (body.shapes && body.shapes.length > 0) {
                this.wp2.addBody(body);
            }
        });

        //  add parallax backgrounds
        this.parallaxBackgrounds = lvl.parallax;
        lvl.parallax.forEach((plx: Parallax, idx: number) => {
            this.worldContainer.addChildAt(plx, idx);
            //  TODO: there is a bug not initially calculating all viewport  
            //        visible parallax textures. So just move it in both 
            //        directions to trigger textures recalculation
            plx.SetViewPortX(lvl.start[0] - 10);
            //plx.SetViewPortX(lvl.start[0] + 10);
            plx.SetViewPortX(lvl.start[0]);
        });

        //  set start for player
        this.wp2.playerBody.position[0] = lvl.start[0];
        this.wp2.playerBody.position[1] = lvl.start[1];
        Global.UserInfo.position.x = lvl.start[0];
        Global.UserInfo.position.y = lvl.start[1];
        this.hero.visible = true;
        this.resetPlayerStats();
    }

    /**
     * Saves the current level and dumps to console.
     */
    private saveLevel(): void {
        var map: ILevelMap = {
            start: [],
            templates: [],
            entities: [],
            NPC: []
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

    /**
     * Checks if the player has jumped on something with a high velocity.
     * Adds smoke for ground contacts and handles mob collision for npc's.
     *
     * @param event
     */
    private onPlayerContact(event: any): void {
        const SMOKE_VELOCITY: number = 430;
        const ATTACK_VELOCITY: number = 545;

        let body: p2.Body = event.body as p2.Body;
        let verticalVelocity = Math.abs(event.velocity[1])
        if (verticalVelocity > 400) {
            console.log("Vert velocity: " + verticalVelocity);
        }

        if (verticalVelocity > ATTACK_VELOCITY && body.shapes[0].collisionGroup === WorldP2.COL_GRP_NPC) {
            //  check collision vs mobs
            console.log("Mob hit!");
            var mob: Mob = (body as any).DisplayObject as Mob;
            if (!mob.IsLoading) {
                this.handleMobInteraction(mob, body);
            }
        } else if (verticalVelocity > SMOKE_VELOCITY) {
            var smoke: AnimatedSprite = new AnimatedSprite();
            smoke.addAnimations(new AnimationSequence("smoke", "assets/_distribute/jump_smoke.png",
                [0, 1, 2, 3, 4, 5], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
            smoke.anchor.set(0.5);
            smoke.pivot.set(0.5);
            smoke.x = this.hero.x;
            smoke.y = this.hero.y - 25;
            smoke.alpha = 0.7;
            smoke.rotation = Math.random() * Math.PI;
            this.worldContainer.addChild(smoke);
            smoke.OnComplete = () => this.worldContainer.removeChild(smoke);
            smoke.PlayAnimation("smoke", 5, false);
        }
    }

    /**
     * Handles bullets hitting the player or obstacle.
     *
     * @param event
     */
    private onBulletContact(event: any): void {
        let bullet: Bullet = event.bulletBody.DisplayObject as Bullet;
        if (!bullet.IsDead) {
            if (event.playerHit) {
                Global.snd.hitMagic1();
                this.addInfoMessage(this.hero.position, `${-bullet.damage} HP`);
                this.hero.PlayerStats.increaseStat(StatType.HP, -bullet.damage);
            } else {

                //  recycle explode animations
                var explode: AnimatedSprite = new AnimatedSprite();
                explode.addAnimations(new AnimationSequence("exp",
                    "assets/_distribute/slime_atk_exp.png",
                    [0, 1, 2, 3, 4, 5], 32, 32)
                );
                explode.anchor.set(0.5);
                explode.pivot.set(0.5);
                explode.x = bullet.x;
                explode.y = bullet.y;
                explode.alpha = 0.7;
                explode.rotation = Math.random() * Math.PI;
                this.worldContainer.addChild(explode);
                explode.OnComplete = () => this.worldContainer.removeChild(explode);
                explode.PlayAnimation("exp", 10, false);
                Global.snd.bulletHitWall();
            }
            bullet.IsDead = true;
        }
    }
}