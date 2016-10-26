import { Scene } from "app/_engine/Scene";
import { Parallax } from "app/_engine/Parallax";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";
import { PhysicsTuple } from "app/_engine/PhysicsConnector";
import { JumpController, P2JumpController } from "./JumpController";
import { PWorld } from "./PWorld";
import * as Global from "app/Demo/Global";

enum MovementState {
    Left,
    Right,
    Idle,
    JumpLeft,
    JumpRight,
    JumpUp,
}


/**
 *   Load in game scene.
 */
export class InGameScene extends Scene {

    private backgroundGround: Parallax;
    private backgroundNear: Parallax;
    private backgroundFar: Parallax;
    private worldContainer: PIXI.Container;
    private hero: AnimatedSprite;
    private entities: Array<PhysicsTuple<p2.Body>> = [];

    private movementState: MovementState = -1;
    private heroPosition: PIXI.Point = new PIXI.Point();
    
    private readonly VELOCITY = 10;
    private readonly ANIMATION_FPS = 10;

    private isRunning = false;


    private readonly HALF_WIDTH = Global.SCENE_WIDTH / 2;

    /**
    * holds current jump information.
    */
    private jumpCtrl: P2JumpController;

    private p2w: PWorld;

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
        this.handleKeyboard();

        if (!this.jumpCtrl.isJumping) {
            var velocity = this.calculateHorizontalVelocity();
            this.p2w.player.velocity[0] = velocity;
        }
            
        this.p2w.update(dt);
        this.hero.position.x = this.heroPosition.x;
        this.hero.position.y = this.heroPosition.y;
        this.worldContainer.x = -this.hero.position.x - 32 + this.HALF_WIDTH;
        this.worldContainer.position.y = Global.SCENE_HEIGHT-70;
        

        console.log('physics x,y: ' + this.heroPosition.x.toFixed(0) + ',' + this.heroPosition.y.toFixed(0) + ', render x,y: ' + this.hero.position.x.toFixed(0) + ',' + this.hero.position.y.toFixed(0));
        this.setParallaxPositions(this.hero.position.x);
        this.hud.txtPosition.text = `Position: (${this.heroPosition.x.toFixed(0)}, ${this.heroPosition.y.toFixed(0)})`;

        this.entities.forEach((tupple) => {
            tupple.displayObject.position.set(tupple.body.interpolatedPosition[0], tupple.body.interpolatedPosition[1] );
            tupple.displayObject.rotation = tupple.body.interpolatedAngle;
        });
    }

    private setup() {
        this.BackGroundColor = 0x1099bb;
        PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR;
        
        //-----------------------------
        //  setup hero
        //-----------------------------
        const FRAME_SIZE: number = 64;
        this.hero = new AnimatedSprite();
        this.hero.addAnimations(new AnimationSequence("right", "assets/images/hero_64x64.png", [12, 13, 14, 15, 16, 17], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("left", "assets/images/hero_64x64.png", [6, 7, 8, 9, 10, 11], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("jumpleft", "assets/images/hero_64x64.png", [48, 49, 50, 51, 52, 53], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("jumpright", "assets/images/hero_64x64.png", [54, 55, 56, 57, 58, 59], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("jumpup", "assets/images/hero_64x64.png", [1, 3, 4], FRAME_SIZE, FRAME_SIZE));
        this.hero.addAnimations(new AnimationSequence("idle", "assets/images/hero_64x64.png", [25, 24, 40, 19, 19, 18, 19, 22, 30, 31, 1, 1, 1], FRAME_SIZE, FRAME_SIZE));
        this.hero.Anchor = new PIXI.Point(0.5, 0);
        this.heroPosition.set((Global.SCENE_WIDTH / 2) - (FRAME_SIZE / 2), 1);
        this.worldContainer.addChild(this.hero);
        this.hero.PlayAnimation("idle");

        this.p2w = new PWorld(this.heroPosition);
        this.jumpCtrl = new P2JumpController(this.p2w.player);

        //-----------------------------
        //  setup backgrounds
        //-----------------------------
        var vps = new PIXI.Point(Global.SCENE_WIDTH, Global.SCENE_HEIGHT);

        //  far parallax
        this.backgroundFar = new Parallax(vps);
        this.backgroundFar.setTextures("assets/images/background/Canyon.png");
        //this.backgroundFar.setTextures("assets/images/background/Wood_night.png");
        this.worldContainer.addChildAt(this.backgroundFar, 0);

        //  near parallax
        this.backgroundNear = new Parallax(vps);
        this.backgroundNear.setTextures("assets/images/background/trees01.png",
            "assets/images/background/trees02.png",
            "assets/images/background/trees03.png",
            "assets/images/background/trees04.png",
            "assets/images/background/trees05.png");
        this.worldContainer.addChildAt(this.backgroundNear, 1);
        this.backgroundNear.y = 15;

        //  ground (nearest) parallax
        this.backgroundGround = new Parallax(vps);
        this.backgroundGround.setTextures("assets/images/background/ground.png");
        this.worldContainer.addChildAt(this.backgroundGround, 2);
        this.backgroundGround.y = -90;
        
        this.addChild(this.worldContainer);

        this.setParallaxPositions(this.heroPosition.x);

        this.addBoxes();
    }

    private handleKeyboard = () => {
        const LEFT: number = 65;
        const RIGHT: number = 68;
        const JUMP: number = 87;
        const SHIFT: number = 16;

        var newState: MovementState = MovementState.Idle;

        //  no movement while jumping
        if (this.jumpCtrl.isJumping) return;


        var kbd = Global.kbd;
        var newIsJumping: boolean = false;
        var newIsRunning = kbd.IsKeyDown(SHIFT);

        if (kbd.IsKeyDown(LEFT)) {
            newState = MovementState.Left;
        } else if (kbd.IsKeyDown(RIGHT)) {
            newState = MovementState.Right;
        }

        //  check if jump is pressed
        if (kbd.IsKeyDown(JUMP) && this.jumpCtrl.canJump) {
            if (this.movementState === MovementState.Left) {
                newState = MovementState.JumpLeft;
                newIsRunning = false;
            }
            else if (this.movementState === MovementState.Right) {
                newState = MovementState.JumpRight;
                newIsRunning = false;
            }
            else if (this.movementState === MovementState.Idle) {
                newState = MovementState.JumpUp;
                newIsRunning = false;
            }
            console.log('new state: ' + MovementState[newState]);
        }

        //  has state changed
        if (newState !== this.movementState) {
            console.log('state change: ' + MovementState[this.movementState] + ' -> ' + MovementState[newState]);

            switch (newState) {
                case MovementState.Idle:
                    this.hero.PlayAnimation("idle");
                    break;
                case MovementState.Left:
                    this.hero.PlayAnimation("left");
                    break;
                case MovementState.Right:
                    this.hero.PlayAnimation("right");
                    break;
                case MovementState.JumpLeft:
                    newIsJumping = true;
                    this.hero.PlayAnimation("jumpleft");
                    break;
                case MovementState.JumpRight:
                    newIsJumping = true;
                    this.hero.PlayAnimation("jumpright");
                    break;
                case MovementState.JumpUp:
                    newIsJumping = true;
                    this.hero.PlayAnimation("jumpup");
                    break;
            }
        }

        //  has a jump started
        if (newIsJumping) {
            this.jumpCtrl.startJump();
        }

        //  adjust animation FPS based on jump/idle/isrunning flags
        var animationFPS = (newState === MovementState.Idle || newIsJumping) ? this.ANIMATION_FPS / 2 : (newIsRunning ? 2 : 1) * this.ANIMATION_FPS;
        this.hero.Fps = animationFPS;

        //  update new states
        this.movementState = newState;
        this.isRunning = newIsRunning;
    }
   
    /**
     * Calculates the horizontal velocity
     */
    private calculateHorizontalVelocity(): number {
        var move = 0;
        if (this.movementState === MovementState.Left || this.movementState === MovementState.JumpLeft) {
            move = -1;
        } else if (this.movementState === MovementState.Right || this.movementState === MovementState.JumpRight) {
            move = 1;
        }
        var velocity = (move * this.VELOCITY) * (this.isRunning ? 2 : 1.0);
        return velocity;
    }

    /**
     * Updates the parallax background components to a new world position.
     * @param movementPositionX
     */
    private setParallaxPositions(movementPositionX: number) {
        this.backgroundGround.SetViewPortX(movementPositionX, 1);
        this.backgroundNear.SetViewPortX(movementPositionX, 0.8);
        this.backgroundFar.SetViewPortX(movementPositionX, 0.5);
    }

    private addBoxes = () => {
        //for (var x = 0; x < 4; x ++) {
        //    var spr = new PIXI.Sprite(PIXI.loader.resources["assets/images/objects/box.png"].texture);
        //    spr.anchor.set(0, 0.5);
        //    spr.position.x = this.movementPosition.x + (x*512);
        //    spr.position.y = Global.SCENE_HEIGHT - 190;
        //    spr.scale.set(0.5);
        //    this.worldContainer.addChild(spr);            
        //    this.addStaticObject(spr.position, new p2.Box({width:64, height:64}));
        //}
        var t = PIXI.loader.resources["assets/images/objects/box_dbg.png"].texture;
        t.rotate = 8;
        for (var x = 0; x < 2; x++) {            
            var spr = new PIXI.Sprite(t);
            spr.position.set(50 + (x * 256), 100);
            spr.pivot.set(0.5);
            spr.anchor.set(0.5, 0.5);
            spr.scale.set(0.5);
            this.worldContainer.addChild(spr);
            var body = new p2.Body({ mass: 60, position: [spr.position.x, spr.position.y] });
            body.addShape(new p2.Box({ width: 64, height: 64 }));
            this.p2w.addBody(body);
            this.entities.push(new PhysicsTuple(spr, body));
        }
    }
    
    /**
     * adds an static object to the scene and p2 world
     * @param pixiObject
     * @param shape
     */
    private addStaticObject(position: PIXI.Point, shape?: p2.Shape) {
        var options: p2.BodyOptions = {
            position: [position.x, position.y]            
        };
        this.p2w.addObject(options, shape);
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

