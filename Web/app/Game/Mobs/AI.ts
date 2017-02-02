import * as Global from "../Global";
import { Mob, AtrType, DirectionH } from "./Mob";

/**
 * Max distance at which the target can be acquired.
 */
let LOCK_DISTANCE = 350;

/**
 * Max distance at which the target is tracked.
 */
let TRACK_DISTANCE = 550;

/**
 * Base for all mob AI. Provides low level AI functions.
 */
export class AI {

    /**
     * True if the AI has a 'target lock' on the player.
     */
    protected hasTarget: boolean;

    /**
     * Distance from player.
     */
    protected targetDistance: number;

    protected lastFire: number = Date.now();    //  so that the attack is not triggered at right at init time

    private attackCD: number;

    constructor(protected mobEntity: Mob) {
        this.attackCD = mobEntity.Attributes[AtrType.AtkCD];
    }

    private calcDistance() {
        let dx = Global.UserInfo.position.x - this.mobEntity.x;
        let dy = Global.UserInfo.position.y - this.mobEntity.y;
        this.targetDistance = Math.sqrt(dx * dx + dy * dy);
    }

    private turnTowardsTarget() {
        //  negative left, positive right
        let dir = Global.UserInfo.position.x - this.mobEntity.x;

        if (dir < 0 && this.mobEntity.Direction != DirectionH.Left) {
            this.mobEntity.Direction = DirectionH.Left;
        } else if (dir > 0 && this.mobEntity.Direction != DirectionH.Right) {
            this.mobEntity.Direction = DirectionH.Right;
        }
    }

    public onUpdate = (dt: number) => {
        this.calcDistance();

        //  TODO: implement visibility check
        if (this.targetDistance < TRACK_DISTANCE) {
            this.turnTowardsTarget();
        }

        if (this.targetDistance < LOCK_DISTANCE) {
            this.hasTarget = true;

            //  check attack CD
            let nowMilliseconds = Date.now();
            let canFire = (this.lastFire + this.attackCD <= nowMilliseconds);
            if (canFire) {
                this.mobEntity.Attack();
                this.lastFire = nowMilliseconds;
            }
        } else {
            this.hasTarget = false;
        }
    }
}