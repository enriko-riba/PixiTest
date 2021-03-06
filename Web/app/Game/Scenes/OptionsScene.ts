﻿import { Scene } from "app/_engine/Scene";
import { Button } from "app/_engine/Button";
import { Slider } from "app/_engine/Slider";
import * as Global from "../Global";

/**
 *   Main options GUI.
 */
export class OptionsScene extends Scene {

    private currentMusicTrack: number = 0; 
    private TEXT_STYLE: PIXI.TextStyleOptions =
    {
        align: "left",
        padding: 0,
        fontSize: "22px",
        fontFamily: Global.fontFamily,
        fill: 0xaaaa13,
        strokeThickness: 3,
        stroke: 0x0f0f2f,
    };

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
        btnBack.text = new PIXI.Text("Back to game", Global.BTN_STYLE);
        btnBack.onClick = () => {
            this.resetSounds();
            Global.sceneMngr.ActivateScene("InGame");
        };
        this.addChild(btnBack);

        //--------------------
        //  restart level
        //--------------------
        var btnRestart = new Button("assets/_distribute/Button1.png", HALF_BTN_WIDTH * 3.5, BTN_Y, Global.BTN_WIDTH, Global.BTN_HEIGHT);
        this.addChild(btnRestart);
        btnRestart.text = new PIXI.Text("Restart level", Global.BTN_STYLE);
        btnRestart.onClick = () => {
            this.resetSounds();
            Global.sceneMngr.ActivateScene("Loader");
        };

        //--------------------
        //  quit game
        //--------------------
        var btnQuit = new Button("assets/_distribute/Button1.png", HALF_BTN_WIDTH * 6, BTN_Y, Global.BTN_WIDTH, Global.BTN_HEIGHT);
        this.addChild(btnQuit);
        btnQuit.text = new PIXI.Text("Quit game", Global.BTN_STYLE);
        btnQuit.onClick = () => {
            this.resetSounds();
            window.location.href = "#home";
        };

        //--------------------
        //  fx button
        //--------------------
        var btnFx = new Button("assets/_distribute/gui_snd_fx_on.png", HALF_BTN_WIDTH, Global.BTN_HEIGHT * 1, 32, 32);
        this.addChild(btnFx);
        btnFx.onClick = () => {
            Global.snd.IsFxOn = !Global.snd.IsFxOn;
            if (Global.snd.IsFxOn) {
                fxSlider.Value = 1;
            } else {
                fxSlider.Value = 0;
            }
        };

        var fxSlider = new Slider("assets/_distribute/slider1.png", 10, Global.BTN_WIDTH, (Global.BTN_HEIGHT * 1) + 1, 150, 30);
        this.addChild(fxSlider);

        var fxTxt = new PIXI.Text("0", this.TEXT_STYLE);
        fxTxt.position.set(fxSlider.x + fxSlider.width + 20, fxSlider.y + 2);
        this.addChild(fxTxt);

        fxSlider.on('valueChange', (v:number) => {
            fxTxt.text = (v * 100).toFixed(2).toString();
            Global.snd.FxVolume = v;
            Global.snd.fxDemo.volume(v);
        });
        fxSlider.on('valueChanged', (v:number) => {
            Global.snd.fxDemo.volume(v);
            let tname = "assets/_distribute/gui_snd_fx_" + (Global.snd.IsFxOn ? "on.png" : "off.png");
            btnFx.setTexture(tname);
        });
        fxSlider.Value = Global.snd.FxVolume;


        //--------------------
        //  music button
        //--------------------
        var btnMusic = new Button("assets/_distribute/gui_snd_music_on.png", HALF_BTN_WIDTH, Global.BTN_HEIGHT * 2, 32, 32);
        this.addChild(btnMusic);
        btnMusic.onClick = () => {
            Global.snd.IsMusicOn = !Global.snd.IsMusicOn;
            if (Global.snd.IsMusicOn) {
                musicSlider.Value = 0.6;
            } else {
                musicSlider.Value = 0;
            }
        };

        var musicSlider = new Slider("assets/_distribute/slider1.png", 10, Global.BTN_WIDTH, Global.BTN_HEIGHT * 2 + 1, 150, 30);
        this.addChild(musicSlider);

        var mTxt = new PIXI.Text("0", this.TEXT_STYLE);
        mTxt.position.set(musicSlider.x + musicSlider.width + 20, musicSlider.y + 2);
        this.addChild(mTxt);

        musicSlider.on('valueChange', (v:number) => {
            mTxt.text = (v * 100).toFixed(2).toString();
            Global.snd.MusicVolume = v;
        });
        musicSlider.on('valueChanged', (v:number) => {
            let tname = "assets/_distribute/gui_snd_music_" + (Global.snd.IsMusicOn ? "on.png" : "off.png");
            btnMusic.setTexture(tname);
        });
        musicSlider.Value = Global.snd.MusicVolume;
    };

    public onActivate = () => {
        this.currentMusicTrack = Global.snd.CurrentTrackId;
        Global.snd.playTrack(Global.snd.getTrack('music-demo'));
        Global.snd.fxDemo.play();
        Global.snd.fxDemo.loop(true);
        Global.snd.fxDemo.volume(Global.snd.FxVolume);
    };

    private resetSounds() {
        Global.snd.fxDemo.stop();
        Global.snd.playTrack(this.currentMusicTrack);
    }
}
