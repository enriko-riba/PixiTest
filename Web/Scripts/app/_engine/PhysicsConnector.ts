/**
 * 
 */
export class PhysicsTuple<T> {
    constructor(
        public displayObject: PIXI.DisplayObject,
        public body: T
    ) { }
}


/**
 * 
 */
export class PhysicsConnector<T> {

    private updateDisplayObject: (tuple: PhysicsTuple<T>) => void;
    private updatePhysicsObject: (tuple: PhysicsTuple<T>) => void;

    private tuples: Array<PhysicsTuple<T>> = [];

    constructor(updateDisplayObject: (tuple: PhysicsTuple<T>) => void, updatePhysicsObject: (tuple: PhysicsTuple<T>) => void) {
        this.updateDisplayObject = updateDisplayObject;
        this.updatePhysicsObject = updatePhysicsObject;
    }

    public addObjects(displayObject: PIXI.DisplayObject, physicsObject: T):number {
        return this.tuples.push(new PhysicsTuple(displayObject, physicsObject));
    }

    public updateDisplayObjects() {
        this.tuples.forEach((tuple) => {
            this.updateDisplayObject(tuple);
        });
    }

    public updatePhysicsObjects() {
        this.tuples.forEach((tuple) => {
            this.updatePhysicsObject(tuple);
        });
    }
}