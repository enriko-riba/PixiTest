import { Scene } from "app/_engine/Scene";
import { Button } from "app/_engine/Button";
import { LoadMenuScene } from "app/Demo/LoadMenuScene";
import { InGameScene } from "app/Demo/InGameScene";
import * as Global from "app/Demo/Global";

/**
*   Main menu GUI.
*/
export class MainMenuScene extends Scene {

    /**
    *   Creates a new scene instance.
    */
    constructor() {
        super("MainMenu");
        this.setup();
    }

    private setup = () => {

        var loadScene = new LoadMenuScene();
        var inGame = new InGameScene();
        Global.sceneMngr.AddScene(loadScene);
        Global.sceneMngr.AddScene(inGame);

        var x = (Global.SCENE_WIDTH - Global.BTN_WIDTH) / 2;
        //  new, load, quit buttons
        //var btnNew = new Button("Assets/Images/Gui/Button1.png", x, 130 + 0 * Global.BTN_HEIGHT, Global.BTN_WIDTH * 2, Global.BTN_HEIGHT);
        //btnNew.anchor.set(0.5, 0);
        //btnNew.Text = new PIXI.Text("New", Global.BTN_STYLE);
        //btnNew.onClick = () => { Global.sceneMngr.ActivateScene(newScene); }
        //this.addChild(btnNew);


        var btnLoad = new Button("Assets/Images/Gui/Button1.png", x, 145 + 1 * Global.BTN_HEIGHT, Global.BTN_WIDTH * 2, Global.BTN_HEIGHT);
        //btnLoad.anchor.set(0.5, 0);
        btnLoad.Text = new PIXI.Text("Start", Global.BTN_STYLE);
        btnLoad.onClick = () => { Global.sceneMngr.ActivateScene(inGame); }
        this.addChild(btnLoad)


        var btnQuit = new Button("Assets/Images/Gui/Button1.png", x, 160 + 2 * Global.BTN_HEIGHT, Global.BTN_WIDTH * 2, Global.BTN_HEIGHT);
        //btnQuit.anchor.set(0.5, 0);
        btnQuit.Text = new PIXI.Text("Quit", Global.BTN_STYLE);
        btnQuit.onClick = () => window.location.href = "#home";
        this.addChild(btnQuit);
    }
}
