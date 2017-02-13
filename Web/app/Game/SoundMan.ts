import * as howler from "howler";

export class SoundMan {

    private backgroundSnd: Howl;
    private walkSnd: Howl;
    private jumpSnd1: Howl;
    private jumpSnd2: Howl;
    private hitSnd: Howl;
    private burnSnd: Howl;
    private coinSnd: Howl;
    private gemSnd: Howl;
    private hurtSnd: Howl;
    private winSnd: Howl;
    private atkMag1: Howl;
    private hitMag1: Howl;
    private jumpAtk: Howl;
    private woosh: Howl;
    private squish: Howl;

    private fxDemoSnd: Howl;

    private questItemSnd: Howl;

    private musicTrackNames: Array<string> = [
        'assets/Audio/Two-Finger-Johnny.mp3',
        'assets/Audio/Bumbling-Burglars_Looping.mp3',
        'assets/Audio/Funk-Soul.mp3',
        'assets/Audio/Carrousel.mp3',

        'assets/Audio/music-demo.mp3',
    ];
    private musicTracks: Array<Howl> = [];
    private currentTrack: number = 0;

    constructor() {
        let h = howler.Howl;//  HACK: dummy assignment needed to force the transpiler generate the import

        for (var i = 0, len = this.musicTrackNames.length; i < len; i++) {
            var trackName = this.musicTrackNames[i];
            this.musicTracks.push(new Howl({
                src: [trackName],
                preload: true,
                autoplay: false,
                loop: true,
                volume: 0.8
            }));
        }

        this.walkSnd = new Howl({
            src: ['assets/Audio/effects/step.mp3'],
            preload: true,
            autoplay: false,
            loop: true,
            volume: 1,
        });
        this.jumpSnd1 = new Howl({
            src: ['assets/Audio/effects/jump1.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.jumpSnd2 = new Howl({
            src: ['assets/Audio/effects/jump2.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.burnSnd = new Howl({
            src: ['assets/Audio/effects/burn.mp3'],
            preload: true,
            autoplay: false,
            loop: true,
            volume: 1
        });
        this.hurtSnd = new Howl({
            src: ['assets/Audio/effects/hurt.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.coinSnd = new Howl({
            src: ['assets/Audio/effects/coin.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.gemSnd = new Howl({
            src: ['assets/Audio/effects/gem.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.questItemSnd = new Howl({
            src: ['assets/Audio/effects/quest-item.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.winSnd = new Howl({
            src: ['assets/Audio/effects/win.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.atkMag1 = new Howl({
            src: ['assets/Audio/effects/atk-mag01.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1, 
        });
        this.hitMag1 = new Howl({
            src: ['assets/Audio/effects/hit-mag01.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.jumpAtk = new Howl({
            src: ['assets/Audio/effects/jump-atk.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.woosh = new Howl({
            src: ['assets/Audio/effects/woosh.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
        this.squish = new Howl({
            src: ['assets/Audio/effects/mob-squish.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });

        this.fxDemoSnd = new Howl({
            src: ['assets/Audio/effects/fx-demo.mp3'],
            preload: true,
            autoplay: false,
            loop: false,
            volume: 1
        });
    }

    private previousMusicVolume = 0.8;
    private previousFxVolume = 1;

    private musicVolume = 0.8;
    private fxVolume = 1;

    public get MusicVolume() { return this.musicVolume; }
    public set MusicVolume(value: number) {
        this.musicVolume = value;
        if (this.backgroundSnd && this.backgroundSnd.playing()) {
            this.backgroundSnd.volume(this.musicVolume);
        }
    }

    public get FxVolume() { return this.fxVolume; }
    public set FxVolume(value: number) {
        this.fxVolume = value;       
    }


    public get IsFxOn() { return this.fxVolume > 0.0; }
    public set IsFxOn(value: boolean) {
        if (!value) {
            this.previousFxVolume = this.fxVolume;
            this.FxVolume = 0;
        } else {
            this.FxVolume = this.previousFxVolume;
        }
    }

    public get IsMusicOn() { return this.musicVolume > 0.0; }
    public set IsMusicOn(value: boolean) {
        if (!value) {
            this.previousMusicVolume = this.musicVolume;
            this.MusicVolume = 0;
        } else {
            this.MusicVolume = this.previousMusicVolume;
        }
    }

    public get CurrentTrackId() {
        return this.currentTrack;
    }


    public get fxDemo() {
        return this.fxDemoSnd;
    }

    public jumpAttack() {
        this.walkSnd.pause();
        this.jumpAtk.loop(false);
        this.jumpAtk.play();
        this.jumpAtk.volume(this.fxVolume);
    }

    public jump() {
        this.walkSnd.pause();
        this.jumpSnd1.play();
        this.jumpSnd1.volume(this.fxVolume);
    }
    public idle() {
        this.walkSnd.pause();
    }
    public walk(isRunning?: boolean) {
        this.walkSnd.rate(isRunning ? 2.0 : 1.0)
        if (!this.walkSnd.playing()) {
            this.walkSnd.volume(this.fxVolume);          
            this.walkSnd.play();
        }
    }
    public atkMagic1() {
        this.atkMag1.volume(this.fxVolume);
        this.atkMag1.play();
    }
    public hitMagic1() {
        this.hitMag1.volume(this.fxVolume);
        this.hitMag1.play();
    }

    public mobSquish() {
        this.squish.volume(this.fxVolume);
        this.squish.play();
    }

    public bulletHitWall() {
        this.woosh.volume(this.fxVolume);
        this.woosh.play();
    }

    public coin() {
        this.coinSnd.volume(this.fxVolume);
        this.coinSnd.play();
    }

    public gem() {
        this.gemSnd.volume(this.fxVolume);
        this.gemSnd.play();
    }

    public hurt() {
        this.hurtSnd.volume(this.fxVolume);
        this.hurtSnd.play();
    }

    public questItem() {
        this.questItemSnd.play();
    }

    public win() {
        if (this.backgroundSnd && this.backgroundSnd.playing()) {
            this.backgroundSnd.fade(1, 0, 500);
        }
        this.hurtSnd.stop();
        this.walkSnd.stop();
        this.jumpSnd1.stop();
        this.jumpSnd2.stop();
        this.burnSnd.stop();

        this.winSnd.volume(this.fxVolume);
        this.winSnd.play();
    }

    public burn() {
        if (!this.burnSnd.playing()) {
            this.burnSnd.volume(this.fxVolume);
            this.burnSnd.play();
        }
        this.hurt();
    }
    public burnStop() {
        this.burnSnd.stop();
    }

    public getTrack(name: string) {
        for (var i = 0, len = this.musicTrackNames.length; i < len; i++) {
            if (this.musicTrackNames[i].indexOf(name) >= 0) {
                return i;
            }
        }
        return -1;        
    }

    public stopTrack() {
        if (this.backgroundSnd !== undefined) {
            this.backgroundSnd.stop();
        }
    }

    public playTrack(trackId: number) {
        if (this.backgroundSnd === undefined) {
            this.backgroundSnd = this.musicTracks[trackId];
            console.log("playTrack " + trackId, this.backgroundSnd);
        }

        if (this.backgroundSnd !== this.musicTracks[trackId]) {
            this.backgroundSnd.stop();
            this.backgroundSnd = this.musicTracks[trackId];
            this.backgroundSnd.volume(this.musicVolume);
            this.backgroundSnd.play();
        } else {
            if (!this.backgroundSnd.playing()) {
                this.backgroundSnd.volume(this.musicVolume);
                this.backgroundSnd.play();
            }
        }
        this.currentTrack = trackId;
    }
}