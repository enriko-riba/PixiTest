﻿import * as p2 from "p2";
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
    public playerBody: p2.Body;
    private world: p2.World;
    private ground: p2.Body;

    private playerPosition: PIXI.Point;
    private materials: Dictionary<p2.Material>;

    private contactPairs: Array<ContactPair> = [];
    private contactWatch: Array<number> = [];

    /**
     * We hold all player contacts separate (due to heavy usage).
     */
    private playerBodyContacts: Array<p2.Body> = [];

    private readonly fixedTimeStep = 1 / 60; // seconds


    constructor(playerPosition: PIXI.Point) {
        this.world = new p2.World({
            gravity: [0, -1500]
        });
        this.world.sleepMode = p2.World.BODY_SLEEPING;

        this.setupMaterials();
        this.playerPosition = playerPosition;

        // create an infinite ground plane body
        this.ground = new p2.Body({
            mass: 0,
        });
        var shape = new p2.Plane();
        shape.material = this.materials.get("ground_default");
        this.ground.addShape(shape);
        this.world.addBody(this.ground);

        //  player body
        this.playerBody = new p2.Body({
            mass: 40,
            position: [playerPosition.x, playerPosition.y],
            fixedRotation: true,
        });
        shape = new p2.Circle({
            radius: 24,
        });
        shape.material = this.materials.get("player");
        this.playerBody.addShape(shape);
        this.world.addBody(this.playerBody);

        this.world.solver.iterations = 25;
        this.world.on("beginContact", this.beginContact, this);
        this.world.on("endContact", this.endContact, this);
    }

    /**
     * Adds an event handler to the p2 world object.
     * @param eventName
     * @param handler
     */
    public on(eventName: string, handler: any, context?: any): void {
        context = context || this;
        this.world.on(eventName, handler, context);
    }

    /**
     * advances the physics simulation for the given dt time
     * @param dt the time in seconds since the last simulation step
     */
    public update(dt: number): void {
        //console.log("worldp2 update() dt: " + dt/1000);
        this.world.step(this.fixedTimeStep, dt/1000, 20);
        this.playerPosition.x = this.playerBody.interpolatedPosition[0];
        this.playerPosition.y = this.playerBody.interpolatedPosition[1];
    }

    /**
     * Removes the body from world.
     * @param body
     */
    public removeBody(body: p2.Body): void {
        this.world.removeBody(body);
    }

    /**
     * adds an object to the p2 world
     * @param bodyOptions
     * @param shape
     */
    //public addObject(bodyOptions?: p2.BodyOptions, shape?: p2.Shape): p2.Body {
    //    var body = new p2.Body(bodyOptions);
    //    if (!shape) {
    //        shape = new p2.Box({ width: 64, height: 64 });
    //    }
    //    if (!shape.material) {
    //        shape.material = this.materials.get("box_default");
    //    }
    //    body.addShape(shape);
    //    this.world.addBody(body);
    //    return body;
    //}

    /**
     * adds an object to the p2 world
     * @param body
     */
    public addBody(body: p2.Body): void {
        // HACK: loader specific implementation stores the material name in shape.materialName
        if (body.shapes && body.shapes.length > 0) {
            for (var i = 0, len = body.shapes.length; i < len; i++) {
                let shape: any = body.shapes[i];
                if (shape.materialName && !shape.material) {
                    shape.material = this.materials.get(shape.materialName);
                }
            }            
        }
        this.world.addBody(body);
    }

    /**
     * Clears all saved contacts (from contactPairs) for the given body.
     * @param body
     */
    public clearContactsForBody(body: p2.Body):void {
        if (body === this.playerBody) {
            this.playerBodyContacts = [];
            return;
        }

        var foundIdx: number = 0;
        while (foundIdx > -1) {
            foundIdx = -1;
            for (var i = 0; i < this.contactPairs.length; i++) {
                let cp:ContactPair = this.contactPairs[i];
                if (cp.BodyA === body || cp.BodyB === body)  {
                    foundIdx = i;
                    break;
                }
            }

            if (foundIdx >= 0) {
                this.contactPairs.splice(foundIdx, 1);
            }
        }
    }

    /**
     * returns all contact pairs for the given body.
     * Note: the body must be in the contact watch list or an empty array will be returned.
     * @param body
     */
    public getContactsForBody(body: p2.Body): Array<ContactPair> {
        var foundPairs: Array<ContactPair> = [];
        for (var i = 0, len = this.contactPairs.length; i < len; i++) {
            let cp: ContactPair = this.contactPairs[i];        
            if (cp.BodyA === body || cp.BodyB === body) {
                foundPairs.push(cp);
            }
        };
        return foundPairs;
    }

    /**
     * Adds the body to the contact watch list.
     * Only bodies in this list can be retrieved via the getContactsForBody() function.
     * @param body
     */
    public addContactWatch(body: p2.Body): void {
        this.contactWatch.push(body.id);
    }

    /**
     * Returns all bodies the player has contact with.
     */
    public get playerContacts(): p2.Body[]{
        return this.playerBodyContacts;
    }

    /**
     * Returns the players x position.
     */
    public get playerX(): number {
        return this.playerPosition.x;
    }
    /**
     * Returns the players x position.
     */
    public get playerY(): number {
        return this.playerPosition.y;
    }

    private beginContact = (evt: any) => {

        //  check for player contacts (but only with dynamic bodies)
        if (this.playerBody === evt.bodyA) {
            //console.log("beginContact: ", evt.bodyB, this.player);
            //console.log("contact velocity: " + this.player.velocity[0] + ", " + this.player.velocity[1]);
            this.playerBodyContacts.push(evt.bodyB);
            this.world.emit({ type: "playerContact", velocity: this.playerBody.velocity, body: evt.bodyB });
            return;
        } else if (this.playerBody === evt.bodyB) {
            //console.log("beginContact: ", evt.bodyA, this.player);
            //console.log("contact velocity: " + this.player.velocity[0] + ", " + this.player.velocity[1]);
            this.playerBodyContacts.push(evt.bodyA);
            this.world.emit({ type: "playerContact", velocity: this.playerBody.velocity, body: evt.bodyB });
            return;
        }

        //  check for watched bodies and store pairs if match
        var watchedItemFound = this.contactWatch.filter((bodyId) => {
            return (bodyId === evt.bodyA.id || bodyId === evt.bodyB.id);
        });
        if (watchedItemFound && watchedItemFound.length > 0) {
            let cp: ContactPair = new ContactPair(evt.bodyA, evt.bodyB);
            this.contactPairs.push(cp);
        }
    };

    private endContact = (evt: any) => {
        //  check for player contacts 
        if (this.playerBody === evt.bodyA) {
            //console.log("endContact: ", evt);
            //console.log("endcontact velocity: " + this.player.velocity[0] + ", " + this.player.velocity[1]);
            var bodyIDX = this.playerBodyContacts.indexOf(evt.bodyB);
            this.playerBodyContacts.splice(bodyIDX, 1);
            return;
        } else if (this.playerBody === evt.bodyB) {
            //console.log("endContact: ", evt);
            //console.log("endcontact velocity: " + this.player.velocity[0] + ", " + this.player.velocity[1]);
            var bodyIDX = this.playerBodyContacts.indexOf(evt.bodyB);
            this.playerBodyContacts.splice(bodyIDX, 1);
            return;
        }


        //console.log("endContact: ", evt);
        var foundIdx: number = -1;
        for (var i = 0; i < this.contactPairs.length; i++) {
            let cp: ContactPair = this.contactPairs[i];
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
        this.materials.set("bumper", new p2.Material(p2.Material.idCounter++));


        var playerGroundContactMaterial = new p2.ContactMaterial(
            this.materials.get("player"),
            this.materials.get("ground_default"),
            {
                friction: 0.8,
                restitution: 0.1,
                stiffness: p2.Equation.DEFAULT_STIFFNESS,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity:0
            });
        this.world.addContactMaterial(playerGroundContactMaterial);

        var playerBoxContactMaterial = new p2.ContactMaterial(
            this.materials.get("player"),
            this.materials.get("box_default"),
            {
                friction: 0.6,
                restitution: 0.15,
                stiffness: p2.Equation.DEFAULT_STIFFNESS,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity: 0
            });
        this.world.addContactMaterial(playerBoxContactMaterial);

        var playerBumperContactMaterial = new p2.ContactMaterial(
            this.materials.get("player"),
            this.materials.get("bumper"),
            {
                friction: 0.90,
                restitution: 0.5,
                stiffness: Number.MAX_VALUE,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: Number.MAX_VALUE,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity: 0
            });
        this.world.addContactMaterial(playerBumperContactMaterial);

        var boxGroundContactMaterial = new p2.ContactMaterial(
            this.materials.get("box_default"),
            this.materials.get("ground_default"),
            {
                friction: 0.9,
                restitution: 0.1,
                stiffness: p2.Equation.DEFAULT_STIFFNESS,
                relaxation: p2.Equation.DEFAULT_RELAXATION,
                frictionStiffness: p2.Equation.DEFAULT_STIFFNESS,
                frictionRelaxation: p2.Equation.DEFAULT_RELAXATION,
                surfaceVelocity: 0
            });
        this.world.addContactMaterial(boxGroundContactMaterial);
    }
}