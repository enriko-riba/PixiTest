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
        this.levels = root.Levels;
    }

    public get Levels():ILevel[] {
        return this.levels;
    }

    public BuildLevel(name: string, container: PIXI.Container):any {
        var level: ILevel = undefined;
        for (var i = 0; i < this.levels.length; i++) {
            if (this.levels[i].Name === name) {
                level = this.levels[i];
                break;
            }
        }

        if (level) {
            var result :any = {};
            result.parallax = [];
            result.physicsConnector = new PhysicsConnector<p2.Body>();

            //--------------------------------------
            //  create parallax objects
            //--------------------------------------            
            var vps = new PIXI.Point(Global.SCENE_WIDTH, Global.SCENE_HEIGHT);
            level.Parallax.forEach((iplx, idx, arr) => {
                var parallax = new Parallax(vps, iplx.ParallaxFactor);
                parallax.setTextures(iplx.Tiles);
                parallax.y = iplx.y;

                //  save to result array
                result.parallax.push(parallax);

                //  add to container
                container.addChildAt(parallax, idx);
            });
            

            //--------------------------------------
            //  create physics objects
            //--------------------------------------
            level.Map.Entities.forEach((entity, idx, arr) => {
                var displayObjectDef = entity.DisplayObject;
                var bodyDef = entity.Body;

                switch (displayObjectDef.Type) {
                    case "AnimatedSprite": break;
                    case "Sprite": break;
                //  TODO: implement
                }

                if (bodyDef) {
                    switch (bodyDef.Type) {
                        case 0: break;
                        case 1: break;
                        case 2: break;
                        //  TODO: implement
                    }
                }
            });
        }

        return result;
    }
}


export interface IParallax {
    Index: number;
    Name: string;
    ParallaxFactor: number;
    y: number;
    Tiles: string[];
}

export interface IBody {
    Shape: string,
    Type: number;
    xy: number[];
    Mass: number;
    Angle: number;
}

export interface IDisplayObject {
    Type: string,
    Texture: string;
    Scale?: number;
    xy?: number[];
}

export interface IEntity {
    DisplayObject: IDisplayObject;
    Body: IBody;
}

export interface ILevelMap {
    Entities: IEntity[];
}

export interface ILevel {
    Id: number;
    Name: string;
    Parallax: IParallax[];
    Map: ILevelMap;
}

export interface IRootObject {
    Levels: ILevel[];
}