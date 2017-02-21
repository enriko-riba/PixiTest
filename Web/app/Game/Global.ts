import { SceneManager } from "app/_engine/SceneManager";
import { SoundMan } from "app/Game/SoundMan";
import { IRootObject } from "./LevelLoader";
import { PlayerStats } from "./Player/PlayerStats";

export var SCENE_WIDTH: number = 1366;
export var SCENE_HEIGHT: number = 768;
export var BTN_WIDTH: number = 90;
export var BTN_HEIGHT: number = 40;

export var BACK_COLOR = 0x3a1010;//0x3a1818;

let ff = "Farsan";

export var BTN_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        dropShadow: true,
        dropShadowColor: 0x102010,
        dropShadowDistance: 5,
        fontSize: "42px",
        fontFamily: ff,
        fill: 0xf0f0f0,
        strokeThickness: 1,
        stroke: 0xCC5010
    };
export var TXT_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "26px",
        fontFamily: ff,
        fill: 0x905b15,
        strokeThickness: 3,
        stroke: 0xcfbfbf
    };
export var TXT_SMALL_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "13px",
        fontFamily: ff,
        fill: 0x111111,
        strokeThickness: 4,
        stroke: 0xffffff
    };

export var INFO_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "25px",
        fontFamily: ff,
        fill: 0x905b15,
        strokeThickness: 3,
        stroke: 0x111111
    };
export var INFO2_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "24px",
        fontFamily: ff,
        fill: 0x84c202,
        strokeThickness: 3,
        stroke: 0x112111
    };

export var QUEST_ITEM_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "28px",
        fontFamily: ff,
        fill: 0x84c2f2,
        strokeThickness: 4,
        stroke: 0x111121
    };
export var WARN_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "27px",
        fontFamily: ff,
        fill: 0xff0011,
        strokeThickness: 4,
        stroke: 0x222222
    };

export var QUEST_STYLE: PIXI.ITextStyleStyle =
    {
        align: "left",
        padding: 0,
        fontSize: "26px",
        fontFamily: ff,
        fill: 0x8a3333,
        strokeThickness: 3,
        stroke: 0xefefff,
        dropShadow: true,
        dropShadowDistance: 7,
        dropShadowBlur:8
    };

export var sceneMngr: SceneManager;
export var snd: SoundMan;
export var stats: PlayerStats = new PlayerStats(); 

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
    coins: number;
    gold: number;
    dust: number;
    exp: number;
    gamelevel: number;
    position: PIXI.Point;
} = {
        id: 0,
        name: "",
        coins: 0,
        gold: 0,
        dust: 0,
        exp: 0,
        gamelevel: 0,
        position: new PIXI.Point()
    };

