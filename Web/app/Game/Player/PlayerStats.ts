import * as ko from "knockout";
import { Dictionary } from "app/_engine/Dictionary";

export enum StatType {
    MaxHP,
    HP,

    MaxDust,
    Dust,

    Coins,
    Gold,           //  not used

    LevelExp,       // calculate value: current level exp, starts from 0 each level
    LevelMaxExp,    // calculated value: current level exp needed to reach next level 
    TotalExp,       // total exp  

    
    CharacterLevel, // calculated value: current char level based on total experience
}

export enum DpsType {
    LavaBorder,
    Lava,
}

export interface IStatChangeEvent {
    Type: StatType;
    OldValue: number;
    NewValue: number;
    Stats: Array<number>;
}

export interface IDpsChangeEvent {
    OldValue: number;
    Amount: number;
}

export var STATCHANGE_TOPIC = "stat_changed";
export var DPS_TOPIC = "dps_changed";

export class PlayerStats {
    private stats: Array<number> = [];

    private accumulator: number = 0.0;
    private dpsDecreaseAmount: number = 0;

    private atr_points: number = 0;
    private attributes: Array<number> = [];

    private hasJumpAttack: boolean = false;
    private hasMagicAttack: boolean = false;
    private characterLevel: number = 0;
    private expForNextLevel: number = 0;

    public static expForLevel: Array<number> = [];

    constructor() {
        this.stats[StatType.Coins] = 0;
        this.stats[StatType.MaxHP] = 0;
        this.stats[StatType.HP] = 0;
        this.stats[StatType.MaxDust] = 0;
        this.stats[StatType.Dust] = 0;
        this.stats[StatType.TotalExp] = 0;


        let diff = 1000;
        PlayerStats.expForLevel[0] = 0;
        for (var i = 1; i < 10000; i++) {
            PlayerStats.expForLevel[i] = PlayerStats.expForLevel[i - 1] + (i * diff);
        }
    }

    /**
     * Finds the exp level for the given total exp value.
     * @param exp
     */
    public static findExpLevel(exp: number) {
        for (var i = 0, len = PlayerStats.expForLevel.length; i < len; i++) {
            if (exp < PlayerStats.expForLevel[i]) {
                return i - 1;
            }
        }
    }

    /**
     *  Updates stats that increase/decrease over time.
     *  The update is calculated in a half second interval.
     */
    public onUpdate = (dt: number) => {

        let INTERVAL = 500;
        var now = performance.now() / 1000;

        //  accumulate dps
        for (let i = 1000, len = this.buffs.length; i < len; i++) {
            if (this.buffs[i] && this.buffs[i] > now) {
                let dps = 0;
                switch (i) {
                    case 1000:  // lava border
                        dps = 5;
                        break;
                    case 1001:  // lava
                        dps = 15;
                        break;
                }
                let dmg = dt * 0.001 * dps;
                this.dpsDecreaseAmount += dmg;
            }
        }

        //  handle once per interval ticks
        this.accumulator += dt;
        if (this.accumulator > INTERVAL) {
            this.accumulator -= INTERVAL;

            //  dust
            if (this.stats[StatType.Dust] < this.stats[StatType.MaxDust]) {
                this.increaseStat(StatType.Dust, 1);
            }

            //  hp
            if (this.stats[StatType.HP] < this.stats[StatType.MaxHP]) {
                this.increaseStat(StatType.HP, 0.5);
            }

            //  dps
            if (this.dpsDecreaseAmount >= 1) {
                var amount = Math.floor(this.dpsDecreaseAmount);
                let event = {
                    OldValue: this.stats[StatType.HP],
                    Amount: -amount
                };
                ko.postbox.publish<IDpsChangeEvent>(DPS_TOPIC, event);
                this.increaseStat(StatType.HP, -amount);
                this.dpsDecreaseAmount -= amount;
            }
        }
    };

    public get HasJumpAtack() {
        return this.hasJumpAttack;
    }
    public set HasJumpAtack(value: boolean) {
        this.hasJumpAttack = value;
    }


    public setStat(type: StatType, value: number) {
        this.stats[type] = value;
        if (type === StatType.TotalExp) {
            this.characterLevel = PlayerStats.findExpLevel(value);
            this.stats[StatType.LevelMaxExp] = PlayerStats.expForLevel[this.characterLevel + 1] - PlayerStats.expForLevel[this.characterLevel];
            this.stats[StatType.LevelExp] = this.stats[StatType.TotalExp] - PlayerStats.expForLevel[this.characterLevel];
            this.expForNextLevel = PlayerStats.expForLevel[this.characterLevel + 1];
        }
        this.updateEvent(type, value);
        ko.postbox.publish<IStatChangeEvent>(STATCHANGE_TOPIC, this.scevent);
    }

    public increaseStat(type: StatType, value: number, maxValue?: number) {

        var newValue = this.stats[type] + value;
        if (maxValue && newValue > maxValue) {
            newValue = maxValue;
        }
        if (newValue < 0) {
            newValue = 0;
        }

        this.updateEvent(type, newValue);
        this.stats[type] = newValue;


        //  special logic for experience
        if (type === StatType.TotalExp) {
            this.stats[StatType.LevelExp] = newValue - PlayerStats.expForLevel[this.characterLevel];

            //  level up check
            if (newValue >= this.expForNextLevel) {
                this.characterLevel = PlayerStats.findExpLevel(newValue);
                this.expForNextLevel = PlayerStats.expForLevel[this.characterLevel + 1];

                this.stats[StatType.LevelMaxExp] = this.expForNextLevel - PlayerStats.expForLevel[this.characterLevel];
                this.stats[StatType.LevelExp] = newValue - PlayerStats.expForLevel[this.characterLevel];

                this.scevent.Type = StatType.CharacterLevel;
                this.scevent.OldValue = this.characterLevel - 1;
                this.scevent.NewValue = this.characterLevel;
                this.scevent.Stats = this.stats;
                ko.postbox.publish<IStatChangeEvent>(STATCHANGE_TOPIC, this.scevent);

                //  fix regular stat change event (for exp)
                this.scevent.Type = type;
                this.scevent.OldValue = 0;
                this.scevent.NewValue = this.stats[StatType.LevelExp];
                this.scevent.Stats = this.stats;
            } 
        } 

        ko.postbox.publish<IStatChangeEvent>(STATCHANGE_TOPIC, this.scevent);
    }

    public getStat(type: StatType): number {
        return this.stats[type];
    }

    /**
     *   Stores timestamps (Unix timestamps in seconds with fractions) when the buff elapses.
     */
    public buffs: Array<number> = [];

    /**
     * Searches the exp level starting from the current exp level.
     * @param exp
     */
    private findExpLevelInternal(exp: number) {
        for (var i = this.characterLevel, len = PlayerStats.expForLevel.length; i < len; i++) {
            if (exp < PlayerStats.expForLevel[i]) {
                return i - 1;
            }
        }
    }

    private scevent: IStatChangeEvent = {
        Type: StatType.Coins,
        OldValue: 0,
        NewValue: 0,
        Stats: []
    };

    private updateEvent(type: StatType, newValue: number) {
        this.scevent.Type = type;
        this.scevent.OldValue = this.stats[type];
        this.scevent.NewValue = newValue;
        this.scevent.Stats = this.stats;
    }
}