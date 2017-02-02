import { AI } from "./AI";
import { Mob } from "./Mob";

/**
 * Can attack and turn towards player but invokes no other actions.
 */
export class BasicStaticAI extends AI {

    constructor(mobEntity: Mob) {
        super(mobEntity);
    }
}