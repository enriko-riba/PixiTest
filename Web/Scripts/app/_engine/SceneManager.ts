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
    constructor(width: number, height: number, options?: PIXI.IRendererOptions, resizer? : ISceneResizer) {
        this.designWidth = width;
        this.designHeight = height;
        this.sceneResizer = resizer || new DefaultResizer(this.designWidth, this.designHeight);
           
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

    /**
    *   Cancels the animationFrame loop, removes all scenes and finaly destroys the renderer.
    */
    public Destroy = () => {        
        cancelAnimationFrame(this.animationFrameHandle);
        if (this.currentScene) this.currentScene.pause();
        this.scenes.forEach((scene) => {
            this.RemoveScene(scene);
        });
        this.renderer.destroy(true);
    }

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
    }

    private render = (timestamp) => {
        this.animationFrameHandle = requestAnimationFrame(this.render);

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

export class DefaultResizer implements ISceneResizer {
    constructor(protected designedWidth, protected designedHeight) {
    }
    public GetAvailableSize() {
        return { x: window.innerWidth, y: window.innerHeight};
    }   
    public GetAspectRatio() {
        return this.designedWidth / this.designedHeight;
    }
    public CalculateSize(availableSize : ISize, aspect: number) {
        var maxWidth: number, maxHeight: number;
        maxWidth = aspect * availableSize.y;
        maxHeight = window.innerHeight;
        return { x: maxWidth, y: maxHeight };
    }
    public CalculateScale(newSize: ISize) {
        return newSize.x / this.designedWidth
    }
}

export interface ISize {
    x: number;
    y: number;
}

/**
*   Object passed to the SceneManager handling various aspects of scene resizing.
*
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
