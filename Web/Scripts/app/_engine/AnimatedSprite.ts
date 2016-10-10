import { Dictionary } from "./Dictionary";

export class AnimatedSprite extends PIXI.Sprite {
    constructor(texture?: PIXI.Texture) {
        super(texture);
    }

    private fps: number = 12;
    private animations = new Dictionary<AnimationSequence>();
    private isPlaying: boolean = false;
    private frame: number = 0;

    public addAnimations(...sequences: Array<AnimationSequence>) {
        sequences.forEach((seq, idx, arr) => {
            this.animations.set(seq.Name, seq);
        });
    }

    public Stop() {
    }

    public get Fps() {
        return this.fps;
    }
    public set Fps(fps: number) {
        this.fps = fps;
    }

    public update = (deltaMilliseconds: number) => {
    }
}

export class AnimationSequence {
    public Name: string;
    public frames: Array<number> = [];
    public get Length() {
        return this, frames.length;
    }
}