import { SceneManager } from "./SceneManager";

/**
*   Represents a scene. 
*   Only one scene at a time is rendered.
*/
export class Scene extends PIXI.Container {
    private paused: boolean = false;
    private hudScene: PIXI.Container;
    private backgroundColor: number;
    public sceneManager: SceneManager;

    public onActivate: () => void;
    public onUpdate: () => void;
    public onResize: () => void;


    /**
    *   Creates a new scene instance.
    *   @param name the scene name.
    */
    constructor(name: string) {
        super();
        this.backgroundColor = 0x0;
        this.Name = name;
    }

    public Name: string;

    public get BackGroundColor() {
        return this.backgroundColor;
    }
    public set BackGroundColor(color: number) {
        this.backgroundColor = color;
    }

    public get HudOverlay() {
        return this.hudScene;
    }
    public set HudOverlay(hud: PIXI.Container) {
        if (this.hudScene) {
            this.removeChild(this.hudScene);
        }
        this.hudScene = hud;

        if (hud) {
            var maxIndex = this.children.length;
            this.addChildAt(this.hudScene, maxIndex);
        }
    }

    public addChild(child: PIXI.DisplayObject): PIXI.DisplayObject {
        var dispObj = super.addChild(child);
        if (this.hudScene) {
            var maxIndex = this.children.length - 1;
            this.setChildIndex(this.hudScene, maxIndex);
        }
        return dispObj;
    }

    public addChildAt(child: PIXI.DisplayObject, index: number): PIXI.DisplayObject {
        var dispObj = super.addChildAt(child, index);
        if (this.hudScene) {
            var maxIndex = this.children.length - 1;
            this.setChildIndex(this.hudScene, maxIndex);
        }
        return dispObj;
    }

    public pause() {
        this.paused = true;
    }
    public resume() {
        this.paused = false;
    }
    public isPaused() {
        return this.paused;
    }
}
