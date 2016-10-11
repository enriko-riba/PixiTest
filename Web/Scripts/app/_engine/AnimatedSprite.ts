import { Dictionary } from "./Dictionary";

export class AnimatedSprite extends PIXI.Container {
    constructor() {
        super();        
    }

    private fps: number = 12;
    private animations = new Dictionary<AnimationSequence>();
    private isPlaying: boolean = false;
    private currentSequence: AnimationSequence;

    public addAnimations(...sequences: Array<AnimationSequence>) {
        sequences.forEach((seq, idx, arr) => {
            this.animations.set(seq.sequenceName, seq);
        });
    }

    public PlayAnimation(name: string) {
        if (!this.currentSequence || this.currentSequence.sequenceName !== name) {
            this.currentSequence = this.animations.get(name);
            this.resetAnimation();
            this.addChild(this.currentSequence.Clip);
            this.currentSequence.Clip.animationSpeed = 0.05;
            this.currentSequence.Clip.play();
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
    }

    private resetAnimation() {
        this.isPlaying = true;
        this.removeChildren();
        if (this.currentSequence) {
            this.currentSequence.Clip.stop();
        }
    }
}

export class AnimationSequence  {
    constructor(public sequenceName: string, private textureName:string, private frames: Array<number> = [], frameWidth : number, frameHeight : number) {
        var base: PIXI.BaseTexture = PIXI.utils.TextureCache[textureName];
        var xFrames = Math.floor(base.width / frameWidth);
        var yFrames = Math.floor(base.height / frameHeight);
        var textures = [];
        frames.forEach((frame, idx, arr) => {
            var texture = new PIXI.Texture(base);            
            var y = Math.floor(frame / xFrames);
            var x = frame % xFrames;            
            var rect = new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
            console.log('clip: ' + sequenceName + ', frame: ' + frame + ', rect: {' + rect.x + ', ' + + rect.y + '}');
            texture.frame = rect;
            textures.push(texture);
        });
        this.clip = new PIXI.extras.MovieClip(textures);        
    }

    private clip: PIXI.extras.MovieClip = null;  

    public get Clip() {
        return this.clip;
    }

    public get FrameCount() {
        return this.frames.length;
    }
}