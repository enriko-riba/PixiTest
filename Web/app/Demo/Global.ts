﻿import { SceneManager } from "app/_engine/SceneManager";

export var SCENE_WIDTH : number = 1366;
export var SCENE_HEIGHT: number = 768;
export var BTN_WIDTH : number = 100;
export var BTN_HEIGHT: number = 48;

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

export var WARN_STYLE: PIXI.ITextStyleStyle =
    {
        align: "center",
        padding: 0,
        fontSize: "27px",
        fontFamily: "Calibri",
        fill: 0xf05b15,
        strokeThickness: 1,
        stroke: 0xff6f6f
    };

export var QUEST_STYLE: PIXI.ITextStyleStyle =
    {
        align: "left",
        padding: 0,
        fontSize: "21px",
        fontFamily: "Futura",
        fill: 0x79ff33        ,
        strokeThickness: 3,
        stroke: 0x06160f,
        dropShadow: false
    };

export var sceneMngr: SceneManager;

export var GameLevels: {
                        root: any
} = { root: "" };
