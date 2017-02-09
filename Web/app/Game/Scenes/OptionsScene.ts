import { Scene } from "app/_engine/Scene";
import { Button } from "app/_engine/Button";
import { Slider } from "app/_engine/Slider";
import { InGameScene } from "./InGameScene";
import * as Global from "../Global";

/**
 *   Main options GUI.
 */
export class OptionsScene extends Scene {

    private currentMusicTrack: number = 0; 

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

            //  reset sounds
            Global.snd.fxDemo.stop();
            Global.snd.playTrack(this.currentMusicTrack);
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

        //--------------------
        //  fx button
        //--------------------
        var btnFx = new Button("assets/_distribute/gui_snd_fx_on.png", HALF_BTN_WIDTH, Global.BTN_HEIGHT * 1, 32, 32);
        btnFx.onClick = () => {
            Global.snd.IsFxOn = !Global.snd.IsFxOn;
            if (Global.snd.IsFxOn) {
                fxSlider.Value = 1;
            } else {
                fxSlider.Value = 0;
            }

            let tname = "assets/_distribute/gui_snd_fx_" + (Global.snd.IsFxOn ? "on.png" : "off.png");
            btnFx.SetTexture(tname);            
        };
        this.addChild(btnFx);
        var fxSlider = new Slider("assets/_distribute/slider1.png", 7, Global.BTN_WIDTH, (Global.BTN_HEIGHT * 1) + 7, 150, 18);
        this.addChild(fxSlider);
        var fxTxt = new PIXI.Text("0", Global.QUEST_STYLE);
        fxTxt.position.set(fxSlider.x + fxSlider.width + 20, fxSlider.y -5);
        this.addChild(fxTxt);
        fxSlider.on('valueChange', (v) => {
            fxTxt.text = (v * 100).toFixed(2).toString();
            Global.snd.FxVolume = v
            Global.snd.fxDemo.volume(v);
        });
        fxSlider.on('valueChanged', (v) => {
            Global.snd.FxVolume = v
        });
        fxSlider.Value = Global.snd.FxVolume;


        //--------------------
        //  music button
        //--------------------
        var btnMusic = new Button("assets/_distribute/gui_snd_music_on.png", HALF_BTN_WIDTH, Global.BTN_HEIGHT * 2, 32, 32);
        btnMusic.onClick = () => {
            Global.snd.IsMusicOn = !Global.snd.IsMusicOn;
            if (Global.snd.IsMusicOn) {
                musicSlider.Value = 0.8;
            } else {
                musicSlider.Value = 0;
            }

            let tname = "assets/_distribute/gui_snd_music_" + (Global.snd.IsMusicOn ? "on.png" : "off.png");
            btnMusic.SetTexture(tname);            
        };
        this.addChild(btnMusic);
        var musicSlider = new Slider("assets/_distribute/slider1.png", 7, Global.BTN_WIDTH, Global.BTN_HEIGHT * 2 + 7, 150, 18);
        this.addChild(musicSlider);
        var mTxt = new PIXI.Text("0", Global.QUEST_STYLE);
        mTxt.position.set(musicSlider.x + musicSlider.width + 20, musicSlider.y -5);
        this.addChild(mTxt);
        musicSlider.on('valueChange', (v) => {
            mTxt.text = (v * 100).toFixed(2).toString();
            Global.snd.MusicVolume = v
        });
        musicSlider.on('valueChanged', (v) => {
            Global.snd.MusicVolume = v
        });
        musicSlider.Value = Global.snd.MusicVolume;
    }

    public onActivate = ()=> {
        this.currentMusicTrack = Global.snd.CurrentTrackId;
        Global.snd.playTrack(Global.snd.getTrack('music-demo'));
        Global.snd.fxDemo.play();
        Global.snd.fxDemo.loop(true);
        Global.snd.fxDemo.volume(Global.snd.FxVolume);
    }
}
