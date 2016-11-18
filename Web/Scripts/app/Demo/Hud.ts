import * as Global from "./Global";
import { InGameScene, createParticleEmitter } from "./InGameScene";
import { Button } from "app/_engine/Button";

export class Hud extends PIXI.Container {
    constructor() {
        super();
        this.setup();
    }

    public heroLevel: string = "1";
    public heroPosition: PIXI.Point;
    public coins: number = 0;

    private txtPosition: PIXI.Text;
    private txtLevel: PIXI.Text;
    private txtCoins: PIXI.Text;

    private emitter: PIXI.particles.Emitter;

    private setup(): void {
        
        //--------------------------------
        //  btn for level editor support
        //--------------------------------
        var btnSave = new Button("assets/images/Gui/Button1.png",
            Global.SCENE_WIDTH - Global.BTN_WIDTH - 10, 10,
            Global.BTN_WIDTH, Global.BTN_HEIGHT);
        btnSave.Text = new PIXI.Text("Save", Global.BTN_STYLE);
        btnSave.onClick = () => {
            var igs = Global.sceneMngr.CurrentScene as InGameScene;
            igs.saveLevel();
        };

        this.addChild(btnSave);

        //var pnl = new PIXI.Sprite(PIXI.loader.resources["assets/images/Gui/TestHUD.png"].texture);
        //pnl.position.set(5, 5);
        //this.addChild(pnl);


        //  HP
        {
            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/images/Gui/stat_panel.png"].texture);
            let spr = new PIXI.Sprite(PIXI.loader.resources["assets/images/Gui/heart.png"].texture);
            spr.position.set(15, 15);
            spr.scale.set(0.5);
            pnl.position.set(5, 5);
            pnl.addChild(spr);
            this.addChild(pnl);
        }

        //  pixi dust
        {
            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/images/Gui/stat_panel.png"].texture);
            this.emitter = createParticleEmitter(pnl);
            this.emitter.ownerPos.set(30, 55);
            this.emitter.startSpeed = 15;
            this.emitter.maxLifetime = 0.6;
            this.emitter.maxParticles = 50;
            this.emitter.emit = true;
            pnl.position.set(5, 90);
            this.addChild(pnl);
        }

        //  coins
        {
            this.txtCoins = new PIXI.Text("0", Global.TXT_STYLE);
            this.txtCoins.resolution = window.devicePixelRatio;
            this.txtCoins.position.set(70, 17);
            let pnl = new PIXI.Sprite(PIXI.loader.resources["assets/images/Gui/stat_panel.png"].texture);
            let spr = new PIXI.Sprite(PIXI.loader.resources["assets/images/Gui/coin.png"].texture);
            spr.position.set(15, 15);
            spr.scale.set(0.5);
            pnl.position.set(5, 170);
            pnl.addChild(spr);
            pnl.addChild(this.txtCoins);
            this.addChild(pnl);
        }

        this.txtLevel = new PIXI.Text("1", Global.TXT_STYLE);
        this.txtLevel.resolution = window.devicePixelRatio;
        //this.txtLevel.position.set(70, 20);
        //pnl.addChild(this.txtLevel);

        this.txtPosition = new PIXI.Text("", Global.TXT_STYLE);
        this.txtPosition.resolution = window.devicePixelRatio;
        //this.txtPosition.position.set(15, 215);
        //pnl.addChild(this.txtPosition);

    }

    public onUpdate(dt: number): void {
        this.txtLevel.text = this.heroLevel.toString();//`Level:  ${this.heroLevel}`;
        this.txtCoins.text = this.coins.toString();//`Coins:  ${this.coins}`;
        this.txtPosition.text = `${this.heroPosition.x.toFixed(0)}, ${this.heroPosition.y.toFixed(0)}`;
        this.emitter.update(dt * 0.001);
    }
}