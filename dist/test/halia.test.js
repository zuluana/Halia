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
var core_plugin_1 = require("../src/core-plugin");
var halia_1 = require("../src/halia");
var chai_1 = require("chai");
describe("Halia", function () {
    var haliaStack;
    before(function () { return __awaiter(void 0, void 0, void 0, function () {
        var PIAPI, PI, PIIImports, PIIAPI, PII, PIII;
        return __generator(this, function (_a) {
            PIAPI = /** @class */ (function () {
                function PIAPI() {
                    var _this = this;
                    this.messages = [];
                    this.addMessage = function (message) {
                        _this.messages.push(message + ":PI");
                    };
                }
                return PIAPI;
            }());
            PI = {
                id: "pI",
                name: "PI",
                description: "Plugin I:  Export a function to add messages which will be returned by the Halia Program.",
                dependencies: [core_plugin_1.HaliaProgram.id],
                install: function (_a) {
                    var haliaProgram = _a.haliaProgram;
                    var pIAPI = new PIAPI();
                    haliaProgram.registerCode(function () {
                        return pIAPI.messages;
                    });
                    return pIAPI;
                }
            };
            //  Create the Stack
            haliaStack = new halia_1.HaliaStack();
            haliaStack.register(core_plugin_1.HaliaProgram);
            haliaStack.register(PI);
            PIIImports = /** @class */ (function () {
                function PIIImports() {
                }
                return PIIImports;
            }());
            PIIAPI = /** @class */ (function () {
                function PIIAPI(pI) {
                    var _this = this;
                    this.pI = pI;
                    this.messages = [];
                    this.addMessage = function (message) {
                        _this.pI.addMessage(message + ":PII");
                    };
                }
                return PIIAPI;
            }());
            PII = {
                id: "pII",
                name: "PII",
                description: "Plugin II:  Build a function to wrap the PI 'addMessage' function.  It adds ':II' to the message",
                dependencies: [PI.id],
                install: function (_a) {
                    var pI = _a.pI;
                    var pIIAPI = new PIIAPI(pI);
                    return pIIAPI;
                }
            };
            //  IF a plugin messes up something, then that things depednencies MAY not get the otherr one.
            //  MAYBE depende on the one that canges, OR maybe just
            haliaStack.register(PII);
            PIII = {
                name: "Plugin III",
                id: "pIII",
                description: "Plugin III:  Actually add the message using the P2 API.",
                dependencies: [PII.id],
                install: function (_a) {
                    var pII = _a.pII;
                    pII.addMessage("PIII");
                }
            };
            haliaStack.register(PIII);
            return [2 /*return*/];
        });
    }); });
    it("should successfully start the program", function () { return __awaiter(void 0, void 0, void 0, function () {
        var progAPI, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, haliaStack.build()];
                case 1:
                    _a.sent();
                    progAPI = haliaStack.getExports(core_plugin_1.HaliaProgram.id);
                    return [4 /*yield*/, progAPI.run()];
                case 2:
                    res = _a.sent();
                    chai_1.expect(JSON.stringify(res[0])).equals(JSON.stringify(["PIII:PII:PI"]));
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=halia.test.js.map