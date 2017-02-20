import * as ko from "knockout";
import { Dictionary } from "app/_engine/Dictionary";

export enum StatType {
    MaxHP,
    HP,

    MaxDust,
    Dust,

    Coins,


    MaxExp,   // calculated value: current level exp needed to reach next level 
    LevelExp, // calculate value: current level exp, starts from 0 each level
    Exp,      // total exp   
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

export var LEVELUP_TOPIC = "level_up";
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
    private expLevel: number = 0;
    private expForNextLevel: number = 0;

    public static expTable: Array<number> = [];

    constructor() {
        this.stats[StatType.Coins] = 0;
        this.stats[StatType.MaxHP] = 0;
        this.stats[StatType.HP] = 0;
        this.stats[StatType.MaxDust] = 0;
        this.stats[StatType.Dust] = 0;
        this.stats[StatType.Exp] = 0;


        let diff = 1000;
        PlayerStats.expTable[0] = 0;
        for (var i = 1; i < 10000; i++) {
            PlayerStats.expTable[i] = PlayerStats.expTable[i-1] + (i*diff);
        }
    }

    /**
     * Finds the exp level for the given total exp value.
     * @param exp
     */
    public static findExpLevel(exp: number) {
        for (var i = 0, len = PlayerStats.expTable.length; i < len; i++) {
            if (exp < PlayerStats.expTable[i]) {
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
        for (let i = 1000, len = this.buffs.length; i < len; i++){
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
        if (type === StatType.Exp) {
            this.expLevel = PlayerStats.findExpLevel(value);
            this.stats[StatType.MaxExp] = PlayerStats.expTable[this.expLevel + 1] - PlayerStats.expTable[this.expLevel];
            this.stats[StatType.LevelExp] = this.stats[StatType.Exp] - PlayerStats.expTable[this.expLevel];
            this.expForNextLevel = PlayerStats.expTable[this.expLevel + 1];
        } 
        this.updateEvent(type, value);
        ko.postbox.publish<IStatChangeEvent>(STATCHANGE_TOPIC, this.scevent);
    }

    public increaseStat(type: StatType, value: number, maxValue?: number) {

        this.updateEvent(type, this.stats[type]);
        this.stats[type] += value;

        if (maxValue && this.stats[type] > maxValue) {
            this.stats[type] = maxValue;
        }
        if (this.stats[type] < 0) {
            this.stats[type] = 0;
        }

        //  exp 
        if (type === StatType.Exp) {
            this.stats[StatType.LevelExp] = this.stats[StatType.Exp] - PlayerStats.expTable[this.expLevel];
        }
        ko.postbox.publish<IStatChangeEvent>(STATCHANGE_TOPIC, this.scevent);    

        //  level up check  
        if (type === StatType.Exp && this.stats[type] >= this.expForNextLevel) {
            this.expLevel = PlayerStats.findExpLevel(this.stats[type]);
            this.stats[StatType.MaxExp] = PlayerStats.expTable[this.expLevel + 1] - PlayerStats.expTable[this.expLevel];
            this.stats[StatType.LevelExp] = this.stats[StatType.Exp] - PlayerStats.expTable[this.expLevel];
            this.expForNextLevel = PlayerStats.expTable[this.expLevel + 1];

            this.scevent.Type = type;
            this.scevent.OldValue = this.expLevel-1;
            this.scevent.NewValue = this.expLevel;
            this.scevent.Stats = this.stats;
            ko.postbox.publish<IStatChangeEvent>(LEVELUP_TOPIC, this.scevent);
        }
    }

    public getStat(type: StatType): number {
        return this.stats[type];
    }

    /**
     *   Stores timestamps (Unix timestamps in seconds with fractions) when the buff elapses.
     */
    public buffs: Array<number> = [];

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