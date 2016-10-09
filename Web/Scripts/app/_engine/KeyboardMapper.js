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
            var _this = this;
            this.ALT_KEY = 18;
            this.SHIFT_KEY = 16;
            this.CTRL_KEY = 17;
            this.AddKeyboardActionHandler = function (action, state) {
                if (!_this.stateActions[state])
                    _this.stateActions[state] = [];
                _this.stateActions[state].push(action);
            };
            this.stateActions = {};
            this.keyboard = [];
            for (var i = 0; i < 256; i++) {
                this.keyboard[i] = false;
            }
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
            actions = this.stateActions[SceneManager_1.State.GLOBAL];
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