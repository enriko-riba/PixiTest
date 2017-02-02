/**
 * Base for bullets, decals etc.
 */
export class Bullet extends PIXI.Sprite {
    private direction: PIXI.Point = new PIXI.Point();
    private velocity: number;
    private ttl: number;
    private startTime: number;
    private isDead: boolean;
    private onDeath: () => void;

    /**
     * Creates a new bullet particle.
     *
     * @param texture
     * @param velocity in pixels per second
     * @param ttl time to live in seconds
     * @param damage bullet hit damage
     */
    constructor(texture: PIXI.Texture, velocity: number, ttl: number, private damage: number) {
        super(texture);

        this.velocity = velocity / 1000;
        this.ttl = ttl;
        this.IsDead = false;
        this.interactionType = 666;
    }

    public set Direction(direction: PIXI.Point) {
        //  normalize movement vector
        let len = direction.x * direction.x + direction.y * direction.y;
        len = 1 / Math.sqrt(len);
        this.direction.set(direction.x * len, direction.y * len);
    }

    public get IsDead() {
        return this.isDead;
    }
    public set IsDead(value: boolean) {
        if (value != this.isDead) {
            this.isDead = value;
            console.log("bullet is dead: " + value);

            //  if set to alive remember starttime
            if (!this.isDead) {
                this.startTime = Date.now() / 1000;
            }

            //  fire OnDeath if needed
            if (this.isDead && this.onDeath) {
                this.onDeath();
            }

            this.visible = !this.isDead;
        }
    }

    public set OnDeath(cb: { (): void }) {
        this.onDeath = cb;
    }
    public get OnDeath() {
        return this.onDeath;
    }


    public onUpdate = (dt: number) => {
        let now = Date.now() / 1000;
        let ellapsed = now - this.startTime;
        //console.log("now: " + now + ", alive: " + ellapsed);

        // TTL expiry
        this.IsDead = this.ttl < ellapsed;

        //  update position
        if (!this.isDead) {
            let distance = dt * this.velocity;
            //  TODO: set body position to get collisions
            this.x += (distance * this.direction.x);
            this.y += (distance * this.direction.y);
        }
    }
}