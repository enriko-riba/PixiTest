/**
 * Base for bullets, decals etc.
 */
export class Particle extends PIXI.Sprite {
    private direction: PIXI.Point;
    private velocity: number;
    private ttl: number;
    private startTime: number;

    /**
     * Creates a new particle.
     *
     * @param texture
     * @param direction
     * @param velocity in pixels per second
     * @param ttl time to live in seconds
     */
    constructor(texture: PIXI.Texture, position: PIXI.Point, direction: PIXI.Point, velocity: number, ttl: number) {
        super(texture);
        this.position = position;

        this.velocity = velocity / 1000;
        this.ttl = ttl;
        this.startTime = Date.now() / 1000;

        //  normalize movement vector
        let len = direction.x * direction.x + direction.y * direction.y;
        len = 1 / Math.sqrt(len);
        this.direction.set(direction.x * len, direction.y * len);
    }


    public onUpdate = (dt: number) => {
        let distance = dt * this.velocity;
        //  TODO: set body position to get collisions
        this.x += (distance * this.direction.x);
        this.y += (distance * this.direction.y);
    }
}