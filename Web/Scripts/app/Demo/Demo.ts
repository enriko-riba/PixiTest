import * as ko from "knockout";
import { SceneManager, ISceneResizer, ISize } from "app/_engine/SceneManager";
import { LoaderScene } from "app/Demo/LoaderScene";
import * as Global from "app/Demo/Global";

class DemoVM {

    constructor() {
        if (Global.sceneMngr) {
            Global.sceneMngr.Renderer.destroy();
        }

        //  prepare canvas and scene manager
        var canvas: HTMLCanvasElement = document.getElementById("stage") as HTMLCanvasElement;
        var renderOptions : PIXI.IRendererOptions = {
            view: canvas,
            backgroundColor: 0xff99bb,
            antialias: true,
            transparent: false,
            resolution: window.devicePixelRatio
        };
        (Global as any).sceneMngr = new SceneManager(Global.SCENE_WIDTH, Global.SCENE_HEIGHT, renderOptions, null/*new CustomSceneResizer()*/);

        Global.sceneMngr.AddScene(new LoaderScene());
        Global.sceneMngr.ActivateScene("Loader");
    }
}

class CustomSceneResizer implements ISceneResizer {
    private readonly HEADER_HEIGHT = 50;
    
    public GetAvailableSize() : ISize {
        return { x: window.innerWidth, y: window.innerHeight - this.HEADER_HEIGHT};
    }

    public GetAspectRatio() : number {
        return Global.SCENE_WIDTH / Global.SCENE_HEIGHT;
    }

    public CalculateSize(availableSize: ISize, aspect: number) : ISize {
        return availableSize;
    }

    public CalculateScale(newSize: ISize): number {
        var ratio = Math.min(newSize.x / Global.SCENE_WIDTH, newSize.y / Global.SCENE_HEIGHT);
        return ratio;
    }
}

export = DemoVM;
