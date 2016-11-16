import * as Global from "./Global";
import { Parallax } from "app/_engine/Parallax";
import { Bumper } from "./Bumper";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";

export class LevelLoader {

    private levels: Array<ILevelDefinition> = [];

    constructor(levelOrName: IRootObject | string) {
        var root: IRootObject;
        if (typeof levelOrName === "string") {
            root = PIXI.loader.resources[levelOrName as string].data as IRootObject;
        } else {
            root = levelOrName as IRootObject;
        }
        this.levels = root.levels;
    }

    public get Levels():ILevelDefinition[] {
        return this.levels;
    }

    /**
     * Loads the level and adds all display objects to the container.
     * @param name
     * @param container
     */
    public BuildLevel(name: string): any {
        var levelDefinition: ILevelDefinition = undefined;
        for (var i = 0; i < this.levels.length; i++) {
            if (this.levels[i].name === name) {
                levelDefinition = this.levels[i];
                break;
            }
        }
        var result: ILevel;
        if (levelDefinition) {
            if (levelDefinition.assets && levelDefinition.assets.length > 0) {
                //  TODO: preload assets and start level loading
            } else {
                result = this.createLevel(levelDefinition);
            }
        }
        return result;
    }

    private createLevel(level: ILevelDefinition): ILevel {
        var result: ILevel = {
            parallax : [],
            entities : []
        };

        //--------------------------------------
        //  create parallax objects
        //--------------------------------------            
        var vps = new PIXI.Point(Global.SCENE_WIDTH, Global.SCENE_HEIGHT);
        level.parallax.forEach((iplx, idx, arr) => {
            var parallax = new Parallax(vps, iplx.parallaxFactor, iplx.scale);
            parallax.y = iplx.y;           
            parallax.setTextures(iplx.tiles);
            result.parallax.push(parallax);            
        });
       
        //--------------------------------------
        //  create display/physics object pairs
        //--------------------------------------
        level.map.entities.forEach((entity: IMapEntity, idx, arr) => {
            var entityTemplate = level.map.templates.filter((item, idx, arr) => item.name === entity.template);
            if (entityTemplate && entityTemplate.length > 0) {
                var template = entityTemplate[0];
                var displayObjectDefinition = $.extend(template.displayObject, entity);
                var bodyDefinition = $.extend(template.body, entity);
                var dispObj: PIXI.DisplayObject = this.buildDisplayObject(displayObjectDefinition);
                (dispObj as any).templateName = template.name;
                var p2body: p2.Body = this.buildPhysicsObject(bodyDefinition, dispObj);
                (p2body as any).DisplayObject = dispObj;
                result.entities.push(p2body);
            } else {
                throw `Entity template: '${entity.template}' not found!`;
            }
        });

        return result;
    }

    /**
     * Creates a display object from the definition.
     * @param definition
     */
    private buildDisplayObject(definition: IDisplayObjectDefinition): PIXI.DisplayObject {
        var dispObj: PIXI.DisplayObject
        switch (definition.type) {
            case "AnimatedSprite":
                var aspr = new AnimatedSprite();
                definition.sequences.forEach((seq, idx, arr) => {
                    var aseq = new AnimationSequence(seq.name, seq.texture, seq.frames, seq.framesize[0], seq.framesize[1]);
                    aspr.addAnimations(aseq);
                });
                aspr.PlayAnimation(definition.sequences[0].name, definition.fps);
                aspr.Anchor = new PIXI.Point(0.5, 0.5);
                
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
        if (definition.collectibleType) {
            dispObj.collectibleType = definition.collectibleType;
        }
        //if (definition.tint) {
        //    if (typeof definition.tint === "string") definition.tint = parseInt(definition.tint, 16);
        //    if ((dispObj as any).tint) (dispObj as any).tint = definition.tint;
        //    if ((dispObj as any).Tint) (dispObj as any).Tint = definition.tint;
        //}
        return dispObj;
    }

    /**
     * Creates a physics body and shape from the definition.
     * @param definition
     * @param dispObj the display object to retrieve the defaults from.
     */
    private buildPhysicsObject(definition: IBodyDefinition, dispObj: PIXI.DisplayObject): p2.Body {
        var body: p2.Body;
        if (definition) {
            var options: p2.BodyOptions = {
                mass: definition.mass,
                position: definition.xy ? definition.xy : [dispObj.x, dispObj.y],
                angle: definition.angle || dispObj.rotation,
                fixedRotation: definition.fixedRotation || false,
                angularDamping: definition.angularDamping || 0.1,
                damping: definition.damping || 0.1, 
            };
            body = new p2.Body(options);
            body.type = definition.type;
            var dispObjAsAny:any = dispObj as any;
            var shape: p2.Shape;
            switch (definition.shape) {
                case "Circle":  
                    var radius = definition.size ? definition.size[0] : dispObjAsAny.width;            
                    shape = new p2.Circle({ radius: radius });
                    break;
                case "Box":
                    //  get the size
                    var w, h;
                    if (definition.size) {
                        w = definition.size[0]; 
                        h = definition.size[1];
                    } else {                        
                        if (dispObjAsAny.width) {
                            w = dispObjAsAny.width;
                            h = dispObjAsAny.height;
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
                //  TODO: implement other shapes if needed
            }

            if (definition.material) {
                (shape as any).materialName = definition.material;                
            }

            if (!!dispObj.collectibleType) {
                shape.sensor = true;
                body.type = p2.Body.STATIC;
                body.collisionResponse = false;
                body.setDensity(0.0); //   this is to prevent body impacts on player collide (makes no sense as it is a sensor, bug maybe?)
                console.log("created collectible sensor", shape);
            }
            body.addShape(shape);
        }
        return body;
    }
}

export interface ILevel {
    parallax: Parallax[];
    entities: p2.Body[];
}

export interface IParallaxDefinition {
    index: number;
    name: string;
    parallaxFactor: number;
    y: number;
    tiles: string[];
    scale?: number;
}

export interface IBodyDefinition {
    shape: string,
    type: number;
    xy: number[];
    size?: number[];
    mass: number;
    angle: number;
    material?: string;
    damping?: number; 
    angularDamping?: number;
    fixedRotation?: boolean;
}

export interface IAnimationSequence {
    name: string;
    texture: string;
    frames: number[];
    framesize: number[];
}

export interface IDisplayObjectDefinition {
    type: string,
    texture: string;
    xy?: number[];
    scale?: number[];
    rotation?: number;
    collectibleType?: number; 
    tint?: number;
    fps?: number;
    sequences?:IAnimationSequence[]
}
export interface ITemplate {
    name: string;
    displayObject: IDisplayObjectDefinition;
    body: IBodyDefinition;
}

export interface IMapEntity {
    template: string;
    xy?: number[];
    scale?: number[];
    rotation?: number;
    texture?: string;
    collectibleType?: number; 
}

export interface ILevelMap {
    templates: ITemplate[];
    entities: IMapEntity[];
    NPC: any[];
}

export interface ILevelDefinition {
    id: number;
    assets?: string[];
    name: string;
    parallax: IParallaxDefinition[];
    map: ILevelMap;
}

export interface IRootObject {
    levels: ILevelDefinition[];
}