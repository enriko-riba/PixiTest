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

    private questItemSnd: Howl;

    private musicTrackNames: Array<string> = [
        'assets/Audio/Two-Finger-Johnny.mp3',
        'assets/Audio/Bumbling-Burglars_Looping.mp3',
        'assets/Audio/Techno-Dreaming_Looping.mp3'
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
    }

    private playJumpRnd() {
        this.jumpSnd1.play();
        return;

        //var r = Math.random() * 101 | 0;
        //if (r % 2 == 0) {
        //    this.jumpSnd1.play();
        //} else {
        //    this.jumpSnd2.play();
        //}
    }

    public jump() {
        this.walkSnd.pause();
        this.playJumpRnd();
    }
    public idle() {
        this.walkSnd.pause();
    }
    public walk(isRunning?: boolean) {
        this.walkSnd.rate(isRunning ? 2.0 : 1.0)
        if (!this.walkSnd.playing()) {
            this.walkSnd.play();
        }
    }

    public coin() {
        this.coinSnd.play();
    }

    public gem() {
        this.gemSnd.play();
    }

    public hurt() {
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
        this.winSnd.play();
    }

    public burn() {
        if (!this.burnSnd.playing()) {
            this.burnSnd.play();
        }
        this.hurt();
    }
    public burnStop() {
        this.burnSnd.stop();
    }

    public playTrack(trackId: number) {
        if (this.backgroundSnd === undefined) {
            this.backgroundSnd = this.musicTracks[trackId];
            console.log("playTrack " + trackId, this.backgroundSnd);
        }

        if (this.backgroundSnd !== this.musicTracks[trackId]) {
            this.backgroundSnd.fade(1, 0, 1000).on("fade", (id) => {
                this.backgroundSnd.stop();
                this.backgroundSnd = this.musicTracks[trackId];
                this.backgroundSnd.play();
                this.backgroundSnd.fade(0, 1, 1000);
            });
        } else {
            if (!this.backgroundSnd.playing()) {
                this.backgroundSnd.play();
            }
        }
    }
}