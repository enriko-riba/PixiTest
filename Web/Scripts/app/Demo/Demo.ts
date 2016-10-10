import * as ko from "knockout";
import { SceneManager } from "app/_engine/SceneManager";
import { LoaderScene } from "app/Demo/LoaderScene";
import * as Global from "app/Demo/Global";

class DemoVM {

    constructor() {
        if (Global.sceneMngr) {
            Global.sceneMngr.Renderer.destroy();
        }

        //  prepare canvas and scene manager
        var canvas: HTMLCanvasElement = document.getElementById("stage") as HTMLCanvasElement;
        var renderOptions = {
            view: canvas,
            backgroundColor: 0xff99bb,
            antialias: true,
            transparent: false,
            resolution: window.devicePixelRatio
        };
        (Global as any).sceneMngr = new SceneManager(Global.SCENE_WIDTH, Global.SCENE_HEIGHT, renderOptions, this.customResizer);

        Global.sceneMngr.AddScene(new LoaderScene());
        Global.sceneMngr.ActivateScene("Loader");
    }

    private customResizer = () => {
        const HEADER_HEIGHT = 50;
        const FOOTER_HEIGHT = 50;
        var w = window.innerWidth;
        var h = window.innerHeight - HEADER_HEIGHT;

        var ratio = Math.min(w / Global.SCENE_WIDTH, h / Global.SCENE_HEIGHT);
        Global.sceneMngr.CurrentScene.scale.set(ratio);

        // Update the renderer dimensions
        Global.sceneMngr.Renderer.resize(w, Math.ceil(Global.SCENE_HEIGHT * ratio));
    }
}

export = DemoVM;
