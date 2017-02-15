import { LevelLoader } from "../LevelLoader";
import { WorldP2 } from "../Objects/WorldP2";
import { Mob } from "../Mobs/Mob";
import * as Global from "../Global";

export class SpawnPoint {
    private mobCount: number = 0;
    private nextSpawn: number = 0;
    private templates;
    private worldContainer: PIXI.Container;;
    private wp2: WorldP2;;

    constructor(public name: string,
        private x: number,
        private y: number,
        private area: number,
        private maxMobCount: number,
        private respawnSeconds: number,
        private entity: any,
        private active: boolean = true){

        this.nextSpawn = Date.now() / 1000;
       
    }

    public get IsActive() { return this.active; };
    public set IsActive(value: boolean) { this.active = value; };

    public onUpdate(dt: number) {
        if (this.active && this.mobCount < this.maxMobCount) {

            //  is it time to respawn?
            var now = Date.now() / 1000;
            if (this.nextSpawn <= now) {

                //  grab the level templates if not present
                if (!this.templates) {
                    var igs: any = Global.sceneMngr.GetScene("InGame");
                    this.templates = igs.currentLevel.templates;
                    this.worldContainer = igs.worldContainer as PIXI.Container;
                    this.wp2 = igs.wp2 as WorldP2;
                }

                var mobBody = LevelLoader.createMob(this.templates, this.entity);
                let dispObj = (mobBody as any).DisplayObject as PIXI.DisplayObject;

                let x = this.x + (Math.random() * this.area) - (this.area / 2);
                let y = this.y;

                mobBody.position = [x, y];
                this.wp2.addBody(mobBody);

                dispObj.position.set(x, y);
                this.worldContainer.addChild(dispObj);

                (dispObj as Mob).OnDeath = () => {
                    console.log("mob died");
                    this.mobCount--;
                }

                this.mobCount++;
                this.nextSpawn = (Date.now() / 1000) + this.respawnSeconds;
            }
        }
    }
}