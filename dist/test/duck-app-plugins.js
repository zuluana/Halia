"use strict";
/**
 * Copyright (C) Oranda - All Rights Reserved (January 2021 - January 2021)
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Duck App Plugin
 */
var DuckApp = __importStar(require("./duck-app"));
exports.DuckAppPlugin = {
    id: "duckApp",
    name: "Duck App Plugin",
    install: function () { return DuckApp; }
};
/**
 * Disco Duck Plugin
 */
var UnhappyClient = "Stevie McGrouch";
var config = {
    client: UnhappyClient
};
exports.DiscoDuckPlugin = {
    id: "discoDuck",
    name: "Disco Duck Plugin",
    dependencies: [exports.DuckAppPlugin.id],
    install: function (_a) {
        var duckApp = _a.duckApp;
        if (config.client === UnhappyClient) {
            duckApp.getDuck = function () { return "Michael Quackson"; };
        }
    }
};
//# sourceMappingURL=duck-app-plugins.js.map