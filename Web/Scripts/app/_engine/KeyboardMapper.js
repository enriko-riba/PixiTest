define(["require", "exports", "./SceneManager"], function (require, exports, SceneManager_1) {
    "use strict";
    /**
    *   Simple keyboard mapper.
    */
    var KeyboardMapper = (function () {
        /**
        *   Creates a new KeyboardMapper instance.
        */
        function KeyboardMapper() {
            this.ALT_KEY = 18;
            this.SHIFT_KEY = 16;
            this.CTRL_KEY = 17;
            this.keyboard = [];
            for (var i = 0; i < 256; i++) {
                this.keyboard[i] = false;
            }
            this.initStateActions();
            document.addEventListener('keydown', this.keydown.bind(this), false);
            document.addEventListener('keyup', this.keyup.bind(this), false);
        }
        /*
        *   Invokes needed action handlers based on the pressed keys.
        */
        KeyboardMapper.prototype.update = function (currentState) {
            //  state specific handler
            var actions = this.stateActions[currentState];
            this.findHandlerAndInvoke(actions);
            //  global handlers
            actions = this.stateActions[SceneManager_1.State.GENERAL];
            this.findHandlerAndInvoke(actions);
        };
        /**
        *   Searches for all keyboard handlers with matching current pressed key combinations and invokes them.
        */
        KeyboardMapper.prototype.findHandlerAndInvoke = function (actions) {
            if (actions) {
                var len = actions.length;
                for (var i = 0; i < len; i++) {
                    var ka = actions[i];
                    if (ka && ka.isAssigned()
                        && this.keyboard[ka.key]
                        && this.keyboard[this.ALT_KEY] == ka.altKey
                        && this.keyboard[this.SHIFT_KEY] == ka.shiftKey
                        && this.keyboard[this.CTRL_KEY] == ka.ctrlKey) {
                        ka.handler();
                        if (ka.releaseKeyAfterInvoke)
                            this.keyboard[ka.key] = false;
                    }
                }
            }
        };
        KeyboardMapper.prototype.initStateActions = function () {
            this.stateActions = {};
            //this.stateActions[Global.State.SECTOR_TACTICAL] = [];            
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*W*/new KeyboardAction(87, 'Increase thrust', () => this.shipEngine.thrustIncrease(), false ));
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*S*/new KeyboardAction(83, 'Decrease thrust', () => this.shipEngine.thrustDecrease(), false ));
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*Q*/new KeyboardAction(81, 'Roll left', () => this.shipEngine.rollLeft(), false ));
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*E*/new KeyboardAction(69, 'Roll right', () => this.shipEngine.rollRight(), false ));
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*C*/new KeyboardAction(67, 'Next celestial', () => this.vm.playerControls.targetCelestialShift(1) ));
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*C + shift*/new KeyboardAction(67, 'Previous celestial', () => this.vm.playerControls.targetCelestialShift(-1), true, true));           
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*X*/new KeyboardAction(88, 'Autotarget celestial', () => this.shipEngine.autotargetCelestial() ));
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*1*/new KeyboardAction(49, '1/3 speed', () => this.shipEngine.speedControl(0.33333333) ));
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*2*/new KeyboardAction(50, '1/2 speed', () => this.shipEngine.speedControl(0.5) ));
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*3*/new KeyboardAction(51, 'Full speed', () => this.shipEngine.speedControl(1.0)));
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*T*/new KeyboardAction(84, 'Next target', () => this.vm.playerControls.targetTacticalShift(1)));
            //this.stateActions[Global.State.SECTOR_TACTICAL].push( /*C + shift*/new KeyboardAction(84, 'Previous target', () => this.vm.playerControls.targetTacticalShift(-1), true, true));
            //this.stateActions[Global.State.SECTOR_SHIP] = [];
            //this.stateActions[Global.State.SECTOR_NAV_MAP] = [];
            //this.stateActions[Global.State.DOCKED_MISSIONS] = [];
            //this.stateActions[Global.State.DOCKED_MODULES] = [];
            //this.stateActions[Global.State.DOCKED_REPAIR] = [];
            //this.stateActions[Global.State.DOCKED_TRADE] = [];
        };
        KeyboardMapper.prototype.keydown = function (e /*: JQueryEventObject*/) {
            this.keyboard[e.which] = true;
        };
        KeyboardMapper.prototype.keyup = function (e /*: JQueryEventObject*/) {
            this.keyboard[e.which] = false;
        };
        return KeyboardMapper;
    }());
    exports.KeyboardMapper = KeyboardMapper;
    var KeyboardAction = (function () {
        /**
        *   Creates a new KeyboardAction instance.
        */
        function KeyboardAction(key, name, handler, releaseKeyAfterInvoke, shiftKey, ctrlKey, altKey) {
            if (handler === void 0) { handler = undefined; }
            if (releaseKeyAfterInvoke === void 0) { releaseKeyAfterInvoke = true; }
            if (shiftKey === void 0) { shiftKey = false; }
            if (ctrlKey === void 0) { ctrlKey = false; }
            if (altKey === void 0) { altKey = false; }
            this.key = key;
            this.name = name;
            this.handler = handler;
            this.releaseKeyAfterInvoke = releaseKeyAfterInvoke;
            this.shiftKey = shiftKey;
            this.ctrlKey = ctrlKey;
            this.altKey = altKey;
        }
        /**
        *   Returns true if the handler is assigned.
        */
        KeyboardAction.prototype.isAssigned = function () {
            return this.handler !== undefined;
        };
        return KeyboardAction;
    }());
    exports.KeyboardAction = KeyboardAction;
});
//# sourceMappingURL=KeyboardMapper.js.map