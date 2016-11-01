import * as Global from "./Global";
import { Parallax } from "app/_engine/Parallax";
import { PhysicsConnector } from "app/_engine/PhysicsConnector";


export class LevelLoader {

    private levels: Array<ILevel> = [];

    constructor(levelOrName: IRootObject | string) {
        var root: IRootObject;
        if (typeof levelOrName === "string") {
            root = PIXI.loader.resources[levelOrName as string].data as IRootObject;
        } else {
            root = levelOrName as IRootObject;
        }
        this.levels = root.levels;
    }

    public get Levels():ILevel[] {
        return this.levels;
    }

    /**
     * Loads the level and adds all display objects to the container.
     * @param name
     * @param container
     */
    public BuildLevel(name: string):any {
        var levelDefinition: ILevel = undefined;
        for (var i = 0; i < this.levels.length; i++) {
            if (this.levels[i].name === name) {
                levelDefinition = this.levels[i];
                break;
            }
        }
        var result: any = {};
        if (levelDefinition) {
            if (levelDefinition.assets && levelDefinition.assets.length > 0) {
                //  TODO: preload assets and start level loading
            } else {
                this.createLevel(levelDefinition, result);
            }
        }
        return result;
    }

    private createLevel(level : ILevel, result: any) {
        result.parallax = [];
        result.physicsConnector = new PhysicsConnector<p2.Body>();

        //--------------------------------------
        //  create parallax objects
        //--------------------------------------            
        var vps = new PIXI.Point(Global.SCENE_WIDTH, Global.SCENE_HEIGHT);
        level.parallax.forEach((iplx, idx, arr) => {
            var parallax = new Parallax(vps, iplx.parallaxFactor);
            parallax.setTextures(iplx.tiles);
            parallax.y = iplx.y;
            result.parallax.push(parallax);            
        });

        //--------------------------------------
        //  create display/physics object pairs
        //--------------------------------------
        level.map.entities.forEach((entity, idx, arr) => {
            var dispObj: PIXI.DisplayObject = this.buildDisplayObject(entity.displayObject);
            var p2body: p2.Body = this.buildPhysicsObject(entity.body, dispObj);
            result.physicsConnector.addObjects(dispObj, p2body);
        });

        return result;
    }

    private buildDisplayObject(definition: IDisplayObject): PIXI.DisplayObject {
        var dispObj: PIXI.DisplayObject
        switch (definition.type) {
            case "AnimatedSprite":
                //  TODO: implement
                break;
            case "Sprite":
                var text = PIXI.loader.resources[definition.texture].texture;
                dispObj = new PIXI.Sprite(text);
                break;
        }
        dispObj.pivot.set(0.5);
        if ((dispObj as any).anchor) {
            (dispObj as any).anchor.set(0.5);
        }
        if (definition.xy) {
            dispObj.position.set(definition.xy[0], definition.xy[1]);
        }
        if (definition.scale) {
            dispObj.scale.set(definition.scale[0], definition.scale[1]);
        }
        dispObj.rotation = definition.rotation || 0;
        return dispObj;
    }

    private buildPhysicsObject(definition: IBody, dispObj: PIXI.DisplayObject): p2.Body {
        var body: p2.Body;
        if (definition) {
            var options: p2.BodyOptions = {
                mass: definition.mass,
                position: definition.xy ? definition.xy : [dispObj.x, dispObj.y],
                angle: definition.angle || dispObj.rotation,
                //angularVelocity?: number;
                //force?: number[];
                //angularForce?: number;
                //velocity?: number[];
                //fixedRotation?: boolean;
            };
            body = new p2.Body(options);
            body.type = definition.type;

            var shape: p2.Shape;
            switch (definition.shape) {
                case "Box":
                    //  get the size
                    var w, h;
                    if (definition.size) {
                        w = definition.size[0]; 
                        h = definition.size[1];
                    } else {
                        var doAny = dispObj as any;
                        if (doAny.width) {
                            w = doAny.width;
                            h = doAny.height;
                        } else {
                            //  TODO: check this - seems not to get correct bounds
                            w = dispObj.scale.x * dispObj.getLocalBounds().width;
                            h = dispObj.scale.y * dispObj.getLocalBounds().height;
                        }
                    }
                    shape = new p2.Box({
                        width:  w,
                        height: h,
                    });
                    break;                
                //  TODO: implement
            }
            body.addShape(shape);
        }
        return body;
    }
}


export interface IParallax {
    index: number;
    name: string;
    parallaxFactor: number;
    y: number;
    tiles: string[];
}

export interface IBody {
    shape: string,
    type: number;
    xy: number[];
    size?: number[];
    mass: number;
    angle: number;
}

export interface IDisplayObject {
    type: string,
    texture: string;
    xy?: number[];
    scale?: number[];
    rotation?: number;
}

export interface IEntity {
    displayObject: IDisplayObject;
    body: IBody;
}

export interface ILevelMap {
    entities: IEntity[];
}

export interface ILevel {
    id: number;
    assets?: string[];
    name: string;
    parallax: IParallax[];
    map: ILevelMap;
}

export interface IRootObject {
    levels: ILevel[];
}