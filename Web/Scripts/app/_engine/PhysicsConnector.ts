/**
 * Storage for pairs of display-physics object pairs.
 */
export class PhysicsTuple<T> {
    constructor(
        public displayObject: PIXI.DisplayObject,
        public body: T
    ) { }
}


/**
 *  Glue between a PIXI.DisplayObject and a physics object (body).
 *  Stores all objects a pairs of a display object and body.
 *  Supports iterating through tuples, updating display objects with custom callback, updating physics objects with custom callback. 
 */
export class PhysicsConnector<T> {

    private updateDisplayObject: (displayObject: PIXI.DisplayObject, body: T) => void;
    private updatePhysicsObject: (displayObject: PIXI.DisplayObject, body: T) => void;

    private tuples: Array<PhysicsTuple<T>> = [];

    constructor(updateDisplayObject?: (displayObject: PIXI.DisplayObject, body: T) => void,
                updatePhysicsObject?: (displayObject: PIXI.DisplayObject, body: T) => void) {
        this.updateDisplayObject = updateDisplayObject;
        this.updatePhysicsObject = updatePhysicsObject;
    }

    /**
     * Iterates through each tuple and invokes the supplied callback function.
     * @param cb callback to be invoked
     */
    public forEach(cb: (displayObject: PIXI.DisplayObject, body: T) => void) {
        this.tuples.forEach((tuple) => {
            cb(tuple.displayObject, tuple.body);
        });
    }

    public get DisplayObjectUpdater(): (displayObject: PIXI.DisplayObject, body: T)=> void {
        return this.updateDisplayObject;
    }
    public set DisplayObjectUpdater(cb: (displayObject: PIXI.DisplayObject, body: T)=> void) {
        this.updateDisplayObject = cb;
    }

    public addObjects(displayObject: PIXI.DisplayObject, physicsObject: T):number {
        return this.tuples.push(new PhysicsTuple(displayObject, physicsObject));
    }

    public updateDisplayObjects() {
        this.tuples.forEach((tuple) => {
            this.updateDisplayObject(tuple.displayObject, tuple.body);
        });
    }

    public updatePhysicsObjects() {
        this.tuples.forEach((tuple) => {
            this.updatePhysicsObject(tuple.displayObject, tuple.body);
        });
    }
}