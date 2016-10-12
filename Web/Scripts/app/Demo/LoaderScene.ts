import { Scene } from "app/_engine/Scene";
import { InGameScene } from "app/Demo/InGameScene";
import * as Global from "app/Demo/Global";

export class LoaderScene extends Scene {
    private loadingMessage: PIXI.Text;

    constructor() {
        super("Loader");
        this.BackGroundColor = 0x1099bb;
    }

    public onActivate = ()=> {
        this.loadingMessage = new PIXI.Text("Loading", { fontSize: "52px", fontFamily: "Futura", fill: "white", align: "Left", dropShadow: true, stroke: "#44ff44", strokeThickness: 6 });
        this.loadingMessage.anchor.set(0, 0.5);
        this.loadingMessage.position.set(550, 350);
        this.addChild(this.loadingMessage);

        //------------------------------------------------------
        //  get loading image and define callback on image load
        //------------------------------------------------------
        PIXI.loader.reset();
        PIXI.loader
            .add('Assets/Images/loading.png')
            .load(() => {
                //  once the loading image is downloaded start spinning it and invoke Initialize()
                var loadingTexture = PIXI.Texture.fromImage('Assets/Images/loading.png');
                var romb = new PIXI.Sprite(loadingTexture);
                romb.position.set(500, 350);
                romb.anchor.set(0.5, 0.5);
                romb.scale.set(0.5);
                this.addChild(romb);
                this.onUpdate = () => {
                    romb.rotation += 0.05;
                }
                this.downloadAssets();
            });  
    }
    
    private downloadAssets() {
        console.log("Initializing...");

        PIXI.loader.reset();

        var assets = [
            "assets/images/hero.png",
            "assets/images/hero_64x64.png",

            "assets/images/Gui/Button1.png",
            "assets/images/Gui/Listitem.png",

            "assets/images/Npcs/bahamut.png",
            "assets/images/Npcs/barrissoffee.png",
            "assets/images/Npcs/ifrit.png",
            "assets/images/Npcs/leviathan.png",
            "assets/images/Npcs/phoenix.png",
            "assets/images/Npcs/tonberry.png",

            "assets/images/background/Canyon.png",
            "assets/images/background/Mountains.png",
            "assets/images/background/trees01.png",
            "assets/images/background/trees02.png",
            "assets/images/background/trees03.png",
            "assets/images/background/trees04.png",
            "assets/images/background/trees05.png",
        ];
        
        PIXI.loader.add(assets)
            .load(this.onAssetsLoaded)
            .on("progress", this.onProgress);
    }

    private onProgress = (loader, resource: PIXI.loaders.Resource) => {
        var progress = loader.progress as number;
        console.log("progress: " + progress.toFixed(2) + "%, asset: " + resource.name);
        this.loadingMessage.text = "Loading " + progress.toFixed(2) + " %";
    }

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
    }
}