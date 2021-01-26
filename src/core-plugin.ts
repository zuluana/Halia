/**
 * Copyright (C) Oranda - All Rights Reserved (January 2019 - January 2021)
 */

import { HaliaCoreAPI, haliaCoreAPI, ImportRegisterParams } from "./halia";

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

export const HaliaCore: HaliaPlugin<undefined, HaliaCoreAPI> = {
  id: "haliaCore",
  name: "Halia Core",
  description: "The Extensible Halia Core",
  dependencies: [],
  install: () => {
    return haliaCoreAPI;
  }
};


/**
 * HaliaProgram
 */

export type handler = (dependencies: HaliaPlugin[]) => void;

export interface Program {
  registerCode: (handler: handler) => void;
}

export class HaliaProgramAPI {

  public code: any[] = [];
  public registerCode = (handler: handler) => {
    this.code.push(handler);
  };

  public run = async () => {
    const results = [];
    for (const handler of this.code) {
      const res = await handler();
      results.push(res);
    }
    return results;
  };
}


export const HaliaProgram: HaliaPlugin<undefined, HaliaProgramAPI> = {
  id: "haliaProgram",
  name: "Halia Program",
  description: "Extensible Program",
  dependencies: [],
  install: () => {
    return new HaliaProgramAPI();
  }
};


export interface OptionalDependenciesPatch {
  optionalDependencies?: string[];
}

/**
 * NOTE:  Optional Dependencies may be useful while debugging
 */
export const OptionalDependencies: HaliaPlugin<undefined, void> = {
  id: "optionalDependencies",
  name: "Optional Dependencies",
  description: "Optional Dependencies",
  dependencies: [HaliaCore.id],
  install: ({ haliaCore }: { haliaCore: HaliaCoreAPI }) => {
    haliaCore.importRegister.addRegister("optional-dependencies", ({ stack, node, importMap, exportMap }: ImportRegisterParams<HaliaPlugin & OptionalDependenciesPatch>) => {
      const { original: { optionalDependencies = [] } } = node;
      optionalDependencies.forEach(depId => {
        importMap[depId] = exportMap[depId];
      });
    });
  }
};
