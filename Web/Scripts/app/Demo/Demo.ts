import * as ko from "knockout";


class DemoVM {
    private stage: PIXI.Container;
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private hero: PIXI.Sprite;
    private entities: Array<PIXI.Sprite> = [];

    private backgroundNear: PIXI.particles.ParticleContainer;

    private isRunning: boolean = true;
    
    private readonly GAME_HEIGHT = 600;
    private readonly GAME_WIDTH = 800;

    constructor() {        
        this.showOverlay("Loading resources...");

        PIXI.loader.reset();
        PIXI.loader
            .add("coins", "assets/images/coins.png")
            .add("collectibles", "assets/images/collectibles.png")
            .add("hero", "assets/images/Hero.png")            
            .add("trees01", "assets/images/trees01.png")
            .add("trees02", "assets/images/trees02.png")
            .add("trees03", "assets/images/trees03.png")
            .add("trees04", "assets/images/trees04.png")
            .add("trees05", "assets/images/trees05.png")
            .load(this.setupStage)
            .on("progress", this.loadProgressHandler);
    }

    private animate = () => {
        if (this.isRunning) requestAnimationFrame(this.animate);
        this.renderer.render(this.stage);
    }

    private setupStage = () => {
        var canvas: HTMLCanvasElement = document.getElementById("stage") as HTMLCanvasElement;
        var renderOptions = {
            view: canvas,
            backgroundColor: 0x1099bb,
            antialias: true,
            transparent: false,
            resolution: window.devicePixelRatio
        };

        this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, renderOptions);
        this.renderer.autoResize = true;
        this.stage = new PIXI.Container();
        this.resizeCanvas();
        this.animate();

        window.removeEventListener("resize", this.resizeCanvas);
        window.addEventListener("resize", this.resizeCanvas);

        var resources = PIXI.loader.resources;

        //  setup background
        this.backgroundNear = new PIXI.particles.ParticleContainer();
        this.stage.addChild(this.backgroundNear);
        var tree = new PIXI.Sprite(resources["trees01"].texture);
        this.backgroundNear.addChild(tree);

        //  setup sprites
        this.hero = new PIXI.Sprite(resources["hero"].texture);
        this.stage.addChild(this.hero);

        
        this.hideOverlay();
    }

    private loadProgressHandler = (loader, resource) => {
        this.resourceText("loading: '" + resource.url + "', progress: " + loader.progress + "%");
        console.log("loading: '" + resource.url + "', progress: " + loader.progress + "%");
    }


    private resizeCanvas = () => {
        const HEADER_HEIGHT = 50;
        const FOOTER_HEIGHT = 50;
        var w = window.innerWidth;
        var h = window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
        //this.renderer.view.style.width = w + "px";
        //this.renderer.view.style.height = h + "px";
        //this.renderer.resize(w, h);

        var ratio = Math.min(w / this.GAME_WIDTH, h / this.GAME_HEIGHT);

        // Scale the view appropriately to fill that dimension
        this.stage.scale.x = this.stage.scale.y = ratio;

        // Update the renderer dimensions
        this.renderer.resize(w /*Math.ceil(this.GAME_WIDTH * ratio)*/, Math.ceil(this.GAME_HEIGHT * ratio));
    }

    private resourceText = ko.observable("");
    private overlayText = ko.observable("");
    private showOverlay = (text:string) => {
        $(".overlay").css("visibility", "visible");
        $(".overlay").css("opacity", "1");
        this.overlayText(text);
    }
    private hideOverlay = () => {
        $(".overlay").css("visibility", "hidden");
        $(".overlay").css("opacity", "0");
    }
}

export = DemoVM;
