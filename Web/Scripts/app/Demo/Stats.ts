import * as ko from "knockout";

export enum StatType {
    MaxHP,
    HP,
    MaxDust,
    Dust,
    Coins
}

export interface StatChangeEvent {
    Type: StatType;
    OldValue: number;
    NewValue: number;
    Stats: Array<number>;
}

export var STATCHANGE_TOPIC = "stat_changed";

export class Stats {
    private stats: Array<number> = [];

    constructor() {
        this.stats[StatType.Coins] = 0;
        this.stats[StatType.MaxHP] = 100;
        this.stats[StatType.HP] = 100;
        this.stats[StatType.MaxDust] = 1000;
        this.stats[StatType.Dust] = 100;
    }

    private scevent: StatChangeEvent = {
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

    public setStat(type: StatType, value: number) {
        this.updateEvent(type, value);
        ko.postbox.publish<StatChangeEvent>(STATCHANGE_TOPIC, this.scevent);
        this.stats[type] = value;
    }
    public increaseStat(type: StatType, value: number) {
        this.updateEvent(type, this.stats[type] + value);
        ko.postbox.publish<StatChangeEvent>(STATCHANGE_TOPIC, this.scevent);
        this.stats[type] += value;
    }
    public getStat(type: StatType): number {
        return this.stats[type];
    }
}