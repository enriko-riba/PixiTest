import * as ko from "knockout";


class DemoVM {
    private stage: PIXI.Container;
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private hero: PIXI.Sprite;
    private entities: Array<PIXI.Sprite> = [];

    private isRunning: boolean = true;
    

    constructor() {        
        this.showOverlay("Loading resources...");

        PIXI.loader.reset();
        PIXI.loader
            .add("coins", "assets/images/coins.png")
            .add("collectibles", "assets/images/collectibles.png")
            .add("hero", "assets/images/Hero.png")            
            .load(() => setTimeout(this.setupStage, 1000))
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
        window.onresize = (event) => {
            this.resizeCanvas();
        };

        //  load sprites
        var resources = PIXI.loader.resources;
        this.hero = new PIXI.Sprite(resources["hero"].texture);
        this.stage.addChild(this.hero);

        this.hideOverlay();
    }

    private loadProgressHandler = (loader, resource) => {
        this.resourceText("loading: '" + resource.url + "', progress: " + loader.progress + "%");
        for (var i = 0; i< 1000; i++) {
            var j = Math.random();
            console.log(j);
        }
    }


    private resizeCanvas = () => {
        const HEADER_HEIGHT = 50;
        const FOOTER_HEIGHT = 50;
        var w = window.innerWidth;
        var h = window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
        this.renderer.view.style.width = w + "px";
        this.renderer.view.style.height = h + "px";
        this.renderer.resize(w, h);
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
