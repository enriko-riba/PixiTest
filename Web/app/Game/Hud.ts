import * as Global from "./Global";
import * as ko from "knockout";

import { Button } from "app/_engine/Button";
import { InGameScene, createParticleEmitter } from "./InGameScene";
import { STATCHANGE_TOPIC, IStatChangeEvent, StatType } from "./PlayerStats";

export class Hud extends PIXI.Container {
    constructor() {
        super();
        this.setup();
    }

    public heroLevel: string = "1";
    public heroPosition: PIXI.Point;

    private txtPlayerPosition: PIXI.Text;
    private txtLevel: PIXI.Text;
    private txtCoins: PIXI.Text;
    private txtDust: PIXI.Text;
    private txtHP: PIXI.Text;

    private emitter: PIXI.particles.Emitter;

    private get isFullScreen(): boolean {
        var doc: any = document;
        return !(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement);
    }

    private toggleFullScreen() {
        var doc: any = document;
        var docElm: any = document.documentElement;

        var requestFullScreen = docElm.requestFullscreen || docElm.mozRequestFullScreen || docElm.webkitRequestFullScreen || docElm.msRequestFullscreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (!this.isFullScreen) {
            requestFullScreen.call(docElm);
        } else {
            cancelFullScreen.call(doc);
        }
    }

    private setup(): void {

        ko.postbox.subscribe<IStatChangeEvent>(STATCHANGE_TOPIC, this.handleStatChange);

/*
        //--------------------------------
        //  btn for level editor support
        //--------------------------------
        var btnSave = new Button("assets/_distribute/Button1.png",
            Global.SCENE_WIDTH - Global.BTN_WIDTH - 10, 10,
            Global.BTN_WIDTH, Global.BTN_HEIGHT);
        btnSave.Text = new PIXI.Text("Console dump", Global.BTN_STYLE);
        btnSave.onClick = () => {
            var igs = Global.sceneMngr.CurrentScene as InGameScene;
            igs.saveLevel();
        };
        this.addChild(btnSave);
        */
        var btnFullScreen = new Button("assets/_distribute/gui_fs_enter.png",
            Global.SCENE_WIDTH - 100,
            10);
        this.addChild(btnFullScreen);
        btnFullScreen.onClick = () => {
            this.toggleFullScreen();
            if (this.isFullScreen) {
                btnFullScreen.SetTexture("assets/_distribute/gui_fs_exit.png");
            } else {
                btnFullScreen.SetTexture("assets/_distribute/gui_fs_enter.png");
            }
        };

        let txtPosition = new PIXI.Point(70, 18);
        //  HP
        {
            this.txtHP = new PIXI.Text("0", Global.TXT_STYLE);
            this.txtHP.resolution = window.devicePixelRatio;
            this.txtHP.position = txtPosition;
            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/stat_panel.png"].texture);
            let spr = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/heart.png"].texture);
            spr.position.set(16, 18);
            spr.scale.set(0.5);
            pnl.position.set(5, 5);
            pnl.addChild(spr);
            pnl.addChild(this.txtHP);
            this.addChild(pnl);
        }

        //  pixi dust
        {
            this.txtDust = new PIXI.Text("0", Global.TXT_STYLE);
            this.txtDust.resolution = window.devicePixelRatio;
            this.txtDust.position = txtPosition;
            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/stat_panel.png"].texture);
            this.emitter = createParticleEmitter(pnl, [PIXI.Texture.fromImage("assets/_distribute/star.png")]);
            this.emitter.ownerPos.set(32, 58);
            this.emitter.startSpeed = 15;
            this.emitter.maxLifetime = 0.6;
            this.emitter.maxParticles = 50;
            this.emitter.emit = true;
            pnl.position.set(5, 90);
            pnl.addChild(this.txtDust);
            this.addChild(pnl);
        }

        //  coins
        {
            this.txtCoins = new PIXI.Text("0", Global.TXT_STYLE);
            this.txtCoins.resolution = window.devicePixelRatio;
            this.txtCoins.position = txtPosition;
            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/stat_panel.png"].texture);
            let spr = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/coin.png"].texture);
            spr.position.set(16, 18);
            spr.scale.set(0.5);
            pnl.position.set(5, 170);
            pnl.addChild(spr);
            pnl.addChild(this.txtCoins);
            this.addChild(pnl);
        }

        //  TODO: remove or make a hud for lvl, position
        this.txtLevel = new PIXI.Text("1", Global.TXT_STYLE);
        this.txtLevel.resolution = window.devicePixelRatio;
        this.txtPlayerPosition = new PIXI.Text("", Global.TXT_STYLE);
        this.txtPlayerPosition.resolution = window.devicePixelRatio;
    }

    private handleStatChange = (event: IStatChangeEvent) => {
        switch (event.Type) {
            case StatType.Coins:
                this.txtCoins.text = event.NewValue.toString();
                break;
            case StatType.Dust:
                this.txtDust.text = `${event.NewValue.toFixed(0)} / ${event.Stats[StatType.MaxDust].toFixed(0)}`;
                break;
            case StatType.MaxDust:
                this.txtDust.text = `${Math.floor(event.Stats[StatType.Dust])} / ${event.NewValue.toFixed(0)}`;
                break;
            case StatType.HP:
                this.txtHP.text = `${Math.round(event.NewValue)} / ${event.Stats[StatType.MaxHP]}`;
                break;
            case StatType.MaxHP:
                this.txtHP.text = `${Math.round(event.Stats[StatType.HP])} / ${event.NewValue}`;
                break;
        }
    };

    public onUpdate(dt: number): void {
        this.txtPlayerPosition.text = `${this.heroPosition.x.toFixed(0)}, ${this.heroPosition.y.toFixed(0)}`;
        this.emitter.update(dt * 0.001);
    }
}