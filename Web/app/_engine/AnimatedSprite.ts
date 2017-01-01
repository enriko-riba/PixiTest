import { Dictionary } from "./Dictionary";

export class AnimatedSprite extends PIXI.Container {
    constructor() {
        super();
        this.pivot.set(0.5);
    }

    private animations = new Dictionary<AnimationSequence>();
    private currentSequence: AnimationSequence;
    private clip: PIXI.extras.AnimatedSprite = null;

    public addAnimations(...sequences: Array<AnimationSequence>):void {
        sequences.forEach((seq: AnimationSequence, idx:number) => {
            this.animations.set(seq.sequenceName, seq);

            //  if no clip exists create it from first animation sequence
            if (!this.clip && idx === 0) {
                this.createClip(seq);
            }
        });
    }

    public PlayAnimation(name: string, fps?: number): void {
        if (!this.currentSequence || this.currentSequence.sequenceName !== name) {
            this.currentSequence = this.animations.get(name);
            this.resetAnimation();
            this.createClip(this.currentSequence);

            this.Fps = fps || this.Fps;
            this.clip.play();
        }
    }

    public set OnComplete(cb: () => void) {
        this.clip.onComplete = cb;
    }

    public get OnComplete(): () => void {
        return this.clip.onComplete;
    }

    public Stop():void {
        this.clip.stop();
    }
    public get Fps():number {
        return this.clip.animationSpeed * 60;
    }
    public set Fps(fps: number) {
        let animationSpeed = fps / 60;
        this.clip.animationSpeed = animationSpeed;
    }
    public get Anchor(): PIXI.Point {
        let p = new PIXI.Point;
        this.clip.anchor.copy(p);
        return p;
    }
    public set Anchor(p:PIXI.Point) {
        this.clip.anchor.set(p.x, p.y);
    }
    public set Loop(isLooping: boolean) {
        this.clip.loop = isLooping;
    }
    public get Loop(): boolean {
        return this.clip.loop;
    }
    
    private resetAnimation():void {
        if (this.clip) {
            this.clip.stop();
        }
    }
    private createClip(sequence: AnimationSequence):void {
        if (!this.clip) {
            this.clip = new PIXI.extras.AnimatedSprite(sequence.Textures);
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
        //var yFrames = Math.floor(base.height / frameHeight);

        frames.forEach((frame:number) => {
            let texture = new PIXI.Texture(base);
            let y = Math.floor(frame / xFrames);
            let x = frame % xFrames;
            let rect = new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
            texture.frame = rect;
            texture.rotate = 8;
            this.textures.push(texture);
        });
    }
    public get Textures(): PIXI.Texture[] {
        return this.textures;
    }
    public get FrameCount(): number {
        return this.textures.length;
    }
}