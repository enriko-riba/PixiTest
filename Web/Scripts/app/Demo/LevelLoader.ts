import * as Global from "./Global";
import { Parallax } from "app/_engine/Parallax";
import { PhysicsConnector } from "app/_engine/PhysicsConnector";

import { Bumper } from "./Bumper";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";

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

    /**
     * Creates a display object from the definition.
     * @param definition
     */
    private buildDisplayObject(definition: IDisplayObject): PIXI.DisplayObject {
        var dispObj: PIXI.DisplayObject
        switch (definition.type) {
            case "AnimatedSprite":
                var aspr = new AnimatedSprite();
                definition.sequences.forEach((seq, idx, arr) => {
                    var aseq = new AnimationSequence(seq.name, seq.texture, seq.frames, seq.framesize[0], seq.framesize[1]);
                    aspr.addAnimations(aseq);
                });
                aspr.PlayAnimation(definition.sequences[0].name, definition.fps);
                aspr.Anchor = new PIXI.Point(0.5,0.5);
                dispObj = aspr;
                break;

            case "Sprite":
                var text = PIXI.loader.resources[definition.texture].texture;
                var spr = new PIXI.Sprite(text);
                spr.anchor.set(0.5);
                dispObj = spr;
                break;

            case "Bumper":
                var bmp = new Bumper();
                bmp.anchor.set(0.5);
                dispObj = bmp;
                break;
        }

        dispObj.pivot.set(0.5);
        dispObj.rotation = definition.rotation || 0;
        if (definition.xy) {
            dispObj.position.set(definition.xy[0], definition.xy[1]);
        }
        if (definition.scale) {
            dispObj.scale.set(definition.scale[0], definition.scale[1]);
        }
        return dispObj;
    }

    /**
     * Creates a physics body and shape from the definition.
     * @param definition
     * @param dispObj the display object to retrieve the defaults from.
     */
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
                case "Circle":                    
                    shape = new p2.Circle({ radius: definition.size[0] });
                    break;
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

export interface ISequence {
    name: string;
    texture: string;
    frames: number[];
    framesize: number[];
}

export interface IDisplayObject {
    type: string,
    texture: string;
    xy?: number[];
    scale?: number[];
    rotation?: number;


    fps?: number;
    sequences?:ISequence[]
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