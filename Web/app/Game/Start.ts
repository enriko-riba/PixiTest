﻿import * as ko from "knockout";
import { vm } from "app/main";
import { ViewModelBase, RouteNavigationData } from "app/_framework/SpaApplication";
import { SceneManager, ISceneResizer, ISize, DefaultResizer } from "app/_engine/SceneManager";
import * as Global from "./Global";
import { LoaderScene } from "./Scenes/LoaderScene";
import { SoundMan } from "./SoundMan";

class StartVM extends ViewModelBase{

    constructor() {
        super();        

        vm.isLoadingVisible(true);
        if (Global.stats.id === 0) {
            window.location.hash = "#login";
            return;
        }

        //  prepare canvas and scene manager
        var canvas: HTMLCanvasElement = document.getElementById("stage") as HTMLCanvasElement;
        var renderOptions : PIXI.RendererOptions = {
            view: canvas,
            backgroundColor: 0x684123,
            antialias: true,
            transparent: false,
            roundPixels: false,
            resolution: window.devicePixelRatio
        };
        (Global as any).sceneMngr = new SceneManager(Global.SCENE_WIDTH, Global.SCENE_HEIGHT, renderOptions, new CustomSceneResizer(Global.SCENE_WIDTH, Global.SCENE_HEIGHT));
        (Global as any).snd = new SoundMan(); 
        Global.sceneMngr.AddScene(new LoaderScene());
        Global.sceneMngr.ActivateScene("Loader");
    }

    protected OnDeactivate(data: RouteNavigationData) {
        if (Global.sceneMngr) {            
            Global.sceneMngr.Destroy();
        }
    }
}

/**
 * Resizes the scene to fit vertically
 */
class CustomSceneResizer extends DefaultResizer {
    constructor(designedWidth, designedHeight) {
        super(designedWidth, designedHeight);
    }

    public GetAvailableSize(): ISize {
        return { x: window.innerWidth, y: window.innerHeight };
        //return { x: Math.min(window.innerWidth, this.designedWidth), y: Math.min(window.innerHeight, this.designedHeight)};
    }
    public CalculateSize(availableSize: ISize, aspect: number): ISize {
        var maxWidth: number, maxHeight: number;
        maxWidth = Math.floor(aspect * availableSize.y);
        maxHeight = Math.floor(window.innerHeight);
        //return { x: availableSize.x, y: Math.min(maxHeight, availableSize.y) };
        return { x: Math.min(maxWidth, availableSize.x), y: Math.min(maxHeight, availableSize.y) };
    }
    public CalculateScale(newSize: ISize): number {
        //let aspect = this.GetAspectRatio();
        //return Math.floor(aspect * newSize.y) / this.designedWidth;
        return newSize.x / this.designedWidth;
    }
}

export = StartVM;
