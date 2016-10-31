import * as Global from "./Global";
import { Parallax } from "app/_engine/Parallax";

export class LevelLoader {

    private levels: Array<ILevel> = [];

    constructor(levelOrName: RootObject | string) {
        var root: RootObject;
        if (typeof levelOrName === "string")
            root = PIXI.loader.resources[levelOrName as string].data as RootObject;
        else
            root = levelOrName as RootObject;

        this.levels = root.Levels;
    }


    public get Levels() {
        return this.levels;
    }

    public BuildLevel(name: string) {
        var level: ILevel = undefined;
        for (var i = 0; i < this.levels.length; i++) {
            if (this.levels[i].Name === name) {
                level = this.levels[i];
                break;
            }
        }

        if (level) {
            var result :any = {};

            //--------------------------------------
            //  create parallax objects
            //--------------------------------------
            result.parallax = [];
            var vps = new PIXI.Point(Global.SCENE_WIDTH, Global.SCENE_HEIGHT);
            level.Parallax.forEach((iplx, idx, arr) => {
                var parallax = new Parallax(vps, iplx.ParallaxFactor);
                parallax.setTextures(iplx.Tiles);
                parallax.y = iplx.y;

                //  save to result
                result.parallax.push(parallax);
            });


            //--------------------------------------
            //  create physics objects
            //--------------------------------------
            level.Map.Body.forEach((ibdy, idx, arr) => {
            
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
    Type: string;
    xy: number[];
    Texture: string;
    Mass: number;
    Angle: number;
}

export interface IDisplayObject {
}

export interface IEntity {
    DisplayObject: IDisplayObject;
    Body: IBody;
}

export interface ILevelMap {
    Entities: IEntity[];
    //Body: IBody[];
    //NPC: any[];
}

export interface ILevel {
    Id: number;
    Name: string;
    Parallax: IParallax[];
    Map: ILevelMap;
}

export interface RootObject {
    Levels: ILevel[];
}