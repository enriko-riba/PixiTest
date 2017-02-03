import { Dictionary } from "./Dictionary";

export class AnimatedSprite extends PIXI.Sprite {
    constructor() {
        super();
        this.pivot.set(0.5);
        this.anchor.set(0.5);
        this.scale.set(1, -1);
    }

    private animations = new Dictionary<AnimationSequence>();
    protected currentSequence: AnimationSequence;

    public addAnimations(...sequences: Array<AnimationSequence>):void {
        sequences.forEach((seq: AnimationSequence, idx:number) => {
            this.animations.set(seq.sequenceName, seq);

            //  if no clip exists create it from first animation sequence
            if (!this.texture.valid && idx === 0) {
                this.texture = seq.textureAtlas;
                this.texture.frame = seq.frames[0];
            }
        });
    }

    public PlayAnimation = (name: string, fps?: number, loop = true) :void => {
        if (!this.currentSequence || this.currentSequence.sequenceName !== name) {
            this.resetAnimation();
            this.currentSequence = this.animations.get(name);
            this.texture = this.currentSequence.textureAtlas;
            this.texture.frame = this.currentSequence.frames[0];
            this.Fps = fps || this.Fps;
            this.isLooping = loop;
            this.isPlaying = true;
        }
    }

    private accumulator: number = 0;
    private isPlaying: boolean = false;
    private isLooping: boolean = false;
    private frameIndex: number = 0;
    private fps: number = 8;
    private onComplete: (seq:AnimationSequence) => void;

    public onUpdate (dt: number) { 
        if (this.isPlaying && this.texture.valid) {
            this.accumulator += dt;
            let secForFrame = 1000 / this.Fps;
            if (this.accumulator > secForFrame) {
                this.accumulator -= secForFrame;
                this.texture.frame = this.currentSequence.frames[++this.frameIndex];
                if (this.frameIndex == this.currentSequence.frames.length-1) {
                    this.frameIndex = 0;

                    //  end the animation if not looping
                    if (!this.isLooping) {
                        this.isPlaying = false;
                        if (this.onComplete) {
                            this.onComplete(this.currentSequence);
                        }
                    }
                }
                
            }
        }
    }

    public set OnComplete(cb: (seq: AnimationSequence) => void) {
        this.onComplete = cb;
    }
    public get OnComplete(): (seq: AnimationSequence) => void {
        return this.onComplete;
    }

    public Stop():void {
        this.isPlaying = false;
    }
    public get Fps():number {
        return this.fps;
    }
    public set Fps(fps: number) {
        this.fps = fps;
    }    
    public set Loop(isLooping: boolean) {
        this.isLooping = isLooping;
    }
    public get Loop(): boolean {
        return this.isLooping;
    }
    
    protected resetAnimation():void {
        this.Stop();
        this.currentSequence = null;
        this.accumulator = 0;
        this.frameIndex = -1;
    }
    
}

/*
*   Creates and holds textures form a texture atlas.
*/
export class AnimationSequence  {
    public textureAtlas: PIXI.Texture;
    public frames: PIXI.Rectangle[] = [];

    constructor(public sequenceName: string, textureAtlasName:string, frames: Array<number> = [], frameWidth : number, frameHeight : number) {
        let tempTexure : PIXI.Texture = PIXI.utils.TextureCache[textureAtlasName];
        this.textureAtlas = new PIXI.Texture(tempTexure.baseTexture);
        var xFrames = Math.floor(this.textureAtlas.baseTexture.width / frameWidth);
        frames.forEach((frame:number) => {
            let y = Math.floor(frame / xFrames);
            let x = frame % xFrames;
            let rect = new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
            this.frames.push(rect);
        });
    }
    
    public get FrameCount(): number {
        return this.frames.length;
    }
}