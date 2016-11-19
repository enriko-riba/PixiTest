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

    private accumulator: number = 0.0;

    constructor() {
        this.stats[StatType.Coins] = 0;
        this.stats[StatType.MaxHP] = 100;
        this.stats[StatType.HP] = 100;
        this.stats[StatType.MaxDust] = 1000;
        this.stats[StatType.Dust] = 100;
    }

    /**
     *  Updates stats that recover over time
    */
    public onUpdate = (dt: number) => {
        this.accumulator += dt;
        if (this.accumulator > 1000) {
            this.accumulator -= 1000;

            //  dust
            if (this.stats[StatType.Dust] < this.stats[StatType.MaxDust]) {
                this.increaseStat(StatType.Dust, 1);
            }

            //  hp
            if (this.stats[StatType.HP] < this.stats[StatType.MaxHP]) {
                this.increaseStat(StatType.HP, 0.5);
            }
        }
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

    
}