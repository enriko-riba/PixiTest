define(["require", "exports", "app/_engine/KeyboardMapper"], function (require, exports, KeyboardMapper_1) {
    "use strict";
    exports.SCENE_WIDTH = 1366;
    exports.SCENE_HEIGHT = 768;
    exports.BTN_WIDTH = 100;
    exports.BTN_HEIGHT = 48;
    exports.BTN_STYLE = {
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
    exports.kbd = new KeyboardMapper_1.KeyboardMapper();
});
//# sourceMappingURL=Global.js.map