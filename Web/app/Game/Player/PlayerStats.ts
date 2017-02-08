﻿import * as ko from "knockout";
import { Dictionary } from "app/_engine/Dictionary";

export enum StatType {
    MaxHP,
    HP,
    MaxDust,
    Dust,
    Coins,
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

    constructor() {
        this.stats[StatType.Coins] = 0;
        this.stats[StatType.MaxHP] = 0;
        this.stats[StatType.HP] = 0;
        this.stats[StatType.MaxDust] = 0;
        this.stats[StatType.Dust] = 0;
    }

    /**
     *  Updates stats that increase/decrease over time.
     *  The update is calculated in a half second interval.
     */
    public onUpdate = (dt: number) => {

        let INTERVAL = 500;
        var now = Date.now() / 1000;

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

    public setStat(type: StatType, value: number) {
        this.updateEvent(type, value);
        ko.postbox.publish<IStatChangeEvent>(STATCHANGE_TOPIC, this.scevent);
        this.stats[type] = value;
    }
    public increaseStat(type: StatType, value: number) {
        this.updateEvent(type, this.stats[type] + value);
        ko.postbox.publish<IStatChangeEvent>(STATCHANGE_TOPIC, this.scevent);
        this.stats[type] += value;
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