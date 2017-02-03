﻿import { AI } from "./AI";
import { Mob } from "./Mob";

/**
 * Can attack and turn towards player but invokes no other actions.
 */
export class BasicStaticAI extends AI {

    constructor(mobEntity: Mob) {
        super(mobEntity);
    }

    public canFire() {
        let nowMilliseconds = Date.now();
        let rnd = Math.random() * 1500;
        let can = (this.lastFire + this.attackCD  + rnd <= nowMilliseconds);
        if (can) {
            let rnd = Math.random();
            can = can && rnd > 0.2;
            this.lastFire = Date.now(); //  set to prevent firing in next update if 'can' is false
        }
        return can;
    };
}