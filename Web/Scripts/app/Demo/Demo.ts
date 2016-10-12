import * as ko from "knockout";
import { SceneManager, ISceneResizer, ISize, DefaultResizer } from "app/_engine/SceneManager";
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
        (Global as any).sceneMngr = new SceneManager(Global.SCENE_WIDTH, Global.SCENE_HEIGHT, renderOptions, new CustomSceneResizer(Global.SCENE_WIDTH, Global.SCENE_HEIGHT));

        Global.sceneMngr.AddScene(new LoaderScene());
        Global.sceneMngr.ActivateScene("Loader");
    }
}

class CustomSceneResizer extends DefaultResizer {
    private readonly HEADER_HEIGHT = 50;

    constructor(designedWidth, designedHeight) {
        super(designedWidth, designedHeight);
    }

    public GetAvailableSize() : ISize {
        return { x: window.innerWidth, y: window.innerHeight - this.HEADER_HEIGHT};
    }
}

export = DemoVM;
