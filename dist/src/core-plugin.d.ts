/**
 * Copyright (C) Oranda - All Rights Reserved (January 2019 - January 2021)
 */
import { HaliaCoreAPI } from "./halia";
export interface HaliaPlugin<Imports = any, Exports = any> {
    id: string;
    name: string;
    description?: string;
    dependencies?: string[];
    install: (imports: Imports) => Exports;
}
/**
 * HaliaCore
 */
export declare const HaliaCore: HaliaPlugin<undefined, HaliaCoreAPI>;
/**
 * HaliaProgram
 */
export declare type handler = (dependencies: HaliaPlugin[]) => void;
export interface Program {
    registerCode: (handler: handler) => void;
}
export declare class HaliaProgramAPI {
    code: any[];
    registerCode: (handler: handler) => void;
    run: () => Promise<any[]>;
}
export declare const HaliaProgram: HaliaPlugin<undefined, HaliaProgramAPI>;
export interface OptionalDependenciesPatch {
    optionalDependencies?: string[];
}
/**
 * NOTE:  Optional Dependencies may be useful while debugging
 */
export declare const OptionalDependencies: HaliaPlugin<undefined, void>;
