import * as Global from "./Global";
import * as ko from "knockout";

import { Button } from "app/_engine/Button";
import { InGameScene, createParticleEmitter } from "./Scenes/InGameScene";
import { STATCHANGE_TOPIC, IStatChangeEvent, StatType } from "./Player/PlayerStats";

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
    private txtExp: PIXI.Text;
    private expPreFiller: PIXI.Sprite;
    private expFiller: PIXI.Sprite;

    private emitter: PIXI.particles.Emitter;


    private questRect: PIXI.Sprite;
    private txtQuestMessage: PIXI.Text;

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

        var btnFullScreen = new Button("assets/_distribute/gui_fs_enter.png", Global.SCENE_WIDTH - 36, 4);
        this.addChild(btnFullScreen);
        btnFullScreen.on('click', () => {
            this.toggleFullScreen();
            if (this.isFullScreen) {
                btnFullScreen.SetTexture("assets/_distribute/gui_fs_exit.png");
            } else {
                btnFullScreen.SetTexture("assets/_distribute/gui_fs_enter.png");
            }
        });

        var btnOptions = new Button("assets/_distribute/gui_options.png", Global.SCENE_WIDTH - (36 + 32 + 4), 4);
        this.addChild(btnOptions);
        btnOptions.on('click', () => {
            let opt = Global.sceneMngr.GetScene("Options");
            Global.sceneMngr.ActivateScene(opt);
        });


        //  HP
        {
            let y = 5;

            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/stat_panel.png"].texture);
            pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(5, y);
            pnl.scale.set(0.5);
            this.addChild(pnl);

            this.txtHP = new PIXI.Text("0", Global.TXT_STYLE);
            this.txtHP.resolution = window.devicePixelRatio;
            this.txtHP.position = new PIXI.Point(80, y + 15);
            this.addChild(this.txtHP);

            let spr = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/heart.png"].texture);
            spr.position.set(21, y + 17);
            spr.scale.set(0.5);
            this.addChild(spr);
        }

        //  pixi dust
        {
            let y = 90;
            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/stat_panel.png"].texture);
            pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(5, y);
            pnl.scale.set(0.5);
            this.addChild(pnl);

            this.txtDust = new PIXI.Text("0", Global.TXT_STYLE);
            this.txtDust.resolution = window.devicePixelRatio;
            this.txtDust.position = new PIXI.Point(80, y + 15);
            this.addChild(this.txtDust);

            this.emitter = createParticleEmitter(pnl, [PIXI.Texture.fromImage("assets/_distribute/star.png")], { spawnCircle: { x: 0, y: 0, r: 20 } });
            this.emitter.ownerPos.set(65, 90);
            this.emitter.startSpeed = 15;
            this.emitter.maxLifetime = 0.6;
            this.emitter.maxParticles = 50;
            this.emitter.emit = true;
        }

        //  coins
        {
            let y = 170;

            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/stat_panel.png"].texture);
            pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(5, y);
            pnl.scale.set(0.5);
            this.addChild(pnl);

            this.txtCoins = new PIXI.Text("0", Global.TXT_STYLE);
            this.txtCoins.resolution = window.devicePixelRatio;
            this.txtCoins.position = new PIXI.Point(80, y + 15);
            this.addChild(this.txtCoins);

            let spr = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/coin.png"].texture);
            spr.position.set(21, y + 17);
            spr.scale.set(0.5);
            this.addChild(spr);
        }

        //  Exp
        {
            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/exp_panel.png"].texture);
            pnl.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            pnl.position.set(0, Global.SCENE_HEIGHT - pnl.height);
            this.addChild(pnl);

            //  pre filler rect
            this.expPreFiller = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/exp_prefill.png"].texture);
            this.expPreFiller.position.set(3, 3);
            pnl.addChild(this.expPreFiller);

            //  filler rect
            this.expFiller = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/exp_fill.png"].texture);
            this.expFiller.position.set(3, 3);
            pnl.addChild(this.expFiller);
            this.fillLen = pnl.width - 6; // 3 pixels for left/right border;


            this.txtExp = new PIXI.Text("0 / 1000", Global.TXT_SMALL_STYLE);
            this.txtExp.pivot.set(0.5);
            this.txtExp.anchor.set(0.5);
            this.txtExp.resolution = window.devicePixelRatio;
            this.txtExp.position = new PIXI.Point(pnl.width / 2, pnl.height/2);
            pnl.addChild(this.txtExp);

        }


        //  TODO: remove or make a hud for lvl, position
        this.txtLevel = new PIXI.Text("1", Global.TXT_STYLE);
        this.txtLevel.resolution = window.devicePixelRatio;
        this.txtPlayerPosition = new PIXI.Text("", Global.TXT_STYLE);
        this.txtPlayerPosition.resolution = window.devicePixelRatio;

        //  callout for quest message
        this.questRect = new PIXI.Sprite(PIXI.Texture.fromImage("assets/_distribute/rect.png"));
        this.questRect.position.set(Global.SCENE_WIDTH - this.questRect.width - 4, Global.SCENE_HEIGHT - this.questRect.height - 4);
        this.questRect.name = "TriggerMessage";
        this.addChild(this.questRect);

        this.txtQuestMessage = new PIXI.Text("Hello world", Global.QUEST_STYLE);
        this.txtQuestMessage.resolution = window.devicePixelRatio;
        this.txtQuestMessage.position.set(25, 25);
        this.questRect.addChild(this.txtQuestMessage);
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
            case StatType.TotalExp:
                this.renderExp(event);
                break;
            case StatType.CharacterLevel:
                this.handleLevelUp(event);
                break;
        }
    };

    private handleLevelUp = (event: IStatChangeEvent) => {
        this.txtExp.text = `${Math.round(event.Stats[StatType.LevelExp])} / ${event.Stats[StatType.LevelMaxExp]}`;
        this.expFiller.width = 1;
        //  TODO: show level up GUI icon
    };

    private fillLen: number;
    private renderExp(event: IStatChangeEvent) {
        var pct = Math.min(event.Stats[StatType.LevelExp] / event.Stats[StatType.LevelMaxExp], 1.0);

        //  special case during level up
        if (pct === 0) {
            this.expFiller.width = 1;
            this.expPreFiller.position.x = 1 + this.expFiller.x;
            return;
        }

        this.expPreFiller.position.x = this.expFiller.width + this.expFiller.x;
        var targetWidth = (this.fillLen * pct) | 0;

        var diff = targetWidth - this.expFiller.width;

        //  tween pre-fill width
        this.expPreFiller.width = 1;
        var preFillTween = new TWEEN.Tween(this.expPreFiller)
            .to({ width: diff }, 500)
            .easing(TWEEN.Easing.Linear.None);

        var fillTween = new TWEEN.Tween(this.expFiller)
            .to({ width: targetWidth }, 600)
            .easing(TWEEN.Easing.Bounce.Out);
        preFillTween.chain(fillTween).start();

        //this.expFiller.width = (this.fillLen * pct)|0;
        this.txtExp.text = `${Math.round(event.Stats[StatType.LevelExp])} / ${event.Stats[StatType.LevelMaxExp]}`;
    }

    /**
     * Displays the quest message in the quest rectangle.
     * @param msg
     * @param ttlMilis
     */
    public setQuestMessage(msg: string, ttlMilis: number = 8000, onCompleteCB: () => void = null) {
        this.txtQuestMessage.text = msg;
        this.questRect.visible = true;
        this.questMsgEndTime = performance.now() + ttlMilis;
        this.onCompleteCB = onCompleteCB;
    }

    private questMsgEndTime = 0;
    private onCompleteCB?: () => void;

    public onUpdate(dt: number): void {
        this.txtPlayerPosition.text = `${this.heroPosition.x.toFixed(0)}, ${this.heroPosition.y.toFixed(0)}`;
        this.emitter.update(dt * 0.001);

        //  turn off the quest message
        if (this.questRect.visible && this.questMsgEndTime < performance.now()) {
            this.questRect.visible = false;
            if (this.onCompleteCB) {
                this.onCompleteCB();
            }
        }
    }
}