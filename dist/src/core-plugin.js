"use strict";
/**
 * Copyright (C) Oranda - All Rights Reserved (January 2019 - January 2021)
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var halia_1 = require("./halia");
/**
 * HaliaCore
 */
exports.HaliaCore = {
    id: "haliaCore",
    name: "Halia Core",
    description: "The Extensible Halia Core",
    dependencies: [],
    install: function () {
        return halia_1.haliaCoreAPI;
    }
};
var HaliaProgramAPI = /** @class */ (function () {
    function HaliaProgramAPI() {
        var _this = this;
        this.code = [];
        this.registerCode = function (handler) {
            _this.code.push(handler);
        };
        this.run = function () { return __awaiter(_this, void 0, void 0, function () {
            var results, _i, _a, handler, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        results = [];
                        _i = 0, _a = this.code;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        handler = _a[_i];
                        return [4 /*yield*/, handler()];
                    case 2:
                        res = _b.sent();
                        results.push(res);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        }); };
    }
    return HaliaProgramAPI;
}());
exports.HaliaProgramAPI = HaliaProgramAPI;
exports.HaliaProgram = {
    id: "haliaProgram",
    name: "Halia Program",
    description: "Extensible Program",
    dependencies: [],
    install: function () {
        return new HaliaProgramAPI();
    }
};
/**
 * NOTE:  Optional Dependencies may be useful while debugging
 */
exports.OptionalDependencies = {
    id: "optionalDependencies",
    name: "Optional Dependencies",
    description: "Optional Dependencies",
    dependencies: [exports.HaliaCore.id],
    install: function (_a) {
        var haliaCore = _a.haliaCore;
        haliaCore.importRegister.addRegister("optional-dependencies", function (_a) {
            var stack = _a.stack, node = _a.node, importMap = _a.importMap, exportMap = _a.exportMap;
            var _b = node.original.optionalDependencies, optionalDependencies = _b === void 0 ? [] : _b;
            optionalDependencies.forEach(function (depId) {
                importMap[depId] = exportMap[depId];
            });
        });
    }
};
//# sourceMappingURL=core-plugin.js.map