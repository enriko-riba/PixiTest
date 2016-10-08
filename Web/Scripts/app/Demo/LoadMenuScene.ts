import { Scene } from "app/_engine/Scene";
import { Button } from "app/_engine/Button";
import * as Global from "app/Demo/Global";

/**
*   Load menu.
*/
export class LoadMenuScene extends Scene {

    /**
    *   Creates a new scene instance.
    */
    constructor() {
        super("LoadMenu");
        this.setup();
    }

    private setup = () => {
        //  new, load, quit buttons
        var btnLoad = new Button("Assets/Images/Gui/Button1.png", 10, 30 + 0 * Global.BTN_HEIGHT, Global.BTN_WIDTH * 2, Global.BTN_HEIGHT);
        btnLoad.Text = new PIXI.Text("Load", Global.BTN_STYLE);
        this.addChild(btnLoad);

        var btnBack = new Button("Assets/Images/Gui/Button1.png", 10, 35 + 1 * Global.BTN_HEIGHT, Global.BTN_WIDTH * 2, Global.BTN_HEIGHT);
        btnBack.Text = new PIXI.Text("Back", Global.BTN_STYLE);
        this.addChild(btnBack);
        btnBack.onClick = () => Global.sceneMngr.ActivateScene("MainMenu");
    }
}