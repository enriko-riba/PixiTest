import { Scene } from "app/_engine/Scene";
import { Button } from "app/_engine/Button";
import { InGameScene } from "./InGameScene";
import { SoundMan } from "../SoundMan";
import * as Global from "../Global";

export class CutScene extends Scene {
    private callout: PIXI.Sprite;
    private textMessage: PIXI.Text;
    private backSprite: PIXI.Sprite;
    private deathScene: boolean = false;
    private corpse: PIXI.Sprite;
    private btnContinue: Button;
        
    constructor() {
        super("CutScene");
        this.BackGroundColor = 0x1099bb;


        this.corpse = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/hero-dead.png"].texture);
        this.corpse.anchor.set(0.5);
        this.corpse.pivot.set(0.5);
        this.corpse.position.set(Global.SCENE_WIDTH/2, Global.SCENE_HEIGHT/2); 
        this.addChild(this.corpse);

        var blur = new PIXI.filters.BlurFilter();
        this.corpse.filters = [blur];


        this.callout = new PIXI.Sprite(PIXI.loader.resources["assets/_distribute/rect.png"].texture);
        this.callout.anchor.set(0.5);
        this.callout.position.set(Global.SCENE_WIDTH / 2, Global.SCENE_HEIGHT / 2);
        this.addChild(this.callout);

        this.textMessage = new PIXI.Text("");
        this.textMessage.anchor.set(0.5);
        this.textMessage.position.set(0, 0);
        this.callout.addChild(this.textMessage);

        //--------------------------------
        //  btn for next level
        //--------------------------------
        this.btnContinue = new Button("assets/_distribute/Button1.png",
            (Global.SCENE_WIDTH - Global.BTN_WIDTH) / 2, (Global.SCENE_HEIGHT - Global.BTN_HEIGHT + this.callout.height + 30) / 2,
            Global.BTN_WIDTH, Global.BTN_HEIGHT);
        this.btnContinue.Text = new PIXI.Text("Continue", Global.BTN_STYLE);
        this.btnContinue.onClick = () => {            
            Global.sceneMngr.ActivateScene("Loader");
        };
        this.addChild(this.btnContinue);
    }

    public onActivate = () => {
        this.btnContinue.visible = !this.deathScene;
        this.callout.visible = !this.deathScene;
        this.corpse.visible = this.deathScene;
        this.corpse.scale.set(0.1);
        this.btnContinue.Text.text = this.deathScene ? "Retry" : "Continue";

        if (this.deathScene) {
            var deathTrackId = Global.snd.getTrack("Carrousel");
            Global.snd.playTrack(deathTrackId);
        }
    }

    public onUpdate(dt: number) {
        if (this.deathScene) {
            if (this.corpse.scale.x < 8) {
                this.corpse.rotation += 0.1;
                var scale = this.corpse.scale.x + 0.04;
                this.corpse.scale.set(scale);
            } else {
                this.deathScene = false;
                Global.UserInfo.gamelevel--;

                this.textMessage.text = this.deathMessages[0 | (Math.random() * this.deathMessages.length)];
                this.callout.visible = true;
                this.btnContinue.visible = true;
            }
        } else {
            this.corpse.rotation += 0.005;
            var blurFilter = this.corpse.filters[0] as PIXI.filters.BlurFilter;
            blurFilter.blur = Math.min(blurFilter.blur + 0.08, 15.0);
        }
    }

    /**
     * If true the player death scene is played.
     */
    public get DeathScene() {
        return this.deathScene;
    }
    public set DeathScene(value: boolean) {
        this.deathScene = value;    
        if (this.deathScene) {
            (this.corpse.filters[0] as PIXI.filters.BlurFilter).blur = 0;
        }    
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

    private deathMessages: string[] = [
        "Life sucks and you just died!",
        "You decided to check the afterlife.\nGuess what? You are dead!",
        "Owned!\nMore luck next time.",
        "You have died!\nRest in peace.",
        "Your quest has failed.\nMay you find more peace\nin that world than\nyou found in this one.",
        "Here's a picture of your corpse.\nNot pretty!",
        "Yep, you're dead.\nMaybe you should consider\nplaying a Barbie game!",
        "Died..."
    ];
}