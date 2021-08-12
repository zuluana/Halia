"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Register functions to be synchronously invoked.  Similar to an "Event Emitter".
 */
var Register = /** @class */ (function () {
    function Register() {
        var _this = this;
        this.registerList = [];
        this.size = function () {
            return _this.registerList.length;
        };
        this.addRegister = function (id, func) {
            _this.registerList.push({ id: id, func: func });
        };
        this.removeRegister = function (id) {
            var index = _this.registerList.findIndex(function (register) { register.id === id; });
            if (index === -1) {
                throw "No register registered with ID '" + id + "'.";
            }
            _this.registerList.splice(index, 1);
        };
        this.invoke = function (input) {
            for (var i = 0; i < _this.registerList.length; i++) {
                var func = _this.registerList[i].func;
                func(input);
            }
        };
    }
    return Register;
}());
exports.Register = Register;
//# sourceMappingURL=register.js.map