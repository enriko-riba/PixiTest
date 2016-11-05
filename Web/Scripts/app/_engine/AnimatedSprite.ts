import { Dictionary } from "./Dictionary";

export class AnimatedSprite extends PIXI.Container {
    constructor() {
        super();        
        this.pivot.set(0.5);
    }

    private animations = new Dictionary<AnimationSequence>();
    private currentSequence: AnimationSequence;
    private clip: PIXI.extras.MovieClip = null;  

    public addAnimations(...sequences: Array<AnimationSequence>) {
        sequences.forEach((seq, idx, arr) => {
            this.animations.set(seq.sequenceName, seq);

            //  if no clip exists create it from first animation sequence
            if (!this.clip && idx === 0) {
                this.createClip(seq);
            }
        });        
    }

    public PlayAnimation(name: string, fps?:number) {
        if (!this.currentSequence || this.currentSequence.sequenceName !== name) {
            this.currentSequence = this.animations.get(name);
            this.resetAnimation();
            this.createClip(this.currentSequence);
            
            this.Fps = fps || this.Fps;
            this.clip.play();
        }
    } 

    public Stop() {
        this.clip.stop();
    }
    public get Fps() {
        return this.clip.animationSpeed * 60;
    }
    public set Fps(fps: number) {
        var animationSpeed = fps / 60;
        this.clip.animationSpeed = animationSpeed;
    }
    public get Anchor() {
        var p = new PIXI.Point;
        this.clip.anchor.copy(p);
        return p;
    }
    public set Anchor(p:PIXI.Point) {
        this.clip.anchor.set(p.x, p.y);
    }
    private resetAnimation() {
        if(this.clip)
            this.clip.stop();        
    }
    private createClip(sequence: AnimationSequence) {
        if (!this.clip) {
            this.clip = new PIXI.extras.MovieClip(sequence.Textures);
            this.clip.anchor.set(0.5);
            this.clip.pivot.set(0.5);
            this.addChild(this.clip);
        } else {
            this.clip.textures = this.currentSequence.Textures;
        }
    }
}

/*
*   Creates and holds textures form a texture atlas.
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
            texture.rotate = 8;          
            this.textures.push(texture);
        });
    }
    public get Textures() {
        return this.textures;
    }
    public get FrameCount() {
        return this.textures.length;
    }
}