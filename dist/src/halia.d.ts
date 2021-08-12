/**
 * Copyright (C) Oranda - All Rights Reserved (January 2019 - January 2021)
 */
import { Register } from "./register";
import { HaliaPlugin } from "./core-plugin";
export interface Node<T> {
    id: string;
    parents: Node<T>[];
    children: Node<T>[];
    original: T;
    exports?: any;
    isInstalled: boolean;
}
export declare type ImportRegisterParams<T extends HaliaPlugin> = {
    stack: HaliaStack<T>;
    node: Node<T>;
    importMap: {
        [id: string]: any;
    };
    exportMap: {
        [id: string]: any;
    };
};
export declare type ExportRegisterParams<T extends HaliaPlugin> = {
    stack: HaliaStack<T>;
    node: Node<T>;
    exportMap: {
        [id: string]: any;
    };
};
export declare type ProcessRegisterParams<T extends HaliaPlugin> = {
    stack: HaliaStack<T>;
    child: Node<T>;
    parent: Node<T>;
};
/**
 * Extension API
 * Defines the HaliaCore "Plugin API" (I also call this an "API-API")
 */
export declare class HaliaCoreAPI {
    importRegister: Register<ImportRegisterParams<any>>;
    exportRegister: Register<ExportRegisterParams<any>>;
    processRegister: Register<ProcessRegisterParams<any>>;
}
export declare const haliaCoreAPI: HaliaCoreAPI;
export declare class HaliaStack<T extends HaliaPlugin = HaliaPlugin> {
    private haliaCoreAPI;
    private plugins;
    private exports;
    getPlugin: (pluginId: string) => HaliaPlugin<any, any>;
    getExports: (pluginId: string) => any;
    /**
     * Returns the set of Root Nodes
     * CONSIDER:  Could we save time by providing a "converter" function to transform each object to a Node without pre-processing?
     * @param nodes
     */
    nestNodes: <T_1>(nodes: Node<T_1>[]) => Promise<Node<T_1>[]>;
    register: (plugin: T) => void;
    private buildNode;
    private processNode;
    private getNodeExports;
    private setNodeExports;
    /**
     * Builds the Halia Stack and returns the root nodes.
     */
    build: () => Promise<Node<T>[]>;
}
