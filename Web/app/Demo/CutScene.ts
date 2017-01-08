import { Scene } from "app/_engine/Scene";
import { Button } from "app/_engine/Button";
import { LevelLoader, ILevelMap, IMapEntity } from "./LevelLoader";
import { InGameScene } from "./InGameScene";
import * as Global from "app/Demo/Global";

export class CutScene extends Scene {
    private textMessage: PIXI.Text;

    constructor() {
        super("CutScene");
        //this.BackGroundColor = 0x1099bb;
        var callout = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/rect.png"].texture);
        callout.anchor.set(0.5);
        callout.position.set(Global.SCENE_WIDTH / 2, Global.SCENE_HEIGHT / 2);
        this.addChild(callout);

        this.textMessage = new PIXI.Text("");
        this.textMessage.anchor.set(0.5);
        this.textMessage.position.set(0, 0);
        callout.addChild(this.textMessage);

        //--------------------------------
        //  btn for next level
        //--------------------------------
        var btnSave = new Button("assets/_distribute/Button1.png",
            (Global.SCENE_WIDTH - Global.BTN_WIDTH) / 2, (Global.SCENE_HEIGHT - Global.BTN_HEIGHT + callout.height + 30) / 2,
            Global.BTN_WIDTH, Global.BTN_HEIGHT);
        btnSave.Text = new PIXI.Text("Continue", Global.BTN_STYLE);
        btnSave.onClick = () => {
            var ig = Global.sceneMngr.GetScene("InGame") as InGameScene;
            Global.sceneMngr.ActivateScene(ig);
            ig.NextLevel();
        };
        this.addChild(btnSave);
    }

    public SetText(text: string, style?: PIXI.ITextStyleStyle) {
        this.textMessage.text = text;
        if (style) {
            this.textMessage.style = style as PIXI.TextStyle;
        }
    }
}