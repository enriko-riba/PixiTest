import { Scene } from "app/_engine/Scene";
import { InGameScene } from "app/Demo/InGameScene";
import * as Global from "app/Demo/Global";

export class LoaderScene extends Scene {
    private loadingMessage: PIXI.Text;

    constructor() {
        super("Loader");
        this.BackGroundColor = 0x1099bb;
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
        PIXI.loader
            .add("assets/_distribute/loading.png")
            .load(() => {
                //  once the loading image is downloaded start spinning it and invoke Initialize()
                var loadingTexture = PIXI.Texture.fromImage("assets/_distribute/loading.png");
                var romb = new PIXI.Sprite(loadingTexture);
                romb.position.set(500, 350);
                romb.anchor.set(0.5, 0.5);
                romb.scale.set(0.5);
                this.addChild(romb);
                this.onUpdate = () => {
                    romb.rotation += 0.05;
                };
                this.downloadAssets();
            });
    };
    
    private downloadAssets():void {
        console.log("Initializing...");

        PIXI.loader.reset();

        var assets:string[] = [
            "assets/_distribute/hero_64.png",

            "assets/_distribute/Button1.png",
            "assets/_distribute/Listitem.png",
            "assets/_distribute/Panel_256x128.png",
            "assets/_distribute/Panel_256x256.png",
            "assets/_distribute/TestHUD.png",
            "assets/_distribute/heart.png",
            "assets/_distribute/coin.png",
            "assets/_distribute/stat_panel.png",

            "assets/_distribute/jump_smoke.png",

            "assets/_distribute/bahamut.png",
            "assets/_distribute/barrissoffee.png",
            "assets/_distribute/ifrit.png",
            "assets/_distribute/leviathan.png",
            "assets/_distribute/phoenix.png",
            "assets/_distribute/tonberry.png",

            "assets/_distribute/IceSnow.png",
            "assets/_distribute/Canyon.png",
            "assets/_distribute/Mountains.png",
            "assets/_distribute/Wood_night.png",
            "assets/_distribute/trees01.png",
            "assets/_distribute/trees02.png",
            "assets/_distribute/trees03.png",
            "assets/_distribute/trees04.png",
            "assets/_distribute/trees05.png",
            "assets/_distribute/ground.png",

            "assets/_distribute/box_64_01.png",
            "assets/_distribute/box_64_02.png",
            "assets/_distribute/box_64_03.png",

            "assets/_distribute/box_128_01.png",
            "assets/_distribute/box_128_02.png",
            "assets/_distribute/box_128_03.png",

            "assets/_distribute/bumper_01.png",
            "assets/_distribute/bumper_rotor_01.png",
            "assets/_distribute/chest_01.png",
            "assets/_distribute/coins.png",
            "assets/_distribute/gem32.png",
            "assets/_distribute/gem64.png",
            "assets/_distribute/star.png",
            "assets/_distribute/lava.png",
            "assets/_distribute/lava-border-l.png",
            "assets/_distribute/lava-border-r.png",

            "assets/levels/levels.json",
        ];
        
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

        var inGame = new InGameScene();
        Global.sceneMngr.AddScene(inGame);

        //  setTimeout is only to make the 100% noticeable
        setTimeout(() => {
            this.removeChild(this.loadingMessage);
            Global.sceneMngr.ActivateScene(inGame);
        }, 800);
    };
}