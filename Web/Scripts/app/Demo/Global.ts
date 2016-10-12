import { SceneManager } from "app/_engine/SceneManager";
import { KeyboardMapper } from "app/_engine/KeyboardMapper";

export var SCENE_WIDTH : number = 1366;
export var SCENE_HEIGHT: number = 768;
export var BTN_WIDTH : number = 100;
export var BTN_HEIGHT: number = 48;

export var BTN_STYLE: PIXI.ITextStyle =
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


export var sceneMngr: SceneManager;
export var kbd = new KeyboardMapper();