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
var register_1 = require("./register");
/**
 * Extension API
 * Defines the HaliaCore "Plugin API" (I also call this an "API-API")
 */
var HaliaCoreAPI = /** @class */ (function () {
    function HaliaCoreAPI() {
        this.importRegister = new register_1.Register();
        this.exportRegister = new register_1.Register();
        this.processRegister = new register_1.Register();
    }
    return HaliaCoreAPI;
}());
exports.HaliaCoreAPI = HaliaCoreAPI;
//  CONSIDER:  This could be made per-stack instead of global.
exports.haliaCoreAPI = new HaliaCoreAPI();
//  CONSIDER:  Do we need to extend "HaliaPlugin"?  Could downstream features over-write these elements?  Let's leave it for now.
var HaliaStack = /** @class */ (function () {
    function HaliaStack() {
        var _this = this;
        this.haliaCoreAPI = exports.haliaCoreAPI;
        this.plugins = {};
        this.exports = undefined;
        this.getPlugin = function (pluginId) {
            return _this.plugins[pluginId];
        };
        this.getExports = function (pluginId) {
            return _this.exports[pluginId];
        };
        /**
         * Returns the set of Root Nodes
         * CONSIDER:  Could we save time by providing a "converter" function to transform each object to a Node without pre-processing?
         * @param nodes
         */
        this.nestNodes = function (nodes) { return __awaiter(_this, void 0, void 0, function () {
            var nodeLog, rootNodes, processNode, _i, nodes_1, node;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nodeLog = {};
                        rootNodes = [];
                        processNode = function (node) { return __awaiter(_this, void 0, void 0, function () {
                            var id, parents, _i, parents_1, parent_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        id = node.id, parents = node.parents;
                                        if (!!nodeLog[id]) return [3 /*break*/, 5];
                                        //  Set the Node
                                        nodeLog[id] = true;
                                        _i = 0, parents_1 = parents;
                                        _a.label = 1;
                                    case 1:
                                        if (!(_i < parents_1.length)) return [3 /*break*/, 4];
                                        parent_1 = parents_1[_i];
                                        return [4 /*yield*/, processNode(parent_1)];
                                    case 2:
                                        _a.sent();
                                        parent_1.children.push(node);
                                        _a.label = 3;
                                    case 3:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 4:
                                        //  Check Root
                                        if (parents.length == 0) {
                                            rootNodes.push(node);
                                        }
                                        _a.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); };
                        _i = 0, nodes_1 = nodes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < nodes_1.length)) return [3 /*break*/, 4];
                        node = nodes_1[_i];
                        return [4 /*yield*/, processNode(node)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, rootNodes];
                }
            });
        }); };
        this.register = function (plugin) {
            //  TODO:  Build a more robust, contextual error handling system (like Typescript).
            if (_this.plugins[plugin.id] != undefined) {
                throw "The '" + plugin.name + "' plugin has already been installed.";
            }
            _this.plugins[plugin.id] = plugin;
        };
        this.buildNode = function (plugin, nodeCache) {
            //  Check Existing
            var existing = nodeCache[plugin.id];
            if (existing) {
                return existing;
            }
            //  Define the Node
            var node = {
                original: plugin,
                id: plugin.id,
                parents: [],
                children: [],
                isInstalled: false,
            };
            //  Build Parents
            var parentPluginIds = plugin.dependencies || [];
            var parentNodes = parentPluginIds.map(function (parentPluginId) {
                var parentPlugin = _this.getPlugin(parentPluginId);
                var cachedNode = nodeCache[parentPlugin.id];
                if (cachedNode) {
                    return cachedNode;
                }
                var parentNode = _this.buildNode(parentPlugin, nodeCache);
                parentNode.children.push(node);
                return parentNode;
            });
            //  Attach Parents
            node.parents = parentNodes;
            //  Attach the Node
            nodeCache[node.id] = node;
            return node;
        };
        //  Function to obtain imports
        this.getNodeExports = function (node, exportMap) {
            var _a = node.original.dependencies, dependencies = _a === void 0 ? [] : _a;
            //  Core Requirements
            var importMap = {};
            dependencies.forEach(function (depId) {
                importMap[depId] = exportMap[depId];
            });
            //  Iterate Import Transformers
            _this.haliaCoreAPI.importRegister.invoke({ stack: _this, node: node, importMap: importMap, exportMap: exportMap });
            return importMap;
        };
        this.setNodeExports = function (node, value, exportMap) {
            var id = node.original.id;
            if (exportMap[id] != undefined) {
                throw "An export has already been defined for the '" + id + "' Plugin.";
            }
            exportMap[id] = value;
            //  Iterate Export Transformers
            _this.haliaCoreAPI.exportRegister.invoke({ stack: _this, node: node, exportMap: exportMap });
        };
        /**
         * Builds the Halia Stack and returns the root nodes.
         */
        this.build = function () { return __awaiter(_this, void 0, void 0, function () {
            var plugins, nodeCache, nodes, rootNodes, exportMap, _i, rootNodes_1, node;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plugins = Object.keys(this.plugins).map(function (pluginName) { return _this.plugins[pluginName]; });
                        nodeCache = {};
                        nodes = plugins.map(function (plugin) { return _this.buildNode(plugin, nodeCache); });
                        return [4 /*yield*/, this.nestNodes(nodes)];
                    case 1:
                        rootNodes = _a.sent();
                        exportMap = {};
                        _i = 0, rootNodes_1 = rootNodes;
                        _a.label = 2;
                    case 2:
                        if (!(_i < rootNodes_1.length)) return [3 /*break*/, 5];
                        node = rootNodes_1[_i];
                        return [4 /*yield*/, this.processNode(node, exportMap)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        //  Set the Map
                        this.exports = exportMap;
                        return [2 /*return*/, rootNodes];
                }
            });
        }); };
    }
    HaliaStack.prototype.processNode = function (node, exportMap) {
        return __awaiter(this, void 0, void 0, function () {
            var plugin, children, imports, exports, err_1, _i, children_1, child, isPending;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plugin = node.original, children = node.children;
                        imports = this.getNodeExports(node, exportMap);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, plugin.install(imports)];
                    case 2:
                        exports = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        throw "An error occurred while installing the '" + plugin.name + "' Halia Plugin: " + JSON.stringify(err_1);
                    case 4:
                        //  Update the Node
                        node.isInstalled = true;
                        //  Set Exports
                        this.setNodeExports(node, exports, exportMap);
                        node.exports = exports;
                        _i = 0, children_1 = children;
                        _a.label = 5;
                    case 5:
                        if (!(_i < children_1.length)) return [3 /*break*/, 8];
                        child = children_1[_i];
                        //  Check Installed
                        //  NOTE:  It's possible for a node to depend on this node AND a child of this node.  Then, it will be installed at the child and should be skipped here.
                        if (child.isInstalled) {
                            return [3 /*break*/, 7];
                        }
                        isPending = child.parents
                            .map(function (parent) { return parent.isInstalled; })
                            .includes(false);
                        if (isPending) {
                            return [3 /*break*/, 7];
                        }
                        //  Process the Child
                        return [4 /*yield*/, this.processNode(child, exportMap)];
                    case 6:
                        //  Process the Child
                        _a.sent();
                        //  Invoke the Process Register
                        this.haliaCoreAPI.processRegister.invoke({ stack: this, child: child, parent: node });
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return HaliaStack;
}());
exports.HaliaStack = HaliaStack;
//# sourceMappingURL=halia.js.map