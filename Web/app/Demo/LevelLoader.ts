import * as Global from "./Global";
import { Parallax } from "app/_engine/Parallax";
import { Bumper } from "./Bumper";
import { Lava } from "./Lava";
import { Platform } from "./Platform";
import { AnimatedSprite, AnimationSequence } from "app/_engine/AnimatedSprite";

export class LevelLoader {

    private levels: Array<ILevelDefinition> = [];

    constructor() {
        this.levels = Global.GameLevels.root.levels;
    }

    /**
     * Returns all assets referenced in the level.
     * @param root
     * @param levelId
     */
    public static GetLevelAssets(root: IRootObject, levelId: number): string[] {
        var assets: string[] = []
       
        var level: ILevelDefinition = undefined;
        for (var i = 0; i < root.levels.length; i++) {
            if (root.levels[i].id === levelId) {
                level = root.levels[i];
                break;
            }
        }

        if (level) {
            level.parallax.forEach((iplx, idx, arr) => {
                assets = assets.concat(iplx.tiles);
            });

            level.map.entities.forEach((entity: IMapEntity, idx, arr) => {
                var entityTemplate = level.map.templates.filter((item, idx, arr) => item.name === entity.template);
                if (entityTemplate && entityTemplate.length > 0) {
                    var template = entityTemplate[0];
                    var temp = $.extend(true, {}, template.displayObject);
                    var displayObjectDefinition = $.extend(temp, entity);

                    if (displayObjectDefinition.texture) {
                        if (typeof displayObjectDefinition.texture === "string") {
                            assets.push(displayObjectDefinition.texture);
                        } else {
                            assets = assets.concat(displayObjectDefinition.texture);
                        }
                    }

                    if (displayObjectDefinition.sequences) {
                        displayObjectDefinition.sequences.forEach((item) => {
                            assets.push(item.texture)
                        });
                    }
                }
            });
        }

        assets = LevelLoader.GetUniqueItems(assets);
        return assets;
    }

    private static GetUniqueItems(arr) {
        var n = {}, r = [];
        for (var i = 0; i < arr.length; i++) {
            if (!n[arr[i]]) {
                n[arr[i]] = true;
                r.push(arr[i]);
            }
        }
        return r;
    }

    public get Levels():ILevelDefinition[] {
        return this.levels;
    }

    /**
     * Finds a level by its name.
     * @param name
     * @param container
     */
    public FindLevel(name: string): ILevelDefinition {
        var levelDefinition: ILevelDefinition = undefined;
        for (var i = 0; i < this.levels.length; i++) {
            if (this.levels[i].name === name) {
                levelDefinition = this.levels[i];
                break;
            }
        }
        return levelDefinition;
    }

    /**
    * Loads the level.
    * @param name
    * @param container
    */
    public BuildLevel(id: number): ILevel {
        var levelDefinition: ILevelDefinition = undefined;
        for (var i = 0; i < this.levels.length; i++) {
            if (this.levels[i].id === id) {
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
            entities: [],
            start: []
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
                var temp = $.extend(true, {}, template.displayObject);
                var displayObjectDefinition = $.extend(temp, entity);
                var bodyDefinition = $.extend(entity, template.body);
                var dispObj: PIXI.DisplayObject = this.buildDisplayObject(displayObjectDefinition);
                dispObj.name = entity.name;
                (dispObj as any).templateName = template.name;
                var p2body: p2.Body = this.buildPhysicsObject(bodyDefinition, dispObj);
                (p2body as any).DisplayObject = dispObj;

                if (template.trigger || displayObjectDefinition.trigger) {
                    var temp = $.extend(true, {}, template.trigger);
                    (p2body as any).Trigger = $.extend(true, temp, displayObjectDefinition.trigger);
                }

                result.entities.push(p2body);
            } else {
                throw `Entity template: '${entity.template}' not found!`;
            }
        });
        result.start = level.map.start;
        return result;
    }

    /**
     * Creates a display object from the definition.
     * @param definition
     */
    private buildDisplayObject(definition: IDisplayObjectDefinition): PIXI.DisplayObject {
        var dispObj: PIXI.DisplayObject
        switch (definition.typeName) {
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
                var text = PIXI.loader.resources[definition.texture as string].texture;
                var spr = new PIXI.Sprite(text);

                if (definition.anchor === undefined)
                    definition.anchor = 0.5;
                spr.anchor.set(definition.anchor);

                if (definition.pivot === undefined)
                    definition.pivot = 0.5;

                if (definition.scale === undefined)
                    definition.scale = [1, -1];

                spr.pivot.set(definition.pivot);
                dispObj = spr;                
                break;

            case "Bumper":
                var bmp = new Bumper();
                bmp.anchor.set(0.5);
                dispObj = bmp;
                break;

            case "Lava":
                var lv = new Lava(definition.texture as string);                
                dispObj = lv;
                break;

            case "Platform":
                let pl: Platform = null;
                if (typeof definition.texture === "string") {
                    pl = new Platform(definition.texture);
                } else {
                    pl = new Platform(definition.texture[0], definition.tiles || 1, definition.texture[1], definition.texture[2]);
                }
                dispObj = pl;
        }
        
        dispObj.rotation = definition.rotation || 0;
        if (definition.xy) {
            dispObj.position.set(definition.xy[0], definition.xy[1]);
        }
        if (definition.scale) {
            dispObj.scale.set(definition.scale[0], definition.scale[1]);
        }
        if (definition.interactionType) {
            dispObj.interactionType = definition.interactionType;
        }
        
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

                case "Platform":
                    var w, h;
                    if (definition.size) {
                        w = definition.size[0];
                        h = definition.size[1];
                    } else {
                        w = Math.abs(dispObjAsAny.width);
                        h = Math.abs(dispObjAsAny.height);
                    }
                    shape = new p2.Box({
                        width: w,
                        height: h,
                    });

                    //  the position is centered but we need it to be left top aligned
                    body.position[0] = body.position[0] + w / 2;
                    body.position[1] = body.position[1] - h / 2;
                    break; 

                case "Box":
                    //  get the size
                    var w, h;
                    if (definition.size) {
                        w = definition.size[0]; 
                        h = definition.size[1];
                    } else {                        
                        if (dispObjAsAny.width) {
                            w = Math.abs(dispObjAsAny.width);
                            h = Math.abs(dispObjAsAny.height);
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

            if (!!dispObj.interactionType) {
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
    start: number[];
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
    typeName: string,
    texture: string | string[];
    tiles?: number,
    xy?: number[];
    scale?: number[];
    rotation?: number;
    pivot?: number;
    anchor?: number;
    interactionType?: number; 
    tint?: number;
    fps?: number;
    sequences?:IAnimationSequence[]
}

export interface ITriggerDefinition {
    type: string;
    distance?: number;
    text: string;
    textposition: number[]
    questId?: number;
    completedText?: string;
}

export interface ITemplate {
    name: string;
    displayObject: IDisplayObjectDefinition;
    body: IBodyDefinition;
    trigger: ITriggerDefinition;
}

export interface IMapEntity {
    template: string;
    xy?: number[];
    scale?: number[];
    rotation?: number;
    texture?: string;
    interactionType?: number; 
    name?: string;
}

export interface ILevelMap {
    start: number[];
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