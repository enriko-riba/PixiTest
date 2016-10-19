import { Dictionary } from "./Dictionary";

export class AnimatedSprite extends PIXI.Container {
    constructor() {
        super();
    }

    private animations = new Dictionary<AnimationSequence>();
    private isPlaying: boolean = false;
    private currentSequence: AnimationSequence;
    private clip: PIXI.extras.MovieClip = null;  

    public addAnimations(...sequences: Array<AnimationSequence>) {
        sequences.forEach((seq, idx, arr) => {
            this.animations.set(seq.sequenceName, seq);
        });
    }

    public PlayAnimation(name: string, fps?:number) {
        if (!this.currentSequence || this.currentSequence.sequenceName !== name) {
            this.currentSequence = this.animations.get(name);
            this.resetAnimation();

            if (!this.clip) {
                this.clip = new PIXI.extras.MovieClip(this.currentSequence.Textures);
                this.addChild(this.clip);
                if (!fps) fps = 8;  //    default for new animations
            } else {
                this.clip.textures = this.currentSequence.Textures;
            }
            
            this.Fps = fps || this.Fps;
            this.clip.play();
        }
    } 

    public get Fps() {
        return this.clip.animationSpeed * 60;
    }
    public set Fps(fps: number) {
        var animationSpeed = fps / 60;
        this.clip.animationSpeed = animationSpeed;
        console.log('animation speed: ' + animationSpeed);
    }
    public Stop() {
        this.isPlaying = false;
    }

    private resetAnimation() {
        this.isPlaying = true;
        if(this.clip)
            this.clip.stop();
        //this.removeChildren();
        //if (this.currentSequence) {
        //    this.clip.stop();
        //}
    }
}

/*
*   Creates textures form a texture atlas.
*/
export class AnimationSequence  {
    private textures: Array<PIXI.Texture> = [];
    constructor(public sequenceName: string, textureAtlasName:string, frames: Array<number> = [], frameWidth : number, frameHeight : number) {
        var base: PIXI.BaseTexture = PIXI.utils.TextureCache[textureAtlasName];
        var xFrames = Math.floor(base.width / frameWidth);
        var yFrames = Math.floor(base.height / frameHeight);
       
        frames.forEach((frame, idx, arr) => {
            var texture = new PIXI.Texture(base);            
            var y = Math.floor(frame / xFrames);
            var x = frame % xFrames;            
            var rect = new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
            texture.frame = rect;
            this.textures.push(texture);
        });
        //var animationSpeed = fps / 60;
        //this.clip = new PIXI.extras.MovieClip(textures);  
        //this.clip.animationSpeed = animationSpeed;        
    }

    //private clip: PIXI.extras.MovieClip = null;  

    //public get Clip() {
    //    return this.clip;
    //}
    public get Textures() {
        return this.textures;
    }
    public get FrameCount() {
        return this.textures.length;
    }
}