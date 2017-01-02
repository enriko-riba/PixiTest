import { Scene } from "./Scene";
import * as TWEEN from "tween";

export enum State {
    GLOBAL,
    MENU,
    IN_GAME,
    CUSTOM1,
    CUSTOM2,
    CUSTOM3,
    CUSTOM4,
    CUSTOM5,
}

declare var stats: Stats;

/**
 *   Handles multiple scenes, scene activation, rendering and updates.
 */
export class SceneManager {
    private currentScene: Scene;
    private scenes: Array<Scene> = [];
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;

    private designWidth: number;
    private designHeight: number;
    private sceneResizer: ISceneResizer;

    private startTime = null;
    private animationFrameHandle: number;

    /**
     *   Creates a new SceneManager instance.
     *
     *   @param width the width of the scene
     *   @param height the height of the scene
     *   @param resizer custom resize function
     */
    constructor(width: number, height: number, options?: PIXI.IRendererOptions, resizer?: ISceneResizer) {
        this.designWidth = width;
        this.designHeight = height;
        this.sceneResizer = resizer || new DefaultResizer(this.designWidth, this.designHeight);

        if (!options) {
            options = { antialias: false, backgroundColor: 0x012135 };
        }
        this.renderer = PIXI.autoDetectRenderer(width, height, options);
        //this.renderer = new PIXI.CanvasRenderer(width, height, options);
        this.renderer.autoResize = true;

        //  textureGC is only used for web GL renderer
        if ((this.render as any).textureGC) {
            (this.render as any).textureGC.mode = PIXI.GC_MODES.AUTO;
        }

        window.removeEventListener("resize", this.resizeHandler);
        window.addEventListener("resize", this.resizeHandler, true);

        stats.showPanel(0); // 0 – use the FPS mode, 1 – use the milliseconds mode

        // Position the meter in the top-left corner
        stats.domElement.style.position = "absolute";
        stats.domElement.style.left = "0px";
        stats.domElement.style.top = "52px";

        // Append the meter to the body of your HTML5 document.
        document.body.appendChild(stats.domElement);

        this.render(0);
    }

    /**
     *   Returns the renderer instance.
     */
    public get Renderer(): PIXI.WebGLRenderer | PIXI.CanvasRenderer {
        return this.renderer;
    }

    /**
     *   Returns the current scene instance.
     */
    public get CurrentScene():Scene {
        return this.currentScene;
    }

    /**
     *   Adds a scene.
     */
    public AddScene(scene: Scene):void {
        this.scenes.push(scene);
        scene.sceneManager = this;
    }

    /**
     *   Removes a scene.
     */
    public RemoveScene(scene: Scene): void {
        this.scenes = this.scenes.filter((item: Scene, index: number, arr) => {
            return item !== scene;
        });
        scene.sceneManager = undefined;
    }

    /**
     *   Activates the given scene.
     */
    public ActivateScene(sceneOrName: Scene | string):void {
        var scene: Scene;
        if (typeof (sceneOrName) === "string") {
            var found = this.scenes.filter((item:Scene) => { return item.Name === sceneOrName; });
            if (!found || found.length === 0) {
                throw Error("Scene: '" + sceneOrName + "' not found");
            }
            if (found.length > 1) {
                throw Error("Multiple scenes: '" + sceneOrName + "' found");
            }
            scene = found[0];
        }else {
            scene = sceneOrName as Scene;
        }
        console.log("ActivateScene " + scene.Name);
        this.startTime = null;
        this.currentScene = scene;
        this.renderer.backgroundColor = scene.BackGroundColor;
        this.resizeHandler();

        if (scene.onActivate) {
            scene.onActivate();
        }

        PIXI.settings.RESOLUTION = window.devicePixelRatio;
    }

    /**
     *   Cancels the animationFrame loop, removes all scenes and finally destroys the renderer.
     */
    public Destroy = () => {
        cancelAnimationFrame(this.animationFrameHandle);
        if (this.currentScene) { this.currentScene.pause(); }
        this.scenes.forEach((scene: Scene) => {
            this.RemoveScene(scene);
        });
        this.renderer.destroy(true);
    };

    private resizeHandler = () => {
        var avlSize = this.sceneResizer.GetAvailableSize();
        var aspect = this.sceneResizer.GetAspectRatio();
        var size = this.sceneResizer.CalculateSize(avlSize, aspect);
        this.renderer.resize(size.x, size.y);

        if (this.currentScene) {
            this.currentScene.scale.set(this.sceneResizer.CalculateScale(size));
            if (this.currentScene.onResize) {
                this.currentScene.onResize();
            }
        }
    };

    private render = (timestamp) => {
        stats.begin();
        //  for tween support
        TWEEN.update(timestamp);

        this.animationFrameHandle = requestAnimationFrame(this.render);

        //  exit if no scene or paused
        if (!this.currentScene || this.currentScene.isPaused()) {
            return;
        }

        if (!this.startTime) {
            this.startTime = timestamp;
        }

        if (this.currentScene.onUpdate) {
            var dt = timestamp - this.startTime;
            if (dt > 50) {
                dt = 50;
            }
            this.currentScene.onUpdate(dt);
        }

        this.startTime = timestamp;
        this.renderer.render(this.currentScene);

        stats.end();
    };
}

export class DefaultResizer implements ISceneResizer {
    constructor(protected designedWidth, protected designedHeight) {
    }
    public GetAvailableSize():ISize {
        return { x: window.innerWidth, y: window.innerHeight};
    }
    public GetAspectRatio():number {
        return this.designedWidth / this.designedHeight;
    }
    public CalculateSize(availableSize: ISize, aspect: number): ISize {
        var maxWidth: number, maxHeight: number;
        maxWidth = Math.floor(aspect * availableSize.y);
        maxHeight = Math.floor(window.innerHeight);
        return { x: maxWidth, y: maxHeight };
    }
    public CalculateScale(newSize: ISize):number {
        return newSize.x / this.designedWidth;
    }
}

export interface ISize {
    x: number;
    y: number;
}

/**
 *   Object passed to the SceneManager handling various aspects of scene resizing.
 */
export interface ISceneResizer {

    /*
     *   Returns the available width.
     */
    GetAvailableSize: () => ISize;

    /*
     *   Returns the desired aspect ratio for the stage.
     */
    GetAspectRatio: () => number;

    CalculateSize: (availableSize: ISize, aspect: number) => ISize;

    CalculateScale(newSize: ISize): number;
}
