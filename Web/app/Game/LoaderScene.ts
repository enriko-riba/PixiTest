import { Scene } from "app/_engine/Scene";
import { InGameScene } from "app/Game/InGameScene";
import { LevelLoader, ILevelMap, IMapEntity } from "./LevelLoader";

import * as Global from "app/Game/Global";
import { vm } from "app/main";

export class LoaderScene extends Scene {
    private loadingMessage: PIXI.Text;
    private spinner: PIXI.Sprite;

    constructor() {
        super("Loader");
        this.BackGroundColor = 0x1060a0;
    }

    public onUpdate = (dt: number) => {
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
            .load(this.downloadNextLevel);

        //  this hides the loading HTML text
        vm.isLoadingVisible(false);
    };

    private downloadNextLevel = (): void => {
        Global.UserInfo.gamelevel += 1;
        console.log(`downloading level ${Global.UserInfo.gamelevel}...`);

        PIXI.loader.reset();
        PIXI.loader.add("assets/levels/levels.json")
                   .load(this.downloadAssets);

        //   add a loading spinner
        var loadingTexture = PIXI.Texture.fromImage("assets/_distribute/loading.png");
        this.spinner = new PIXI.Sprite(loadingTexture);
        this.spinner.position.set(500, 350);
        this.spinner.anchor.set(0.5, 0.5);
        this.spinner.scale.set(0.5);
        this.addChild(this.spinner);
    }

    private downloadAssets = ():void => {
        console.log("Initializing...");
        Global.GameLevels.root = PIXI.loader.resources["assets/levels/levels.json"].data;
        
        let assets: string[] = LevelLoader.GetLevelAssets(Global.GameLevels.root as any, Global.UserInfo.gamelevel);

        //  add assets not in level description
        assets = assets.concat(
            [
                "assets/_distribute/gui_fs_enter.png",
                "assets/_distribute/gui_fs_exit.png",

                "assets/_distribute/hero_64.png",
                "assets/_distribute/Button1.png",

                "assets/_distribute/heart.png",
                "assets/_distribute/coin.png",
                "assets/_distribute/stat_panel.png",

                "assets/_distribute/jump_smoke.png",
                "assets/_distribute/bumper_rotor_01.png",

                "assets/_distribute/balloon_01.png",
                "assets/_distribute/balloon_basket_01.png",

                "assets/_distribute/flame.png",
                "assets/_distribute/callout.png",
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
        console.log("progress: " + progress.toFixed(2) + "%, asset: " + resource.name);
        this.loadingMessage.text = "Loading " + progress.toFixed(2) + " %";
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
            inGame.IsHeroInteractive = true;            
            Global.sceneMngr.ActivateScene("InGame");
        }, 500);
    };
}