import { Dictionary } from "./Dictionary";

export class AnimatedSprite extends PIXI.Container {
    constructor() {
        super();        
    }

    private animations = new Dictionary<AnimationSequence>();
    private isPlaying: boolean = false;
    private currentSequence: AnimationSequence;

    public addAnimations(...sequences: Array<AnimationSequence>) {
        sequences.forEach((seq, idx, arr) => {
            this.animations.set(seq.sequenceName, seq);
        });
    }

    public PlayAnimation(name: string, fps?:number) {
        if (!this.currentSequence || this.currentSequence.sequenceName !== name) {
            this.currentSequence = this.animations.get(name);
            this.resetAnimation();
            this.addChild(this.currentSequence.Clip);
            if (fps) {
                var animationSpeed = fps / 60;
                this.currentSequence.Clip.animationSpeed = animationSpeed;
            }
            this.currentSequence.Clip.play();
        }
    }

    public Stop() {
        this.isPlaying = false;
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
    constructor(public sequenceName: string, private textureName:string, private frames: Array<number> = [], frameWidth : number, frameHeight : number, private fps : number = 8) {
        var base: PIXI.BaseTexture = PIXI.utils.TextureCache[textureName];
        var xFrames = Math.floor(base.width / frameWidth);
        var yFrames = Math.floor(base.height / frameHeight);
        var textures = [];
        frames.forEach((frame, idx, arr) => {
            var texture = new PIXI.Texture(base);            
            var y = Math.floor(frame / xFrames);
            var x = frame % xFrames;            
            var rect = new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
            //console.log('clip: ' + sequenceName + ', frame: ' + frame + ', rect: {' + rect.x + ', ' + + rect.y + '}');
            texture.frame = rect;
            textures.push(texture);
        });
        var animationSpeed = fps / 60;
        this.clip = new PIXI.extras.MovieClip(textures);  
        this.clip.animationSpeed = animationSpeed;   
    }

    private clip: PIXI.extras.MovieClip = null;  

    public get Clip() {
        return this.clip;
    }

    public get FrameCount() {
        return this.frames.length;
    }
}