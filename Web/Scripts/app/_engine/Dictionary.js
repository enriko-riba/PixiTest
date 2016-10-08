define(["require", "exports"], function (require, exports) {
    "use strict";
    var Dictionary = (function () {
        function Dictionary() {
            this.values = {};
        }
        Dictionary.prototype.get = function (key) {
            return this.values[key];
        };
        Dictionary.prototype.contains = function (key) {
            return key in this.values;
        };
        Dictionary.prototype.remove = function (key) {
            delete this.values[key];
        };
        Dictionary.prototype.set = function (key, value) {
            this.values[key] = value;
        };
        Dictionary.prototype.getAll = function () {
            return this.values;
        };
        Dictionary.prototype.getSet = function (key, valueOrvalueGetter) {
            if (!this.contains(key)) {
                this.set(key, typeof valueOrvalueGetter == 'function' ? valueOrvalueGetter() : valueOrvalueGetter);
            }
            return this.get(key);
        };
        return Dictionary;
    }());
    exports.Dictionary = Dictionary;
});
//# sourceMappingURL=Dictionary.js.map