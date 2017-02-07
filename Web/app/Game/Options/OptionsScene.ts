import { Scene } from "app/_engine/Scene";
import { Button } from "app/_engine/Button";
import { InGameScene } from "app/Game/InGameScene";
import * as Global from "app/Game/Global";

/**
 *   Main options GUI.
 */
export class OptionsScene extends Scene {

    /**
    *   Creates a new scene instance.
    */
    constructor() {
        super("Options");
        this.BackGroundColor = Global.BACK_COLOR;

        this.setup();
    }

    private setup = () => {
        let HALF_BTN_WIDTH = Global.BTN_WIDTH / 2;
        let BTN_Y = Global.SCENE_HEIGHT - Global.BTN_HEIGHT - (Global.BTN_HEIGHT / 2);

        //--------------------
        //  back to game
        //--------------------
        var btnBack = new Button("assets/_distribute/Button1.png", HALF_BTN_WIDTH, BTN_Y, Global.BTN_WIDTH, Global.BTN_HEIGHT);
        btnBack.Text = new PIXI.Text("Back to game", Global.BTN_STYLE);
        btnBack.onClick = () => {
            let inGame = Global.sceneMngr.GetScene("InGame") as InGameScene;
            Global.sceneMngr.ActivateScene(inGame);
        };
        this.addChild(btnBack);

        //--------------------
        //  restart level
        //--------------------
        var btnRestart = new Button("assets/_distribute/Button1.png", HALF_BTN_WIDTH * 3.5, BTN_Y, Global.BTN_WIDTH, Global.BTN_HEIGHT);
        btnRestart.Text = new PIXI.Text("Restart level", Global.BTN_STYLE);
        btnRestart.onClick = () => {
            Global.UserInfo.gamelevel--;
            let loderScene = Global.sceneMngr.GetScene("Loader");
            Global.sceneMngr.ActivateScene(loderScene);
        };
        this.addChild(btnRestart);

        //--------------------
        //  quit game
        //--------------------
        var btnQuit = new Button("assets/_distribute/Button1.png", HALF_BTN_WIDTH * 6, BTN_Y, Global.BTN_WIDTH, Global.BTN_HEIGHT);
        btnQuit.Text = new PIXI.Text("Quit game", Global.BTN_STYLE);
        btnQuit.onClick = () => window.location.href = "#home";
        this.addChild(btnQuit);
        
        var btnFx = new Button("assets/_distribute/gui_snd_fx_on.png", HALF_BTN_WIDTH, Global.BTN_HEIGHT * 1, 32, 32);
        btnFx.onClick = () => {
            Global.snd.IsFxOn = !Global.snd.IsFxOn;
            let tname = "assets/_distribute/gui_snd_fx_" + (Global.snd.IsFxOn ? "on.png" : "off.png");
            btnFx.SetTexture(tname);
        };
        this.addChild(btnFx);

        var btnMusic = new Button("assets/_distribute/gui_snd_music_on.png", HALF_BTN_WIDTH, Global.BTN_HEIGHT * 2, 32, 32);
        btnMusic.onClick = () => {
            Global.snd.IsMusicOn = !Global.snd.IsMusicOn;
            let tname = "assets/_distribute/gui_snd_music_" + (Global.snd.IsMusicOn ? "on.png" : "off.png");
            btnMusic.SetTexture(tname);
        };
        this.addChild(btnMusic);
    }
}
