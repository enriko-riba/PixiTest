import { Scene } from "app/_engine/Scene";
import { InGameScene } from "./InGameScene";
import { LevelLoader, ILevelMap, IMapEntity } from "../LevelLoader";
import { vm } from "app/main";
import { Quest } from "../QuestSystem/Quest";
import * as Global from "../Global";

export class LoaderScene extends Scene {
    private loadingMessage: PIXI.Text;
    private spinner: PIXI.Sprite;

    constructor() {
        super("Loader");
        this.BackGroundColor = Global.BACK_COLOR;
    }

    public onUpdate(dt: number){
        if (this.spinner) {
            this.spinner.rotation += 0.05;
        }
    }

    public onActivate = () => {
        this.loadingMessage = new PIXI.Text("Loading", { fontSize: "52px", fontFamily: "Futura", fill: "white", align: "Left", dropShadow: true, stroke: "#44ff44", strokeThickness: 6 });
        this.loadingMessage.anchor.set(0, 0.5);
        this.loadingMessage.position.set(550, 350);
        this.addChild(this.loadingMessage);

        //------------------------------------------------------
        //  get loading image and define callback on image load
        //------------------------------------------------------
        PIXI.loader.reset();
        PIXI.loader.add("assets/_distribute/loading.png")
            .load(this.downloadDefinitions);       
    };

    /**
     *  Downloads JSON files and invokes next level loading.
     */
    private downloadDefinitions = (): void => {

        //   first add a loading spinner
        var loadingTexture = PIXI.Texture.fromImage("assets/_distribute/loading.png");
        this.spinner = new PIXI.Sprite(loadingTexture);
        this.spinner.position.set(500, 350);
        this.spinner.anchor.set(0.5, 0.5);
        this.spinner.scale.set(0.5);
        this.addChild(this.spinner);
        //  this hides the loading HTML text
        vm.isLoadingVisible(false);

        PIXI.loader.reset();
        PIXI.loader.add(["assets/levels/quests.json", "assets/levels/levels.json"])
            .load(() => {
                Global.GameLevels.root = PIXI.loader.resources["assets/levels/levels.json"].data;
                var questsObj = PIXI.loader.resources["assets/levels/quests.json"].data;
                Global.GameLevels.root.quests = questsObj.quests as Array<Quest>;
                Global.GameLevels.root.quests.every((q: Quest) => {
                    q.itemId = q.itemId || 0;
                    q.itemsNeeded = q.itemsNeeded || 0;
                    q.itemsCollected = 0;
                    q.rewardCoins = q.rewardCoins || 0;
                    q.rewardExp = q.rewardExp || 0;
                    return true;
                });
                this.downloadNextLevel();
            });
    }

    private downloadNextLevel = (): void => {
        //Global.UserInfo.gamelevel += 1;
        console.log(`downloading level ${Global.UserInfo.gamelevel}...`);
        
        let assets: string[] = LevelLoader.GetLevelAssets(Global.GameLevels.root as any, Global.UserInfo.gamelevel);

        //  add assets not in level description
        assets = assets.concat(
            [
                "assets/_distribute/gui_fs_enter.png",
                "assets/_distribute/gui_fs_exit.png",
                "assets/_distribute/gui_options.png",
                "assets/_distribute/gui_snd_fx_off.png",
                "assets/_distribute/gui_snd_fx_on.png",
                "assets/_distribute/gui_snd_music_off.png",
                "assets/_distribute/gui_snd_music_on.png",
                "assets/_distribute/slider1.png",

                "assets/_distribute/hero.png",
                "assets/_distribute/hero-dead.png",
                "assets/_distribute/Button1.png",

                "assets/_distribute/heart.png",
                "assets/_distribute/coin.png",
                "assets/_distribute/stat_panel.png",
                "assets/_distribute/exp_panel.png",
                "assets/_distribute/exp_fill.png",
                "assets/_distribute/exp_prefill.png",

                "assets/_distribute/jump_smoke.png",
                "assets/_distribute/bumper_rotor_01.png",

                "assets/_distribute/balloon_01.png",
                "assets/_distribute/balloon_basket_01.png",

                "assets/_distribute/flame.png",
                "assets/_distribute/load.png",
                "assets/_distribute/hit.png",
                "assets/_distribute/rect.png"
            ]
        );
        console.log(`Downloading ${assets.length} assets ...`);

        PIXI.loader.reset();
        PIXI.loader.add(assets)
            .load(this.onAssetsLoaded)
            .on("progress", this.onProgress);
    }

    private onProgress = (loader, resource: PIXI.loaders.Resource) => {
        var progress = loader.progress as number;
        console.log("progress: " + progress.toFixed(0) + "%, asset: " + resource.name);
        this.loadingMessage.text = "Loading " + progress.toFixed(0) + " %";
    };

    private onAssetsLoaded = () => {
        console.log("onAssetsLoaded...");
        this.loadingMessage.text = "Loading 100 %";

        //---------------------------------------------
        //  Bootstrap new game scene or reuse existing
        //---------------------------------------------
        var inGame: InGameScene;
        try {
            inGame = Global.sceneMngr.GetScene("InGame") as InGameScene;
        } catch (e) {
        }
        if (!inGame) {
            inGame = new InGameScene();
            Global.sceneMngr.AddScene(inGame);
        }
        inGame.StartLevel(Global.UserInfo.gamelevel);       

        //  setTimeout is only to make the "100%" noticeable
        setTimeout(() => {
            this.removeChild(this.loadingMessage);            
            //inGame.IsHeroInteractive = true;            
            //Global.sceneMngr.ActivateScene("InGame");
        }, 500);
    };
}