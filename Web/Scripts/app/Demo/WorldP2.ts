import * as p2 from "p2";
import { Dictionary } from "app/_engine/Dictionary";

/**
 * Tuple of two physics bodies touching or penetrating each other.
 */
export class ContactPair {
    constructor(public BodyA: p2.Body, public BodyB: p2.Body) { }
}

/**
 * Takes care of the physics simulations.
 */
export class WorldP2 {
    public player: p2.Body;
    private world: p2.World;
    private ground: p2.Body;


    private playerPosition: PIXI.Point;
    private materials: Dictionary<p2.Material>;

    private contactPairs: Array<ContactPair> = [];
    private contactWatch: Array<number> = [];

    private readonly fixedTimeStep = 1 / 60; // seconds


    constructor(playerPosition: PIXI.Point) {
        this.world = new p2.World({
            gravity: [0, -9.0]
        });
        
        this.setupMaterials();

        this.playerPosition = playerPosition;

        // Create an infinite ground plane body
        this.ground = new p2.Body({
            mass: 0,
        });
        var shape = new p2.Plane();
        shape.material = this.materials.get("ground_default");
        this.ground.addShape(shape);
        this.world.addBody(this.ground);

        //  player body
        this.player = new p2.Body({
            mass: 40,
            position: [playerPosition.x, playerPosition.y]            
        });
        shape = new p2.Capsule({
            length: 20,
            radius: 6,
        });
        shape.material = this.materials.get("player");
        this.player.addShape(shape);
        this.world.addBody(this.player);


        this.world.on("beginContact", this.beginContact, this);
        this.world.on("endContact", this.endContact, this);
    }

    /**
     * advances the physics simulation for the given dt time
     * @param dt the time in milliseconds since the last simulation step
     */
    public update(dt: number): void {
        this.world.step(this.fixedTimeStep, dt, 30);
        this.playerPosition.x = this.player.interpolatedPosition[0];
        this.playerPosition.y = this.player.interpolatedPosition[1];
    }

    /**
     * adds an object to the p2 world
     * @param bodyOptions
     * @param shape
     */
    public addObject(bodyOptions?: p2.BodyOptions, shape?: p2.Shape): p2.Body {
        var body = new p2.Body(bodyOptions);
        if (!shape) {
            shape = new p2.Box({ width: 64, height: 64 });
        }
        if (!shape.material) {
            shape.material = this.materials.get("box_default");
        }
        body.addShape(shape);
        this.world.addBody(body);
        return body;
    }

    /**
     * adds an object to the p2 world
     * @param body
     */
    public addBody(body: p2.Body):void {
        this.world.addBody(body);
    }

    /**
     * returns all contact pairs for the given body.
     * Note: the body must be in the contact watch list or an empty array will be returned.
     * @param body
     */
    public getContactsForBody(body: p2.Body): Array<ContactPair> {
        var foundPairs : Array<ContactPair> = [];
        this.contactPairs.forEach((cp, idx, arr) => {
            if (cp.BodyA === body || cp.BodyB === body) {
                foundPairs.push(cp);
            }
        });
        return foundPairs;
    }

    /**
     * Adds the body to the contact watch list.
     * Only bodies in this list will be elected for contact pair updates - if in this list their contact pairs
     * can be retrieved via the getContactsForBody() function.
     * @param body
     */
    public addContactWatch(body: p2.Body): void {
        this.contactWatch.push(body.id);
    }

    private beginContact = (evt: any) => {

        //  fire contact event if body supported

        var watchedItemFound = this.contactWatch.filter((bodyId, idx, arr) => {
            return (bodyId === evt.bodyA.id || bodyId === evt.bodyB.id);
        });
        if (watchedItemFound && watchedItemFound.length > 0) {
            var cp = new ContactPair(evt.bodyA, evt.bodyB);
            this.contactPairs.push(cp);
        }
    };

    private endContact = (evt: any) => {
        var foundIdx: number = -1;
        for (var i = 0; i < this.contactPairs.length; i++) {
            var cp = this.contactPairs[i];
            if (
                (cp.BodyA === evt.bodyA && cp.BodyB === evt.bodyB) ||
                (cp.BodyA === evt.bodyB && cp.BodyB === evt.bodyA)) {
                foundIdx = i;
                break;
            }
        }

        if (foundIdx >= 0) {
            this.contactPairs.splice(foundIdx, 1);
        }
    };  
    
    private setupMaterials(): void {
        this.materials = new Dictionary<p2.Material>();
        this.materials.set("player", new p2.Material(p2.Material.idCounter++));
        this.materials.set("ground_default", new p2.Material(p2.Material.idCounter++));
        this.materials.set("box_default", new p2.Material(p2.Material.idCounter++));


        var groundContactMaterial = new p2.ContactMaterial(
            this.materials.get("player"),
            this.materials.get("ground_default"),
            {
                friction: 0.4,
                restitution: 0.2,
                stiffness: p2.Equation.DEFAULT_STIFFNESS * 0.5,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity:0
            });
        this.world.addContactMaterial(groundContactMaterial);

        var boxContactMaterial = new p2.ContactMaterial(
            this.materials.get("player"),
            this.materials.get("box_default"),
            {
                friction: 0.2,
                restitution: 0.3,
                stiffness: p2.Equation.DEFAULT_STIFFNESS * 0.5,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity: 0
            });
        this.world.addContactMaterial(boxContactMaterial);
    }
}