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
import { Bullet } from "./Bullet";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";

import "../../Scripts/pixi-particles";

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
    public onUpdate(dt: number){
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

        //-------------------------------------------
        //  check if player is dead
        //-------------------------------------------
        if (this.PlayerStats.getStat(StatType.HP) <= 0) {
            this.IsHeroInteractive = false;
            this.hero.visible = false;

            var cutScene = Global.sceneMngr.GetScene("CutScene") as CutScene;
            //cs.SetText(trigger.completedText, Global.QUEST_STYLE);
            var backGroundTexture = Global.sceneMngr.CaptureScene();
            cutScene.SetBackGround(backGroundTexture, this.scale);
            cutScene.DeathScene = true;
            Global.sceneMngr.ActivateScene(cutScene);
        }
    };

    public get PlayerStats(): PlayerStats {
        return this.hero.PlayerStats;
    }

    public set IsHeroInteractive(value: boolean) {
        if (this.hero.IsInteractive !== value) {
            this.hero.IsInteractive = value;
            if (!this.hero.IsInteractive) {
                this.hero.PlayAnimation("idle", ANIMATION_FPS_SLOW);
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
                {
                    let now = Date.now() / 1000;
                    if (!playerStats.buffs[1000] || playerStats.buffs[1000] < now) {
                        this.addInfoMessage(dispObj.position, "Burn", Global.WARN_STYLE);
                    }
                    playerStats.buffs[1000] = this.secondsFromNow(1);
                }
                break;

            case 1001:  //  lava
                {
                    let now = Date.now() / 1000;
                    if (!playerStats.buffs[1001] || playerStats.buffs[1001] < now) {
                        this.addInfoMessage(dispObj.position, "Burn", Global.WARN_STYLE);
                    }
                    playerStats.buffs[1001] = this.secondsFromNow(3);
                }
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
                fixedRotation: true,
                angularDamping: 0,
                damping: 0
            };
            let body = new p2.Body(options);
            body.addShape(shape);
            body.setDensity(0.0);
            body.gravityScale = 0;
            body.collisionResponse = false;
            body.type = p2.Body.DYNAMIC;
            (body as any).DisplayObject = bullet;
            bullet.body = body;

            this.wp2.addBody(body);
            console.log("creating new bullet, body.id: " + body.id);
        } else {
            console.log("recycling bullet, body.id: " + bullet.body.id);
        }

        bullet.position = position;
        bullet.Direction = new PIXI.Point(Global.UserInfo.position.x - position.x, Global.UserInfo.position.y - position.y);
        bullet.IsDead = false;
        bullet.body.velocity[0] = bullet.Direction.x * bullet.velocity;
        bullet.body.velocity[1] = bullet.Direction.y * bullet.velocity;

        return bullet;
    };

    private findDeadBullet = (): Bullet => {
        for (var i = 0, len = this.bullets.length; i < len; i++){
            let blt = this.bullets[i];
            if (blt.IsDead) {
                return blt;
            }
        }
        return null;
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
        txtInfo.position.set(60, 80);
        container.addChild(txtInfo);

        if (fadeSeconds > 0 ) {
            var fade = new TWEEN.Tween(container)
                .to({ alpha: 0.7 }, fadeSeconds)
                .onComplete(() => {
                    this.worldContainer.removeChild(container);
                });
            fade.start();
        }
        container.name = "TriggerMessage";
        return container;
    }

    /**
     * Assigns default player stats.
     */
    public resetPlayerStats() {
        var playerStats = this.hero.PlayerStats;
        playerStats.setStat(StatType.Coins, Global.UserInfo.gold);
        playerStats.setStat(StatType.Dust, Global.UserInfo.dust);
        playerStats.setStat(StatType.MaxHP, 150);
        playerStats.setStat(StatType.HP, 120);
        playerStats.setStat(StatType.MaxDust, 1000);
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
        this.resetPlayerStats();

        ko.postbox.subscribe<IDpsChangeEvent>(DPS_TOPIC, this.handleDpsChange);
        ko.postbox.subscribe<IMoveEvent>(MOVE_TOPIC, this.handleMoveChange);
        ko.postbox.subscribe<IBurnEvent>(BURN_TOPIC, this.handleBurnChange);

        var cutScene = new CutScene();
        Global.sceneMngr.AddScene(cutScene);        

        //--------------------------------------
        //  setup physics subsystem
        //--------------------------------------
        this.wp2 = new WorldP2();
        this.hero.SetWorldP2(this.wp2);
        this.worldContainer.addChild(this.hero);
        this.questMngr = new QuestManager(this, this.wp2, this.hero);
        this.wp2.on("playerContact", this.onPlayerContact, this);
        this.wp2.on("bulletContact", this.onBulletContact, this);
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
                this.snd.idle();
                break;

            case MovementState.Left:
                this.hero.PlayAnimation("left", animationFPS);
                if (!this.hero.isJumping) {
                    this.snd.walk(event.isRunning);
                }
                break;

            case MovementState.Right:
                this.hero.PlayAnimation("right", animationFPS);
                if (!this.hero.isJumping) {
                    this.snd.walk(event.isRunning);
                }
                break;

            case MovementState.JumpLeft:
                this.hero.PlayAnimation("jumpleft", ANIMATION_FPS_SLOW);
                this.snd.jump();
                break;

            case MovementState.JumpRight:
                this.hero.PlayAnimation("jumpright", ANIMATION_FPS_SLOW);
                this.snd.jump();
                break;

            case MovementState.JumpUp:
                this.hero.PlayAnimation("jumpup", ANIMATION_FPS_SLOW);
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
        var lvl = this.levelLoader.buildLevel(levelId);

        if (!lvl) {
            console.log("No more levels!!!");
            return;
        } else {
            this.snd.playTrack(lvl.audioTrack||0);
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
            plx.SetViewPortX(lvl.start[0]-10);
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

    /**
     * Checks if the player has jumped on something with a high velocity and adds some smoke
     *
     * @param event
     */
    private onPlayerContact(event: any): void {
        const SMOKE_VELOCITY: number = 425;
        let body: p2.Body = event.body as p2.Body;

        if (Math.abs(event.velocity[1]) > SMOKE_VELOCITY) {
            var smoke: AnimatedSprite = new AnimatedSprite();
            smoke.addAnimations(new AnimationSequence("smoke", "assets/_distribute/jump_smoke.png",
                [0, 1, 2, 3, 4, 5], this.HERO_FRAME_SIZE, this.HERO_FRAME_SIZE));
            smoke.anchor.set(0.5);
            smoke.pivot.set(0.5);
            smoke.x = this.hero.x;
            smoke.y = this.hero.y - this.HERO_FRAME_SIZE / 3;
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
                this.snd.hitMagic1();
                this.addInfoMessage(this.hero.position, `${-bullet.damage} HP`);
                this.hero.PlayerStats.increaseStat(StatType.HP, -bullet.damage);
            } else {
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
            }
            bullet.IsDead = true;
        }
    }
}