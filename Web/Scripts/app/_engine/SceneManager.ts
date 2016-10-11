import { Scene } from "./Scene";

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

/**
*   Handles multiple scenes, scene activation, rendering and updates.
*/
export class SceneManager {
    private currentScene: Scene;
    private scenes: Array<Scene> = [];
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;

    private designWidth: number;
    private designHeight: number;
    private designedAspect: number;
    private customResizer: () => void;

    private startTime = null;

    /**
    *   Creates a new SceneManager instance.
    *
    *   @param width the width of the scene
    *   @param height the height of the scene
    *   @param resizer custom resize function
    */
    constructor(width: number, height: number, options?: PIXI.IRendererOptions, resizer? : ()=> void) {
        this.designWidth = width;
        this.designHeight = height;
        this.designedAspect = this.designWidth / this.designHeight;
        this.customResizer = resizer;
           
        if (!options) {
            options = { antialias: true, backgroundColor: 0x012135 };
        }
        this.renderer = PIXI.autoDetectRenderer(width, height, options);
        this.renderer.autoResize = true;
        window.removeEventListener('resize', this.resizeHandler);
        window.addEventListener('resize', this.resizeHandler, true);
        this.render(0);
        
    }

    /**
    *   Returns the renderer instance.
    */
    public get Renderer() {
        return this.renderer;
    }

    /**
    *   Returns the current scene instance.
    */
    public get CurrentScene() {
        return this.currentScene;
    }

    /**
    *   Adds a scene.
    */
    public AddScene(scene: Scene) {
        this.scenes.push(scene);
        scene.sceneManager = this;
    }

    /**
    *   Removes a scene.
    */
    public RemoveScene(scene: Scene) {
        this.scenes = this.scenes.filter((item: Scene, index: number, arr) => {
            return item !== scene;
        });
        scene.sceneManager = undefined;
    }

    /**
    *   Activates the given scene.
    */
    public ActivateScene(sceneOrName: Scene | string) {
        var scene: Scene;
        if (typeof (sceneOrName) == "string") {
            var found = this.scenes.filter((item) => { return item.Name == sceneOrName; });
            if (!found || found.length == 0)
                throw Error("Scene: '" + sceneOrName + "' not found");

            if (found.length > 1)
                throw Error("Multiple scenes: '" + sceneOrName + "' found");
            scene = found[0];
        }
        else {
            scene = sceneOrName as Scene;
        }
        console.log("ActivateScene " + scene.Name);
        this.startTime = null;
        this.currentScene = scene;
        this.renderer.backgroundColor = scene.BackGroundColor;
        this.resizeHandler();

        if (scene.onActivate)
            scene.onActivate();
    }

    private resizeHandler = () => {
        console.log("resize...");

        //  if there is a custom resizer invoke it and bail out
        if (this.customResizer) {
            this.customResizer();
            if (this.currentScene && this.currentScene.onResize) {
                this.currentScene.onResize();
            }
            return;
        }


        var maxWidth: number, maxHeight: number;
        var winAspect = window.innerWidth / window.innerHeight;
        maxWidth = this.designedAspect * window.innerHeight;
        maxHeight = window.innerHeight;

        //if (winAspect >= 1) {
        //    maxWidth = this.designedAspect * window.innerHeight;
        //    maxHeight = window.innerHeight;
        //}
        //else {
        //    maxHeight = window.innerWidth / this.designedAspect;
        //    maxWidth = window.innerWidth;
        //}
        var ratio = Math.min(window.innerWidth / this.designWidth, window.innerHeight / this.designHeight);
        this.renderer.resize(maxWidth, maxHeight);
        if (this.currentScene) {
            this.currentScene.scale.set(maxWidth / this.designWidth);

            //   trigger scene onResize
            if (this.currentScene.onResize) {
                this.currentScene.onResize();
            }
        }
    }

    private render = (timestamp) => {
        requestAnimationFrame(this.render);

        //  exit if no scene or paused
        if (!this.currentScene || this.currentScene.isPaused())
            return;

        if (!this.startTime)
            this.startTime = timestamp;

        var dt = timestamp - this.startTime;
        this.startTime = timestamp;
        if (this.currentScene.onUpdate)
            this.currentScene.onUpdate(dt);

        this.renderer.render(this.currentScene);
    }
}
