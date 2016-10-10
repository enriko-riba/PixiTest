import { Dictionary } from "./Dictionary";

export class AnimatedSprite extends PIXI.Container {
    constructor() {
        super();
        
        this.Fps = 12;
        this.sprite = new PIXI.Sprite();
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);
    }

    private textureName: string;
    private sprite : PIXI.Sprite;
    private frameWidth: number;
    private frameHeight: number
    private fps: number = 0;
    private animations = new Dictionary<AnimationSequence>();
    private isPlaying: boolean = false;
    private frame: number = 0;
    private currentSequence: AnimationSequence;
    private currentElapsed: number;
    private frameTime: number;

    public addAnimations(...sequences: Array<AnimationSequence>) {
        sequences.forEach((seq, idx, arr) => {
            this.animations.set(seq.Name, seq);
        });
    }

    public PlayAnimation(name: string) {
        if (!this.currentSequence || this.currentSequence.Name !== name) {
            this.currentSequence = this.animations.get(name);
            this.resetAnimation();
        }
    }

    public Stop() {
        this.isPlaying = false;
    }

    public get Fps() {
        return this.fps;
    }
    public set Fps(fps: number) {
        this.fps = fps;
        this.frameTime = 1000 / fps; 
    }

    public update = (deltaMilliseconds: number) => {

        if (this.isPlaying && this.currentSequence) {

            //  add elapsed
            this.currentElapsed += deltaMilliseconds;

            if (this.currentElapsed > this.frameTime) {
                this.currentElapsed -= this.frameTime;

                //  advance frames
                if (++this.frame >= this.currentSequence.FrameCount) {
                    this.frame = 0;
                }

                this.updateFrameTexture();
            }            
        }
    }

    private updateFrameTexture() {
            var atlasTexture = PIXI.loader.resources[this.textureName].texture;
            var xFrames = Math.floor(atlasTexture.baseTexture.width / this.frameWidth);
            var yFrames = Math.floor(atlasTexture.baseTexture.height / this.frameHeight);

            var animationFrame = this.currentSequence.frames[this.frame];
            var y = Math.floor(animationFrame / yFrames);
            var x = animationFrame % xFrames;

            var rect = new PIXI.Rectangle(x * this.frameWidth, y * this.frameHeight, this.frameWidth, this.frameHeight);
            this.sprite = new PIXI.Sprite(atlasTexture);
            this.sprite.anchor.set(0.5);
            this.removeChildren();
            this.addChild(this.sprite);
            this.sprite.texture.frame = rect;
    }

    private resetAnimation() {
        this.frame = 0;
        this.currentElapsed = 0;
        this.isPlaying = true;
        this.updateFrameTexture();
    }
}

export class AnimationSequence  {
    constructor(public Name: string, public frames: Array<number> = []) {

    }

    public get FrameCount() {
        return this.frames.length;
    }
}