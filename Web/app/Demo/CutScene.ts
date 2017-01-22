import { Scene } from "app/_engine/Scene";
import { Button } from "app/_engine/Button";
import { InGameScene } from "./InGameScene";
import { LoaderScene } from "./LoaderScene";
import * as Global from "app/Demo/Global";

export class CutScene extends Scene {
    private textMessage: PIXI.Text;
    private backSprite: PIXI.Sprite;

    constructor() {
        super("CutScene");
        this.BackGroundColor = 0x1099bb;
        var callout: PIXI.Sprite = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/rect.png"].texture);
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
        var btnContinue = new Button("assets/_distribute/Button1.png",
            (Global.SCENE_WIDTH - Global.BTN_WIDTH) / 2, (Global.SCENE_HEIGHT - Global.BTN_HEIGHT + callout.height + 30) / 2,
            Global.BTN_WIDTH, Global.BTN_HEIGHT);
        btnContinue.Text = new PIXI.Text("Continue", Global.BTN_STYLE);
        btnContinue.onClick = () => {
            var ig = Global.sceneMngr.GetScene("InGame") as InGameScene;
            var nextLevel = ig.GetNextLevelId();

            var loderScene = Global.sceneMngr.GetScene("Loader") as LoaderScene;
            loderScene.setNextLevel(nextLevel);
            Global.sceneMngr.ActivateScene(loderScene);
        };
        this.addChild(btnContinue);
    }

    public SetBackGround(texture : PIXI.RenderTexture, scale) {
        if (!this.backSprite) {
            this.backSprite = new PIXI.Sprite(texture);
            this.addChildAt(this.backSprite, 0);
        } else {
            this.backSprite.texture = texture;
        }
        this.backSprite.scale.set(1 / scale.x, 1 / scale.y);  //  rescale to fit full scene
    }

    public SetText(text: string, style?: PIXI.ITextStyleStyle) {
        this.textMessage.text = text;
        if (style) {
            this.textMessage.style = style as PIXI.TextStyle;
        }
    }
}