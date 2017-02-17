import { SceneManager } from "app/_engine/SceneManager";
import { SoundMan } from "app/Game/SoundMan";
import { IRootObject } from "./LevelLoader";

export var SCENE_WIDTH: number = 1366;
export var SCENE_HEIGHT: number = 768;
export var BTN_WIDTH: number = 90;
export var BTN_HEIGHT: number = 40;

export var BACK_COLOR = 0x3a1010;//0x3a1818;

export var BTN_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        dropShadow: true,
        dropShadowColor: 0x102010,
        dropShadowDistance: 5,
        fontSize: "42px",
        fontFamily: "Calibri",
        fill: 0xf0f0f0,
        strokeThickness: 1,
        stroke: 0xCC5010
    };
export var TXT_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "26px",
        fontFamily: "Calibri",
        fill: 0x905b15,
        strokeThickness: 3,
        stroke: 0xcfbfbf
    };
export var INFO_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "25px",
        fontFamily: "Calibri",
        fill: 0x905b15,
        strokeThickness: 3,
        stroke: 0x111111
    };
export var INFO2_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "24px",
        fontFamily: "Calibri",
        fill: 0x84c202,
        strokeThickness: 3,
        stroke: 0x112111
    };

export var QUEST_ITEM_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "24px",
        fontFamily: "Calibri",
        fill: 0x84c2f2,
        strokeThickness: 3,
        stroke: 0x111121
    };
export var WARN_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "27px",
        fontFamily: "Calibri",
        fill: 0xff0011,
        strokeThickness: 4,
        stroke: 0x222222
    };

export var QUEST_STYLE: PIXI.ITextStyleStyle =
    {
        align: "left",
        padding: 0,
        fontSize: "21px",
        fontFamily: "Futura",
        fill: 0x79ff33,
        strokeThickness: 3,
        stroke: 0x021602,
        dropShadow: false
    };

export var sceneMngr: SceneManager;
export var snd: SoundMan;

export var GameLevels: {
    root: IRootObject;
} = {
        root: {
            templates: undefined,
            levels: undefined,
            quests: undefined
        }
    };

export var UserInfo: {
    id: number;
    name: string;
    gold: number;
    dust: number;
    exp: number;
    gamelevel: number;
    position: PIXI.Point;
} = {
        id: 0,
        name: "",
        gold: 0,
        dust: 0,
        exp: 0,
        gamelevel: 0,
        position: new PIXI.Point()
    };

