﻿import { SceneManager } from "./SceneManager";

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

    public onUpdate(dt: number) : void {
    }

    public get BackGroundColor():number {
        return this.backgroundColor;
    }
    public set BackGroundColor(color: number) {
        this.backgroundColor = color;
    }

    public get HudOverlay(): PIXI.Container {
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

    public pause():void {
        this.paused = true;
    }
    public resume():void {
        this.paused = false;
    }
    public isPaused():boolean {
        return this.paused;
    }

    private _clear:boolean = true;
    public get clear() {
        return this._clear;
    }

    public set clear(clearFlag: boolean) {
        this._clear = clearFlag;
    }   
}
